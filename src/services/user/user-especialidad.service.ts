import { inject, injectable } from "inversify";
import { User } from "../../models/usuarios/user.entity.js";
import { Especialidades } from "../../models/especialidades/especialidades.entity.js";
import { UserRepository } from "../../repositories/usuarios/user.dao.js";
import { EspecialidadesRepository } from "../../repositories/especialidades/especialidades.dao.js";
import { ValidationError } from "../../middleware/errorHandler/validationError.js";
import { UserRolAplService } from "./user-rol-apl.service.js";

@injectable()
export class UserEspecialidadService {
  constructor(
    @inject(UserRepository) private userRepo: UserRepository,
    @inject(EspecialidadesRepository) private espRepo: EspecialidadesRepository,
    @inject(UserRolAplService) private userRolService: UserRolAplService
  ) {}

   // Verifica si el usuario es tatuador
  private async checkIsTatuador(user: User) {
    const roles: Array<{id: number, nombre: string} | number> = await this.userRolService.getAllUserRols(user.id!)?? [];
    if (!roles || !roles.length) {
      throw new ValidationError("Usuario no tiene roles asignados.", 403);
    }

    // Convertimos todo a IDs numéricos
    const roleIds = roles.map(r => {
      if (typeof r === 'number') return r;
      if (typeof r === 'string') return parseInt(r, 10);
      return r.id;
    });

    if (!roleIds.includes(4)) {
      throw new ValidationError("Solo los usuarios con rol 'Tatuador' pueden tener especialidades.", 403);
    }
  }

  // Asigna varias especialidades a un tatuador
  async updateUserEspecialidades(userId: number, especialidadIds: number[]): Promise<Especialidades[]> {
    const user = await this.userRepo.findOne(userId);

    if (!user) throw new ValidationError("Usuario no encontrado", 404);

    await this.checkIsTatuador(user); // Metodo para solo asignar especialidades a tatuadores

    // Cargamos las especialidades actuales como array
    const currentEspecialidades = await user.especialidades ?? [];

    // Limpiamos y asignamos nuevas
    const nuevasEspecialidades: Especialidades[] = [];
    for (const idEsp of especialidadIds) {
      const especialidad = await this.espRepo.findOne(idEsp);
      if (!especialidad) continue;
      nuevasEspecialidades.push(especialidad);
    }

  // Asignamos las nuevas especialidades y guardamos usando el repositorio interno de TypeORM
    user.especialidades = Promise.resolve(nuevasEspecialidades);
    await (this.userRepo as any)._userRepo.save(user);

    return nuevasEspecialidades;
  }

  // Agrega una especialidad a un tatuador
  async addEspecialidad(userId: number, especialidadId: number): Promise<Especialidades[]> {
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new ValidationError("Usuario no encontrado", 404);

    await this.checkIsTatuador(user);

    const currentEspecialidades = await user.especialidades ?? [];

    const especialidad = await this.espRepo.findOne(especialidadId);
    if (!especialidad) throw new ValidationError("Especialidad no encontrada", 404);

    // Solo agregamos si no existe
    if (!currentEspecialidades.find(e => e.id === especialidad.id)) {
      currentEspecialidades.push(especialidad);
      user.especialidades = Promise.resolve(currentEspecialidades);
      await (this.userRepo as any)._userRepo.save(user);
    }

    return currentEspecialidades;
  }

  // Remueve una especialidad de un tatuador
  async removeEspecialidad(userId: number, especialidadId: number): Promise<Especialidades[]> {
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new ValidationError("Usuario no encontrado", 404);

    await this.checkIsTatuador(user);

    let currentEspecialidades = await user.especialidades ?? [];

    currentEspecialidades = currentEspecialidades.filter(e => e.id !== especialidadId);
    user.especialidades = Promise.resolve(currentEspecialidades);
    await (this.userRepo as any)._userRepo.save(user);

    return currentEspecialidades;
  }

  // Listar especialidades de un tatuador
  async getUserEspecialidades(userId: number): Promise<Especialidades[]> {
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new ValidationError("Usuario no encontrado", 404);

    await this.checkIsTatuador(user);

    return await user.especialidades ?? [];
  }

}
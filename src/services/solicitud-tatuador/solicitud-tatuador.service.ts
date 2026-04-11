import { inject, injectable } from 'inversify';
import { SolicitudTatuadorRepository } from '../../repositories/solicitud-tatuador/solicitud-tatuador.dao.js';
import { SolicitudTatuador } from '../../models/solicitud-tatuador/solicitud-tatuador.entity.js';
import { UserRolAplService } from '../user/user-rol-apl.service.js';
import { UserEspecialidadService } from '../user/user-especialidad.service.js';
import { UserRepository } from '../../repositories/usuarios/user.dao.js';
import { EspecialidadesRepository } from '../../repositories/especialidades/especialidades.dao.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';

@injectable()
export class SolicitudTatuadorService {
  constructor(
    @inject(SolicitudTatuadorRepository) private repo: SolicitudTatuadorRepository,
    @inject(UserRolAplService) private userRolService: UserRolAplService,
    @inject(UserRepository) private userRepo: UserRepository,
    @inject(EspecialidadesRepository) private espRepo: EspecialidadesRepository,
  ) {}

  async create(idUser: number, estudio: string | null, especialidadesIds: number[]): Promise<SolicitudTatuador> {
    return await this.repo.create({
      idUser,
      estudio: estudio ?? null,
      especialidadesIds: especialidadesIds ?? [],
      status: 'pendiente',
      notas: null,
      adminUser: null,
    });
  }

  async findAll(): Promise<SolicitudTatuador[]> {
    return await this.repo.findAll();
  }

  async aprobar(id: number, adminUser: string): Promise<SolicitudTatuador> {
    const solicitud = await this.repo.findOne(id);
    if (!solicitud) throw new ValidationError('Solicitud no encontrada', 404);
    if (solicitud.status !== 'pendiente') throw new ValidationError('La solicitud ya fue procesada', 400);

    await this.userRolService.updateUserRoles(solicitud.idUser!, [4], adminUser);

    const user = await this.userRepo.findOne(solicitud.idUser!);
    if (user) {
      if (solicitud.estudio) {
        (user as any).estudio = solicitud.estudio;
      }
      if (solicitud.especialidadesIds?.length) {
        const especialidades = await Promise.all(
          solicitud.especialidadesIds.map(eid => this.espRepo.findOne(eid))
        );
        user.especialidades = especialidades.filter(Boolean) as any;
      }
      await (this.userRepo as any)._userRepo.save(user);
    }

    await this.repo.update(id, { status: 'aprobada', adminUser });
    return (await this.repo.findOne(id))!;
  }

  async rechazar(id: number, adminUser: string, notas?: string): Promise<SolicitudTatuador> {
    const solicitud = await this.repo.findOne(id);
    if (!solicitud) throw new ValidationError('Solicitud no encontrada', 404);
    if (solicitud.status !== 'pendiente') throw new ValidationError('La solicitud ya fue procesada', 400);

    await this.repo.update(id, { status: 'rechazada', adminUser, notas: notas ?? null });
    return (await this.repo.findOne(id))!;
  }
}

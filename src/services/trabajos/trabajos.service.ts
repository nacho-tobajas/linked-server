import { inject, injectable } from 'inversify';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { Trabajo } from '../../models/trabajos/trabajo.entity.js';
import { UserRepository } from '../../repositories/usuarios/user.dao.js'; // O user.repository.ts
import { ITrabajosService } from '../../services/interfaces/trabajos/ITrabajosService.js';
import { TrabajosRepository } from '../../repositories/trabajos/trabajos.dao.js';
import { TrabajoFoto } from '../../models/trabajos/trabajo-foto.entity.js';
@injectable()
export class TrabajosService implements ITrabajosService {

  constructor(
    @inject(TrabajosRepository) private trabajosRepo: TrabajosRepository,
    @inject(UserRepository) private userRepo: UserRepository
  ) { }

  async getAllTrabajosRecientes(): Promise<Trabajo[]> {
    const trabajos = await this.trabajosRepo.findAllRecent();
    return trabajos;
  }

  async subirTrabajo(tatuadorId: number, imagePaths: string[], descripcion: string, username: string): Promise<Trabajo> {

    // Validar tatuador
    const tatuador = await this.userRepo.findOne(tatuadorId);
    if (!tatuador) {
      throw new ValidationError('Tatuador no encontrado', 404);
    }

    // Crear la entidad Trabajo
    const nuevoTrabajo = new Trabajo();
    nuevoTrabajo.tatuador = tatuador;
    nuevoTrabajo.descripcion = descripcion;
    nuevoTrabajo.creationuser = username;
    nuevoTrabajo.creationtimestamp = new Date();

    // Crear las entidades TrabajoFoto 
    // TypeORM con cascade: true guardará esto automáticamente
    nuevoTrabajo.fotos = imagePaths.map(path => {
      const foto = new TrabajoFoto();
      foto.image_path = path;
      return foto;
    });

    return this.trabajosRepo.create(nuevoTrabajo);
  }

  async getTrabajosDeTatuador(tatuadorId: number): Promise<Trabajo[]> {
    const trabajos = await this.trabajosRepo.findByTatuadorId(tatuadorId);
    return trabajos;
  }

  async darLike(clienteId: number, trabajoId: number): Promise<void> {
    const trabajo = await this.trabajosRepo.findOne(trabajoId);
    if (!trabajo) throw new ValidationError('Trabajo no encontrado', 404);

    await this.trabajosRepo.addFavorito(clienteId, trabajoId);
  }

  async quitarLike(clienteId: number, trabajoId: number): Promise<void> {
    await this.trabajosRepo.removeFavorito(clienteId, trabajoId);
  }

  async getMisLikesIds(clienteId: number): Promise<number[]> {
    return this.trabajosRepo.findFavoritosIdsByCliente(clienteId);
  }
}
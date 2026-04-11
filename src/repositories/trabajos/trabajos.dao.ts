import { injectable } from 'inversify';
import { Repository, Not, IsNull } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { Trabajo } from '../../models/trabajos/trabajo.entity.js';
import { TrabajoFavorito } from '../../models/trabajos/trabajo-favorito.entity.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { ITrabajosRepository } from '../../repositories/interfaces/ITrabajosRepository.js';

@injectable()
export class TrabajosRepository implements ITrabajosRepository {
  
  private repository: Repository<Trabajo>;
  private favoritoRepository: Repository<TrabajoFavorito>;

  constructor() {
    this.repository = AppDataSource.getRepository(Trabajo);
    this.favoritoRepository = AppDataSource.getRepository(TrabajoFavorito);
  }

  async findAll(): Promise<Trabajo[]> {
    try {
      return await this.repository.find({
        relations: { fotos: true, tatuador: true }, // Cargamos las fotos y el autor
        order: { creationtimestamp: 'DESC' }
      });
    } catch (error) {
      console.error("Error al buscar todos los trabajos", error);
      throw new DatabaseErrorCustom("Error al obtener trabajos", 500);
    }
  }

  async findOne(id: number): Promise<Trabajo | undefined> {
    try {
      const trabajo = await this.repository.findOne({
        where: { id },
        relations: { fotos: true, tatuador: true, favoritos: true }
      });
      return trabajo ?? undefined;
    } catch (error) {
      console.error(`Error al buscar trabajo ID ${id}`, error);
      throw new DatabaseErrorCustom("Trabajo no encontrado", 500);
    }
  }

  async findAllRecent(): Promise<Trabajo[]> {
    try {
      return await this.repository.find({
        relations: { 
            tatuador: true, 
            fotos: true,    
            favoritos: true 
        },
        order: { 
            creationtimestamp: 'DESC' 
        },
        // (Implementar paginacion....)
        take: 50 
      });
    } catch (error) {
      console.error("Error al cargar el feed:", error);
      throw new DatabaseErrorCustom("Error al obtener las publicaciones recientes", 500);
    }
  }

  async create(trabajo: Trabajo): Promise<Trabajo> {
    try {
      // Gracias a cascade: true en la entidad, esto guarda también las fotos
      return await this.repository.save(trabajo);
    } catch (error) {
      console.error("Error al crear trabajo", error);
      throw new DatabaseErrorCustom("No se pudo crear la publicación", 500);
    }
  }

  async update(id: number, trabajo: Partial<Trabajo>): Promise<Trabajo> {
    try {
      await this.repository.update(id, trabajo);
      return await this.repository.findOneOrFail({ where: { id }, relations: { fotos: true } });
    } catch (error) {
      console.error("Error al actualizar trabajo", error);
      throw new DatabaseErrorCustom("Error al actualizar el trabajo", 500);
    }
  }

  async delete(id: number): Promise<Trabajo | undefined> {
    try {
      const trabajo = await this.findOne(id);
      if (!trabajo) {
        throw new DatabaseErrorCustom("Trabajo no encontrado para eliminar", 404);
      }
      await this.repository.remove(trabajo);
      return trabajo;
    } catch (error) {
      console.error("Error al eliminar trabajo", error);
      throw new DatabaseErrorCustom("Error al eliminar el trabajo", 500);
    }
  }

  // --- MÉTODOS ESPECÍFICOS DE TRABAJOS ---

  async findByTatuadorId(tatuadorId: number): Promise<Trabajo[]> {
    try {
      return await this.repository.find({
        where: { tatuador: { id: tatuadorId } },
        relations: { fotos: true, favoritos: true }, // Traemos favoritos para contarlos
        order: { creationtimestamp: 'DESC' }
      });
    } catch (error) {
      console.error(`Error al buscar trabajos del tatuador ${tatuadorId}`, error);
      throw new DatabaseErrorCustom("Error al obtener el portfolio", 500);
    }
  }

  async findByInstagramMediaId(instagramMediaId: string): Promise<Trabajo | undefined> {
    try {
      const trabajo = await this.repository.findOne({ where: { instagram_media_id: instagramMediaId } });
      return trabajo ?? undefined;
    } catch (error) {
      throw new DatabaseErrorCustom('Error al verificar duplicado de Instagram', 500);
    }
  }

  async findInstagramMediaIdsByTatuador(tatuadorId: number): Promise<string[]> {
    try {
      const trabajos = await this.repository.find({
        where: { tatuador: { id: tatuadorId }, instagram_media_id: Not(IsNull()) },
        select: ['instagram_media_id']
      });
      return trabajos.map(t => t.instagram_media_id!).filter(Boolean);
    } catch (error) {
      throw new DatabaseErrorCustom('Error al obtener IDs de Instagram del portfolio', 500);
    }
  }

  async deleteByInstagramMediaId(mediaId: string): Promise<void> {
    try {
      const trabajo = await this.repository.findOne({
        where: { instagram_media_id: mediaId },
        relations: { fotos: true }
      });
      if (trabajo) await this.repository.remove(trabajo);
    } catch (error) {
      throw new DatabaseErrorCustom('Error al eliminar trabajo de Instagram', 500);
    }
  }

  // --- MÉTODOS DE FAVORITOS (LIKES) ---

  async addFavorito(clienteId: number, trabajoId: number): Promise<TrabajoFavorito> {
    try {
      const fav = this.favoritoRepository.create({
        cliente: { id: clienteId },
        trabajo: { id: trabajoId }
      });
      return await this.favoritoRepository.save(fav);
    } catch (error: any) {
      if (error.code === '23505') { // Código Postgres para duplicado (Unique constraint)
         throw new DatabaseErrorCustom('Ya le diste like a este trabajo', 409);
      }
      throw new DatabaseErrorCustom("Error al dar like", 500);
    }
  }

  async removeFavorito(clienteId: number, trabajoId: number): Promise<void> {
    try {
        await this.favoritoRepository.delete({
            cliente: { id: clienteId },
            trabajo: { id: trabajoId }
        });
    } catch (error) {
        throw new DatabaseErrorCustom("Error al quitar like", 500);
    }
  }

  async findFavoritosIdsByCliente(clienteId: number): Promise<number[]> {
    try {
        const favs = await this.favoritoRepository.find({
            where: { cliente: { id: clienteId } },
            relations: { trabajo: true },
            select: { trabajo: { id: true } }
        });
        return favs.map(f => f.trabajo?.id!);
    } catch (error) {
        throw new DatabaseErrorCustom("Error al obtener mis favoritos", 500);
    }
  }
}
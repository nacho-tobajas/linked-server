import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';
import { TurnoSesion } from '../../models/turno-sesion/turno-sesion.entity.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { ITurnoRepository } from '../../repositories/interfaces/ITurnoRepository.js';

@injectable()
export class TurnoRepository implements ITurnoRepository {

    private _repository: Repository<TurnoSesion>;

    constructor() {
        this._repository = AppDataSource.getRepository(TurnoSesion);
    }

    // Método para transacciones
    private getRepo(manager?: EntityManager): Repository<TurnoSesion> {
        return manager ? manager.getRepository(TurnoSesion) : this._repository;
    }

    async findByClienteId(clienteId: number): Promise<TurnoSesion[]> {
        try {
            return await this._repository.find({
                where: { cliente: { id: clienteId } },
                relations: {
                    tatuadoresAsignados: { tatuador: true },
                    imagenes: true
                },
                order: { fecha_hora_inicio: "DESC" }
            });
        } catch (error) {
            throw new DatabaseErrorCustom('Error al buscar turnos por cliente', 500);
        }
    }

    async findById(turnoId: number, manager?: EntityManager): Promise<TurnoSesion | null> {
        const repo = this.getRepo(manager);
        try {
            return await repo.findOne({
                where: { id: turnoId },
                relations: {
                    cliente: true,
                    imagenes: true,
                    tatuadoresAsignados: { tatuador: true }
                }
            });
        } catch (error) {
            throw new DatabaseErrorCustom('Error al buscar turno por ID', 500);
        }
    }
    
    async save(turno: TurnoSesion, manager?: EntityManager): Promise<TurnoSesion> {
        const repo = this.getRepo(manager);
        try {
            return await repo.save(turno);
        } catch (error) {
            throw new DatabaseErrorCustom('Error al guardar el turno', 500);
        }
    }

    async findAll(): Promise<TurnoSesion[]> {
        return this._repository.find();
    }

    async delete(id: number): Promise<TurnoSesion|undefined> {
        try {
            const result = await this._repository.delete(id);
            if (result.affected === 0) {
                throw new ValidationError("Turno no encontrado para eliminar", 404);
            }
            return undefined;
        } catch (error) {
            if (error instanceof ValidationError) throw error;
            throw new DatabaseErrorCustom('Error al eliminar el turno', 500);
        }
    }

      async create(turno: TurnoSesion): Promise<TurnoSesion> { 
        return turno
      }
    
      async findOne(id: number): Promise<TurnoSesion | undefined> { 
        return 
      }
    
      async update(id: number, turno: Partial<TurnoSesion>): Promise<TurnoSesion> { 
          return turno
      }

    // Los métodos 'create' y 'update' genéricos se omiten
    // intencionalmente, ya que el servicio usa lógica de negocio.
}
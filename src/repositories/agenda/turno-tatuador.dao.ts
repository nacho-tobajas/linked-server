import { Repository, EntityManager, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';
import { TurnoTatuador } from '../../models/turno-tatuador/turno-tatuador.entity.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { EstadoTurno } from '../../models/enums/estado-turno.enum.js';
import { ITurnoTatuadorRepository } from '../../repositories/interfaces/ITurnoTatuadorRepository.js';

@injectable()
export class TurnoTatuadorRepository implements ITurnoTatuadorRepository {

    private _repository: Repository<TurnoTatuador>;

    constructor() {
        this._repository = AppDataSource.getRepository(TurnoTatuador);
    }
    
    private getRepo(manager?: EntityManager): Repository<TurnoTatuador> {
        return manager ? manager.getRepository(TurnoTatuador) : this._repository;
    }

    async findSolapamiento(tatuadorId: number, inicio: Date, fin: Date, manager?: EntityManager): Promise<TurnoTatuador | null> {
        const repo = this.getRepo(manager);
        try {
            // Usamos QueryBuilder para la consulta compleja de solapamiento
            return await repo.createQueryBuilder("tt") // "tt" es el alias para TurnoTatuador
                .innerJoin("tt.turnoSesion", "ts") // "ts" es el alias para TurnoSesion
                .where("tt.tatuador.id = :tatuadorId", { tatuadorId })
                .andWhere("ts.estado IN (:...estados)", { 
                    estados: [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADA] 
                })
                // Lógica de solapamiento: (InicioNuevo < FinExistente) Y (FinNuevo > InicioExistente)
                .andWhere("ts.fecha_hora_inicio < :fin", { fin })
                .andWhere("ts.fecha_hora_fin > :inicio", { inicio })
                .getOne(); // Devuelve un objeto o null
        } catch (error) {
            console.error("Error al validar solapamiento: ", error);
            throw new DatabaseErrorCustom('Error al validar disponibilidad', 500);
        }
    }

    /**
     * Busca asignaciones (turnos) activas para un tatuador en un rango de fechas.
     */
    async findReservadosEnRango(tatuadorId: number, fechaInicio: Date, fechaFin: Date): Promise<TurnoTatuador[]> {
        try {
            // Esta es la consulta específica que tu AgendaService necesita
            return await this._repository.find({
                where: {
                    tatuador: { id: tatuadorId },
                    turnoSesion: {
                        estado: In([EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADA]),
                        // Filtramos por el rango de fechas (el día completo)
                        fecha_hora_inicio: MoreThanOrEqual(fechaInicio),
                        fecha_hora_fin: LessThanOrEqual(fechaFin)
                    }
                },
                relations: {
                    turnoSesion: true // Cargamos la info del turno
                }
            });
        } catch (error) {
            console.error("Error al buscar turnos reservados en rango: ", error);
            throw new DatabaseErrorCustom('Error al buscar turnos reservados', 500);
        }
    }

    /**
     * Guarda una nueva asignación de tatuador a un turno (una fila en la tabla pivote).
     */
    async save(asignacion: TurnoTatuador, manager?: EntityManager): Promise<TurnoTatuador> {
        const repo = this.getRepo(manager);
        try {
            return await repo.save(asignacion);
        } catch (error) {
            throw new DatabaseErrorCustom('Error al guardar asignación de tatuador', 500);
        }
    }

    /**
     * Busca todas las asignaciones (y sus turnos) para un tatuador específico.
     * Usado para mostrar "Mis Turnos" al tatuador.
     */
    async findByTatuadorId(tatuadorId: number): Promise<TurnoTatuador[]> {
        try {
            return await this._repository.find({
                where: { tatuador: { id: tatuadorId } },
                relations: {
                    turnoSesion: { cliente: true, imagenes: true }
                },
                order: { turnoSesion: { fecha_hora_inicio: "ASC" } }
            });
        } catch (error) {
            throw new DatabaseErrorCustom('Error al buscar turnos por tatuador', 500);
        }
    }

    // --- Métodos Genéricos (Heredados de IBaseRepository) ---
    // (Implementación de los métodos CRUD genéricos para esta tabla específica)

    async findAll(): Promise<TurnoTatuador[]> {
        return this._repository.find();
    }

    async findOne(id: number): Promise<TurnoTatuador | undefined> {
        return undefined;
    }

    async create(obj: TurnoTatuador): Promise<TurnoTatuador> {
        // 'save' también se usa para 'create'
        return this._repository.save(obj);
    }

    async update(id: number, obj: Partial<TurnoTatuador>): Promise<TurnoTatuador> {
        await this._repository.update(id, obj);
        return (await this.findOne(id))!; // Recarga para devolver el objeto actualizado
    }

    async delete(id: number): Promise<TurnoTatuador | undefined> {
        const asignacion = await this.findOne(id);
        if (!asignacion) return undefined;
        await this._repository.remove(asignacion);
        return asignacion;
    }
}
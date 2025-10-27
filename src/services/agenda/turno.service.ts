import { inject, injectable } from "inversify";
import { AppDataSource } from "../../config/pg-database/db.js";
import { ValidationError } from "../../middleware/errorHandler/validationError.js";
import { TurnoSesion } from "../../models/turno-sesion/turno-sesion.entity.js";
import { TurnoTatuador } from "../../models/turno-tatuador/turno-tatuador.entity.js";
import { User } from "../../models/usuarios/user.entity.js";
import { ITurnosService } from "../interfaces/agenda/ITurno.service.js";
// Asumo la ruta de tu enum, ajústala si es necesario
import { EstadoTurno } from "../../models/enums/estado-turno.enum.js";
import { Not } from "typeorm";

// Interfaz DTO para la creación de turnos
export interface SolicitarTurnoDto {
    tatuadorId: number;
    fecha_hora_inicio: string | Date;
    fecha_hora_fin: string | Date;
    descripcion_cliente: string;
}

@injectable()
export class TurnosService implements ITurnosService {

    private turnoRepo = AppDataSource.getRepository(TurnoSesion);
    private turnoTatuadorRepo = AppDataSource.getRepository(TurnoTatuador);
    private userRepo = AppDataSource.getRepository(User);

    /**
     * Valida si un tatuador está disponible en el rango de fechas solicitado.
     * Busca turnos que NO estén cancelados o rechazados y que se solapen con el nuevo horario.
     */
    private async validarDisponibilidad(
        tatuadorId: number, 
        inicio: Date, 
        fin: Date,
        manager = AppDataSource.manager // Puede recibir un manager transaccional
    ): Promise<void> {
        
        const repo = manager.getRepository(TurnoTatuador);

        // Lógica de solapamiento:
        // Un solapamiento existe si:
        // (InicioNuevo < FinExistente) Y (FinNuevo > InicioExistente)
        const turnoSolapado = await repo.createQueryBuilder("tt")
            .innerJoin("tt.turnoSesion", "ts")
            .where("tt.tatuador.id = :tatuadorId", { tatuadorId })
            .andWhere("ts.estado NOT IN (:...estados)", { 
                estados: [EstadoTurno.CANCELADA, EstadoTurno.RECHAZADA] 
            })
            .andWhere("ts.fecha_hora_inicio < :fin", { fin })   // InicioNuevo < FinExistente
            .andWhere("ts.fecha_hora_fin > :inicio", { inicio }) // FinNuevo > InicioExistente
            .getOne();

        if (turnoSolapado) {
            throw new ValidationError(
                "El tatuador ya tiene un turno asignado que se solapa con ese horario.", 
                409 // 409 Conflict
            );
        }
    }

    public async solicitarTurno(datos: SolicitarTurnoDto, clienteId: number): Promise<TurnoSesion> {
        
        const { tatuadorId, fecha_hora_inicio, fecha_hora_fin, descripcion_cliente } = datos;

        const newStart = new Date(fecha_hora_inicio);
        const newEnd = new Date(fecha_hora_fin);

        if (newEnd <= newStart) {
            throw new ValidationError("La fecha de fin debe ser posterior a la fecha de inicio.", 400);
        }

        // Validar que el cliente y tatuador existan
        const cliente = await this.userRepo.findOneBy({ id: clienteId });
        const tatuador = await this.userRepo.findOneBy({ id: tatuadorId });
        if (!cliente) throw new ValidationError("Cliente no encontrado", 404);
        if (!tatuador) throw new ValidationError("Tatuador no encontrado", 404);
        // Aquí podrías validar que el tatuadorId tenga el ROL de tatuador

        return AppDataSource.transaction(async (manager) => {
            
            // Validar disponibilidad DENTRO de la transacción
            await this.validarDisponibilidad(tatuadorId, newStart, newEnd, manager);

            // Crear el TurnoSesion 
            const nuevoTurno = new TurnoSesion();
            nuevoTurno.cliente = cliente;
            nuevoTurno.fecha_hora_inicio = newStart;
            nuevoTurno.fecha_hora_fin = newEnd;
            nuevoTurno.descripcion_cliente = descripcion_cliente;
            nuevoTurno.estado = EstadoTurno.PENDIENTE; // Estado inicial
            nuevoTurno.creationuser = cliente.username;
            
            const turnoGuardado = await manager.save(nuevoTurno);

            // Crear la relación en la tabla Pivote
            const nuevaAsignacion = new TurnoTatuador();
            nuevaAsignacion.tatuador = tatuador;
            nuevaAsignacion.turnoSesion = turnoGuardado;
            
            await manager.save(nuevaAsignacion);

            // Retornamos el turno con la asignación cargada
            // (findone para recargar la relación que acabamos de crear)
            return await manager.findOne(TurnoSesion, {
                where: { id: turnoGuardado.id },
                relations: { 
                    tatuadoresAsignados: { tatuador: true }, // Asumo este nombre de relación
                    cliente: true 
                }
            }) as TurnoSesion;
        });
    }

    /**
     * Obtiene todos los turnos asignados a un tatuador específico.
     * Retorna las entradas de la tabla pivote (TurnoTatuador)
     */
    public async getTurnosByTatuador(tatuadorId: number): Promise<TurnoTatuador[]> {
        return this.turnoTatuadorRepo.find({
            where: { 
                tatuador: { id: tatuadorId } 
            },
            relations: {
                turnoSesion: {
                    cliente: true,
                    imagenes: true // Asumo que 'imagenes' es una relación en TurnoSesion
                }
            },
            order: {
                turnoSesion: {
                    fecha_hora_inicio: "ASC"
                }
            }
        });
    }

    /**
     * Obtiene todos los turnos solicitados por un cliente específico.
     * Retorna las sesiones (TurnoSesion)
     */
    public async getTurnosByCliente(clienteId: number): Promise<TurnoSesion[]> {
        // Asumo que la relación inversa en TurnoSesion se llama 'asignacionesTatuador'
        return this.turnoRepo.find({
            where: {
                cliente: { id: clienteId }
            },
            relations: {
                tatuadoresAsignados: { tatuador: true },
                imagenes: true
            },
            order: {
                fecha_hora_inicio: "DESC"
            }
        });
    }

    /**
     * Obtiene un turno específico por su ID con todas las relaciones.
     */
    public async getTurnoById(turnoId: number): Promise<TurnoSesion> {
        const turno = await this.turnoRepo.findOne({
            where: { id: turnoId },
            relations: {
                cliente: true,
                imagenes: true,
                tatuadoresAsignados: { tatuador: true }
            }
        });

        if (!turno) {
            throw new ValidationError("Turno no encontrado", 404);
        }
        return turno;
    }


    /**
     * Permite a un gestor (tatuador) cambiar el estado de un turno.
     * (Ej: PENDIENTE -> APROBADO, APROBADO -> COMPLETADO)
     */
    public async actualizarEstadoTurno(
        turnoId: number, 
        nuevoEstado: EstadoTurno, 
        gestorId: number // ID del usuario (tatuador/admin) que realiza el cambio
    ): Promise<TurnoSesion> {

        return AppDataSource.transaction(async (manager) => {
            const turnoRepo = manager.getRepository(TurnoSesion);
            const userRepo = manager.getRepository(User);

            const gestor = await userRepo.findOneBy({ id: gestorId });
            if (!gestor) throw new ValidationError("Usuario gestor no encontrado", 404);

            const turno = await turnoRepo.findOne({
                where: { id: turnoId },
                relations: {
                    // Cargamos las asignaciones para validar permisos
                    tatuadoresAsignados: { tatuador: true }
                }
            });

            if (!turno) {
                throw new ValidationError("Turno no encontrado", 404);
            }

            // Validación de permisos: Solo el tatuador asignado puede gestionar el turno
            // (Aquí podrías agregar lógica para rol 'ADMIN')
            const estaAsignado = turno.tatuadoresAsignados!
                .some(asig => asig.tatuador?.id === gestorId);
            
            if (!estaAsignado) {
                 throw new ValidationError(
                    "No tienes permisos para modificar este turno. Solo el tatuador asignado puede hacerlo.", 
                    403 // 403 Forbidden
                );
            }

            // Validar transición de estado (ej: no se puede cancelar un turno completado)
            if (turno.estado === EstadoTurno.COMPLETADA || turno.estado === EstadoTurno.CANCELADA) {
                 throw new ValidationError(`El turno ya está ${turno.estado} y no se puede modificar.`, 409);
            }

            // Actualizar
            turno.estado = nuevoEstado;
            turno.modificationuser = gestor.username;
            turno.modificationtimestamp = new Date();

            return await manager.save(turno);
        });
    }

    // --- MÉTODOS CRUD GENÉRICOS (Para satisfacer la interfaz) ---

    /**
     * (Método CRUD genérico) Busca un turno por ID.
     * Prefiera usar getTurnoById si necesita las relaciones cargadas.
     */
    public async findOne(id: number): Promise<TurnoSesion | undefined> {
        return;
    }

    /**
     * (Método CRUD genérico) Devuelve todos los turnos.
     * (¡Cuidado! Esto puede devolver miles de turnos sin paginación).
     */
    public async findAll(): Promise<TurnoSesion[]> {
        return this.turnoRepo.find();
    }

    /**
     * (Método CRUD genérico) NO USAR.
     * Este método no incluye la lógica de negocio (como crear la asignación M:N en TurnoTatuador).
     * Use 'solicitarTurno' en su lugar.
     */
    public async create(data: any): Promise<TurnoSesion> {
        throw new Error(
            "Método 'create' no implementado. Use 'solicitarTurno' para asegurar la lógica de negocio."
        );
    }

    /**
     * (Método CRUD genérico) NO USAR.
     * Este método no incluye la lógica de negocio (como validar permisos del tatuador).
     * Use 'actualizarEstadoTurno' en su lugar.
     */
    public async update(id: number, data: any): Promise<TurnoSesion> {
        throw new Error(
            "Método 'update' no implementado. Use 'actualizarEstadoTurno' para asegurar la lógica de negocio."
        );
    }

    /**
     * (Método CRUD genérico) Borra un turno de la base de datos.
     * (¡Cuidado! Esto es un borrado físico).
     */
    public async delete(id: number): Promise<TurnoSesion | undefined> {
        const result = await this.turnoRepo.delete(id);
        if (result.affected === 0) {
            throw new ValidationError("Turno no encontrado para eliminar", 404);
        }
        return;
    }
}
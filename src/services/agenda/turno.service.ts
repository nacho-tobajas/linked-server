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
import { ImagenRef } from "../../models/imagen-ref/imagen-ref.entity.js";
import { TurnoMensaje } from "../../models/turno-sesion/turno-mensaje.entity.js";

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
    private imagenRefRepo = AppDataSource.getRepository(ImagenRef);
    private mensajeRepo = AppDataSource.getRepository(TurnoMensaje);
    
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

    public async solicitarTurno(datos: SolicitarTurnoDto, clienteId: number, imagePaths: string[]): Promise<TurnoSesion> {
        
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

        return AppDataSource.transaction(async (manager) => {
            
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

            const repoImg = manager.getRepository(ImagenRef);
            for (const path of imagePaths) {
                const nuevaImagen = new ImagenRef();
                nuevaImagen.turnoSesion = turnoGuardado;
                nuevaImagen.image_path = path;
                nuevaImagen.creationuser = cliente.username!;
                await repoImg.save(nuevaImagen); // Guardamos dentro de la transacción
            }

            // Retornamos el turno con la asignación cargada
            return await manager.findOne(TurnoSesion, {
                where: { id: turnoGuardado.id },
                relations: { 
                    tatuadoresAsignados: { tatuador: true }, 
                    cliente: true,
                    imagenes: true 
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
                    imagenes: true
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

    async updateTurno(id: number, changes: { fecha_hora_inicio?: string, estado?: string }): Promise<TurnoSesion | null> {
    
    const turno = await this.turnoRepo.findOne({ 
        where: { id: id },
        relations: ['cliente', 'tatuadoresAsignados', 'tatuadoresAsignados.tatuador']});
        if (!turno) return null;
    if (changes.estado) {
      turno.estado = changes.estado as any;
    }

    if (changes.fecha_hora_inicio) {
      const nuevaFechaInicio = new Date(changes.fecha_hora_inicio);
      if (nuevaFechaInicio < new Date()) {
          throw new ValidationError("No puedes mover un turno al pasado.", 400);
      }

      if (turno.fecha_hora_fin && turno.fecha_hora_inicio) {
          
          const duracionMs = new Date(turno.fecha_hora_fin).getTime() - new Date(turno.fecha_hora_inicio).getTime();
          const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracionMs);

          if (turno.tatuadoresAsignados && turno.tatuadoresAsignados.length > 0) {
             for (const asignacion of turno.tatuadoresAsignados) {
                 if (asignacion.tatuador) {
                     await this.validarDisponibilidad(
                         asignacion.tatuador.id!, 
                         nuevaFechaInicio, 
                         nuevaFechaFin
                     );
                 }
             }
          }

          turno.fecha_hora_inicio = nuevaFechaInicio;
          turno.fecha_hora_fin = nuevaFechaFin;
      }
    }
    await this.turnoRepo.update(id, {
        fecha_hora_inicio: turno.fecha_hora_inicio,
        fecha_hora_fin: turno.fecha_hora_fin,
        estado: turno.estado
    });
    return await this.turnoRepo.findOne({
        where: { id: id },
        relations: ['cliente', 'tatuadoresAsignados', 'tatuadoresAsignados.tatuador', 'imagenes'] // Trae todo lo que usa el modal
    });
  }


    /**
     * Permite a un gestor (tatuador) cambiar el estado de un turno.
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
            const estaAsignado = turno.tatuadoresAsignados!
                .some(asig => asig.tatuador?.id === gestorId);
            
            if (!estaAsignado) {
                 throw new ValidationError(
                    "No tienes permisos para modificar este turno. Solo el tatuador asignado puede hacerlo.", 
                    403 
                );
            }

            // Validar transición de estado (ej: no se puede cancelar un turno completado)
            if (turno.estado === EstadoTurno.COMPLETADA || turno.estado === EstadoTurno.CANCELADA) {
                 throw new ValidationError(`El turno ya está ${turno.estado} y no se puede modificar.`, 409);
            }

            await manager.update(TurnoSesion, turnoId, {
                estado: nuevoEstado,
                modificationuser: gestor.username,
                modificationtimestamp: new Date()
            });

            const turnoActualizado = await manager.findOne(TurnoSesion, {
                where: { id: turnoId },
                relations: { 
                    cliente: true,
                    tatuadoresAsignados: { tatuador: true } 
                } 
            });

            return turnoActualizado!;
        });
    }

    /**
   * Envía un mensaje en el contexto de un turno.
   */
  public async enviarMensaje(turnoId: number, usuarioId: number, texto: string): Promise<TurnoMensaje> {
    
    // Validar que el turno existe
    const turno = await this.turnoRepo.findOne({ 
        where: { id: turnoId },
        relations: { cliente: true, tatuadoresAsignados: { tatuador: true } }
    });
    
    if (!turno) throw new ValidationError("Turno no encontrado", 404);

    // Validar Seguridad: ¿El usuario es el cliente O el tatuador asignado?
    const esCliente = turno.cliente?.id === usuarioId;
    const esTatuador = turno.tatuadoresAsignados?.some(tt => tt.tatuador?.id === usuarioId);

    if (!esCliente && !esTatuador) {
        throw new ValidationError("No tienes permiso para comentar en este turno.", 403);
    }

    const usuario = await this.userRepo.findOneBy({ id: usuarioId });
    
    const nuevoMensaje = new TurnoMensaje();
    nuevoMensaje.turnoSesion = turno;
    nuevoMensaje.usuarioEnvia = usuario!;
    nuevoMensaje.mensaje = texto;
    
    return this.mensajeRepo.save(nuevoMensaje);
  }

  /**
   * Obtiene el historial de mensajes de un turno
   */
  public async getMensajesTurno(turnoId: number): Promise<TurnoMensaje[]> {
      return this.mensajeRepo.find({
          where: { turnoSesion: { id: turnoId } },
          relations: { usuarioEnvia: true }, // Para mostrar el nombre y foto de quien escribe
          order: { timestamp: 'ASC' } // Del más viejo al más nuevo (tipo chat)
      });
  }



    public async findOne(id: number): Promise<TurnoSesion | undefined> {
        return;
    }

    public async findAll(): Promise<TurnoSesion[]> {
        return this.turnoRepo.find();
    }

    public async create(data: any): Promise<TurnoSesion> {
        throw new Error(
            "Método 'create' no implementado. Use 'solicitarTurno' para asegurar la lógica de negocio."
        );
    }

    public async update(id: number, data: any): Promise<TurnoSesion> {
        throw new Error(
            "Método 'update' no implementado. Use 'actualizarEstadoTurno' para asegurar la lógica de negocio."
        );
    }

    public async delete(id: number): Promise<TurnoSesion | undefined> {
        const result = await this.turnoRepo.delete(id);
        if (result.affected === 0) {
            throw new ValidationError("Turno no encontrado para eliminar", 404);
        }
        return;
    }
}
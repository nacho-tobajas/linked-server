import { TurnoTatuador } from '../../../models/turno-tatuador/turno-tatuador.entity.js';
import { TurnoSesion } from '../../../models/turno-sesion/turno-sesion.entity.js';
import { IBaseService } from '../IBaseService.js';
import { EstadoTurno } from '../../../models/enums/estado-turno.enum.js';
import { TurnoMensaje } from '../../../models/turno-sesion/turno-mensaje.entity.js';

export interface ITurnosService extends IBaseService<TurnoSesion> {
    solicitarTurno(datos: any, clienteId: number, imagePaths: string[]): Promise<TurnoSesion>;
    getTurnosByTatuador(tatuadorId: number): Promise<TurnoTatuador[]>;
    getTurnosByCliente(clienteId: number): Promise<TurnoSesion[]>;
    getTurnoById(turnoId: number): Promise<TurnoSesion>;
    actualizarEstadoTurno(
        turnoId: number, 
        nuevoEstado: EstadoTurno, 
        gestorId: number
    ): Promise<TurnoSesion>;
    enviarMensaje(turnoId: number, usuarioId: number, texto: string): Promise<TurnoMensaje>;
    getMensajesTurno(turnoId: number): Promise<TurnoMensaje[]>;
    updateTurno(id: number, changes: { fecha_hora_inicio?: string, estado?: string }): Promise<TurnoSesion | null>;

}

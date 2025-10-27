import { TurnoTatuador } from '../../../models/turno-tatuador/turno-tatuador.entity.js';
import { TurnoSesion } from '../../../models/turno-sesion/turno-sesion.entity.js';
import { IBaseService } from '../IBaseService.js';
import { EstadoTurno } from '../../../models/enums/estado-turno.enum.js';

export interface ITurnosService extends IBaseService<TurnoSesion> {
    solicitarTurno(datos: any, clienteId: number): Promise<TurnoSesion>;
    getTurnosByTatuador(tatuadorId: number): Promise<TurnoTatuador[]>;
    getTurnosByCliente(clienteId: number): Promise<TurnoSesion[]>;
    getTurnoById(turnoId: number): Promise<TurnoSesion>;
    actualizarEstadoTurno(
        turnoId: number, 
        nuevoEstado: EstadoTurno, 
        gestorId: number
    ): Promise<TurnoSesion>;
}

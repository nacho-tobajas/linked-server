import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPatch, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { TurnosService } from '../../services/agenda/turno.service.js';
import { ITurnosService } from '../../services/interfaces/agenda/ITurno.service.js';
import { uploadTurno } from '../../config/cloudinary/multer.config.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { EstadoTurno } from '../../models/enums/estado-turno.enum.js';

@controller('/api/turnos')
export class TurnosController {

  constructor(
    @inject(TurnosService) private _turnosService: ITurnosService
  ) {}


  // --- Endpoint para el CLIENTE (solicitar turno) ---
  @httpPost('/solicitar', authenticateToken, authorizeRol('Cliente'), uploadTurno.array('imagenes', 3))
  public async solicitarTurno(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = req.user?.id; 
      const datosTurno = req.body; 
      
      const files = req.files as Express.Multer.File[];

      const filePaths = files ? files.map(file => `/uploads/turnos/${file.filename}`) : [];

      const nuevoTurno = await this._turnosService.solicitarTurno(datosTurno, clienteId!, filePaths);
      res.status(201).json(nuevoTurno);
    } catch (error) {
      next(error);
    }
  }

  // --- Endpoint para el CLIENTE (Ver sus reservas) ---
  @httpGet('/mis-reservas-cliente', authenticateToken, //authorizeRol('Cliente')
    )
  public async getMisReservasCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = req.user?.id;
      const turnos = await this._turnosService.getTurnosByCliente(clienteId!);
      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }

  // --- Endpoint para el TATUADOR (Ver su agenda) ---
  @httpGet('/mis-turnos', authenticateToken, authorizeRol('Tatuador'))
  public async getMisTurnos(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = req.user?.id;
      const turnos = await this._turnosService.getTurnosByTatuador(tatuadorId!);
      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para que el Tatuador gestione un turno (Aprobar, Rechazar, Completar)
  @httpPatch('/gestionar/:idTurno', authenticateToken, authorizeRol('Tatuador'))
  public async gestionarTurno(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = req.user?.id;
      const turnoId = parseInt(req.params.idTurno, 10);
      
      const { estado } = req.body; 

      if (!estado || !Object.values(EstadoTurno).includes(estado)) {
        throw new ValidationError("Se requiere un estado válido.", 400);
      }

      const turnoActualizado = await this._turnosService.actualizarEstadoTurno(
        turnoId,
        estado as EstadoTurno,
        tatuadorId!
      );

      res.status(200).json(turnoActualizado);

    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  public async updateTurno(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const datosActualizar = req.body; // { fecha_hora_inicio, estado }

      const turnoActualizado = await this._turnosService.updateTurno(id, datosActualizar);
      
      if (turnoActualizado) {
        res.status(200).json(turnoActualizado);
      } else {
        res.status(404).json({ message: 'Turno no encontrado' });
      }
    } catch (error) {
      next(error);
    }
  }

  //Obtener mensajes
  @httpGet('/:id/mensajes', authenticateToken)
  public async getMensajes(req: Request, res: Response, next: NextFunction) {
    try {
      const turnoId = parseInt(req.params.id, 10);
      const mensajes = await this._turnosService.getMensajesTurno(turnoId);
      res.status(200).json(mensajes);
    } catch (error) {
      next(error);
    }
  }

  // Enviar mensaje
  @httpPost('/:id/mensajes', authenticateToken)
  public async enviarMensaje(req: Request, res: Response, next: NextFunction) {
    try {
      const turnoId = parseInt(req.params.id, 10);
      const usuarioId = req.user?.id;
      const { mensaje } = req.body;

      if (!mensaje) throw new ValidationError("El mensaje no puede estar vacío", 400);

      const mensajeCreado = await this._turnosService.enviarMensaje(turnoId, usuarioId!, mensaje);
      res.status(201).json(mensajeCreado);
    } catch (error) {
      next(error);
    }
  }

}
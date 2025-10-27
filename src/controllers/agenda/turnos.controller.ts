import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { TurnosService } from '../../services/agenda/turno.service.js';
import { ITurnosService } from '../../services/interfaces/agenda/ITurno.service.js';

@controller('/api/turnos')
export class TurnosController {

  constructor(
    @inject(TurnosService) private _turnosService: ITurnosService
  ) {}


  // --- Endpoint para el CLIENTE (solicitar turno) ---
  @httpPost('/solicitar', authenticateToken, authorizeRol('Cliente'))
  public async solicitarTurno(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = req.user?.id; // ID del cliente desde el token
      const datosTurno = req.body; 
      // (Ej: { "tatuadorId": 2, "fecha_hora_inicio": "2025-11-20T14:00:00", ... })
      
      const nuevoTurno = await this._turnosService.solicitarTurno(datosTurno, clienteId!);
      res.status(201).json(nuevoTurno);
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

  // ... (Aquí irían los endpoints PATCH para gestionar turnos)

}
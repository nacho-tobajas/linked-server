import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { TurnosService } from '../../services/agenda/turno.service.js';
import { ITurnosService } from '../../services/interfaces/agenda/ITurno.service.js';
import { uploadTurno } from '../../config/cloudinary/multer.config.js';

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

      console.log('--- NUEVA SOLICITUD DE TURNO ---');
      console.log('DATOS DE TEXTO (req.body):', datosTurno);
      console.log('ARCHIVOS RECIBIDOS (req.files):', files);

      const filePaths = files ? files.map(file => `/uploads/turnos/${file.filename}`) : [];

      const nuevoTurno = await this._turnosService.solicitarTurno(datosTurno, clienteId!, filePaths);
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
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPut } from 'inversify-express-utils';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js'; // Tu middleware de auth
import { IAgendaService } from '../../services/interfaces/agenda/IAgenda.service.js';
import { AgendaService } from '../../services/agenda/agenda.service.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';

@controller('/api/agenda') // Ruta base para la agenda
export class AgendaController {

    private _agendaService: IAgendaService;

    constructor(
        @inject(AgendaService) agendaService: IAgendaService // Inyecta el servicio de agenda
    ) {
        this._agendaService = agendaService;
    }

    // --- ENDPOINT PARA OBTENER EL HORARIO HABITUAL ---
    @httpGet('/horario-habitual', authenticateToken, authorizeRol('Tatuador')) // Solo tatuadores logueados
    public async getHorarioHabitual(req: Request, res: Response, next: NextFunction) {
        try {
            // Obtenemos el ID del tatuador desde el token (req.user viene de authenticateToken)
            const tatuadorId = req.user?.id;
    if (!tatuadorId || typeof tatuadorId !== 'number') {
                console.error('[AgendaController] ID de tatuador inválido o no encontrado en token:', req.user);
                return res.status(403).json({ message: 'Acceso denegado o ID de usuario inválido.' });
            }

            const horario = await this._agendaService.getHorarioHabitual(tatuadorId);
            res.status(200).json(horario); // Devuelve el array de horarios o []

        } catch (error) {
            next(error);
        }
    }

    // --- ENDPOINT PARA GUARDAR/ACTUALIZAR EL HORARIO HABITUAL ---
    @httpPut('/horario-habitual', authenticateToken, authorizeRol('Tatuador')) // Solo tatuadores
    public async updateHorarioHabitual(req: Request, res: Response, next: NextFunction) {
        try {
            const tatuadorId = req.user?.id;
            const username = req.user?.username; 

            if (!tatuadorId || typeof tatuadorId !== 'number') {
                console.error('[AgendaController] ID de tatuador inválido o no encontrado en token:', req.user);
               return res.status(403).json({ message: 'Acceso denegado o ID de usuario inválido.' });
            }

            const nuevoHorario = req.body;
            console.log(`[AgendaController] PUT /horario-habitual para tatuador ID: ${tatuadorId} por ${username}. Data recibida:`, nuevoHorario);

            const horarioActualizado = await this._agendaService.updateHorarioHabitual(tatuadorId, nuevoHorario, username);
            res.status(200).json(horarioActualizado);

        } catch (error) {
             console.error('[AgendaController] Error en PUT /horario-habitual:', error);
             if (error instanceof ValidationError || error instanceof DatabaseErrorCustom) {
                    return res.status(error.status || 400).json({ message: error.message });
                } else if (error instanceof Error) {
                    return res.status(500).json({ message: error.message });
                } else {
                    return res.status(500).json({ message: 'An unexpected error occurred' });
                }
        }


}}
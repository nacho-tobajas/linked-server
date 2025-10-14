import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { authenticateToken } from '../../middleware/auth/authToken.js';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { createEspecialidadValidationRules, updateEspecialidadValidationRules, deleteEspecialidadValidationRules, getEspecialidadValidationRules } from '../../middleware/validation/validations-rules/especialidades-validations.js';
import { AppDataSource } from '../../config/pg-database/db.js';
import { User } from '../../models/usuarios/user.entity.js';
import { IEspecialidadesService } from '../../services/interfaces/especialidades/IEspecialidades.service.js';
import { Especialidades } from '../../models/especialidades/especialidades.entity.js';
import { EspecialidadesService } from '../../services/especialidades/especialidades.service.js';

@controller('/api/especialidades')
export class EspecialidadesController {
  private _especialidadesService: IEspecialidadesService;

  constructor(
    @inject(EspecialidadesService) especialidadesService: IEspecialidadesService
  ) {
    this._especialidadesService = especialidadesService;
  }

  @httpGet('/findall')
  public async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const especialidades = await this._especialidadesService.findAll();
      if (especialidades.length > 0) {
        res.status(200).json(especialidades);
      } else {
        res.status(404).json({ message: 'No se encontraron especialidades' });
      }
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id', validateInputData(getEspecialidadValidationRules))
  public async findOne(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id, 10);
    try {
      const especialidad = await this._especialidadesService.findOne(id);
      if (especialidad) {
        res.status(200).json(especialidad);
      } else {
        res.status(404).json({ message: 'Especialidad no encontrada' });
      }
    } catch (error) {
      next(error);
    }
  }

  @httpPost('/create', validateInputData(createEspecialidadValidationRules), authenticateToken)
  public async create(req: Request, res: Response, next: NextFunction) {
    const newEspecialidad: Especialidades = req.body;
    try {
      const created = await this._especialidadesService.create(newEspecialidad);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id', validateInputData(updateEspecialidadValidationRules), authenticateToken)
  public async update(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id, 10);
    const updates: Especialidades = req.body;
    try {
      const updated = await this._especialidadesService.update(id, updates);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  @httpDelete('/:id', validateInputData(deleteEspecialidadValidationRules))
  public async delete(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id, 10);
    try {
      const deleted = await this._especialidadesService.delete(id);
      if (deleted) {
        res.status(200).json(deleted);
      } else {
        res.status(404).json({ message: 'Especialidad no encontrada' });
      }
    } catch (error) {
      next(error);
    }
  }

}
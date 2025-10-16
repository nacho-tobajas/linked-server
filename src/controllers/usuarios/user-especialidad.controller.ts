import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, httpGet, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
//import  } from '../../middleware/auth/authToken.js';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { UserService } from '../../services/user/user.service.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { assignEspecialidadesToUserValidationRules } from '../../middleware/validation/validations-rules/user-validations.js';
import { UserEspecialidadService } from '../../services/user/user-especialidad.service.js';

@controller('/api/tatuador')
export class UserEspecialidadController {
  constructor(
    @inject(UserEspecialidadService) private _userEspecialidadService: UserEspecialidadService
  ) {}

  // Obtener las especialidades asignadas a un tatuador
  @httpGet('/:userId/especialidades')
  public async getEspecialidadesByTatuador(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.params.userId, 10);
    try {
      const especialidades = await this._userEspecialidadService.getUserEspecialidades(userId);
      res.status(200).json(especialidades);
    } catch (error) {
      next(error);
    }
  }

  // Asignar una o más especialidades a un tatuador
  @httpPost('/:userId/asignar-especialidades', validateInputData(assignEspecialidadesToUserValidationRules))
  public async assignEspecialidades(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.params.userId, 10);
    const { especialidadIds } = req.body; // ejemplo: { especialidadIds: [1, 3, 5] }

    try {
      const updatedEspecialidades = await this._userEspecialidadService.updateUserEspecialidades(userId, especialidadIds);
      res.status(200).json(updatedEspecialidades);
    } catch (error) {
      next(error);
    }
  }

  // Quitar una especialidad de un tatuador
  @httpDelete('/:userId/quitar-especialidad/:especialidadId')
  public async removeEspecialidad(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.params.userId, 10);
    const especialidadId = parseInt(req.params.especialidadId, 10);

    try {
      const updatedEspecialidades = await this._userEspecialidadService.removeEspecialidad(userId, especialidadId);
      res.status(200).json(updatedEspecialidades);
    } catch (error) {
      next(error);
    }
  }
}
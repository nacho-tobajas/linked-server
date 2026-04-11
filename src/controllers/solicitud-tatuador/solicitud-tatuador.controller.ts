import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPut, BaseHttpController } from 'inversify-express-utils';
import { inject } from 'inversify';
import { SolicitudTatuadorService } from '../../services/solicitud-tatuador/solicitud-tatuador.service.js';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';

@controller('/api/solicitudes-tatuador')
export class SolicitudTatuadorController extends BaseHttpController {
  constructor(
    @inject(SolicitudTatuadorService) private service: SolicitudTatuadorService
  ) {
    super();
  }

  @httpGet('/', authenticateToken, authorizeRol('Administrador'))
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const solicitudes = await this.service.findAll();
      res.json(solicitudes);
    } catch (err) { next(err); }
  }

  @httpPut('/:id/aprobar', authenticateToken, authorizeRol('Administrador'))
  async aprobar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const adminUser = (req as any).user?.username ?? 'admin';
      const result = await this.service.aprobar(id, adminUser);
      res.json(result);
    } catch (err) { next(err); }
  }

  @httpPut('/:id/rechazar', authenticateToken, authorizeRol('Administrador'))
  async rechazar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const adminUser = (req as any).user?.username ?? 'admin';
      const { notas } = req.body;
      const result = await this.service.rechazar(id, adminUser, notas);
      res.json(result);
    } catch (err) { next(err); }
  }
}

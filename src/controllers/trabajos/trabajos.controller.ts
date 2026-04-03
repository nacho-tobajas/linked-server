import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { TrabajosService } from '../../services/trabajos/trabajos.service.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { uploadTrabajo } from '../../config/cloudinary/multer.config.js';

@controller('/api/trabajos')
export class TrabajosController {

  constructor(@inject(TrabajosService) private trabajosService: TrabajosService) { }

  //Feed global (publico)
  @httpGet('/feed')
  public async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const trabajos = await this.trabajosService.getAllTrabajosRecientes();
      res.json(trabajos);
    } catch (e) {
      next(e);
    }
  }

  // Subir Trabajo (Tatuador)
  @httpPost('/', authenticateToken, authorizeRol('Tatuador'), uploadTrabajo.array('imagen', 5))
  public async subirTrabajo(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const tatuadorId = req.user?.id;
      const { descripcion } = req.body;

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new ValidationError("Se requiere al menos una imagen", 400);
      }

      const paths = files.map(file => `/uploads/trabajos/${file.filename}`);

      const trabajo = await this.trabajosService.subirTrabajo(tatuadorId!, paths, descripcion, username);

      res.status(201).json(trabajo);
    } catch (e) { next(e); }
  }

  // Ver Trabajos de un Tatuador 
  @httpGet('/tatuador/:id')
  public async getPorTatuador(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = parseInt(req.params.id, 10);
      const trabajos = await this.trabajosService.getTrabajosDeTatuador(tatuadorId);
      res.json(trabajos);
    } catch (e) { next(e); }
  }

  // Dar Like (Cliente)
  @httpPost('/:id/favorito', authenticateToken, authorizeRol('Cliente'))
  public async darLike(req: Request, res: Response, next: NextFunction) {
    try {
      const trabajoId = parseInt(req.params.id, 10);
      const clienteId = req.user?.id;
      await this.trabajosService.darLike(clienteId!, trabajoId);
      res.status(200).json({ message: 'Like agregado' });
    } catch (e) { next(e); }
  }

  // Quitar Like (Cliente)
  @httpDelete('/:id/favorito', authenticateToken, authorizeRol('Cliente'))
  public async quitarLike(req: Request, res: Response, next: NextFunction) {
    try {
      const trabajoId = parseInt(req.params.id, 10);
      const clienteId = req.user?.id;
      await this.trabajosService.quitarLike(clienteId!, trabajoId);
      res.status(200).json({ message: 'Like removido' });
    } catch (e) { next(e); }
  }

  // Obtener IDs de likes
  @httpGet('/mis-favoritos/ids', authenticateToken,)//  authorizeRol('Cliente')
  public async getMisLikes(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = req.user?.id;
      const ids = await this.trabajosService.getMisLikesIds(clienteId!);
      res.json(ids);
    } catch (e) { next(e); }
  }

  @httpGet('/:id', authenticateToken)
  public async getTrabajoById(req: Request, res: Response, next: NextFunction) {
    try {
      const trabajoId = parseInt(req.params.id, 10);
      const trabajo = await this.trabajosService.getTrabajoById(trabajoId);
      res.json(trabajo);
    } catch (e) { next(e); }
  }
}
import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { InstagramService } from '../../services/instagram/instagram.service.js';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';

@controller('/api/instagram')
export class InstagramController {

  constructor(@inject(InstagramService) private instagramService: InstagramService) { }

  /**
   * GET /api/instagram/auth?tatuadorId=123
   * Inicia el flujo OAuth de Meta. Angular redirige el navegador aquí con el ID del tatuador.
   * Codificamos el tatuadorId en el parámetro `state` para recuperarlo en el callback.
   */
  @httpGet('/auth')
  public loginWithInstagram(req: Request, res: Response) {
    const tatuadorId = req.query.tatuadorId as string;

    if (!tatuadorId || isNaN(Number(tatuadorId))) {
      return res.status(400).json({ message: 'Se requiere el parámetro tatuadorId' });
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI;
    const scopes = 'instagram_basic,pages_show_list,pages_read_engagement';

    // Codificamos el tatuadorId en state para recuperarlo cuando Meta nos devuelva el callback
    const state = Buffer.from(JSON.stringify({ tatuadorId })).toString('base64');

    const facebookAuthUrl =
      `https://www.facebook.com/v19.0/dialog/oauth` +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri!)}` +
      `&scope=${scopes}` +
      `&response_type=code` +
      `&state=${state}`;

    res.redirect(facebookAuthUrl);
  }

  /**
   * GET /api/instagram/callback
   * Meta redirige aquí con el `code` y el `state` después de que el usuario autoriza.
   * Intercambia el code por un token de larga duración y lo persiste en la BD.
   * (Este endpoint debe coincidir con META_REDIRECT_URI en el .env)
   */
  @httpGet('/callback')
  public async callbackInstagram(req: Request, res: Response, next: NextFunction) {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const error = req.query.error as string;

    const frontendUrl = (process.env.FRONT_BASE_URL ?? 'http://localhost:4200/').replace(/\/$/, '');

    // El usuario canceló el acceso en Meta
    if (error) {
      return res.redirect(`${frontendUrl}/info?instagram=denied`);
    }

    if (!code || !state) {
      return res.status(400).json({ message: 'Parámetros incompletos en el callback de Meta' });
    }

    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      const tatuadorId = Number(decoded.tatuadorId);

      if (!tatuadorId || isNaN(tatuadorId)) {
        return res.status(400).json({ message: 'State inválido en el callback de Meta' });
      }

      await this.instagramService.processOAuthCallback(code, tatuadorId);

      res.redirect(`${frontendUrl}/info?instagram=success`);

    } catch (err: any) {
      console.error('Error en el callback de Instagram:', err?.response?.data ?? err.message);
      next(err);
    }
  }

  /**
   * POST /api/instagram/sync
   * Sincroniza los posts de Instagram del tatuador autenticado como Trabajos en la BD.
   */
  @httpPost('/sync', authenticateToken, authorizeRol('Tatuador'))
  public async syncPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = req.user?.id!;
      const result = await this.instagramService.syncInstagramPosts(tatuadorId);
      res.json({
        message: `Sincronización completada: ${result.synced} nuevos posts importados, ${result.skipped} omitidos.`,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/instagram/status
   * Retorna si el tatuador autenticado tiene su cuenta de Instagram vinculada.
   */
  @httpGet('/status', authenticateToken, authorizeRol('Tatuador'))
  public async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = req.user?.id!;
      const status = await this.instagramService.getInstagramStatus(tatuadorId);
      res.json(status);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/instagram/disconnect
   * Desvincula la cuenta de Instagram del tatuador autenticado.
   */
  @httpDelete('/disconnect', authenticateToken, authorizeRol('Tatuador'))
  public async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const tatuadorId = req.user?.id!;
      await this.instagramService.disconnectInstagram(tatuadorId);
      res.json({ message: 'Cuenta de Instagram desvinculada correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}

import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@controller('/api/instagram/callback')
export class InstagramController {

    // 1. El endpoint que inicia todo. Angular llamará acá cuando el tatuador haga clic en "Vincular Instagram"
    @httpGet('/auth')
    public loginWithInstagram(req: Request, res: Response) {
        const appId = process.env.META_APP_ID;
        const redirectUri = process.env.META_REDIRECT_URI;

        // Permisos que le vamos a pedir al tatuador (leer su info básica y ver las páginas de su negocio)
        const scopes = 'instagram_basic,pages_show_list,pages_read_engagement';

        // Construimos la URL oficial de Facebook/Meta para pedir permisos
        const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;

        // Redirigimos al usuario a la pantalla de Meta
        res.redirect(facebookAuthUrl);
    }

    // 2. El endpoint que recibe a Meta de vuelta
    @httpGet('/callback')
    public async callbackInstagram(req: Request, res: Response, next: NextFunction) {
        // Meta nos envía un código temporal por la URL
        const code = req.query.code as string;

        if (!code) {
            return res.status(400).json({ message: 'No se recibió el código de autorización de Meta' });
        }

        try {
            const appId = process.env.META_APP_ID;
            const appSecret = process.env.META_APP_SECRET;
            const redirectUri = process.env.META_REDIRECT_URI;

            // Intercambiamos el código temporal por el Token de Acceso definitivo
            const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
                params: {
                    client_id: appId,
                    redirect_uri: redirectUri,
                    client_secret: appSecret,
                    code: code
                }
            });

            const accessToken = tokenResponse.data.access_token;

            // ¡ÉXITO! Ya tenemos la llave de acceso.
            console.log('Token obtenido con éxito:', accessToken);

            // TODO: Acá deberás guardar este 'accessToken' en tu base de datos, 
            // asociándolo al tatuador correspondiente.

            // Finalmente, redirigimos al tatuador de vuelta a tu frontend de Angular
            // Podés enviarle un parámetro por URL para que Angular sepa que todo salió bien
            res.redirect('http://localhost:4200/panel-admin?instagram=success');

        } catch (error: any) {
            console.error('Error obteniendo el token de Meta:', error.response?.data || error.message);
            res.status(500).json({ message: 'Error en la autenticación con Instagram' });
        }
    }
}
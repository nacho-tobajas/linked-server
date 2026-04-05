// src/controllers/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.service.js';
import { AuthCryptography } from '../../middleware/auth/authCryptography.js';
import { controller, httpPost, httpGet } from 'inversify-express-utils';
import { inject} from 'inversify';
import { IAuthService } from '../../services/interfaces/auth/IAuthService.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { UserService } from '../../services/user/user.service.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { loginValidationRules } from '../../middleware/validation/validations-rules/auth-validations.js';
import axios from 'axios';
import { rsaPublicKey } from '../../shared/Utils/Keys.js';
import { InstagramService } from '../../services/instagram/instagram.service.js';
import { InstagramRepository } from '../../repositories/instagram/instagram.dao.js';

@controller('/api/auth')
export class AuthController {

  private _authService: IAuthService;
  private _userService: IUserService;
  private authCryptography = new AuthCryptography();

  constructor(
    @inject(AuthService) authService: IAuthService,
    @inject(UserService) userService: IUserService,
    @inject(InstagramService) private instagramService: InstagramService,
    @inject(InstagramRepository) private instagramRepo: InstagramRepository,
  )
  {
    this._authService = authService;
    this._userService = userService;
  }

  @httpGet('/public-key')
  public getPublicKey(_req: Request, res: Response) {
    return res.json({ publicKey: rsaPublicKey });
  }

  @httpPost('/login', validateInputData(loginValidationRules))
  public async login(req: Request, res: Response, next: NextFunction) {

    const { username, recaptchaToken } = req.body;
    const password = this.authCryptography.decrypt(req.body.password);

  try {
    // Validar reCAPTCHA solo en producción y cuando la secret key esté configurada
    if (process.env.NODE_ENV === 'production' && process.env.RECAPTCHA_SECRET_KEY) {
      const captchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
      );
      if (!captchaResponse.data.success) {
        throw new ValidationError('Captcha inválido, intente nuevamente.');
      }
    }

    // 🔹 Buscar usuario y validar password
    const user = await this._userService.findByUserName(username);

    if (!user?.id || !user.userauth?.password) {
      throw new ValidationError('Usuario no encontrado');
    }

    const accessToken = await this._authService.login(user, password);

    // Si es Tatuador, sincronizar Instagram en background solo si tiene token válido de larga duración
    if (user.currentRol?.description === 'Tatuador' && user.id) {
      this.instagramRepo.findByTatuadorId(user.id).then(tokenRecord => {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        const hasValidToken = tokenRecord?.access_token && tokenRecord.token_expires_at && tokenRecord.token_expires_at > oneHourFromNow;
        if (hasValidToken) {
          this.instagramService.syncInstagramPosts(user.id!).catch(() => {});
        }
      }).catch(() => {});
    }

    return res.json({ accessToken });

  } catch (error) {
    return next(error);
  }}
}

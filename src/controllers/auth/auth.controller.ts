// src/controllers/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.service.js';
import { controller, httpPost } from 'inversify-express-utils';
import { inject} from 'inversify';
import { IAuthService } from '../../services/interfaces/auth/IAuthService.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { UserService } from '../../services/user/user.service.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { loginValidationRules } from '../../middleware/validation/validations-rules/auth-validations.js';
import axios from 'axios';

@controller('/api/auth')
export class AuthController {

  private _authService: IAuthService;
  private _userService: IUserService;

  constructor(
    @inject(AuthService) authService: IAuthService,
    @inject(UserService) userService: IUserService,
  )
  {
    this._authService = authService;
    this._userService = userService;
  }

  @httpPost('/login', validateInputData(loginValidationRules))
  public async login(req: Request, res: Response, next: NextFunction) {

    const { username, password, recaptchaToken } = req.body;

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

    return res.json({ accessToken });

  } catch (error) {        
    return next(error);
  }}
}
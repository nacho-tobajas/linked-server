import { IBaseService } from '../IBaseService.js';
import { UserAuth } from '../../../models/usuarios/user-auth.entity.js';
import { User } from '../../../models/usuarios/user.entity.js';

export interface IAuthService {
  
  login(user: User, password: string): Promise <string>;

}

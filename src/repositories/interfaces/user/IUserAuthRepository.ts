
import { UserAuth } from '../../../models/usuarios/user-auth.entity.js';
import { User } from '../../../models/usuarios/user.entity.js';
import { IBaseRepository } from '../IBaseRepository.js';

export interface IUserAuthRepository extends IBaseRepository<UserAuth > {

  }
  

import { UserAuth } from '../../../models/usuarios/user-auth.entity.js';
import { User } from '../../../models/usuarios/user.entity.js';
import { IBaseRepository } from '../IBaseRepository.js';

export interface IUserRepository extends IBaseRepository<User | UserAuth > {
    
    findByUserName(userName: string): Promise<User | undefined>;
   
    registerUser( user: User): Promise<User>; 
  }
  
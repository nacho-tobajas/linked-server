
import { UserAuth } from '../../../models/usuarios/user-auth.entity.js';
import { User } from '../../../models/usuarios/user.entity.js';
import { IBaseRepository } from '../IBaseRepository.js';

export interface IUserRepository extends IBaseRepository<User> {
    
    findByUserName(userName: string): Promise<User | undefined>;
   
    registerUser( user: User): Promise<User>; 

    findByEmail(email: string): Promise<User | undefined>;

    findOneby(token: string):Promise<User | null>

    sendResetPassword(email: string, token: string): Promise<void>; //Nuevo

    updatePass(userid: number, newPassword: string): Promise<void>; //Nuevo
  }
  
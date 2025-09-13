// IUserService.ts

import { IBaseService } from '../IBaseService.js';
import { User } from '../../../models/usuarios/user.entity.js';
import { UserDto } from '../../../models-dto/usuarios/user-dto.entity.js';

export interface IUserService extends IBaseService<User | UserDto> {

  findByUserName(userName: string): Promise<User | undefined>;

  findByEmail(email: string): Promise<User | undefined>;//Nuevo

  updateUserByAdmin(id: number, user: User): Promise<User | undefined>;

  updatePassword(id: number, newPassword: string): Promise<void>; //Nuevo

  sendResetPass(email: string, token: string): Promise<void>; //Nuevo

  findByResetToken(token: string): Promise<User | null>;
}



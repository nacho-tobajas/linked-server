// IUserService.ts

import { IBaseService } from '../IBaseService.js';
import { User } from '../../../models/usuarios/user.entity.js';
import { UserDto } from '../../../models-dto/usuarios/user-dto.entity.js';

export interface IUserService extends IBaseService<User | UserDto> {
  // Métodos adicionales específicos para User, agregar cuando los haya

  findByUserName(userName: string): Promise<User | undefined>;

  updateUserByAdmin(id: number, user: User, rolToAsign?: string): Promise<User | undefined>;

}

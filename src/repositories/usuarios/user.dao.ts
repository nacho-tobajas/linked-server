// src/repositories/usuarios/user.repository.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { User } from '../../models/usuarios/user.entity.js';
import { UserAuth } from '../../models/usuarios/user-auth.entity.js';
import { IUserRepository } from '../interfaces/user/IUserRepository.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumUser } from '../../middleware/errorHandler/constants/errorConstants.js';
import { injectable } from 'inversify';
import { IUserAuthRepository } from '../../repositories/interfaces/user/IUserAuthRepository.js';

@injectable()
export class UserRepository implements IUserRepository {
  private _userRepo: Repository<User>;
  private _userAuthRepo: Repository<UserAuth>;

  constructor() {
    this._userRepo = AppDataSource.getRepository(User);
    this._userAuthRepo = AppDataSource.getRepository(UserAuth);
  }
  async updatePass(userid: number, newPassword: string): Promise<void> {
    const user = await this._userRepo.findOne({
      where: { id: userid },
      relations: ['userauth']
    });
    if (!user) {
      throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 404);
    }

    if (user.userauth && user.userauth.id !== undefined) {
      user.userauth.password = newPassword;
      await this._userAuthRepo.update(user.userauth.id, user.userauth);
    }
  }

  findByEmail(email: string): Promise<User | undefined> {
    return this._userRepo.findOne({ where: { email } }).then(user => user ?? undefined);
  }
  async sendResetPassword(email: string, token: string): Promise<void> {
    try {
      await this._userRepo.update({ email }, { resetPasswordToken: token });
    } catch (error) {
      console.error(errorEnumUser.userNotUpdated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotUpdated, 500);
    }
  }
  findOneby(token: string): Promise<User | null> {
    return this._userRepo.findOneBy({ resetPasswordToken: token }).then(user => {
      return user;
    });
  }

  async findAll(): Promise<User[]> {
    try {
      return await this._userRepo.find();
    } catch (error) {
      console.error(errorEnumUser.usersNotFounded, error);
      throw new DatabaseErrorCustom(errorEnumUser.usersNotFounded, 500);
    }
  }

  async findOne(id: number): Promise<User | undefined> {
    try {
      const user = await this._userRepo.findOneBy({ id });
      return user ?? undefined;
    } catch (error) {
      console.error(errorEnumUser.userIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 500);
    }
  }

  async create(user: User): Promise<User> {
    try {
      const newUser = this._userRepo.create(user);
      return await this._userRepo.save(newUser);
    } catch (error) {
      console.error(errorEnumUser.userNotCreated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotCreated, 500);
    }
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    try {

      const existinguser = await this._userRepo.findOneBy({ id });
      if (!existinguser) {
        throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 404);
      }
      await this._userRepo.update(id, user);

      return await this._userRepo.findOneByOrFail({ id });
    } catch (error) {
      console.error(errorEnumUser.userNotUpdated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotUpdated, 500);
    }
  }

  async delete(id: number): Promise<User | undefined> {
    try {
      const userToRemove = await this.findOne(id);
      if (!userToRemove) {
        return undefined;
      }
      await this._userRepo.remove(userToRemove);
      return userToRemove;
    } catch (error) {
      console.error(errorEnumUser.userNotDeleted, error);

      throw new DatabaseErrorCustom(errorEnumUser.userNotDeleted, 500);
    }
  }

  async findByUserName(userName: string): Promise<User | undefined> {
    try {
      const user = await this._userRepo.findOne({ where: { username: userName } });
      return user ?? undefined;
    } catch (error) {
      console.error(errorEnumUser.userIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 404);
    }
  }

  async registerUser(user: User): Promise<User> {
    // Asignar el objeto `UserAuth` al `User` antes de iniciar la transacción


    const queryRunner = this._userRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Guardar el usuario con la entidad relacionada
      const savedUser = await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(errorEnumUser.userNotCreated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotCreated, 500);
    } finally {
      await queryRunner.release();
    }
  }

}

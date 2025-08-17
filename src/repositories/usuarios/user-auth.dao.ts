import { Repository, DataSource } from 'typeorm';
import { UserAuth } from '../../models/usuarios/user-auth.entity.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumUser } from '../../middleware/errorHandler/constants/errorConstants.js';
import { AppDataSource } from '../../config/pg-database/db.js'; 
import { IBaseRepository } from '../interfaces/IBaseRepository.js';
import { injectable } from 'inversify';

@injectable()
export class UserAuthRepository implements IBaseRepository<UserAuth> {
  private repository: Repository<UserAuth>;

  constructor() {
    // Inicializamos el repositorio utilizando TypeORM
    this.repository = AppDataSource.getRepository(UserAuth);
  }

  async findAll(): Promise<UserAuth[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      console.error(errorEnumUser.usersNotFounded, error);
      throw new DatabaseErrorCustom(errorEnumUser.usersNotFounded, 500);
    }
  }

  async findOne(id: number): Promise<UserAuth | undefined> {
    try {
      const userAuth= await this.repository.findOne({ where: { id } });
      return userAuth?? undefined;
    } catch (error) {
      console.error(errorEnumUser.userIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 500);
    }
  }

  async create(user: UserAuth): Promise<UserAuth> {
    try {
      // TypeORM gestiona automáticamente la transacción aquí
      const createdUser = await this.repository.save(user);
      return createdUser;
    } catch (error) {
      console.error(errorEnumUser.userNotCreated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotCreated, 500);
    }
  }

  async update(id: number, user: Partial<UserAuth>): Promise<UserAuth | undefined> {
    try {
      // Recuperamos el usuario existente
      const existingUser = await this.repository.findOne({ where: { id } });
      if (!existingUser) {
        throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 404);
      }

      // Actualizamos solo los campos proporcionados en `user`
      const updatedUser = await this.repository.save({ ...existingUser, ...user });
      return updatedUser;
    } catch (error) {
      console.error(errorEnumUser.userNotUpdated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotUpdated, 500);
    }
  }

  async delete(id: number): Promise<UserAuth | undefined> {
    try {
      // Recuperamos el usuario existente
      const userToDelete = await this.repository.findOne({ where: { id } });
      if (!userToDelete) {
        throw new DatabaseErrorCustom(errorEnumUser.userIndicatedNotFound, 404);
      }

      // Eliminamos el usuario
      await this.repository.remove(userToDelete);
      return userToDelete;
    } catch (error) {
      console.error(errorEnumUser.userNotDeleted, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotDeleted, 500);
    }
  }
}

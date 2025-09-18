import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumUser } from '../../middleware/errorHandler/constants/errorConstants.js';
import { injectable } from 'inversify';
import { UserRolApl } from '../../models/usuarios/user-rol-apl.entity.js';

@injectable()
export class UserRolRepository {
  private _userRolRepo: Repository<UserRolApl>;

  constructor() {
    this._userRolRepo = AppDataSource.getRepository(UserRolApl);
  }

  async create(userRolApl: UserRolApl): Promise<UserRolApl> {
    try {
      // TypeORM gestiona automáticamente la transacción aquí
      const createdUserRolApl = await this._userRolRepo.save(userRolApl);
      return createdUserRolApl;
    } catch (error) {
      console.error(errorEnumUser.userNotCreated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotCreated, 500);
    }
  }

  async getAllRolsByIdUser(idUser: number): Promise<UserRolApl[] | undefined> {
    try {
      const userRols = await this._userRolRepo.findBy({ idUsrapl: idUser });
      return userRols ?? undefined;
    } catch (error) {
      console.error(errorEnumUser.usuerHasNoRol, error);
      throw new DatabaseErrorCustom(errorEnumUser.usuerHasNoRol, 500);
    }
  }
  async update(id: number, updated: Partial<UserRolApl>): Promise<UserRolApl> {
    try {
      // Excluye propiedades que no son columnas
      const cleanData: Partial<UserRolApl> = {
        idUsrapl: updated.idUsrapl,
        idRolapl: updated.idRolapl,
        status: updated.status,
        creationtimestamp: new Date(),
      };

      await this._userRolRepo.update(id, cleanData);
      return await this._userRolRepo.findOneByOrFail({ id });
    } catch (error) {
      console.error(errorEnumUser.userNotUpdated, error);
      throw new DatabaseErrorCustom(errorEnumUser.userNotUpdated, 500);
    }
  }

  async deleteByUserId(idUser: number): Promise<void> {
    await this._userRolRepo.delete({ idUsrapl: idUser });
}
}
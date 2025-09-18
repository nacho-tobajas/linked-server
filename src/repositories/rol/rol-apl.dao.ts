import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumRol } from '../../middleware/errorHandler/constants/errorConstants.js';
import { injectable } from 'inversify';
import { RolApl } from '../../models/roles/rol-apl.entity.js';

@injectable()
export class RolAplRepository {
  private _RolAplRepo: Repository<RolApl>;

  constructor() {
    this._RolAplRepo = AppDataSource.getRepository(RolApl);
  }

  async findOne(id: number): Promise<RolApl | undefined> {
    try {
      const rolApl = await this._RolAplRepo.findOneBy({ id });
      return rolApl ?? undefined;
    } catch (error) {
      console.error(errorEnumRol.rolIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumRol.rolIndicatedNotFound, 500);
    }
  }

  async findByRolName(rolName: string): Promise<RolApl | undefined> {
    try {
      const rolApl = await this._RolAplRepo.findOne({ where: { description: rolName } });
      return rolApl ?? undefined;
    } catch (error) {
      console.error(errorEnumRol.rolIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumRol.rolIndicatedNotFound, 404);
    }
  }

  async findAll(): Promise<RolApl[] | undefined> {
    try {
      const rolApl = await this._RolAplRepo.find();
      return rolApl ?? undefined;
    } catch (error) {
      console.error(errorEnumRol.rolIndicatedNotFound, error);
      throw new DatabaseErrorCustom(errorEnumRol.rolIndicatedNotFound, 404);
    }
  }

}
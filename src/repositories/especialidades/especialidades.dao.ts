import { Repository } from 'typeorm';
import { IBaseRepository } from '../interfaces/IBaseRepository.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumEspecialidades } from '../../middleware/errorHandler/constants/errorConstants.js';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';
import { Especialidades } from '../../models/especialidades/especialidades.entity.js';

@injectable()
export class EspecialidadesRepository implements IBaseRepository<Especialidades> {
  private repository: Repository<Especialidades>;

  constructor() {
    this.repository = AppDataSource.getRepository(Especialidades);
  }

  async findAll(): Promise<Especialidades[]> {
    try {
      return await this.repository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      console.error(errorEnumEspecialidades.especialidadNotFound, error);
      throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotFound, 500);
    }
  }

  async findOne(id: number): Promise<Especialidades | undefined> {
    try {
      const especialidad = await this.repository.findOne({
        where: { id }
      });
      return especialidad ?? undefined;
    } catch (error) {
      console.error(errorEnumEspecialidades.especialidadNotFound, error);
      throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotFound, 500);
    }
  }

  async create(especialidad: Especialidades): Promise<Especialidades> {
    try {
      return await this.repository.save(especialidad);
    } catch (error) {
      console.error(errorEnumEspecialidades.especialidadNotCreated, error);
      throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotCreated, 500);
    }
  }

  async update(id: number, especialidad: Especialidades): Promise<Especialidades> {
    try {
      const existing = await this.repository.findOneBy({ id });
      if (!existing) {
        throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotFound, 404);
      }
      await this.repository.update(id, especialidad);
      return this.repository.findOneOrFail({ where: { id } });
    } catch (error) {
      console.error(errorEnumEspecialidades.especialidadNotUpdated, error);
      throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotUpdated, 500);
    }
  }

  async delete(id: number): Promise<Especialidades | undefined> {
    try {
      const especialidad = await this.repository.findOneBy({ id });
      if (!especialidad) {
        throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotFound, 404);
      }
      await this.repository.remove(especialidad);
      return especialidad;
    } catch (error) {
      console.error(errorEnumEspecialidades.especialidadNotDeleted, error);
      throw new DatabaseErrorCustom(errorEnumEspecialidades.especialidadNotDeleted, 500);
    }
  }
}
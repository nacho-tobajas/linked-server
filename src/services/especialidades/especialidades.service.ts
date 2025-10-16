import { inject, injectable } from 'inversify';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { EspecialidadesRepository } from '../../repositories/especialidades/especialidades.dao.js';
import { Especialidades } from '../../models/especialidades/especialidades.entity.js';
import { IEspecialidadesService } from '../../services/interfaces/especialidades/IEspecialidades.service.js';

@injectable()
export class EspecialidadesService implements IEspecialidadesService
 {
  private _especialidadesRepository: EspecialidadesRepository;

  constructor(
    @inject(EspecialidadesRepository) especialidadesRepository: EspecialidadesRepository
  ) {
    this._especialidadesRepository = especialidadesRepository;
  }

  async findAll(): Promise<Especialidades[]> {
    return this._especialidadesRepository.findAll();
  }

  async findOne(id: number): Promise<Especialidades | undefined> {
    return this._especialidadesRepository.findOne(id);
  }

  async create(newEspecialidad: Especialidades): Promise<Especialidades> {
    newEspecialidad.creationtimestamp = new Date();
    newEspecialidad.status = true;
    if (!newEspecialidad.creationuser) newEspecialidad.creationuser = 'system';
    return this._especialidadesRepository.create(newEspecialidad);
  }

  async update(id: number, especialidad: Especialidades): Promise<Especialidades> {
    especialidad.modificationtimestamp = new Date();
    return this._especialidadesRepository.update(id, especialidad);
  }

  async delete(id: number): Promise<Especialidades | undefined> {
    return this._especialidadesRepository.delete(id);
  }
}
import { injectable } from 'inversify';
import { AppDataSource } from '../../config/pg-database/db.js';
import { SolicitudTatuador } from '../../models/solicitud-tatuador/solicitud-tatuador.entity.js';

@injectable()
export class SolicitudTatuadorRepository {
  private get repo() {
    return AppDataSource.getRepository(SolicitudTatuador);
  }

  async create(data: Partial<SolicitudTatuador>): Promise<SolicitudTatuador> {
    const solicitud = this.repo.create(data);
    return await this.repo.save(solicitud);
  }

  async findAll(): Promise<SolicitudTatuador[]> {
    return await this.repo.find({ order: { creationtimestamp: 'DESC' } });
  }

  async findOne(id: number): Promise<SolicitudTatuador | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<SolicitudTatuador>): Promise<void> {
    await this.repo.update(id, data);
  }
}

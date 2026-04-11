import { injectable } from 'inversify';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { InstagramToken } from '../../models/instagram/instagram-token.entity.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';

@injectable()
export class InstagramRepository {

  private repository: Repository<InstagramToken>;

  constructor() {
    this.repository = AppDataSource.getRepository(InstagramToken);
  }

  async findByTatuadorId(tatuadorId: number): Promise<InstagramToken | undefined> {
    try {
      const token = await this.repository.findOne({
        where: { tatuador: { id: tatuadorId } },
        relations: { tatuador: true }
      });
      return token ?? undefined;
    } catch (error) {
      throw new DatabaseErrorCustom('Error al buscar el token de Instagram', 500);
    }
  }

  async saveOrUpdate(tatuadorId: number, accessToken: string, instagramUserId: string, expiresAt: Date): Promise<InstagramToken> {
    try {
      let record = await this.findByTatuadorId(tatuadorId);

      if (record) {
        record.access_token = accessToken;
        record.instagram_user_id = instagramUserId;
        record.token_expires_at = expiresAt;
      } else {
        record = new InstagramToken();
        record.tatuador = { id: tatuadorId } as any;
        record.access_token = accessToken;
        record.instagram_user_id = instagramUserId;
        record.token_expires_at = expiresAt;
      }

      return await this.repository.save(record);
    } catch (error) {
      throw new DatabaseErrorCustom('Error al guardar el token de Instagram', 500);
    }
  }

  async deleteByTatuadorId(tatuadorId: number): Promise<void> {
    try {
      await this.repository.delete({ tatuador: { id: tatuadorId } });
    } catch (error) {
      throw new DatabaseErrorCustom('Error al desconectar Instagram', 500);
    }
  }

  /** Retorna todos los registros con token guardado, independientemente de si expiraron. */
  async findAllActive(): Promise<InstagramToken[]> {
    try {
      return await this.repository.find({ relations: { tatuador: true } });
    } catch (error) {
      throw new DatabaseErrorCustom('Error al obtener tokens de Instagram', 500);
    }
  }

  async updateToken(tatuadorId: number, accessToken: string, expiresAt: Date): Promise<void> {
    try {
      await this.repository.update(
        { tatuador: { id: tatuadorId } },
        { access_token: accessToken, token_expires_at: expiresAt }
      );
    } catch (error) {
      throw new DatabaseErrorCustom('Error al actualizar token de Instagram', 500);
    }
  }
}

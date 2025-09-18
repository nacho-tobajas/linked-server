import { Repository } from 'typeorm';
import { SupportTicket } from '../../models/support-ticket/support-ticket.entity.js';
import { IBaseRepository } from '../interfaces/IBaseRepository.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumSupportTicket } from '../../middleware/errorHandler/constants/errorConstants.js';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';

@injectable()
export class SupportTicketRepository implements IBaseRepository<SupportTicket> {
  private repository: Repository<SupportTicket>;

  constructor() {
    this.repository = AppDataSource.getRepository(SupportTicket);
  }

  async findAll(): Promise<SupportTicket[]> {
    try {
      return await this.repository.find({
        order: {
          id: 'ASC', // Ordena por id ascendente
        },
      });
    } catch (error) {
      console.error(errorEnumSupportTicket.ticketsNotFounded, error);
      throw new DatabaseErrorCustom(
        errorEnumSupportTicket.ticketsNotFounded,
        500
      );
    }
  }

  async findOne(id: number): Promise<SupportTicket | undefined> {
    try {
      const supportTicket = await this.repository.findOneBy({ id });
      return supportTicket ?? undefined;
    } catch (error) {
      console.error(errorEnumSupportTicket.ticketIndicatedNotFound, error);
      throw new DatabaseErrorCustom(
        errorEnumSupportTicket.ticketIndicatedNotFound,
        500
      );
    }
  }

  async create(supportTicket: SupportTicket): Promise<SupportTicket> {
    try {
      return await this.repository.save(supportTicket);
    } catch (error) {
      console.error(errorEnumSupportTicket.ticketNotCreated, error);
      throw new DatabaseErrorCustom(
        errorEnumSupportTicket.ticketNotCreated,
        500
      );
    }
  }

  async update(
    id: number,
    supportTicket: SupportTicket
  ): Promise<SupportTicket> {
    try {
      const existingsupportTicket = await this.repository.findOneBy({ id });
      if (!existingsupportTicket) {
        throw new DatabaseErrorCustom(
          errorEnumSupportTicket.ticketIndicatedNotFound,
          404
        );
      }
      await this.repository.update(id, supportTicket);
      return this.repository.findOneOrFail({ where: { id } }); // Retorna la entidad actualizada
    } catch (error) {
      console.error(errorEnumSupportTicket.ticketNotUpdated, error);
      throw new DatabaseErrorCustom(
        errorEnumSupportTicket.ticketNotUpdated,
        500
      );
    }
  }

  async delete(id: number): Promise<SupportTicket | undefined> {
    try {
      const supportTicket = await this.repository.findOneBy({ id });
      if (!supportTicket) {
        throw new DatabaseErrorCustom(
          errorEnumSupportTicket.ticketIndicatedNotFound,
          404
        );
      }
      await this.repository.remove(supportTicket);
      return supportTicket;
    } catch (error) {
      console.error(errorEnumSupportTicket.ticketNotDeleted, error);
      throw new DatabaseErrorCustom(
        errorEnumSupportTicket.ticketNotDeleted,
        500
      );
    }
  }
}

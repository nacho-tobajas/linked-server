import { injectable } from 'inversify';
import { AppDataSource } from '../../config/pg-database/db.js';
import { SupportTicket } from '../../models/support-ticket/support-ticket.entity.js';

@injectable()
export class SupportTicketRepository {
  private get repo() {
    return AppDataSource.getRepository(SupportTicket);
  }

  async findAll(): Promise<SupportTicket[]> {
    return this.repo.find({ order: { creationtimestamp: 'DESC' } });
  }

  async findByUser(username: string): Promise<SupportTicket[]> {
    return this.repo.find({
      where: { creationuser: username },
      order: { creationtimestamp: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SupportTicket | null> {
    return this.repo.findOneBy({ id });
  }

  async create(ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    return this.repo.save(this.repo.create(ticket));
  }

  async update(id: number, changes: Partial<SupportTicket>): Promise<SupportTicket | null> {
    await this.repo.update(id, changes);
    return this.repo.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

import { inject, injectable } from 'inversify';
import { SupportTicketRepository } from '../../repositories/support-ticket/support-ticket.dao.js';
import { SupportTicket } from '../../models/support-ticket/support-ticket.entity.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';

@injectable()
export class SupportTicketService {
  constructor(
    @inject(SupportTicketRepository) private repo: SupportTicketRepository
  ) {}

  async findAll(): Promise<SupportTicket[]> {
    return this.repo.findAll();
  }

  async findOne(id: number): Promise<SupportTicket> {
    const ticket = await this.repo.findOne(id);
    if (!ticket) throw new ValidationError('Ticket no encontrado', 404);
    return ticket;
  }

  async create(data: Partial<SupportTicket>): Promise<SupportTicket> {
    if (!data.description?.trim()) {
      throw new ValidationError('La descripción es obligatoria', 400);
    }
    return this.repo.create({
      ...data,
      status: false,
      creationtimestamp: new Date(),
    });
  }

  async update(id: number, changes: Partial<SupportTicket>): Promise<SupportTicket> {
    const updated = await this.repo.update(id, {
      ...changes,
      modificationtimestamp: new Date(),
    });
    if (!updated) throw new ValidationError('Ticket no encontrado', 404);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}

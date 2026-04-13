import { inject, injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { SupportTicketRepository } from '../../repositories/support-ticket/support-ticket.dao.js';
import { SupportTicket } from '../../models/support-ticket/support-ticket.entity.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import pool from '../../config/pg-database/db.js';

@injectable()
export class SupportTicketService {
  constructor(
    @inject(SupportTicketRepository) private repo: SupportTicketRepository
  ) {}

  async findAll(): Promise<SupportTicket[]> {
    return this.repo.findAll();
  }

  async findByUser(username: string): Promise<SupportTicket[]> {
    return this.repo.findByUser(username);
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

  async respond(
    id: number,
    data: { status: boolean; admin_response: string; modificationuser: string }
  ): Promise<SupportTicket> {
    const ticket = await this.findOne(id);

    const updated = await this.repo.update(id, {
      status: data.status,
      admin_response: data.admin_response,
      modificationuser: data.modificationuser,
      modificationtimestamp: new Date(),
    });
    if (!updated) throw new ValidationError('Ticket no encontrado', 404);

    const recipientEmail = ticket.contact_email ?? await this.findUserEmail(ticket.creationuser);
    if (recipientEmail) {
      const displayName = ticket.contact_email ? ticket.contact_email : ticket.creationuser;
      await this.sendTicketResponseEmail(
        recipientEmail,
        displayName,
        id,
        data.status,
        data.admin_response
      );
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  private async findUserEmail(username: string): Promise<string | null> {
    try {
      const result = await pool.query(
        'SELECT email FROM swe_usrapl WHERE username = $1',
        [username]
      );
      return result.rows[0]?.email ?? null;
    } catch {
      return null;
    }
  }

  private async sendTicketResponseEmail(
    to: string,
    username: string,
    ticketId: number,
    status: boolean,
    response: string
  ): Promise<void> {
    const statusLabel = status ? 'RESUELTO' : 'EN PROCESO';
    const statusColor = status ? '#2e7d32' : '#e65100';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Linked Soporte" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Actualización de tu ticket #${ticketId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;padding:24px;border-radius:8px;">
          <div style="background:#393e31;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:1.4rem;letter-spacing:0.15em;">LINKED</h1>
            <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:0.85rem;">Gestión de estudios de tatuaje</p>
          </div>
          <div style="background:#ffffff;padding:32px;border-radius:0 0 8px 8px;">
            <h2 style="color:#393e31;margin:0 0 6px;font-size:1.2rem;">Actualización de tu ticket #${ticketId}</h2>
            <p style="color:#777;margin:0 0 28px;font-size:0.9rem;">Hola <strong>${username}</strong>, el equipo de soporte ha respondido tu consulta.</p>

            <div style="background:#f9f9f9;border-left:4px solid #393e31;padding:14px 18px;border-radius:4px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:0.75rem;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Estado</p>
              <span style="display:inline-block;background:${statusColor};color:#ffffff;padding:4px 14px;border-radius:12px;font-size:0.82rem;font-weight:700;">${statusLabel}</span>
            </div>

            <div style="margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:0.75rem;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Respuesta del equipo</p>
              <p style="color:#333;line-height:1.7;margin:0;font-size:0.95rem;">${response}</p>
            </div>

            <p style="color:#bbb;font-size:0.78rem;margin:0;border-top:1px solid #eee;padding-top:16px;">
              Este mensaje fue generado automáticamente. Por favor no respondas a este correo.
            </p>
          </div>
        </div>
      `,
    });
  }
}

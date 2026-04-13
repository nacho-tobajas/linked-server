import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete, BaseHttpController } from 'inversify-express-utils';
import { inject } from 'inversify';
import { SupportTicketService } from '../../services/support-ticket/support-ticket.service.js';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';

@controller('/api/supportTicket')
export class SupportTicketController extends BaseHttpController {
  constructor(
    @inject(SupportTicketService) private service: SupportTicketService
  ) {
    super();
  }

  @httpGet('/me/tickets', authenticateToken)
  async findMyTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username;
      if (!username) { res.status(401).json({ msg: 'No autenticado' }); return; }
      const tickets = await this.service.findByUser(username);
      res.json(tickets);
    } catch (err) { next(err); }
  }

  @httpGet('/findall', authenticateToken, authorizeRol('Administrador', 'Moderador'))
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await this.service.findAll();
      res.json(tickets);
    } catch (err) { next(err); }
  }

  @httpGet('/:id', authenticateToken, authorizeRol('Administrador', 'Moderador'))
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await this.service.findOne(Number(req.params.id));
      res.json(ticket);
    } catch (err) { next(err); }
  }

  @httpPost('/create')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await this.service.create(req.body);
      res.status(201).json(ticket);
    } catch (err) { next(err); }
  }

  @httpPut('/:id', authenticateToken, authorizeRol('Administrador', 'Moderador'))
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await this.service.update(Number(req.params.id), req.body);
      res.json(ticket);
    } catch (err) { next(err); }
  }

  @httpPost('/:id/respond', authenticateToken, authorizeRol('Administrador', 'Moderador'))
  async respond(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, admin_response, modificationuser } = req.body;
      if (admin_response === undefined || admin_response === '') {
        res.status(400).json({ msg: 'La respuesta es obligatoria' });
        return;
      }
      const ticket = await this.service.respond(Number(req.params.id), {
        status,
        admin_response,
        modificationuser,
      });
      res.json(ticket);
    } catch (err) { next(err); }
  }

  @httpDelete('/:id', authenticateToken, authorizeRol('Administrador', 'Moderador'))
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

import { inject } from "inversify";
import { authenticateToken } from "../../middleware/auth/authToken.js";
import { SweItemMenuService } from "../../services/sweitemmenu/sweitemmenu.service.js";
import { ISweItemMenuService } from "../../services/interfaces/sweitemmenu/ISweItemMenu.js";
import { controller, httpDelete, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { NextFunction, Request, Response } from "express";
import { validateInputData } from "../../middleware/validation/validation-middleware.js";
import { createSweItemMenuValidationRules, getSweItemMenuValidationRules, updateSweItemMenuValidationRules } from "../../middleware/validation/validations-rules/sweitemmenu-validators.js";
import { deleteSupportTicketValidationRules } from "../../middleware/validation/validations-rules/support-ticket-validations.js";

@controller('/api/sweItemMenu', authenticateToken)
export class SweItemMenuController {
    private sweItemMenuService: ISweItemMenuService;

    constructor(
        @inject(SweItemMenuService) _sweItemMenuService: ISweItemMenuService
    ) {
        this.sweItemMenuService = _sweItemMenuService;
    }

    @httpGet('/findall')
    public async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const sweItemMenu = await this.sweItemMenuService.findAll();
            if (sweItemMenu.length > 0) {
                res.status(200).json(sweItemMenu);
            } else {
                res.status(404).json({ message: 'No se han hayado items de menu' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpGet('/:id', validateInputData(getSweItemMenuValidationRules))
    public async findOne(req: Request, res: Response, next: NextFunction) {

        const id = parseInt(req.params.id, 10);

        try {
            const sweItemMenu = await this.sweItemMenuService.findOne(id);
            if (sweItemMenu) {
                res.status(200).json(sweItemMenu);
            } else {
                res.status(404).json({ message: 'Item de menu no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpPost('/create', validateInputData(createSweItemMenuValidationRules))
    public async create(req: Request, res: Response, next: NextFunction) {

        const newSweItemMenu = req.body;

        try {
            const createdSweItemMenu = await this.sweItemMenuService.create(newSweItemMenu);
            res.status(201).json(createdSweItemMenu);
        } catch (error) {
            next(error);
        }
    };

    @httpPut('/:id', validateInputData(updateSweItemMenuValidationRules))
    public async update(req: Request, res: Response, next: NextFunction) {
        const id = parseInt(req.params.id, 10);
        const sweItemMenuUpdates = req.body;


        try {
            const updatedSweItemMenu = await this.sweItemMenuService.update(id, sweItemMenuUpdates);
            if (updatedSweItemMenu) {
                res.status(200).json(updatedSweItemMenu);
            } else {
                res.status(404).json({ message: 'Item de menu no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpDelete('/:id', validateInputData(deleteSupportTicketValidationRules))
    public async remove(req: Request, res: Response, next: NextFunction) {
        const id = parseInt(req.params.id, 10);

        try {
            const deletedSweItemMenu = await this.sweItemMenuService.delete(id);
            if (deletedSweItemMenu) {
                res.status(200).json(deletedSweItemMenu);
            } else {
                res.status(404).json({ message: 'Item de menu no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };
}
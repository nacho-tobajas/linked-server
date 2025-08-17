import { Repository } from 'typeorm';
import { IBaseRepository } from '../interfaces/IBaseRepository.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';
import { SweItemMenu } from '../../models/sweitemmenu/sweitemmenu.entity.js';
import { errorEnumSideMenu } from '../../middleware/errorHandler/constants/errorConstants.js';

@injectable()
export class SupportTicketRepository implements IBaseRepository<SweItemMenu> {
    private repository: Repository<SweItemMenu>;

    constructor() {
        this.repository = AppDataSource.getRepository(SweItemMenu);
    }

    async findAll(): Promise<SweItemMenu[]> {
        try {
            return await this.repository.find({
                order: {
                    ordernumber: 'ASC', // Ordena por valor de atributo order
                },
            });
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuNotFounded, error);
            throw new DatabaseErrorCustom(
                errorEnumSideMenu.sideMenuNotFounded,
                500
            );
        }
    }

    async findOne(id: number): Promise<SweItemMenu | undefined> {
        try {
            const sweItemMenu = await this.repository.findOneBy({ id });
            return sweItemMenu ?? undefined;
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuIndicatedNotFound, error);
            throw new DatabaseErrorCustom(
                errorEnumSideMenu.sideMenuIndicatedNotFound,
                500
            );
        }
    }

    async create(supportTicket: SweItemMenu): Promise<SweItemMenu> {
        try {
            return await this.repository.save(supportTicket);
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuNotCreated, error);
            throw new DatabaseErrorCustom(
                errorEnumSideMenu.sideMenuNotCreated,
                500
            );
        }
    }

    async update(
        id: number,
        sweItemMenu: SweItemMenu
    ): Promise<SweItemMenu> {
        try {
            const existingsweItemMenu = await this.repository.findOneBy({ id });
            if (!existingsweItemMenu) {
                throw new DatabaseErrorCustom(
                    errorEnumSideMenu.sideMenuIndicatedNotFound,
                    404
                );
            }
            await this.repository.update(id, sweItemMenu);
            return this.repository.findOneOrFail({ where: { id } }); // Retorna la entidad actualizada
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuNotUpdated, error);
            throw new DatabaseErrorCustom(
                errorEnumSideMenu.sideMenuNotUpdated,
                500
            );
        }
    }

    async delete(id: number): Promise<SweItemMenu | undefined> {
        try {
            const sweItemMenu = await this.repository.findOneBy({ id });
            if (!sweItemMenu) {
                throw new DatabaseErrorCustom(
                    errorEnumSideMenu.sideMenuIndicatedNotFound,
                    404
                );
            }
            await this.repository.remove(sweItemMenu);
            return sweItemMenu;
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuNotDeleted, error);
            throw new DatabaseErrorCustom(
                errorEnumSideMenu.sideMenuNotDeleted,
                500
            );
        }
    }
}

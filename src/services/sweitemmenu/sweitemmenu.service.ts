import { inject, injectable } from "inversify";
import { SweItemMenu } from "../../models/sweitemmenu/sweitemmenu.entity.js";
import { SideMenuRepository } from "../../repositories/sweitemmenu/sweitemmenu.repository.js";
import { ISweItemMenuService } from "../interfaces/sweitemmenu/ISweItemMenu.js";

@injectable()
export class SweItemMenuService implements ISweItemMenuService {

    private sideMenuRepository: SideMenuRepository;

    constructor(
        @inject(SideMenuRepository) sideMenuRepository: SideMenuRepository,
    ) {
        this.sideMenuRepository = sideMenuRepository;
    }

    async findAll(): Promise<SweItemMenu[]> {
        const items = await this.sideMenuRepository.findAll();

        // Mapa para almacenar los items por ID
        const itemMap = new Map<number, SweItemMenu>();

        // Convertimos los registros en instancias de SweItemMenu
        items.forEach(item => {


            itemMap.set(item.id, new SweItemMenu(
                item.id,
                item.title,
                item.description,
                item.id_supitemmenu,
                item.endpoint,
                item.roles_permitidos,
                item.ordernumber,
                item.creationtimestamp,
                item.creationuser,
                item.modificationtimestamp,
                item.modificationuser
            ));
        });

        return Array.from(itemMap.values());
    }


    async findOne(id: number): Promise<SweItemMenu | undefined> {
        return this.sideMenuRepository.findOne(id);
    }

    async create(newSweItemMenu: SweItemMenu): Promise<SweItemMenu> {
        return this.sideMenuRepository.create(newSweItemMenu);
    }

    async update(id: number, sweItemMenu: SweItemMenu): Promise<SweItemMenu> {
        return this.sideMenuRepository.update(id, sweItemMenu);
    }

    async delete(id: number): Promise<SweItemMenu | undefined> {
        return this.sideMenuRepository.delete(id);
    }



}
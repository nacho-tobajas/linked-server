import { inject, injectable } from "inversify";
import { RolApl } from "../../models/roles/rol-apl.entity.js";
import { UserRolApl } from "../../models/usuarios/user-rol-apl.entity.js";
import { IUserRolAplService } from "../interfaces/user/IUserRolAplService.js";
import { UserRolRepository } from "../../repositories/usuarios/user-rol-apl.dao.js";
import { User } from "../../models/usuarios/user.entity.js";
import { userRolIdCons } from "../../shared/constants/general-constants.js";
import { RolAplRepository } from "../../repositories/rol/rol-apl.dao.js";

@injectable()
export class UserRolAplService implements IUserRolAplService {

    private _userRolRepository: UserRolRepository;
    private _rolAplRepository: RolAplRepository;

    constructor(
        @inject(UserRolRepository) userRolAplService: UserRolRepository,
        @inject(RolAplRepository) rolAplRepository: RolAplRepository,
    ) {
        this._userRolRepository = userRolAplService;
        this._rolAplRepository = rolAplRepository;
    }

    async updateUserRoles(userId: number, roleIds: number[], updatedBy: string): Promise<RolApl[]> {
        // Primero elimino los roles actuales del usuario
        await this._userRolRepository.deleteByUserId(userId);
        
        // Asigno nuevos roles
        const result: RolApl[] = [];
        for (const idRol of roleIds) {
            result.push(await this.createUserRolApl(userId, idRol, updatedBy));
        }
        return result;
    }

    async SearchUserCurrentRol(userRolAplList: UserRolApl[]): Promise<RolApl | undefined> {

        const latestUserRol = userRolAplList.reduce((latest, current) => {
            const latestDate = new Date(latest.creationtimestamp ?? 0); // Si es undefined, usa 0 como fecha predeterminada
            const currentDate = new Date(current.creationtimestamp ?? 0);

            return latestDate > currentDate ? latest : current;
        }, userRolAplList[0]);

        if (!latestUserRol || latestUserRol.status == false) {
            return undefined;
        }

        return await latestUserRol.rolApl;
    }

    async AsignRolUser(user: User, rolName?: string, currentRol?: RolApl): Promise<RolApl | undefined> {
        let rolToAsign: number | undefined;

        if (rolName) {
            const rol = await this._rolAplRepository.findByRolName(rolName);
            rolToAsign = rol?.id;

        } else if (!currentRol) {
            rolToAsign = userRolIdCons.Usuariotienda;

        } else {
            rolToAsign = currentRol.id;
        }

        if (!rolToAsign) return undefined;

        return this.createUserRolApl(user.id, rolToAsign, user.creationuser);

    }

    async getAllUserRols(idUser: number): Promise<number[] | undefined> {

        let userRols: any = await this._userRolRepository.getAllRolsByIdUser(idUser);
        let rolArray: number[] = [];
        if (userRols != undefined) {
            userRols.forEach((ur: UserRolApl) => {
                if (ur.idRolapl != undefined) {
                    rolArray.push(ur.idRolapl);
                }
            });
            return rolArray;
        } else {
            return undefined;
        }
    }

    async getRoles(): Promise<RolApl[] | undefined> {
        let roles: RolApl[] | undefined = await this._rolAplRepository.findAll();
        if (roles != undefined) {
            return roles;
        } else {
            return undefined;
        }
    }

    private async createUserRolApl(userId?: number, rolId?: number, creationUser?: string): Promise<RolApl> {

        const newUserRol = new UserRolApl();
        newUserRol.id = undefined;
        newUserRol.idUsrapl = userId;
        newUserRol.idRolapl = rolId;
        newUserRol.status = true;
        newUserRol.creationuser = creationUser;
        newUserRol.creationtimestamp = new Date();

        const created = await this._userRolRepository.create(newUserRol);

        return created.rolApl!;

    }
}
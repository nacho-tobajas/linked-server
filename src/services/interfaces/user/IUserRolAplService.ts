import { RolApl } from "../../../models/roles/rol-apl.entity.js";
import { UserRolApl } from "../../../models/usuarios/user-rol-apl.entity.js";
import { User } from "../../../models/usuarios/user.entity.js";

export interface IUserRolAplService {
  // Métodos adicionales específicos para User, agregar cuando los haya
  SearchUserCurrentRol(userRolAplList: UserRolApl[]): Promise<RolApl | undefined>

  //Agrgado idRolApl
  AsignRolUser(user: User, rolToAsign?: string, currentRol?: RolApl): Promise<RolApl | undefined>

  getAllUserRols(idUser: number): Promise<number[] | undefined>;

  getRoles(): Promise<RolApl[] | undefined>;

  updateUserRoles(userId: number, roleIds: number[], updatedByUser: string): Promise<RolApl[]>;
}

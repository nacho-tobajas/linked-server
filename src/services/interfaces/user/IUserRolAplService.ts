import { RolApl } from "../../../models/roles/rol-apl.entity";
import { UserRolApl } from "../../../models/usuarios/user-rol-apl.entity";
import { User } from "../../../models/usuarios/user.entity";

export interface IUserRolAplService {
  // Métodos adicionales específicos para User, agregar cuando los haya
  SearchUserCurrentRol(userRolAplList: UserRolApl[]): Promise<RolApl | undefined>

  AsignRolUser(user: User, rolToAsign?: string, currentRol?: RolApl): Promise<RolApl | undefined>

  getAllUserRols(idUser: number): Promise<number[] | undefined>;

  updateUserRoles(userId: number, roleIds: number[], updatedByUser: string): Promise<RolApl[]>;
}

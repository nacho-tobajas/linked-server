import { injectable } from "inversify";
import { UserDto } from "../../models-dto/usuarios/user-dto.entity.js";
import { User } from "../../models/usuarios/user.entity.js";
import { IPasswordService } from "../../services/interfaces/auth/IPasswordService.js";
import { ValidationError } from "../../middleware/errorHandler/validationError.js";
import { UserAuth } from "../../models/usuarios/user-auth.entity.js";
import { RolApl } from "../../models/roles/rol-apl.entity.js";


@injectable()
export class UserMapper {


    async convertDtoToEntity(newUser: UserDto, passwordService: IPasswordService): Promise<User> {
        newUser.creationtimestamp = new Date();

        newUser.password = (await passwordService.validatePassword(newUser.password!))
            ? await passwordService.hashPassword(newUser.password!)
            : (() => { throw new ValidationError('La Contraseña es inválida'); })();

        const newUserAuth: UserAuth = new UserAuth(
            newUser.password!,
            newUser.creationuser!,
            newUser.creationtimestamp
        );

        const userToCreate: User = new User();
        userToCreate.id = undefined;
        userToCreate.realname = newUser.realname;
        userToCreate.surname = newUser.surname;
        userToCreate.username = newUser.username;
        userToCreate.email = newUser.email; // Agregado
        userToCreate.resetPasswordToken = undefined;
        userToCreate.resetPasswordExpires = undefined;
        userToCreate.birth_date = newUser.birth_date;
        userToCreate.delete_date = newUser.delete_date;
        userToCreate.status = newUser.status;
        userToCreate.creationuser = newUser.creationuser;
        userToCreate.creationtimestamp = newUser.creationtimestamp;
        userToCreate.modificationuser = newUser.modificationuser;
        userToCreate.modificationtimestamp = newUser.modificationtimestamp;
        userToCreate.userauth = newUserAuth;

        return userToCreate;


    }

    async convertToEntityOnUpdate(id: number, userWithChanges: User, oldUser: User) {

        const userToUpdate: User = {
            id: oldUser.id,
            realname: userWithChanges.realname && userWithChanges.realname.trim() !== ''
                ? userWithChanges.realname
                : oldUser.realname,
            email: userWithChanges.email ?? oldUser.email,
            surname: userWithChanges.surname && userWithChanges.surname.trim() !== ''
                ? userWithChanges.surname
                : oldUser.surname,
            username: userWithChanges.username && userWithChanges.username.trim() !== ''
                ? userWithChanges.username
                : oldUser.username,
            birth_date: userWithChanges.birth_date ?? oldUser.birth_date,
            delete_date: userWithChanges.delete_date ?? oldUser.delete_date,
            status: userWithChanges.status ?? oldUser.status,
            creationuser: oldUser.creationuser, // No debe cambiar en la actualización
            creationtimestamp: oldUser.creationtimestamp, // No debe cambiar en la actualización
            modificationuser: userWithChanges.modificationuser ?? oldUser?.modificationuser,
            modificationtimestamp: new Date(),
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        };
        return userToUpdate;

    }

    async convertToDto(userCreated: User, rolAsigned: RolApl): Promise<UserDto> {

        const UserDto: UserDto = {
            idUser: userCreated?.id,
            idRolApl: userCreated?.currentRolId, //Nuevo
            email: userCreated?.email, // Agregado
            rolDesc: rolAsigned?.description,
            realname: userCreated?.realname,
            surname: userCreated?.surname,
            username: userCreated?.username,
            birth_date: userCreated?.birth_date,
            creationuser: userCreated?.creationuser,
            creationtimestamp: userCreated?.creationtimestamp,
            password: userCreated?.userauth?.password,
            status: userCreated?.status,
            delete_date: userCreated?.delete_date,
        };

        return UserDto

    }
}
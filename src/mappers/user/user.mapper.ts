import { injectable } from "inversify";
import { UserDto } from "../../models-dto/usuarios/user-dto.entity.js";
import { User } from "../../models/usuarios/user.entity.js";
import { IPasswordService } from "../../services/interfaces/auth/IPasswordService.js";
import { ValidationError } from "../../middleware/errorHandler/validationError.js";
import { UserAuth } from "../../models/usuarios/user-auth.entity.js";
import { RolApl } from "../../models/roles/rol-apl.entity.js";
import { Especialidades } from "../../models/especialidades/especialidades.entity.js";

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
        userToCreate.email = newUser.email; 
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

    async convertToEntityOnUpdate(id: number, userWithChanges: User, oldUser: User):Promise<Partial<User>> {
        const estudioUpdate = userWithChanges.estudio !== undefined ? userWithChanges.estudio : oldUser.estudio;
        const fechaInicioUpdate = userWithChanges.fecha_inicio_actividad !== undefined ? userWithChanges.fecha_inicio_actividad : oldUser.fecha_inicio_actividad;

        const userToUpdate: Partial<User> = {
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
                profile_photo: userWithChanges.profile_photo ?? oldUser.profile_photo,
            birth_date: userWithChanges.birth_date ?? oldUser.birth_date,
            estudio: estudioUpdate, 
            fecha_inicio_actividad: fechaInicioUpdate,
            delete_date: userWithChanges.delete_date ?? oldUser.delete_date,
            status: userWithChanges.status ?? oldUser.status,
            modificationuser: userWithChanges.modificationuser ?? oldUser?.modificationuser,
            modificationtimestamp: new Date(),

        };
        return userToUpdate;

    }

    async convertToDto(entity: User, rolAsigned: RolApl): Promise<UserDto> {

        const userDto = new UserDto(); 

        userDto.idUser = entity.id;
        userDto.idRolApl = rolAsigned?.id; 
        userDto.email = entity.email;
        userDto.rolDesc = rolAsigned?.description;
        userDto.realname = entity.realname;
        userDto.surname = entity.surname;
        userDto.username = entity.username;
        userDto.profile_photo = entity.profile_photo;
        userDto.birth_date = entity.birth_date;
        userDto.status = entity.status;

        userDto.estudio = entity.estudio;
        userDto.fecha_inicio_actividad = entity.fecha_inicio_actividad;


        //Calculo de antiguedad
        if (entity.fecha_inicio_actividad) {
            const hoy = new Date();
            
            const inicio = typeof entity.fecha_inicio_actividad === 'string'
                         ? new Date(entity.fecha_inicio_actividad)
                         : entity.fecha_inicio_actividad;

            if (inicio instanceof Date && !isNaN(inicio.getTime())) { 
                let antiguedadEnAnios = hoy.getFullYear() - inicio.getFullYear();
                const mesActual = hoy.getMonth();
                const diaActual = hoy.getDate();
                const mesInicio = inicio.getMonth();
                const diaInicio = inicio.getDate();

                if (mesActual < mesInicio || (mesActual === mesInicio && diaActual < diaInicio)) {
                    antiguedadEnAnios--;
                }
                userDto.antiguedad = Math.max(0, antiguedadEnAnios); 
            } else {
                 userDto.antiguedad = undefined; 
            }
        } else {
            userDto.antiguedad = undefined; 
        }
        


        // --- Mapping Especialidades ---
         if (Array.isArray(entity.especialidades)) {
             userDto.especialidades = entity.especialidades;
         } else {
             userDto.especialidades = undefined; 
         }

        return userDto; 
    }
}
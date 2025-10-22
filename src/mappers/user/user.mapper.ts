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
        // --- Lógica para campos de texto opcionales (realname, surname, estudio) ---
    const getTextValue = (newValue: string | null | undefined, oldValue: string | null | undefined): string | null | undefined => {
        if (newValue === '') {
            return null; // Si llega '', guardar NULL
        } else if (newValue !== undefined) {
            return newValue; // Si llega un valor (incluido null), usarlo
        } else {
            return oldValue; // Si no llega (undefined), mantener el antiguo
        }
    };

    // --- Lógica para campos de fecha opcionales (birth_date, fecha_inicio_actividad) ---
    const getDateValue = (newValue: Date | string | null | undefined, oldValue: Date | null | undefined): Date | null | undefined => {
        if (newValue === null) {
            return null; // Si llega null explícito, guardar NULL
        } else if (newValue !== undefined) {
            // Intenta convertir a fecha si llega algo, si no es válido o es '', devuelve null
            const date = newValue ? new Date(newValue) : null;
            return (date instanceof Date && !isNaN(date.getTime())) ? date : null; // Guarda fecha válida o NULL
        } else {
            return oldValue; // Si no llega (undefined), mantener el antiguo
        }
    };

    const userToUpdate: Partial<User> = {
      // Campos obligatorios o con lógica diferente (username, email, status)
      username: userWithChanges.username?.trim() ? userWithChanges.username : oldUser.username, // Asumo username no puede ser null
      email: userWithChanges.email ?? oldUser.email, // Asumo email no puede ser null
      status: userWithChanges.status ?? oldUser.status,

      // Campos opcionales usando las funciones helper
      realname: getTextValue(userWithChanges.realname, oldUser.realname),
      surname: getTextValue(userWithChanges.surname, oldUser.surname),
      estudio: getTextValue(userWithChanges.estudio, oldUser.estudio),
      birth_date: getDateValue(userWithChanges.birth_date, oldUser.birth_date),
      fecha_inicio_actividad: getDateValue(userWithChanges.fecha_inicio_actividad, oldUser.fecha_inicio_actividad),

      // Otros campos
      profile_photo: userWithChanges.profile_photo ?? oldUser.profile_photo,
      delete_date: userWithChanges.delete_date ?? oldUser.delete_date, // O lógica específica si necesaria
      modificationuser: userWithChanges.modificationuser, // Asumiendo que viene del servicio/contexto
      modificationtimestamp: new Date(),
    };

    // Limpiar propiedades undefined para evitar problemas con TypeORM (opcional pero seguro)
    Object.keys(userToUpdate).forEach(key => userToUpdate[key as keyof Partial<User>] === undefined && delete userToUpdate[key as keyof Partial<User>]);

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
        userDto.creationtimestamp = entity.creationtimestamp;
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
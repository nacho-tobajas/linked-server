import { Especialidades } from "../../models/especialidades/especialidades.entity.js";

export class UserDto {
    idUser: number | undefined;
    idRolApl: number | undefined; //Nuevo
    email: string | undefined; //Nuevo
    rolDesc: string | undefined;
    realname: string | null | undefined;
    surname: string | null | undefined;
    username: string | undefined;
    profile_photo: string | null | undefined;
    birth_date: Date | null | undefined;
    delete_date: Date | undefined;
    creationuser?: string | undefined;
    creationtimestamp?: Date | undefined;
    password?: string | undefined;
    status: boolean | undefined;
    modificationuser?: string | undefined;
    modificationtimestamp?: Date | undefined;
    resetPasswordToken?: string | undefined;
    resetPasswordExpires?: Date | undefined;
    especialidades?: Especialidades[];
    estudio?: string | null; 
    fecha_inicio_actividad?: Date | null; 
    antiguedad?: number | undefined;

    constructor(
        idUser?: number,
        idRolApl?: number, 
        email?: string, 
        resetPasswordToken?:string, 
        resetPassswordExpires?:Date, 
        rolDesc?: string,
        realname?: string,
        surname?: string,
        username?: string,
        profile_photo?: string,
        birth_date?: Date,
        delete_date?: Date,
        creationuser?: string,
        creationtimestamp?: Date,
        password?: string,
        status?: boolean,
        modificationuser?: string,
        modificationtimestamp?: Date,

    ) {
        this.idUser = idUser;
        this.idRolApl = idRolApl;
        this.email = email; 
        this.resetPasswordToken = resetPasswordToken; 
        this.resetPasswordExpires = resetPassswordExpires; 
        this.rolDesc = rolDesc;
        this.realname = realname;
        this.surname = surname;
        this.username = username;
        this.profile_photo = profile_photo;
        this.birth_date = birth_date;
        this.delete_date = delete_date;
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this.modificationuser = modificationuser;
        this.modificationtimestamp = modificationtimestamp;
        this.password = password;
        this.status = status;
    }
}

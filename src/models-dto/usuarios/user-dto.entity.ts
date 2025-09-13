export class UserDto {
    idUser: number | undefined;
    idRolApl: number | undefined; //Nuevo
    email: string | undefined; //Nuevo
    rolDesc: string | undefined;
    realname: string | undefined;
    surname: string | undefined;
    username: string | undefined;
    birth_date: Date | undefined;
    delete_date: Date | undefined;
    creationuser: string | undefined;
    creationtimestamp: Date | undefined;
    password: string | undefined;
    status: boolean | undefined;
    modificationuser?: string | undefined;
    modificationtimestamp?: Date | undefined;
    resetPasswordToken?: string | undefined;
    resetPasswordExpires?: Date | undefined;

    constructor(
        idUser?: number,
        idRolApl?: number, //Nuevo
        email?: string, //Nuevo
        resetPasswordToken?:string, //Nuevo
        resetPassswordExpires?:Date, //Nuevo
        rolDesc?: string,
        realname?: string,
        surname?: string,
        username?: string,
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
        this.idRolApl = idRolApl; //Nuevo
        this.email = email; //Nuevo
        this.resetPasswordToken = resetPasswordToken; //Nuevo
        this.resetPasswordExpires = resetPassswordExpires; //Nuevo
        this.rolDesc = rolDesc;
        this.realname = realname;
        this.surname = surname;
        this.username = username;
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

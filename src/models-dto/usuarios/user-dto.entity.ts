export class UserDto {
    idUser: number | undefined;
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

    constructor(
        idUser?: number,
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

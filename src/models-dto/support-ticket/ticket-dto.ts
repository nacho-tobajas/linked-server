export class ticketDto{
    id?: number | undefined;
    status?: boolean | undefined;
    creationuser?: string | undefined;
    creationtimestamp?: Date | undefined;
    modificationuser?: string | undefined;
    modificationtimestamp?: Date | undefined;
    description?: string | undefined;
    username?: string | undefined;


    constructor(
        id?: number | undefined,
        status?: boolean | undefined,
        creationuser?: string | undefined,
        creationtimestamp?: Date | undefined,
        modificationuser?: string | undefined,
        modificationtimestamp?: Date | undefined,
        description?: string | undefined,
    ){
        this.id = id;
        this.status = status ;
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp; 
        this.description = description;
        this.modificationuser = modificationuser;
        this.modificationtimestamp = modificationtimestamp;
    }
}
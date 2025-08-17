import { RolApl } from "../roles/rol-apl.entity.js";
import { User } from "./user.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Relation, ManyToOne, JoinColumn } from 'typeorm';


@Entity('swe_usrrolapl')
export class UserRolApl {

    @PrimaryGeneratedColumn({type: "int"})
    id: number | undefined;
    
    @Column({name: "id_rolapl", type: "bigint"})
    idRolapl: number | undefined; 
   
    @Column({name: "id_usrapl", type: "bigint"})
    idUsrapl: number | undefined; 
    
    @Column({name: "creationuser",type: "varchar"})
    public creationuser: string | undefined;

    @CreateDateColumn({name: "creationtimestamp", type: "timestamp", })
    creationtimestamp: Date | undefined;

    @Column({name: "status",type: "boolean"})
    public status: boolean | undefined;

    @ManyToOne(() => User, (user) => user.userRolApl)
    @JoinColumn({ name: 'id_usrapl' }) 
    public user!: Relation<User>;

    @ManyToOne(() => RolApl, (rolApl) => rolApl.userRolApl, {lazy: true})
    @JoinColumn({ name: 'id_rolapl' }) 
    public rolApl?: Promise<RolApl>;

    constructor(   
        id?: number,
        idRolapl?: number,
        idUsrapl?: number,
        creationuser?: string,
        creationtimestamp?: Date,
        status?: boolean,
        

    ) 
    {
        this.id = id;
        this.idRolapl = idRolapl;
        this.idUsrapl = idUsrapl;   
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this.status = status;
  
    }

  

}



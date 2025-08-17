import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Relation, OneToMany } from 'typeorm';
import { UserRolApl } from '../usuarios/user-rol-apl.entity.js';


@Entity('swe_rolapl')
export class RolApl {

    @PrimaryGeneratedColumn({type: "int"})
    id: number | undefined;
    
    @Column({name: "description", type: "character varying"})
    description: string | undefined; 
    
    @Column({name: "creationuser",type: "varchar"})
    public creationuser: string | undefined;

    @CreateDateColumn({name: "creationtimestamp", type: "timestamp", })
    creationtimestamp: Date | undefined;

    @Column({name: "modificationuser",type: "varchar", nullable: true })
    public modificationuser: string | undefined;
    
    @UpdateDateColumn({nullable: true })
    public modificationtimestamp: Date | undefined;

    @Column({name: "status",type: "boolean"})
    public status: boolean | undefined;

    @OneToMany(() => UserRolApl, (userRolApl) => userRolApl.rolApl)
    public userRolApl?: Promise<UserRolApl[]>;


    constructor(   
        id: number,
        description: string,
        creationuser?: string,
        creationtimestamp?: Date,
        modificationuser?: string,
        modificationtimestamp?: Date,
        status?: boolean,
        

    ) 
    {
        this.id = id;
        this.description = description;   
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this.modificationuser = modificationuser;
        this.modificationtimestamp = modificationtimestamp;
        this.status = status;
  
    }

  

}



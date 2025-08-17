import { User } from "./user.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, PrimaryColumn,Relation } from 'typeorm';


@Entity('swe_usrauth')
export class UserAuth {

    @PrimaryGeneratedColumn({type: "int"})
    id: number | undefined;

    @Column({name: "password",type: "varchar"})
    private _password: string ;
    
    @Column({name: "creationuser", type: "varchar"})
    creationuser: string | undefined; 
    
    @CreateDateColumn({name: "creationtimestamp", type: "timestamp", })
    creationtimestamp: Date | undefined;



    @OneToOne(() => User, (user) => user.userauth)
    @JoinColumn({ name: 'id_usrapl' }) // 'id' es la clave primaria de User y la FK en UserAuth
    public user!: Relation<User>;

    constructor(   
        password: string,  
        creationuser?: string,
        creationtimestamp?: Date,
        id?: number,
    ) 
    {
        this.id = id;
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this._password = password
    }

  


    set password(newPassword: string) {
        this._password = newPassword;
    }

    get password(): string {

        const pass = this._password

        return pass?? "";
    }

}



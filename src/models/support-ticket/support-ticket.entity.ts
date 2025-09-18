
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../usuarios/user.entity.js';

@Entity('hd_support_ticket') // El nombre de la tabla en la base de datos

export class SupportTicket {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({type: "boolean"})
    public status: boolean;

    @Column()
    public creationuser: string;

    @Column({ name: "description" })
    public description: string; 

    @CreateDateColumn()
    public creationtimestamp: Date;

    @Column({ nullable: true })
    public modificationuser?: string;

    @UpdateDateColumn({ nullable: true })
    public modificationtimestamp?: Date;

  

    @ManyToMany(() => User, (user) => user.ticketlist,{
        nullable: true,
        lazy: true
    })

    @JoinTable({
        name: 'hd_usr_st', //tabla intermedia
        joinColumn: {name:'id_ticket' , referencedColumnName: 'id'},
        inverseJoinColumn: {name:'id_user' , referencedColumnName: 'id' },
    })
    public user?: Promise<User>

    constructor(
        status: boolean,
        creationuser: string,
        creationtimestamp: Date,
        description: string,
        modificationuser?: string,
        modificationtimestamp?: Date,
        id?: number

    ) {
        this.status = status;
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this.description = description;
        this.modificationuser = modificationuser;
        this.modificationtimestamp = modificationtimestamp;
        this.id = id;
    }
}



import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../usuarios/user.entity.js';

@Entity('hd_support_ticket') // El nombre de la tabla en la base de datos

export class SupportTicket {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ type: "boolean" })
    public status: boolean;

    @Column()
    public creationuser: string;

    @Column({ name: "description" })
    public description: string;

    @Column({ name: 'category', type: 'varchar', length: 50, nullable: true })
    public category?: string;

    @Column({ name: 'priority', type: 'varchar', length: 20, nullable: true })
    public priority?: string;

    @Column({ name: 'url_pagina', type: 'varchar', length: 500, nullable: true })
    public url_pagina?: string;

    @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
    public user_agent?: string;

    @Column({ name: 'screenshot', type: 'text', nullable: true })
    public screenshot?: string;

    @Column({ name: 'admin_response', type: 'text', nullable: true })
    public admin_response?: string | null;

    @Column({ name: 'contact_email', type: 'varchar', length: 254, nullable: true })
    public contact_email?: string | null;

    @CreateDateColumn()
    public creationtimestamp: Date;

    @Column({ nullable: true })
    public modificationuser?: string;

    @UpdateDateColumn({ nullable: true })
    public modificationtimestamp?: Date;



    @ManyToMany(() => User, (user) => user.ticketlist, {
        nullable: true,
        lazy: true
    })

    @JoinTable({
        name: 'hd_usr_st', //tabla intermedia
        joinColumn: { name: 'id_ticket', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_user', referencedColumnName: 'id' },
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
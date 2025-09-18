import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  DeleteDateColumn,
  Relation,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { UserAuth } from './user-auth.entity.js';
import { UserRolApl } from './user-rol-apl.entity.js';
import { RolApl } from '../roles/rol-apl.entity.js';
import { SupportTicket } from '../support-ticket/support-ticket.entity.js';

@Entity('swe_usrapl') // El nombre de la tabla en la base de datos
export class User {
  @PrimaryGeneratedColumn()
  public id: number | undefined;

  @Column({ name: 'realname', type: 'varchar' })
  public realname: string | undefined;

  @Column({ name: 'surname', type: 'varchar' })
  public surname: string | undefined;

  @Column({ name: 'username', type: 'varchar' })
  public username: string | undefined;

  @Column({ name: 'email', type: 'varchar', length: 255 }) //Agregado
  public email: string | undefined;

  @Column({ name: 'birth_date', type: 'timestamp' })
  public birth_date: Date | undefined;

  @Column({ name: 'creationuser', type: 'varchar' })
  public profile_photo: string | undefined;

  @DeleteDateColumn({ name: 'delete_date', type: 'timestamp' })
  public delete_date: Date | undefined;

  @Column({ name: 'creationuser', type: 'varchar' })
  public creationuser: string | undefined;
        //Nuevo
  @Column({ name: 'reset_password_token', type: 'varchar', length: 255 })
  public resetPasswordToken: string | undefined;

  @Column({name: 'reset_password_expires', type: 'timestamp'})
  public resetPasswordExpires: Date | undefined; 
        //
  @CreateDateColumn()
  public creationtimestamp: Date | undefined;

  @Column({ name: 'modificationuser', type: 'varchar', nullable: true })
  public modificationuser: string | undefined;

  @UpdateDateColumn({ nullable: true })
  public modificationtimestamp: Date | undefined;


  @Column({ name: 'status', type: 'boolean' })
  public status: boolean | undefined;

  public currentRol?: RolApl;

  public currentRolId?: number;

  public currentRolDescription?: string;

  @OneToOne(() => UserAuth, (userauth) => userauth.user, {
    cascade: true,
    eager: true,
  }) // Unidireccional: Solo User tiene la referencia
  public userauth?: Relation<UserAuth>;

  @OneToMany(() => UserRolApl, (userRolApl) => userRolApl.user, { lazy: true })
  public userRolApl?: Promise<UserRolApl[]>;

  @ManyToMany(() => SupportTicket, (supportticket) => supportticket.user,{
    nullable: true,
    lazy: true
  })

  public ticketlist?: Promise<SupportTicket[]>

  constructor(
    id?: number,
    realname?: string,
    surname?: string,
    username?: string,
    email?: string, // Agregado
    profile_photo?: string,
    birth_date?: Date,
    delete_date?: Date,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
    status?: boolean,
  ) {
    this.id = id;
    this.realname = realname;
    this.surname = surname;
    this.username = username;
    this.email = email; // Agregado
    this.profile_photo = profile_photo;
    this.birth_date = birth_date;
    this.delete_date = delete_date;
    this.creationuser = creationuser;
    this.creationtimestamp = creationtimestamp;
    this.modificationuser = modificationuser;
    this.modificationtimestamp = modificationtimestamp;
    this.status = status;
  }
}

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
  JoinTable,
} from 'typeorm';
import { UserAuth } from './user-auth.entity.js';
import { UserRolApl } from './user-rol-apl.entity.js';
import { RolApl } from '../roles/rol-apl.entity.js';
import { SupportTicket } from '../support-ticket/support-ticket.entity.js';
import { TurnoSesion } from '../turno-sesion/turno-sesion.entity.js';
import { Especialidades } from '../../models/especialidades/especialidades.entity.js';
import { TurnoTatuador } from '../turno-tatuador/turno-tatuador.entity.js';

@Entity('swe_usrapl') // El nombre de la tabla en la base de datos
export class User {
  @PrimaryGeneratedColumn()
  public id: number | undefined;

  @Column({ name: 'realname', type: 'varchar' })
  public realname: string | null | undefined;

  @Column({ name: 'surname', type: 'varchar' })
  public surname: string | null | undefined;

  @Column({ name: 'username', type: 'varchar', unique: true })
  public username: string | undefined;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  public email: string | undefined;

  @Column({ name: 'birth_date', type: 'timestamp' })
  public birth_date: Date | null | undefined;

  @Column({ name: 'profile_photo', type: 'text', nullable: true })
  public profile_photo: string | null | undefined;

  @Column({ name: 'estudio', type: 'varchar', length: 100, nullable: true })
  public estudio: string | null | undefined;

  @Column({ name: 'fecha_inicio_actividad', type: 'date', nullable: true })
  public fecha_inicio_actividad: Date | null | undefined;

  @Column({ name: 'localidad', type: 'varchar', length: 255, nullable: true })
  public localidad: string | null | undefined;

  @Column({ name: 'lat', type: 'double precision', nullable: true })
  public lat: number | null | undefined;

  @Column({ name: 'lng', type: 'double precision', nullable: true })
  public lng: number | null | undefined;

  @Column({ name: 'instagram_handle', type: 'varchar', length: 100, nullable: true })
  public instagram_handle: string | null | undefined;

  @DeleteDateColumn({ name: 'delete_date', type: 'timestamp' })
  public delete_date: Date | null | undefined;

  @Column({ name: 'creationuser', type: 'varchar' })
  public creationuser: string | undefined;

  @Column({ name: 'reset_password_token', type: 'varchar', length: 255 })
  public resetPasswordToken: string | undefined;

  @Column({ name: 'reset_password_expires', type: 'timestamp' })
  public resetPasswordExpires: Date | undefined;

  @CreateDateColumn({ name: 'creationtimestamp' })
  public creationtimestamp: Date | undefined;

  @Column({ name: 'modificationuser', type: 'varchar', nullable: true })
  public modificationuser: string | undefined;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp: Date | undefined;


  @Column({ name: 'status', type: 'boolean' })
  public status: boolean | undefined;

  @ManyToMany(() => Especialidades, (especialidad) => especialidad.tatuadores, {
    eager: true,
  })
  @JoinTable({
    name: 'tat_tatuador_especialidad', // nombre real de la tabla intermedia
    joinColumn: {
      name: 'id_tatuador',              // nombre de la columna FK hacia User
      referencedColumnName: 'id',      // el campo PK en User
    },
    inverseJoinColumn: {
      name: 'id_especialidad',         // nombre de la columna FK hacia Especialidades
      referencedColumnName: 'id',
    },
  })
  public especialidades: Especialidades[] | undefined;

  // Relaciones
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

  @ManyToMany(() => SupportTicket, (supportticket) => supportticket.user, {
    nullable: true,
    lazy: true
  })

  public ticketlist?: Promise<SupportTicket[]>

  // Turnos donde este usuario es el CLIENTE
  @OneToMany(() => TurnoSesion, (turno) => turno.cliente)
  public turnosCliente?: Relation<TurnoSesion[]>;

  // Turnos donde este usuario es el TATUADOR 
  @OneToMany(() => TurnoTatuador, (tt) => tt.tatuador)
  public turnosTatuador?: Relation<TurnoTatuador[]>;

  constructor(
    id?: number,
    realname?: string,
    surname?: string,
    username?: string,
    email?: string, // Agregado
    birth_date?: Date,
    profile_photo?: string,
    especialidad?: string,
    delete_date?: Date,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
    status?: boolean,
    turnosCliente?: TurnoSesion[],
    turnosTatuador?: TurnoTatuador[],

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
    this.status = status ?? true;
    this.turnosCliente = turnosCliente;
    this.turnosTatuador = turnosTatuador;
  }
}

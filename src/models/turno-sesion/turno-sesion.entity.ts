import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { User } from '../usuarios/user.entity.js';
import { ImagenRef } from '../imagen-ref/imagen-ref.entity.js';

@Entity('tat_turno_sesion') 
export class TurnoSesion {
  @PrimaryGeneratedColumn()
  public id: number | undefined;

  @Column({ name: 'fecha', type: 'date' })
  public fecha: Date | undefined;

  @Column({ name: 'hora', type: 'time' })
  public hora: string | undefined;

  @Column({ name: 'id_cliente', type: 'integer' })
  public id_cliente: number | undefined;

  @ManyToOne(() => User, (user) => user.turnosCliente, { eager: true })
  public cliente!: Relation<User>;

  @ManyToOne(() => User, (user) => user.turnosTatuador, { eager: true })
  public tatuador!: Relation<User>;

  @Column({ name: 'creationuser', type: 'varchar' })
  public creationuser: string | undefined;

  @CreateDateColumn()
  public creationtimestamp: Date | undefined;

  @Column({ name: 'modificationuser', type: 'varchar', nullable: true })
  public modificationuser: string | undefined;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp: Date | undefined;


  @Column({ name: 'status', type: 'boolean' })
  public status: boolean | undefined;

  @OneToMany(() => ImagenRef, (imagen) => imagen.turnoSesion, { cascade: true })
  public imagenes?: ImagenRef[]


  constructor(
    id?: number,
    fecha?: Date,
    hora?: string,
    cliente?: Relation<User>,
    tatuador?: Relation<User>,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
    status?: boolean,
  ) {
    this.id = id;
    this.fecha = fecha ?? new Date();
    this.hora = hora ?? '00:00:00';
    this.cliente = cliente!;
    this.tatuador = tatuador!;
    this.creationuser = creationuser ?? 'system';
    this.creationtimestamp = creationtimestamp;
    this.modificationuser = modificationuser;
    this.modificationtimestamp = modificationtimestamp;
    this.status = status ?? true;
  }
}

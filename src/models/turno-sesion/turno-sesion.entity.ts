import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Relation,
  JoinColumn,
} from 'typeorm';
import { User } from '../usuarios/user.entity.js';
import { ImagenRef } from '../imagen-ref/imagen-ref.entity.js';
import { TurnoTatuador } from '../turno-tatuador/turno-tatuador.entity.js';
import { EstadoTurno } from '../enums/estado-turno.enum.js';
import { TurnoMensaje } from './turno-mensaje.entity.js';

@Entity('tat_turno_sesion')
export class TurnoSesion {

  @PrimaryGeneratedColumn()
  public id?: number ;

  // --- Cliente ---
  @ManyToOne(() => User, (user) => user.turnosCliente)
  @JoinColumn({ name: "id_cliente" })
  public cliente?: Relation<User>;

  // --- Tatuadores ---
  @OneToMany(() => TurnoTatuador, (tt) => tt.turnoSesion, { cascade: true })
  public tatuadoresAsignados?: Relation<TurnoTatuador[]>;

  @Column({ name: 'fecha_hora_inicio', type: 'timestamp' })
  public fecha_hora_inicio?: Date;

  @Column({ name: 'fecha_hora_fin', type: 'timestamp' })
  public fecha_hora_fin?: Date;

  @Column({
    type: 'enum',
    enum: EstadoTurno,
    default: EstadoTurno.PENDIENTE,
  })
  public estado?: EstadoTurno;

  // --- Detalles del Cliente ---
  @Column({ name: 'descripcion_cliente', type: 'varchar', length: 1000, nullable: true })
  public descripcion_cliente?: string;

  // --- Imágenes (Tu relación 1:N) ---
  @OneToMany(() => ImagenRef, (imagen) => imagen.turnoSesion, { cascade: true })
  public imagenes?: Relation<ImagenRef[]>;

  // --- Campos de Auditoría (como los tenías) ---
  @Column({ name: 'creationuser', type: 'varchar' })
  public creationuser?: string;

  @CreateDateColumn({ name: 'creationtimestamp' })
  public creationtimestamp?: Date;

  @Column({ name: 'modificationuser', type: 'varchar', nullable: true })
  public modificationuser?: string;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp?: Date;

  @OneToMany(() => TurnoMensaje, m => m.turnoSesion) 
  public mensajes?: TurnoMensaje[];


  /*constructor(
 id: number,
    cliente: Relation<User>,
    fecha_hora_inicio: Date,
    fecha_hora_fin: Date,
    tatuadoresAsignados: Relation<TurnoTatuador[]>,
    estado: EstadoTurno, 
    descripcion_cliente: string,
    imagenes: Relation<ImagenRef[]>,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
  ) {
    this.id = id;
    this.cliente = cliente;
    this.fecha_hora_inicio = fecha_hora_inicio;
    this.fecha_hora_fin = fecha_hora_fin;
    this.tatuadoresAsignados = tatuadoresAsignados;
    this.estado = estado;
    this.descripcion_cliente = descripcion_cliente;
    this.imagenes = imagenes; 
    this.creationuser = creationuser ?? 'system';
    this.creationtimestamp = creationtimestamp!; 
    this.modificationuser = modificationuser!;
    this.modificationtimestamp = modificationtimestamp!;
  }*/
}

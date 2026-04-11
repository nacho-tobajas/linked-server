import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation
} from 'typeorm';
import { TurnoSesion } from './turno-sesion.entity.js';
import { User } from '../usuarios/user.entity.js';

@Entity('tat_turno_mensajes')
export class TurnoMensaje {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: 'text' })
  public mensaje?: string;

  @CreateDateColumn({ name: 'timestamp' })
  public timestamp?: Date;

  // Relación con el Turno
  @ManyToOne(() => TurnoSesion, (turno) => turno.mensajes)
  @JoinColumn({ name: 'id_turno_sesion' })
  public turnoSesion?: Relation<TurnoSesion>;

  // Relación con el Usuario que envía 
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_usuario_envia' })
  public usuarioEnvia?: Relation<User>;

  @Column()
  public leido?: boolean;



}
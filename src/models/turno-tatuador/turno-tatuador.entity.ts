import {
  Entity, PrimaryGeneratedColumn, ManyToOne, Relation, JoinColumn, CreateDateColumn, Column,
  PrimaryColumn
} from 'typeorm';
import { User } from '../usuarios/user.entity.js';
import { TurnoSesion } from '../turno-sesion/turno-sesion.entity.js';

@Entity('tat_turno_tatuador')
export class TurnoTatuador {


  @PrimaryColumn({ name: 'id_tatuador', type: 'bigint' }) 
  public id_tatuador?: number;

  @ManyToOne(() => User, (user) => user.turnosTatuador)
  @JoinColumn({ name: 'id_tatuador' }) 
  public tatuador?: Relation<User>;


  @PrimaryColumn({ name: 'id_turno_sesion', type: 'bigint' }) 
  public id_turno_sesion?: number;
  
  @ManyToOne(() => TurnoSesion, (turno) => turno.tatuadoresAsignados)
  @JoinColumn({ name: 'id_turno_sesion' }) 
  public turnoSesion?: Relation<TurnoSesion>;
}
import { User } from '../../models/usuarios/user.entity.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';



@Entity('tat_especialidad') 
export class Especialidades {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public nombre: string;

  @Column()
  public descripcion: string;

  @Column()
  public creationuser: String;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  public creationtimestamp: Date;

  @Column({ nullable: true })
  public modificationuser: String;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  public modificationtimestamp: Date;

  @Column()
  public status: boolean;

  @ManyToMany(() => User, (user) => user.especialidades, { lazy: true })
  public tatuadores?: Promise<User[]>;

  constructor(
    id: number,
    nombre: string,
    descripcion: string,
    creationtimestamp: Date,
    creationuser: String,
    modificationtimestamp: Date,
    modificationuser: String,
    status: boolean
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.creationtimestamp = creationtimestamp;
    this.creationuser = creationuser;
    this.modificationtimestamp = modificationtimestamp;
    this.modificationuser = modificationuser;
    this.status = status;
  }
}
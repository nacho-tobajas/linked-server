import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Relation,
} from 'typeorm';
import { TurnoSesion } from '../turno-sesion/turno-sesion.entity.js';

@Entity('tat_imagen_ref')
export class ImagenRef {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => TurnoSesion, (turno) => turno.imagenes, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    eager: true,
  })
  public turnoSesion!: Relation<TurnoSesion>;


  @Column({ name: 'image_path', type: 'varchar', nullable: true })
  public image_path?: string;

  @CreateDateColumn({ name: 'creationtimestamp' })
  public creationtimestamp!: Date;

  @Column({ name: 'creationuser', type: 'varchar', length: 25 })
  public creationuser!: string;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp?: Date;

  @Column({ name: 'modificationuser', type: 'varchar', length: 25, nullable: true })
  public modificationuser?: string;

  constructor(
    image_path?: string,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
  ) {
    this.image_path = image_path;
    this.creationuser = creationuser ?? 'system';
    this.creationtimestamp = creationtimestamp ?? new Date();
    this.modificationuser = modificationuser;
    this.modificationtimestamp = modificationtimestamp;
  }
}
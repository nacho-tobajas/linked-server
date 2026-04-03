import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Trabajo } from './trabajo.entity.js';

@Entity('tat_trabajo_foto')

//Tabla intermedia fotos de trabajo (hasta 5)
export class TrabajoFoto {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: 'varchar' })
  public image_path?: string;

  // Relación inversa hacia el Trabajo padre
  @ManyToOne(() => Trabajo, (trabajo) => trabajo.fotos)
  @JoinColumn({ name: 'id_trabajo' })
  public trabajo?: Relation<Trabajo>;
}
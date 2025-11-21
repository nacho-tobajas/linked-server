import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { User } from '../usuarios/user.entity.js';
import { TrabajoFoto } from './trabajo-foto.entity.js';
import { TrabajoFavorito } from './trabajo-favorito.entity.js';


@Entity('tat_trabajo')
export class Trabajo {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: 'text', nullable: true })
  public descripcion?: string;

  // El Tatuador
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_tatuador' })
  public tatuador?: Relation<User>;

  // Fotos multiples
  @OneToMany(() => TrabajoFoto, (foto) => foto.trabajo, { 
    cascade: true, 
    eager: true    
  })
  public fotos?: Relation<TrabajoFoto[]>;

  // Likes
  @OneToMany(() => TrabajoFavorito, (fav) => fav.trabajo)
  public favoritos?: Relation<TrabajoFavorito[]>;

  @CreateDateColumn()
  public creationtimestamp?: Date;
  
  @Column({ name: 'creationuser', type: 'varchar' })
  public creationuser?: string;
}
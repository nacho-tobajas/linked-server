import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Relation, Unique } from 'typeorm';
import { User } from '../usuarios/user.entity.js';
import { Trabajo } from './trabajo.entity.js';

@Entity('tat_trabajo_favorito')
@Unique(['cliente', 'trabajo']) // Evita que un usuario de like dos veces al mismo trabajo
export class TrabajoFavorito {
  @PrimaryGeneratedColumn()
  public id?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_cliente' })
  public cliente?: Relation<User>;

  @ManyToOne(() => Trabajo)
  @JoinColumn({ name: 'id_trabajo' })
  public trabajo?: Relation<Trabajo>;

  @CreateDateColumn()
  public creationtimestamp?: Date;
}
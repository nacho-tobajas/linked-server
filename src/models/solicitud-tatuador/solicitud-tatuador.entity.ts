import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from '../usuarios/user.entity.js';

@Entity('tat_solicitud_tatuador')
export class SolicitudTatuador {
  @PrimaryGeneratedColumn()
  public id: number | undefined;

  @Column({ name: 'id_user', type: 'int' })
  public idUser: number | undefined;

  @Column({ name: 'estudio', type: 'varchar', length: 100, nullable: true })
  public estudio: string | null | undefined;

  @Column({ name: 'especialidades_ids', type: 'jsonb', nullable: true })
  public especialidadesIds: number[] | undefined;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pendiente' })
  public status: 'pendiente' | 'aprobada' | 'rechazada' | undefined;

  @Column({ name: 'notas', type: 'text', nullable: true })
  public notas: string | null | undefined;

  @Column({ name: 'admin_user', type: 'varchar', nullable: true })
  public adminUser: string | null | undefined;

  @CreateDateColumn({ name: 'creationtimestamp' })
  public creationtimestamp: Date | undefined;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp: Date | undefined;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'id_user' })
  public user: Relation<User> | undefined;
}

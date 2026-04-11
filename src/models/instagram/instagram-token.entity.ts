import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, Relation } from 'typeorm';
import { User } from '../usuarios/user.entity.js';

@Entity('tat_instagram_token')
export class InstagramToken {
  @PrimaryGeneratedColumn()
  public id?: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_tatuador' })
  public tatuador?: Relation<User>;

  @Column({ type: 'text' })
  public access_token?: string;

  // ID de la cuenta de negocio de Instagram (IG User ID)
  @Column({ type: 'varchar', nullable: true })
  public instagram_user_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  public token_expires_at?: Date;

  @CreateDateColumn()
  public creationtimestamp?: Date;
}

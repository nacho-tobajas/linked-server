import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../usuarios/user.entity.js';

@Entity('tat_horario_habitual')
@Unique(['id_tatuador', 'dia_semana']) // Constraint UNIQUE que pusimos en el DDL
export class HorarioHabitual {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_tatuador: number; 

    @ManyToOne(() => User) // muchos horarios pertenecen a un tatuador
    @JoinColumn({ name: 'id_tatuador' }) 
    tatuador?: User; 

    @Column({ type: 'int' })
    dia_semana: number;

    @Column({ type: 'time' }) 
    hora_inicio: string;

    @Column({ type: 'time' })
    hora_fin: string;

    @Column({ type: 'int' })
    duracion_turno_min: number;

    @Column()
    creationuser: string;

    @CreateDateColumn()
    creationtimestamp: Date;

    @Column({ nullable: true })
    modificationuser: string;

    @UpdateDateColumn({ nullable: true })
    modificationtimestamp: Date;

    constructor(
    id?: number,
    id_tatuador?: number,
    dia_semana?: number,
    hora_inicio?: string,
    hora_fin?: string,
    duracion_turno_min?: number,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationtimestamp?: Date,
    modificationuser?: string
  ) {
    this.id = id!;
    this.id_tatuador= id_tatuador!;
    this.dia_semana=dia_semana!;
    this.hora_inicio= hora_inicio!;
    this.hora_fin= hora_fin!;
    this.duracion_turno_min= duracion_turno_min!;
    this.creationtimestamp = creationtimestamp!;
    this.creationuser = creationuser!;
    this.modificationtimestamp = modificationtimestamp!;
    this.modificationuser = modificationuser!;
  }

}
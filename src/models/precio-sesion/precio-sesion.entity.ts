import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tat_precio_sesion')
export class PrecioSesion {
  @PrimaryGeneratedColumn()
  public id: number | undefined;

  @Column({ name: 'precio', type: 'decimal' })
  public precio: number | undefined;

  @Column({ name: 'fecha_desde', type: 'timestamp' })
  public fecha_desde: Date | undefined;

  @CreateDateColumn({ name: 'creationtimestamp' })
  public creationtimestamp: Date | undefined;

  @Column({ name: 'creationuser', type: 'varchar', length: 25 })
  public creationuser: string | undefined;

  @UpdateDateColumn({ name: 'modificationtimestamp', nullable: true })
  public modificationtimestamp: Date | undefined;

  @Column({ name: 'modificationuser', type: 'varchar', length: 25, nullable: true })
  public modificationuser: string | undefined;

  constructor(
    id?:number,
    precio?: number,
    fecha_desde?: Date,
    creationuser?: string,
    creationtimestamp?: Date,
    modificationuser?: string,
    modificationtimestamp?: Date,
  ) {
    this.id = id!;
    this.precio = precio!;
    this.fecha_desde = fecha_desde ?? new Date();
    this.creationuser = creationuser ?? 'system';
    this.creationtimestamp = creationtimestamp ?? new Date();
    this.modificationuser = modificationuser;
    this.modificationtimestamp = modificationtimestamp;
  }
}
import { User } from '../../models/usuarios/user.entity.js';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Relation,
} from 'typeorm';



@Entity('tat_biblioteca_tatuador')
export class TatuajeImagen {
    @PrimaryGeneratedColumn()
    public id: number | undefined;

    @ManyToOne(() => User, (tatuador) => tatuador.idImagenBiblioteca, { lazy: true })
    @JoinColumn({ name: 'id_tatuador' })
    public tatuador: Relation<User> | undefined;

    @Column({ name: 'url_img', type: 'varchar' })
    public urlImg: string | undefined;

    @Column()
    public formato: string | undefined;

    @Column({ nullable: true })
    public descripcion: string | undefined;

    @Column({ name: 'fechasesion', type: 'timestamp' })
    public fechaSesion: Date | undefined;

    @Column()
    public creationuser: String | undefined;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    public creationtimestamp: Date | undefined;

    @Column({ nullable: true })
    public modificationuser: String | undefined;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    public modificationtimestamp: Date | undefined;

    @ManyToMany(() => User, (user) => user.imagenesFavoritas)
    public favoritoDe?: Promise<User[]>;

    constructor(
        id?: number,
        tatuador?: User,
        urlImg?: string,
        formato?: string,
        descripcion?: string,
        fechaSesion?: Date,
        creationuser?: string,
        creationtimestamp?: Date,
        modificationuser?: string,
        modificationtimestamp?: Date
    ) {
        this.id = id;
        this.tatuador = tatuador;
        this.urlImg = urlImg;
        this.formato = formato;
        this.descripcion = descripcion;
        this.fechaSesion = fechaSesion;
        this.creationuser = creationuser;
        this.creationtimestamp = creationtimestamp;
        this.modificationuser = modificationuser;
        this.modificationtimestamp = modificationtimestamp;
    }
}
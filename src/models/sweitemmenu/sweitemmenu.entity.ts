import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity('swe_itemmenu')
export class SweItemMenu {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @ManyToOne(() => SweItemMenu, {
        nullable: true
    })
    @JoinColumn({ name: 'id_supitemmenu' })
    public idSupItemMenu?: SweItemMenu;

    @Column({ type: 'varchar', name: 'roles_permitidos' })
    public roles_permitidos: string;

    @Column({ type: 'varchar', length: 255 })
    public creationuser: string;

    @CreateDateColumn()
    public creationtimestamp: Date;

    @Column({ nullable: true })
    public modificationuser?: string;

    @UpdateDateColumn({ type: 'varchar', length: 255, nullable: true })
    public modificationtimestamp?: Date;

    @Column()
    public endpoint: string;

    @Column()
    public ordernumber: number;

    constructor(
        id: number,
        title: string,
        description: string,
        idSupItemMenu: SweItemMenu,
        endpoint: string,
        roles_permitidos: string,
        ordernumber: number,
        creationtimestamp: Date,
        creationuser: string,
        modificationtimestamp?: Date,
        modificationuser?: string
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.idSupItemMenu = idSupItemMenu;
        this.endpoint = endpoint;
        this.roles_permitidos = roles_permitidos;
        this.ordernumber = ordernumber;
        this.creationtimestamp = creationtimestamp;
        this.creationuser = creationuser;
        this.modificationtimestamp = modificationtimestamp;
        this.modificationuser = modificationuser;
    }
}

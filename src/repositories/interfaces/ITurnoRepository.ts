import { EntityManager } from "typeorm";
import { TurnoSesion } from "../../models/turno-sesion/turno-sesion.entity.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface ITurnoRepository extends IBaseRepository<TurnoSesion> {
/**
     * Busca todos los turnos de un cliente específico, con sus relaciones.
     */
    findByClienteId(clienteId: number): Promise<TurnoSesion[]>;

    /**
     * Busca un turno por ID, opcionalmente usando un manager de transacción, 
     * y carga todas las relaciones necesarias.
     */
    findById(turnoId: number, manager?: EntityManager): Promise<TurnoSesion | null>;

    /**
     * Guarda un turno, opcionalmente usando un manager de transacción.
     */
    save(turno: TurnoSesion, manager?: EntityManager): Promise<TurnoSesion>;
}
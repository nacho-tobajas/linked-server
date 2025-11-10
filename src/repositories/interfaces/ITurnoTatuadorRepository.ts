import { TurnoTatuador } from "../../models/turno-tatuador/turno-tatuador.entity.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { EntityManager } from "typeorm";

export interface ITurnoTatuadorRepository extends IBaseRepository<TurnoTatuador> {
    
    // --- MÉTODOS ESPECÍFICOS que tu TurnosService necesita ---

    /**
     * Revisa si un tatuador ya tiene un turno que se solapa 
     * en el rango de fechas/horas dado.
     */
    findSolapamiento(
        tatuadorId: number, 
        inicio: Date, 
        fin: Date, 
        manager?: EntityManager
    ): Promise<TurnoTatuador | null>;

    /**
     * Guarda una nueva asignación, opcionalmente usando un manager de transacción.
     */
    save(asignacion: TurnoTatuador, manager?: EntityManager): Promise<TurnoTatuador>;

    /**
     * Busca todas las asignaciones de un tatuador (para ver su agenda).
     */
    findByTatuadorId(tatuadorId: number): Promise<TurnoTatuador[]>;
}
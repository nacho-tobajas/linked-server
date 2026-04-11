import { HorarioHabitual } from "../../models/agenda/horario.entity.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IHorarioHabitualRepository extends IBaseRepository<HorarioHabitual> {
    // métodos específicos para horarios
    findByTatuadorId(tatuadorId: number): Promise<HorarioHabitual[]>;
    deleteByTatuadorId(tatuadorId: number): Promise<void>;
    // findByTatuadorAndDia
}
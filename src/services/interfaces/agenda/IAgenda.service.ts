import { HorarioHabitual } from "../../../models/agenda/horario.entity.js";

// Definicion de como vienen los datos del frontend para actualizar
export interface HorarioHabitualInput {
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;    
    duracion_turno_min: number;
}


export interface IAgendaService {
    getSlotsDisponiblesParaDia(tatuadorId: number, fecha: Date): Promise<string[]>;
    getFechasBloqueadasEnRango(tatuadorId: number, fechaInicio: Date, fechaFin: Date): Promise<string[]>;
    getHorarioHabitual(tatuadorId: number): Promise<HorarioHabitual[]>;
    updateHorarioHabitual(tatuadorId: number, horariosInput: HorarioHabitualInput[], currentUser?: string): Promise<HorarioHabitual[]>;
}
import { inject, injectable } from "inversify";
import { ValidationError } from "../../middleware/errorHandler/validationError.js"; 
import { HorarioHabitualInput, IAgendaService } from "../interfaces/agenda/IAgenda.service.js";
import { IHorarioHabitualRepository } from "../../repositories/interfaces/IHorarioHabitualRepository.js";
import { HorarioHabitualRepository } from "../../repositories/agenda/horario-habitual.dao.js";
import { HorarioHabitual } from "../../models/agenda/horario.entity.js";
import { DatabaseErrorCustom } from "../../middleware/errorHandler/dataBaseError.js";
import { ITurnoTatuadorRepository } from "../../repositories/interfaces/ITurnoTatuadorRepository.js";
import { TurnoTatuadorRepository } from "../../repositories/agenda/turno-tatuador.dao.js";
@injectable()
export class AgendaService implements IAgendaService {

    private _horarioRepo: IHorarioHabitualRepository;
    private _turnoTatuadorRepo: ITurnoTatuadorRepository;
    constructor(
        @inject(HorarioHabitualRepository) horarioRepo: IHorarioHabitualRepository,
        @inject(TurnoTatuadorRepository) turnoTatuadorRepo: ITurnoTatuadorRepository
    ) {
        this._horarioRepo = horarioRepo;
        this._turnoTatuadorRepo = turnoTatuadorRepo;
    }

    public async getSlotsDisponiblesParaDia(tatuadorId: number, fecha: Date): Promise<string[]> {

        const diaSemana = fecha.getDay(); 
        const fechaISO = fecha.toISOString().split('T')[0]; 

        // Obtener el Horario Habitual 
        const horariosHabituales = await this._horarioRepo.findByTatuadorId(tatuadorId);
        const horarioDelDia = horariosHabituales.find(h => h.dia_semana === diaSemana);

        if (!horarioDelDia) {
            return []; 
        }

        // Obtener turnos YA RESERVADOS (SOLO PARA ESE DÍA)
        
        const fechaInicioDia = new Date(fechaISO + 'T00:00:00.000Z');
        const fechaFinDia = new Date(fechaISO + 'T23:59:59.999Z');

        const asignacionesReservadas = await this._turnoTatuadorRepo.findReservadosEnRango(
            tatuadorId,
            fechaInicioDia,
            fechaFinDia
        );
        
        // Mapear horarios ocupados 

        const horariosOcupados = asignacionesReservadas.map(a => {
            if (!a.turnoSesion || !a.turnoSesion.fecha_hora_inicio) return '';
            
            const d = new Date(a.turnoSesion.fecha_hora_inicio);
            const h = d.getHours().toString().padStart(2, '0');
            const m = d.getMinutes().toString().padStart(2, '0');

            return `${h}:${m}`;
        }).filter(h => h !== ''); // Filtramos por si alguno fue inválido

        // Generar todos los slots posibles y filtrar 

        const slotsDisponibles: string[] = [];
        const duracionMin = horarioDelDia.duracion_turno_min;
        
        let horaActual = new Date(fechaISO + 'T' + horarioDelDia.hora_inicio + 'Z');
        const horaFin = new Date(fechaISO + 'T' + horarioDelDia.hora_fin + 'Z');

        while (horaActual < horaFin) {
            const h = horaActual.getHours().toString().padStart(2, '0');
            const m = horaActual.getMinutes().toString().padStart(2, '0');
            const slotStr = `${h}:${m}`; 

            if (!horariosOcupados.includes(slotStr)) {
                slotsDisponibles.push(slotStr);
            }

            horaActual.setMinutes(horaActual.getMinutes() + duracionMin);
        }

        return slotsDisponibles;
    }



    /**
     * Devuelve las fechas (YYYY-MM-DD) del rango donde no hay slots disponibles.
     * Realiza solo 2 consultas DB sin importar el tamaño del rango.
     */
    public async getFechasBloqueadasEnRango(tatuadorId: number, fechaInicio: Date, fechaFin: Date): Promise<string[]> {

        // 1 sola query: todos los turnos del rango
        const inicioUTC = new Date(fechaInicio.toISOString().split('T')[0] + 'T00:00:00.000Z');
        const finUTC    = new Date(fechaFin.toISOString().split('T')[0]    + 'T23:59:59.999Z');
        const [horariosHabituales, todosReservados] = await Promise.all([
            this._horarioRepo.findByTatuadorId(tatuadorId),
            this._turnoTatuadorRepo.findReservadosEnRango(tatuadorId, inicioUTC, finUTC),
        ]);

        const fechasBloqueadas: string[] = [];
        const current = new Date(fechaInicio);

        while (current <= fechaFin) {
            const diaSemana = current.getDay();
            const fechaISO  = current.toISOString().split('T')[0];
            const horarioDelDia = horariosHabituales.find(h => h.dia_semana === diaSemana);

            if (!horarioDelDia) {
                // Sin horario configurado para este día de la semana
                fechasBloqueadas.push(fechaISO);
                current.setDate(current.getDate() + 1);
                continue;
            }

            // Horarios ya ocupados ese día
            const ocupados = new Set(
                todosReservados
                    .filter(a => a.turnoSesion?.fecha_hora_inicio &&
                        new Date(a.turnoSesion.fecha_hora_inicio).toISOString().split('T')[0] === fechaISO)
                    .map(a => {
                        const d = new Date(a.turnoSesion!.fecha_hora_inicio!);
                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    })
            );

            // Total de slots posibles ese día
            let totalSlots = 0;
            const horaActual = new Date(fechaISO + 'T' + horarioDelDia.hora_inicio + 'Z');
            const horaFin    = new Date(fechaISO + 'T' + horarioDelDia.hora_fin    + 'Z');
            while (horaActual < horaFin) {
                totalSlots++;
                horaActual.setMinutes(horaActual.getMinutes() + horarioDelDia.duracion_turno_min);
            }

            if (totalSlots > 0 && ocupados.size >= totalSlots) {
                fechasBloqueadas.push(fechaISO);
            }

            current.setDate(current.getDate() + 1);
        }

        return fechasBloqueadas;
    }

    async getHorarioHabitual(tatuadorId: number): Promise<HorarioHabitual[]> {
        const horarios = await this._horarioRepo.findByTatuadorId(tatuadorId);
        return horarios;
    }

async updateHorarioHabitual(tatuadorId: number, horariosInput: HorarioHabitualInput[], currentUser: string = 'system'): Promise<HorarioHabitual[]> {

        if (!Array.isArray(horariosInput)) {
            throw new ValidationError("El formato del horario es inválido (se esperaba un array).", 400);
        }

        // Validación detallada de cada regla (horas, días, duración)
        const diasVistos = new Set<number>();
        for (const input of horariosInput) {
            if (input.dia_semana === undefined || input.dia_semana < 0 || input.dia_semana > 6) {
                throw new ValidationError(`Día de la semana inválido: ${input.dia_semana}. Debe estar entre 0 y 6.`, 400);
            }
            if (diasVistos.has(input.dia_semana)) {
                 throw new ValidationError(`Día de la semana repetido: ${input.dia_semana}. Solo una regla por día.`, 400);
            }
            diasVistos.add(input.dia_semana);

            if (!input.hora_inicio || !/^\d{2}:\d{2}(:\d{2})?$/.test(input.hora_inicio)) {
                throw new ValidationError(`Formato de hora_inicio inválido para día ${input.dia_semana}: ${input.hora_inicio}. Usar HH:MM.`, 400);
            }
            if (!input.hora_fin || !/^\d{2}:\d{2}(:\d{2})?$/.test(input.hora_fin)) {
                throw new ValidationError(`Formato de hora_fin inválido para día ${input.dia_semana}: ${input.hora_fin}. Usar HH:MM.`, 400);
            }
            // Validar que hora_fin sea posterior a hora_inicio (comparando strings o convirtiendo a Date)
            if (input.hora_inicio >= input.hora_fin) {
                 throw new ValidationError(`La hora de fin debe ser posterior a la hora de inicio para el día ${input.dia_semana}.`, 400);
            }
            if (!input.duracion_turno_min || input.duracion_turno_min <= 0) {
                throw new ValidationError(`Duración de turno inválida para día ${input.dia_semana}: ${input.duracion_turno_min}. Debe ser mayor a 0.`, 400);
            }
        }

        //  Borrar el horario anterior completo para este tatuador
        await this._horarioRepo.deleteByTatuadorId(tatuadorId);


        // Crear las nuevas reglas una por una
        const horariosCreados: HorarioHabitual[] = [];
        for (const input of horariosInput) {
            const nuevoHorario = new HorarioHabitual();
            nuevoHorario.id_tatuador = tatuadorId;
            nuevoHorario.dia_semana = input.dia_semana;
            nuevoHorario.hora_inicio = input.hora_inicio.length === 5 ? `${input.hora_inicio}:00` : input.hora_inicio;
            nuevoHorario.hora_fin = input.hora_fin.length === 5 ? `${input.hora_fin}:00` : input.hora_fin;
            nuevoHorario.duracion_turno_min = input.duracion_turno_min;
            nuevoHorario.creationuser = currentUser;

    try {
        const horarioCreado = await this._horarioRepo.create(nuevoHorario);

        if (horarioCreado) {
            horariosCreados.push(horarioCreado); 
        } else {
            throw new Error(`Error inesperado al crear horario para el día ${input.dia_semana}`);
        }

    } catch(error) {
        throw error; 
    }}
        return horariosCreados;
    }

    async update(id: number, horarioChanges: Partial<HorarioHabitual>): Promise<HorarioHabitual> {
    const existingHorario = await this._horarioRepo.findOne(id);

    if (!existingHorario) {
        throw new ValidationError(`Horario con ID ${id} no encontrado.`, 404);
    }
    await this._horarioRepo.update(id, horarioChanges); 

    const updatedHorario = await this._horarioRepo.findOne(id);
    if (!updatedHorario) { 
         throw new DatabaseErrorCustom('Error al recuperar horario actualizado', 500);
    }
    return updatedHorario;
}

}
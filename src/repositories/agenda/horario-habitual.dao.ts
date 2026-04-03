import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/pg-database/db.js';
import { injectable } from 'inversify';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { HorarioHabitual } from '../../models/agenda/horario.entity.js';
import { IHorarioHabitualRepository } from '../interfaces/IHorarioHabitualRepository.js';

@injectable()
export class HorarioHabitualRepository implements IHorarioHabitualRepository { // Implementa la interfaz específica

    private _repository: Repository<HorarioHabitual>;

    constructor() {
        this._repository = AppDataSource.getRepository(HorarioHabitual);
    }

    // --- Métodos Específicos ---

    async findByTatuadorId(tatuadorId: number): Promise<HorarioHabitual[]> {
        try {
            return await this._repository.find({
                where: { id_tatuador: tatuadorId },
                order: { dia_semana: 'ASC' }
            });
        } catch (error) {
            console.error(`Error al buscar horarios para tatuador ${tatuadorId}:`, error);
            throw new DatabaseErrorCustom('Error al obtener horario habitual', 500);
        }
    }

    async deleteByTatuadorId(tatuadorId: number): Promise<void> {
         try {
            const deleteResult = await this._repository.delete({ id_tatuador: tatuadorId });
            console.log(`Horarios borrados para tatuador ${tatuadorId}: ${deleteResult.affected}`);
        } catch (error) {
            console.error(`Error al borrar horarios para tatuador ${tatuadorId}:`, error);
            throw new DatabaseErrorCustom('Error al actualizar horario habitual', 500);
        }
    }

    async create(horario: HorarioHabitual): Promise<HorarioHabitual> { // Ya lo tenías
        try {
            const nuevoHorario = this._repository.create(horario);
            return await this._repository.save(nuevoHorario);
        } catch (error) {
            console.error('Error al crear horario habitual:', error);
            if ((error as any).code === '23505') { // manejo de error con chequeo de UNIQUE de postgres
                 throw new DatabaseErrorCustom(`Ya existe una regla para el día ${horario.dia_semana}.`, 409);
            }
            throw new DatabaseErrorCustom('Error al guardar horario habitual', 500);
        }
    }

    async findAll(): Promise<HorarioHabitual[]> { 
        try {
            return await this._repository.find({ order: { id_tatuador: 'ASC', dia_semana: 'ASC' }});
        } catch (error) {
            throw new DatabaseErrorCustom('Error al obtener todos los horarios', 500);
        }
    }

    async findOne(id: number): Promise<HorarioHabitual | undefined> { 
        try {
            const horario = await this._repository.findOne({ where: { id } , relations: ['tatuador']  });
            return horario ?? undefined;
        } catch (error) {
            throw new DatabaseErrorCustom('Error al obtener horario por ID', 500);
        }
    }

    async update(id: number, horarioChanges: Partial<HorarioHabitual>): Promise<HorarioHabitual> { 
        try {
            const existing = await this._repository.findOneBy({ id });
            if (!existing) {
                throw new DatabaseErrorCustom('Horario no encontrado', 404);
            }
            await this._repository.update(id, horarioChanges);
            // findOneByOrFail es buena opción aquí
            return await this._repository.findOneByOrFail({ id });
        } catch (error) {
             throw new DatabaseErrorCustom('Error al actualizar horario', 500);
        }
    }

    async delete(id: number): Promise<HorarioHabitual | undefined> { 
        try {
            const horario = await this.findOne(id); 
            if (!horario) {
                 return undefined; 
            }
            await this._repository.remove(horario); 
            return horario;
        } catch (error) {
            throw new DatabaseErrorCustom('Error al borrar horario', 500);
        }
    }
}
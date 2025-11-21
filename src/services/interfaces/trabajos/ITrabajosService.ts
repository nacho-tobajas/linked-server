import { Trabajo } from "../../../models/trabajos/trabajo.entity.js";

export interface ITrabajosService {
    subirTrabajo(tatuadorId: number, imagePaths: string[], descripcion: string, username: string): Promise<Trabajo>;
    getTrabajosDeTatuador(tatuadorId: number): Promise<Trabajo[]>;
    darLike(clienteId: number, trabajoId: number): Promise<void>;
    quitarLike(clienteId: number, trabajoId: number): Promise<void>;
    getMisLikesIds(clienteId: number): Promise<number[]>;
    
}
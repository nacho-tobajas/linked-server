import { IBaseRepository } from './IBaseRepository.js';
import { Trabajo } from '../../models/trabajos/trabajo.entity.js';
import { TrabajoFavorito } from '../../models/trabajos/trabajo-favorito.entity.js';

export interface ITrabajosRepository extends IBaseRepository<Trabajo> {
    findByTatuadorId(tatuadorId: number): Promise<Trabajo[]>;
    
    // Métodos para manejar los Likes (Favoritos)
    addFavorito(clienteId: number, trabajoId: number): Promise<TrabajoFavorito>;
    removeFavorito(clienteId: number, trabajoId: number): Promise<void>;
    findFavoritosIdsByCliente(clienteId: number): Promise<number[]>;
}
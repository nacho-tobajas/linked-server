import { Request, Response, NextFunction } from 'express';

export function parseJuegoField(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.juego) {
      throw new Error("No se recibió el campo 'juego' en el body.");
    }

    const juegoData = JSON.parse(req.body.juego);

    // Insertar los campos en req.body para que la validación funcione
    Object.assign(req.body, juegoData);

    next();
  } catch (error: any) {
    return res.status(400).json({ error: 'El formato del campo juego no es válido', details: error.message || 'Error desconocido al parsear juego'});
  }
}
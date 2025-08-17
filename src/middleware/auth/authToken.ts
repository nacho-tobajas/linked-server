import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { secretKeyJWT } from '../../shared/Utils/Keys.js';

const secretKey = process.env.SECRET_KEY || secretKeyJWT;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err || !decoded) {
      res.sendStatus(403);
      return;
    }
    if (typeof decoded === 'object' && 'id' in decoded) {
      //(req as any).user = { id: (decoded as { id: number }).id };
      res.locals.userId = (decoded as { id: number }).id;
      next();
    } else {
      res.status(403).json({ message: 'Invalid token payload' });
    }
  });
};


export const authorizeRol = (requiredRol: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.status(401).json({ message: 'Token no proporcionado' });
      }

      try {
          const decodedToken = jwt.verify(token, secretKey) as { rol: string };
          
          // Verifica si el rol del usuario es el requerido
          if (decodedToken.rol !== requiredRol) {
              return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
          }

          next(); // Si el rol coincide, permite el acceso a la ruta
      } catch (error) {
          res.status(403).json({ message: 'Token no válido' });
      }
  };
};
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { secretKeyJWT } from '../../shared/Utils/Keys.js';

const secretKey = secretKeyJWT;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null || token === undefined) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err || !decoded) {
      res.sendStatus(403);
      return;
    }
    if (typeof decoded === 'object' && 'id' in decoded && 'username' in decoded && 'rol' in decoded) {
        const payload = decoded as { id: number; username: string; rol: string | string[] };
        req.user = {
          id: payload.id,
          username: payload.username,
          roles: Array.isArray(payload.rol) ? payload.rol : [payload.rol],
        };
        res.locals.userId = payload.id;
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
          const decodedToken = jwt.verify(token, secretKey) as { rol: string | string[] };

          // Normaliza: el rol puede ser string o array de strings
          const rolesArray = Array.isArray(decodedToken.rol)
            ? decodedToken.rol
            : [decodedToken.rol];

          if (!rolesArray.includes(requiredRol)) {
              return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
          }

          next();
      } catch (error) {
          res.status(403).json({ message: 'Token no válido' });
      }
  };
};
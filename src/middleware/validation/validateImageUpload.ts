import { Request, Response, NextFunction } from 'express';

export const validateImageUpload = (req: Request, _res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) return next(); // Si no hay archivo sigue igual

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeMB = 2;

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Formato de imagen no permitido. Solo JPEG, PNG o WebP.');
    (error as any).status = 400;
    throw next(error);
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    const error = new Error(`La imagen no debe superar los ${maxSizeMB} MB.`);
    (error as any).status = 400;
    throw next(error);
  }

  return next(); // Si todo esta ok
};
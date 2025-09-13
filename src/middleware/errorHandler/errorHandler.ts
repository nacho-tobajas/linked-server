import { Request, Response, NextFunction } from 'express';
import { CustomError } from './interface/customError.Interface.js';

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (res.headersSent) {
    return next(err); 
  }

  const status = err.status || 500;
  const name = err.name || 'InternalServerError';
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: {
      name,
      status,
      message,
      //...(process.env.NODE_ENV === 'development' && { stack: err.stack }), 
    },
  });
};

export default errorHandler;

import { Request, Response, NextFunction } from 'express';
import { CustomError } from './interface/customError.Interface.js';

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);

  const status = err.status || 500;
  const name = err.name || 'Internal Server Error';
  const message = err.message || undefined;
  const stack = err.stack || undefined;

  res.status(status).json({
    name,
    status,
    message,
    stack,
  });
};



export default errorHandler;

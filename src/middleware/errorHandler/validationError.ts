import { CustomError } from './interface/customError.Interface.js';

export class ValidationError extends Error implements CustomError {
  status: number;
  constructor(message: string, status = 404) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

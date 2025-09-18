import { CustomError } from './interface/customError.Interface.js';

export class AuthenticationError extends Error implements CustomError {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

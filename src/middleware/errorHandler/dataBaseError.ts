import { CustomError } from './interface/customError.Interface.js';

export class DatabaseErrorCustom extends Error implements CustomError {
    status: number;
    constructor(message: string, status = 500) {
      super(message);
      this.name = 'DatabaseError';
      this.status = status;
      Error.captureStackTrace(this, this.constructor);
    }
  }
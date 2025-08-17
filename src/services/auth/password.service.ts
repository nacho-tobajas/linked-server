import { inject, injectable } from 'inversify';
import { hashPassword, verifyPassword } from '../../middleware/auth/authHash.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { IPasswordService } from '../interfaces/auth/IPasswordService.js';

@injectable()
export class PasswordService implements IPasswordService {
    
    
 async validatePassword(password: string): Promise<Boolean> {
    
    if (!password) {
      throw new ValidationError('Contraseña no proporcionada');
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/;
    
    return passwordPattern.test(password)
  }

  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    return verifyPassword(hashedPassword, password);
  }
}
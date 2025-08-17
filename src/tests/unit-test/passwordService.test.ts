import { PasswordService } from '../../services/auth/password.service.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import "reflect-metadata";

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('validatePassword', () => {
    it('debería devolver true para una contraseña válida', async () => {
      const password = 'ContraseñaCorrecta123';
      const result = await passwordService.validatePassword(password);
      expect(result).toBe(true);
    });

    it('debería devolver false si la contraseña no cumple con los requisitos', async () => {
      const password = 'invalid'; 
      const result = await passwordService.validatePassword(password);
      expect(result).toBe(false);
    });

    it('debería lanzar un ValidationError si la contraseña es undefined', async () => {
      await expect(passwordService.validatePassword(''))
        .rejects
        .toThrow(ValidationError);
    });
  });
});

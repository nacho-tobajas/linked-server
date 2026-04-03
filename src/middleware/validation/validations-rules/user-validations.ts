import { body, param } from 'express-validator';

export const getUserValidationRules = [
  param('id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
];
//Nuevo
export const forgotPasswordValidationRules = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Formato de email invalido'),
];

//Nuevo
export const resetPasswordValidationRules = [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido'),
  body('newPassword')
    .notEmpty()
    .isString()
    .withMessage('Nueva contraseña es requerida'),
];

export const createUserValidationRules = [
  body('realname')
    .optional({ nullable: true })
    .isString()
    .withMessage('realname debe ser un string'),
  body('surname')
    .optional({ nullable: true })
    .isString()
    .withMessage('surname debe ser un string'),
  body('username')
    .notEmpty()
    .isString()
    .withMessage('username debe ser un string'),
  body('birth_date')
    .notEmpty()
    .isISO8601()
    .withMessage('Fecha de Nacimiento debe ser una fecha válida'),
  body('creationuser')
    .notEmpty()
    .isString()
    .withMessage('CreationUser debe ser un string'),
  body('status')
    .isBoolean()
    .notEmpty()
    .withMessage('Status debe ser un booleano'),
  body('password')
    .notEmpty()
    .isString()
    .withMessage('password debe ser un string'),
];

export const updateUserValidationRules = [
  param('id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
  body('realname')
    .optional({ nullable: true })
    .isString()
    .withMessage('realname debe ser un string'),
  body('surname')
    .optional({ nullable: true })
    .isString()
    .withMessage('surname debe ser un string'),
  body('username')
    .optional()
    .isString()
    .withMessage('username debe ser un string'),
  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de Nacimiento debe ser una fecha válida'),
  body('modificationuser')
    .optional()
    .isString()
    .withMessage('modificationuser debe ser un string'),
  body('password')
    .optional()
    .isString()
    .withMessage('password debe ser un string'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status debe ser un booleano'),
];

export const deleteUserValidationRules = [
  param('id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
];

export const updateUserByAdminValidationRules = [
  param('id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
  body('realname')
    .optional({ nullable: true })
    .isString()
    .withMessage('realname debe ser un string'),
  body('surname')
    .optional({ nullable: true })
    .isString()
    .withMessage('surname debe ser un string'),
  body('username')
    .optional()
    .isString()
    .withMessage('username debe ser un string'),
  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de Nacimiento debe ser una fecha válida'),
  body('modificationuser')
    .optional()
    .isString()
    .withMessage('modificationuser debe ser un string'),
  body('password')
    .optional()
    .isString()
    .withMessage('password debe ser un string'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status debe ser un booleano'),
  body('rolDescription')
    .optional()
    .isString()
    .withMessage('rolDescription debe ser un string'),
];

export const getAllUserRolsValidationRules = [
  param('idUser')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
];

export const getUserRolByidRoleValidationRules = [
  param('idRole')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
];

export const getAllRolsValidationRules = [
  param('id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Formato de ID invalido'),
];

// Validación para asignar especialidades a un usuario
export const assignEspecialidadesToUserValidationRules = [
  param("userId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El ID de usuario es inválido."),

  body("especialidadIds")
    .custom((value) => {
      if (value === undefined || value === null) {
        throw new Error("Debe enviar al menos una especialidad.");
      }

      // Permite un solo ID o un array de IDs
      const ids = Array.isArray(value) ? value : [value];

      const invalidId = ids.find((id) => !Number.isInteger(id) || id <= 0);
      if (invalidId !== undefined) {
        throw new Error("Todos los IDs de especialidad deben ser números enteros mayores a 0.");
      }

      return true;
    })
    .withMessage('Formato de IDs de especialidad inválido o falta el campo.'),
];

// Validación para quitar una especialidad de un usuario
export const removeEspecialidadesFromUserValidationRules = [
  param("userId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El ID de usuario es inválido."),
  param("especialidadId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El ID de especialidad es inválido."),
];

// Validación para obtener las especialidades de un usuario
export const getUserEspecialidadesValidationRules = [
  param("userId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El ID de usuario es inválido."),];
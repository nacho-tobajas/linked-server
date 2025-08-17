import { body, param } from 'express-validator';

export const getPrecioValidationRules = [
  param('id_game')
    .isInt({ min: 1 })
    .withMessage('El ID del juego (id_game) debe ser un entero positivo'),
  param('valid_until_date')
    .isISO8601()
    .withMessage('valid_until_date debe ser una fecha válida'),
];

export const createPrecioValidationRules = [
  body('id_game')
    .isInt({ min: 1 })
    .withMessage('id_game debe ser un entero positivo'),
  body('valid_until_date')
    .isISO8601()
    .withMessage('valid_until_date debe ser una fecha válida'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('creationuser')
    .isString()
    .withMessage('creationuser debe ser un string'),
  body('creationtimestamp')
    .isISO8601()
    .withMessage('creationtimestamp debe ser una fecha válida'),
];

export const updatePrecioValidationRules = [
  param('id_game')
    .isInt({ min: 1 })
    .withMessage('El ID del juego (id_game) debe ser un entero positivo'),
  param('valid_until_date')
    .isISO8601()
    .withMessage('valid_until_date debe ser una fecha válida'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('modificationuser')
    .optional()
    .isString()
    .withMessage('modificationuser debe ser un string'),
  body('modificationtimestamp')
    .optional()
    .isISO8601()
    .withMessage('modificationtimestamp debe ser una fecha válida'),
];

export const deletePrecioValidationRules = [
  param('id_game')
    .isInt({ min: 1 })
    .withMessage('El ID del juego (id_game) debe ser un entero positivo'),
  param('valid_until_date')
    .isISO8601()
    .withMessage('valid_until_date debe ser una fecha válida'),
];

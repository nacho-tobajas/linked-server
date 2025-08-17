import { body, param, query } from 'express-validator';

export const getJuegoValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido'),
];

export const getJuegoByNameValidationRules = [
  query('gamename')
    .isString()
    .withMessage('El nombre del juego debe ser un string.')
    .notEmpty()
    .withMessage('Nombre del juego es requerido'),
];

export const createJuegoValidationRules = [
  body('gamename').isString().withMessage('gamename debe ser un string'),
  body('creationuser')
    .isString()
    .withMessage('CreationUser debe ser un string'),
  body('creationtimestamp')
    .isISO8601()
    .withMessage('CreationTimestamp debe ser una fecha válida'),
  body('release_date')
    .optional()
    .isISO8601()
    .withMessage('release_date debe ser una fecha válida'),
  body('id_publisher')
    .isInt({ min: 1 })
    .withMessage('id_publisher debe ser un entero positivo'),
  body('id_developer')
    .isInt({ min: 1 })
    .withMessage('id_developer debe ser un entero positivo'),
  body('categorias')
    .isArray()
    .withMessage('categorias debe ser un array de IDs de categorías'),
];

export const updateJuegoValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido'),
  body('gamename')
    .optional()
    .isString()
    .withMessage('gamename debe ser un string'),
  body('modificationuser')
    .optional()
    .isString()
    .withMessage('modificationuser debe ser un string'),
  body('modificationtimestamp')
    .optional()
    .isISO8601()
    .withMessage('modificationuser debe ser una fecha válida'),
  body('release_date')
    .optional()
    .isISO8601()
    .withMessage('release_date debe ser una fecha válida'),
];

export const deleteJuegoValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido'),
];

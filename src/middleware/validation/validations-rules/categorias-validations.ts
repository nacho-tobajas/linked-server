import { body, param } from 'express-validator';

export const getCategoriesValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];

export const createCategoriesValidationRules = [
    body('description')
        .isString()
        .withMessage('La descripcion debe ser un string'),
    body('creationuser')
        .isString()
        .withMessage('CreationUser debe ser un string'),
    body('creationtimestamp')
        .isISO8601()
        .withMessage('CreationTimestamp debe ser una fecha válida'),
  ];

export const updateCategoriesValidationRules = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Formato de ID invalido'),
    body('description')
        .optional()
        .isString()
        .withMessage('La descripcion debe ser un string'),
    body('modificationtimestamp')
        .optional()
        .isISO8601()
        .withMessage('modificationtimestamp debe ser una fecha válida'),
    body('modificationuser')
        .optional()
        .isString()
        .withMessage('modificationuser debe ser un string'),
  ];

export const deleteCategoriesValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];


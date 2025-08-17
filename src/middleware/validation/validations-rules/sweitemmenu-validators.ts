import { body, param } from 'express-validator';

export const getSweItemMenuValidationRules = [
    param('id').notEmpty().isInt({ min: 1 }).withMessage('Formato de ID invalido')
];

export const createSweItemMenuValidationRules = [
    body('creationuser')
        .notEmpty()
        .isString()
        .withMessage('CreationUser debe ser un string'),
    body('creationtimestamp')
        .notEmpty()
        .isISO8601()
        .withMessage('CreationTimestamp debe ser una fecha válida'),
];

export const updateSweItemMenuValidationRules = [
    param('id')
        .notEmpty()
        .isInt({ min: 1 })
        .withMessage('Formato de ID invalido'),
    body('modificationuser')
        .notEmpty()
        .isString()
        .withMessage('modificationuser debe ser un string'),
    body('modificationtimestamp')
        .optional()
        .isISO8601()
        .withMessage('modificationuser debe ser una fecha válida'),
];

export const deleteSweItemMenuValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];


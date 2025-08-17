import { body, param } from 'express-validator';

export const getHostingValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];

export const createHostingValidationRules =      [
    body('name')
        .isString()
        .withMessage('Name debe ser un string'),
    body('creationuser')
        .isString()
        .withMessage('CreationUser debe ser un string'),
    body('creationtimestamp')
        .isISO8601()
        .withMessage('CreationTimestamp debe ser una fecha válida'),
    body('status')
        .isBoolean()
        .withMessage('Status debe ser un booleano'),
  ];

export const updateHostingValidationRules =   [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Formato de ID invalido'),
    body('name')
        .optional()
        .isString()
        .withMessage('Name debe ser un string'),
    body('modificationuser')
        .optional()
        .isString()
        .withMessage('modificationuser debe ser un string'),
    body('modificationtimestamp')
        .optional()
        .isISO8601()
        .withMessage('modificationuser debe ser una fecha válida'),
    body('status')
        .optional()
        .isBoolean()
        .withMessage('Status debe ser un booleano'),
  ];

export const deleteHostingValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];


import { body, param } from 'express-validator';

export const getSupportTicketValidationRules = [
    param('id').notEmpty().isInt({ min: 1 }).withMessage('Formato de ID invalido')
];

export const createSupportTicketValidationRules =        [
    body('creationuser')
        .notEmpty()
        .isString()
        .withMessage('CreationUser debe ser un string'),
    body('creationtimestamp')
        .notEmpty()
        .isISO8601()
        .withMessage('CreationTimestamp debe ser una fecha válida'),
    body('status')
        .isBoolean()
        .withMessage('Status debe ser un booleano'),
  ];

export const updateSupportTicketValidationRules =     [
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
    body('status')
        .optional()
        .isBoolean()
        .withMessage('Status debe ser un booleano'),
  ];

export const deleteSupportTicketValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('Formato de ID invalido')
];

export const createSupportTicketDescriptionValidationRules =        [
    body('description')
        .notEmpty()
        .isString()
        .withMessage('description debe ser un string'),
  ];


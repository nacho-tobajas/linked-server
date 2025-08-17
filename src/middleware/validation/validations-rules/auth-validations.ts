import { body } from 'express-validator';

export const loginValidationRules = [
  body('username')
    .notEmpty()
    .isString()
    .withMessage('username debe ser un string'),
  body('password')
    .notEmpty()
    .isString()
    .withMessage('password debe ser un string'),
];
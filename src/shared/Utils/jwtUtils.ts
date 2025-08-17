import jwt from 'jsonwebtoken';
import { secretKeyJWT } from '../../shared/Utils/Keys.js';

const secretKey = secretKeyJWT;

export const generateToken = (user: object): string => {
  return jwt.sign(user, secretKey, { expiresIn: '1h' });
};

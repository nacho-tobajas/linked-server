import argon2 from 'argon2';
import  { AuthenticationError } from '../../middleware/errorHandler/authenticationError.js';

export async function hashPassword(password: string): Promise<string> {
    try {
        const hashedPassword = await argon2.hash(password);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new AuthenticationError("Error hashing password", 405);;
    }
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    try {
        return await argon2.verify(hashedPassword, password);
    }catch (err) {
        console.error('Error verifyng password:', err);
        throw new AuthenticationError("Error verifyng password", 405);;
    }
}

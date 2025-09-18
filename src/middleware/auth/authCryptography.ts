import * as crypto  from 'crypto';
import { encryptionKey, iv } from "../../shared/Utils/Keys.js";

export class AuthCryptography {

    public encrypt(text: string) {
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        // Convertir el resultado a base64
        return encrypted;
    }

    public decrypt(encryptedText: String): string {
        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
        const encryptedBuffer = Buffer.from(encryptedText, 'base64'); // Decodificar desde base64
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf-8');
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
  }
}

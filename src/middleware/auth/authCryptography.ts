import * as crypto  from 'crypto';
import { encryptionKey, iv } from "../../shared/Utils/Keys.js";

export class AuthCryptography {

    public encrypt(text: string) {
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    public decrypt(encryptedText: any) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
        const encryptedBuffer = Buffer.from(encryptedText, 'base64'); // Decodificar desde base64
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf-8');
    }
}

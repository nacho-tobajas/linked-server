import * as crypto from 'crypto';
import { rsaPrivateKey } from "../../shared/Utils/Keys.js";

export class AuthCryptography {
    public decrypt(encryptedText: string): string {
        try {
            const buffer = Buffer.from(encryptedText, 'base64');
            const decrypted = crypto.privateDecrypt(
                {
                    key: rsaPrivateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                buffer
            );
            return decrypted.toString('utf-8');
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }
}

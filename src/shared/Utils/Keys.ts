import * as crypto from 'crypto';

if (!process.env.JWT_SECRET || !process.env.RSA_PRIVATE_KEY) {
  throw new Error(
    'Variables de entorno faltantes: JWT_SECRET y RSA_PRIVATE_KEY son obligatorias.'
  );
}

export const secretKeyJWT = process.env.JWT_SECRET;
export const rsaPrivateKey = process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n');
export const rsaPublicKey = crypto.createPublicKey(rsaPrivateKey).export({ type: 'spki', format: 'pem' }) as string;

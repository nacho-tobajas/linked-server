if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
  throw new Error(
    'Variables de entorno faltantes: JWT_SECRET, ENCRYPTION_KEY y ENCRYPTION_IV son obligatorias.'
  );
}

export const secretKeyJWT = process.env.JWT_SECRET;
export const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
export const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');


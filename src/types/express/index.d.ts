declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      username?: string;
      email?: string;
      roles?: string[] | number[];

    }

    // Extiende la interfaz Request global de Express
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
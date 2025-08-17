// Importamos el módulo 'express' para crear un servidor web
// Importamos el enrutador para las rutas relacionadas con los editores
import express, { Request, Response } from 'express';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/errorHandler/errorHandler.js';

import swaggerDocs from './swagger.js';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './config/dependency-injection/inversify.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar el servidor con Inversify y Express
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  // Configuramos Express para que pueda analizar solicitudes con formato JSON
  app.use(express.json());
  app.use(cors());

  //app.use(commonRouter);

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  //ruta para utilizar documentacion de swagger
  swaggerDocs(app);
});

server.setErrorConfig((app) => {
  app.use(errorHandler); // Middleware para manejar errores
  // Ruta para manejar 404
  app.use((_: Request, res: Response) => {
    return res.status(404).send({ message: 'Recurso no encontrado' });
  });
});

const appConfigured = server.build(); // Construye la app con Inversify

export default appConfigured;

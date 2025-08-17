import { AppDataSource } from './config/pg-database/db.js';
import 'reflect-metadata';
import app from './app.js';

async function main () {

await AppDataSource.initialize()

// Iniciamos el servidor Express en el puerto 3000
// Para correr esto hay que hacer npm run start-dev en terminal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // necesita comillas invertidas para que tome el valor de port como variable y no convierta el texto completo en string
});
}


main();


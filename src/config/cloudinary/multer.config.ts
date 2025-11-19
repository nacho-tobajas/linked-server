import multer from "multer";
import path from "path";
import fs from 'fs';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config.js";

// Variable para alternar entre Cloudinary o local
const USE_CLOUDINARY = false; // cambia a true si querés Cloudinary

let storage;

if (USE_CLOUDINARY) {
  // --- Configuración para Cloudinary ---
  /*storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "users", // carpeta en Cloudinary
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: (_req, file) => Date.now() + "-" + file.originalname,
    },
  });*/
} else {
  // --- Configuración para almacenamiento local ---
  /*storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Usa process.cwd() para que siempre guarde en la raíz del proyecto
      const uploadPath = path.join(process.cwd(), "uploads/users");

      // Crea el directorio si no existe
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });*/
}

// CONFIGURACIÓN DE STORAGE PARA USUARIOS
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/users");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// CONFIGURACIÓN DE STORAGE PARA TURNOS 
const turnoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/turnos");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});


export const uploadUser = multer({ storage: userStorage });
export const uploadTurno = multer({ storage: turnoStorage });

//export const upload = multer({ storage });
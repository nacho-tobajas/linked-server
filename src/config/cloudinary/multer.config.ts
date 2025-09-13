import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.config.js";

interface CustomParams {
  folder: string;
  allowed_formats: string[];
  public_id: (req: Express.Request, file: Express.Multer.File) => string;
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "games",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (_req: Request, file: Express.Multer.File) => Date.now() + "-" + file.originalname,
  } as unknown as CustomParams, // 👈 extendemos a mano
});

export const upload = multer({ storage });


//si quiere usar el disco duro local para subir imagenes utilice este metodo y configure todo como estaba antes de cloudinary.

/*const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/games'); // Carpeta donde se guardan las imagenes de los juegos
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const uniqueSuffix = Date.now();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });*/
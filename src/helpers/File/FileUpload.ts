import fs from "fs";
import multer from "multer";
import path from "path";

export const createStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Determine folder based on 'type' in request body
      const type = req.body.type; // 'user' or 'message'
      const uploadFolder = type
        ? path.join(process.cwd(), "uploads", type)
        : path.join(process.cwd(), "uploads", "users");

      // Ensure folder exists
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }

      cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
      // Keep original file name
      cb(null, file.originalname);
    },
  });
};

// Multer upload instance
export const upload = multer({
  limits: {
    fileSize: 200 * 1024 * 1024, // Use max size (for videos)
    files: 10
  }
});
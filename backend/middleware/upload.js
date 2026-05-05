import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "profile_pictures",

    // ✅ keep original extension instead of forcing png
    format: file.mimetype.split("/")[1],

    // ✅ unique name
    public_id: `profile_${Date.now()}`,
  }),
});

const upload = multer({
  storage,

  // ✅ prevent large uploads (important)
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  // ✅ allow only images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

export default upload;
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    format: async (req, file) => "png",
    public_id: (req, file) => `profile_${Date.now()}`,
  },
});

export default multer({ storage });
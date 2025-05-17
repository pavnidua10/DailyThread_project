import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 
import { connectDB } from "./db/connect.js";
import articlesRoutes from "./routes/article.js";
import authRoutes from "./routes/auth.js";
import discussionsRoutes from "./routes/discussion.js";
import profilesRoutes from "./routes/profile.js";
import communityRoutes from "./routes/community.js"
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;



app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/config/cloudinary', (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});
// Routes
app.use("/articles", articlesRoutes);
app.use("/auth", authRoutes);
app.use("/discussions", discussionsRoutes);
app.use("/profiles", profilesRoutes);
app.use("/community",communityRoutes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  connectDB();
});

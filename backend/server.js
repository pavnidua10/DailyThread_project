import express from "express";
import dotenv from "dotenv";

dotenv.config();
import cors from "cors"; 
import { connectDB } from "./db/connect.js";
import articlesRoutes from "./routes/article.js";
import authRoutes from "./routes/auth.js";
import discussionsRoutes from "./routes/discussion.js";
import profilesRoutes from "./routes/profile.js";
import communityRoutes from "./routes/community.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import sourceVerificationRoutes from "./routes/sourceVerification.js";
import verdictRoutes from "./routes/verdict.js";
import debateRoutes from "./routes/debates.js";
import discussion from "./routes/discussion.js";
import activityRoutes from "./routes/activity.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;


app.use(cors({
  origin:["http://localhost:5173", "https://dailythread-project-1.onrender.com"],
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

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/articles", articlesRoutes);
app.use("/auth", authRoutes);
app.use("/discussions", discussionsRoutes);
app.use("/profiles", profilesRoutes);
app.use("/communities", communityRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", sourceVerificationRoutes);
app.use("/api", verdictRoutes);
app.use("/api", debateRoutes);
app.use("/api", activityRoutes);
app.use("/api", discussion);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

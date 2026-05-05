import mongoose from "mongoose";

const CredibilityScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  data: { type: Object },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("CredibilityScore", CredibilityScoreSchema);
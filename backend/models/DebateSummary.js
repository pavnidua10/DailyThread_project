import mongoose from "mongoose";

const DebateSummarySchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    unique: true,
  },
  for: {
    type: String,
  },
  against: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.model("DebateSummary", DebateSummarySchema);
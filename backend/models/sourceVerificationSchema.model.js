import mongoose from "mongoose";

const SourceVerificationSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    enum: ["verified", "credible", "unknown", "flagged"],
    default: "unknown",
  },
  label: {
    type: String, // e.g. "Government Source"
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
});

// unique index
SourceVerificationSchema.index({ domain: 1 }, { unique: true });


export default mongoose.model(
  "SourceVerification",
  SourceVerificationSchema
);
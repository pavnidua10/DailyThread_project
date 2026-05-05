import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
    unique: true,
  },
  entries: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
      profilePhoto: {
        type: String,
      },
      credibilityScore: {
        type: Number,
      },
      tier: {
        type: String,
      },
      articlesThisWeek: {
        type: Number,
      },
      rank: {
        type: Number,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ THIS LINE WAS MISSING
export default mongoose.model("Leaderboard", LeaderboardSchema);
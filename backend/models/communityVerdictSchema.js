import mongoose from "mongoose";

const CommunityVerdictSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // Tally
    forVotes: {
      type: Number,
      default: 0,
    },
    againstVotes: {
      type: Number,
      default: 0,
    },

    // Result
    result: {
      type: String,
      enum: ["for", "against", "inconclusive", null],
      default: null,
    },
    resultLabel: {
      type: String,
    },
    summary: {
      type: String,
    },

    // Voters
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        side: {
          type: String,
          enum: ["for", "against"],
        },
      },
    ],
  },
  { timestamps: true }
);

// ✅ THIS LINE WAS MISSING
export default mongoose.model(
  "CommunityVerdict",
  CommunityVerdictSchema
);
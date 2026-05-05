import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
    },

    // one of the CLAIM_TYPE_LABELS keys
    claimType: {
      type: String,
      enum: ["personal_experience", "cited_source", "insider_claim", "opinion", "general"],
      default: "general",
    },

    sourceUrl: {
      type: String,
      trim: true,
    },

    // populated from sourceVerificationSchema.model.js
    sourceVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SourceVerification",
    },

    // optional linked article
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true } // gives createdAt and updatedAt, used in .sort({ createdAt: 1 })
);

const Discussion = mongoose.model("Discussion", discussionSchema);
export default Discussion;
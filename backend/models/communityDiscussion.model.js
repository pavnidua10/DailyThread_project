import mongoose from "mongoose";


const communityDiscussionSchema = new mongoose.Schema(
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
    claimType: {
      type: String,
      enum: ["personal_experience", "cited_source", "insider_claim", "opinion", "general"],
      default: "general",
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    sourceVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SourceVerification",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CommunityDiscussion = mongoose.model("CommunityDiscussion", communityDiscussionSchema);
export default CommunityDiscussion;
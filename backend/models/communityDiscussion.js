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
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CommunityDiscussion",
  communityDiscussionSchema
);
import mongoose from 'mongoose';
const DebateArgumentSchema = new mongoose.Schema({
  articleId:        { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
  authorId:         { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  side:             { type: String, enum: ["for", "against"], required: true },
  text:             { type: String, required: true, maxlength: 1000 },
  credibilityScore: { type: Number, default: 0 },
  upvotes:          [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes:        [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("DebateArgument", DebateArgumentSchema);
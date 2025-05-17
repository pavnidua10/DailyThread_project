import mongoose from 'mongoose';

const communityDiscussionSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }, 
}, { timestamps: true });

export default mongoose.model('communityDiscussion', communityDiscussionSchema);

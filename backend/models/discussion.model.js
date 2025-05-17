import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Discussion',
       default: null }, 
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', 
  },
}, { timestamps: true });

const Discussion = mongoose.model('Discussion', discussionSchema);
export default Discussion;

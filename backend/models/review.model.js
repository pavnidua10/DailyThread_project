
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  comment: {
    type: String,
  },
 
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;

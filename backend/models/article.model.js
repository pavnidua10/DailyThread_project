import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: null,
    },
    averageAccuracy: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['MentalHealth', 'Education', 'Environment', 'Technology', 'Politics', 'Lifestyle', 'sports', 'health', 'others'],
      default: 'others',
    },
    region: {
      type: String,
      trim: true, 
    },
    tags: [
      {
        type: String,
        lowercase: true, 
        trim: true,
      },
    ],
  
    imageUrl: { 
  type: String,
  default: null,
},
communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
external: {
  type: Boolean,
  default: false,
},
sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model('Article', articleSchema);
export default Article;

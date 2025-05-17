import mongoose from 'mongoose';

const savedArticleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // For external articles
  title: String,
  url: String,
  description: String,
  imageUrl: String,
  source: String,
  publishedAt: Date,
  external: { type: Boolean, default: false },
  // For internal articles
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
}, { timestamps: true });

const SavedArticle = mongoose.model('SavedArticle', savedArticleSchema);
export default SavedArticle;

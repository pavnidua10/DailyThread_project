import express from 'express';
import {
  createArticle,
  getAllArticles,
  getArticlesByAuthor,
  submitOrUpdateReview,
  getReviews,
  getTopHeadlines,
  saveArticle,
  editArticle,
  deleteArticle,
  getSavedArticles,
  getTopRatedArticles,
  getMyReview,
  getRelevantArticles,
  unsaveArticle,
} from '../controllers/article.controller.js';
import protect from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/articles',protect, createArticle);
router.get('/get-articles',protect, getAllArticles);
router.get('/articles/by-author', protect,getArticlesByAuthor);
router.get('/:articleId/reviews/me',protect,getMyReview)
router.post('/review',protect, submitOrUpdateReview);
router.get('/:articleId/reviews',protect, getReviews);
router.get('/headlines',protect, getTopHeadlines);
router.patch('/edit/:articleId', protect ,editArticle);
router.delete('/delete/:articleId', protect, deleteArticle);
router.post('/save', protect, saveArticle);
router.get('/articles/saved', protect, getSavedArticles);
router.get('/top-rated', getTopRatedArticles);
router.get('/relevant',getRelevantArticles);
router.post('/unsave', protect, unsaveArticle);


export default router;



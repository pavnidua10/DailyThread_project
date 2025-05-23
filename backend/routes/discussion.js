import express from 'express';
import { getDiscussionsByArticle, createDiscussion } from '../controllers/discussion.controller.js';
import protect from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/article/:articleId', getDiscussionsByArticle);
router.post('/article/:articleId', protect, createDiscussion);

export default router;

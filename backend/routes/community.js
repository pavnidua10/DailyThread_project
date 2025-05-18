import express from 'express';
import {
  searchCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunity,
  addArticleToCommunity,
  createCommunity,
   inviteToCommunity,
  getDiscussions,
  postDiscussion,
  shareArticleToCommunity
} from '../controllers/community.controller.js';
import protect  from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchCommunities);
router.post('/join', protect, joinCommunity);
router.post('/leave', protect, leaveCommunity);
router.post('/:id/articles', protect, addArticleToCommunity);
router.post('/create',protect,createCommunity)
router.post('/:id/invite', protect, inviteToCommunity);
router.post('/:communityId/share-article', protect, shareArticleToCommunity);
router.get('/:id/discussions', getDiscussions);
router.post('/:id/discussions', protect, postDiscussion);
router.get('/community/:id', getCommunity);
export default router;

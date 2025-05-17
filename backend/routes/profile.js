import express from 'express';
import {
  createProfile,
  getMyProfile,
  followReporter,
  getProfile,
  updateProfile
} from '../controllers/profile.controller.js';
import  protect  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createProfile);
router.get('/me', protect, getMyProfile);
router.post('/follow/:reporterId', protect, followReporter);
router.put('/profile', protect, updateProfile);
router.get('/profile',protect,getProfile);
export default router;


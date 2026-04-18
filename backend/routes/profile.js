import express from 'express';
import {
  createProfile,
  getMyProfile,
  getPublicProfile,
  updateProfile,
  getSuggestedUsers,
  getUserById,


} from '../controllers/profile.controller.js';
import  protect  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createProfile);
router.get('/me', protect, getMyProfile);

router.put('/profile', protect, updateProfile);

router.get('/suggested', protect, getSuggestedUsers);


router.get("user/:id", protect, getUserById);
router.get("/:id", getPublicProfile);
export default router;

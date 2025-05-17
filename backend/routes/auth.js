import express from 'express';
import { registerUser, loginUser, logoutUser,followUser,unfollowUser,searchUsers, getUser, getUserProfile} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, (req, res) => {
    res.status(200).json(req.user);
  });
  router.post('/follow', protect, followUser);
router.post('/unfollow', protect, unfollowUser);
router.get('/search', searchUsers);

router.get('/:id', getUser);
router.get('/profile/:id', getUserProfile);
export default router;

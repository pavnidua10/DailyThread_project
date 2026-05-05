import express from 'express';
import { registerUser, loginUser, logoutUser,followUser,unfollowUser,searchUsers, getUser,
   getUserProfile,getCredibility,uploadProfileImage,deleteProfilePhoto} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import upload from "../middleware/upload.js";
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
router.get('/profile/:id', getUserProfile);
router.get('/user/:id', getUser);
router.get("/:userId/credibility",getCredibility);
router.post("/profile-image", protect, upload.single("image"), uploadProfileImage);
router.delete("/profile-image", protect, deleteProfilePhoto);

export default router;

// routes/activity.routes.js

import express from "express";
import {
  getUserActivity,
  getArticlesByAuthor,
  followUser,
  unfollowUser,
} from "../controllers/activity.controller.js";


const router = express.Router();


router.get("/users/:userId/activity", getUserActivity);

router.get("/articles/by-author/:userId", getArticlesByAuthor);

router.post("/profiles/:id/follow", followUser);       
router.post("/profiles/:id/unfollow", unfollowUser);   

export default router;

import express from "express";
import {
  getDiscussions,
  createDiscussion,
  voteDiscussion,
} from "../controllers/discussion.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/communities/:communityId/discussions", getDiscussions);

router.post(
  "/communities/:communityId/discussions",protect,
  createDiscussion 
);

router.post(
  "/communities/:communityId/discussions/:discussionId/vote",protect,
  voteDiscussion 
);

export default router;
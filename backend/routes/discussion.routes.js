
import express from "express";
import {
  getDiscussions,
  createDiscussion,
  voteDiscussion,
} from "../controllers/discussion.js";

const router = express.Router();

router.get("/communities/:communityId/discussions", getDiscussions);

router.post(
  "/communities/:communityId/discussions",
  createDiscussion 
);

router.post(
  "/communities/:communityId/discussions/:discussionId/vote",
  voteDiscussion 
);

export default router;
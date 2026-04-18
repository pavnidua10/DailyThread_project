import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  searchCommunities,
  createCommunity,
  getCommunity,
  getMyCommunities,
  joinCommunity,
  leaveCommunity,
  kickMember,
  addModerator,
  removeModerator,
  transferOwnership,
  addArticleToCommunity,
  shareArticleToCommunity,
  getDiscussions,
  postDiscussion,
  getSuggestedCommunities,
  inviteToCommunity,
} from "../controllers/community.controller.js";

const router = express.Router();



router.get("/suggested", protect, getSuggestedCommunities);

router.get("/search", searchCommunities);

router.get("/suggested", protect, getSuggestedCommunities);

router.get("/my", protect, getMyCommunities);


router.post("/", protect, createCommunity);


router.post("/join", protect, joinCommunity);
router.post("/leave", protect, leaveCommunity);


router.post("/transfer-ownership", protect, transferOwnership);

router.post("/invite/:id", protect, inviteToCommunity);
router.post("/kick", protect, kickMember);

router.post("/add-moderator", protect, addModerator);
router.post("/remove-moderator", protect, removeModerator);


router.post("/:id/articles", protect, addArticleToCommunity);
router.post("/:id/share-article", protect, shareArticleToCommunity);


router.get("/:id/discussions", getDiscussions);
router.post("/:id/discussions", protect, postDiscussion);


router.get("/:id", getCommunity);

export default router;
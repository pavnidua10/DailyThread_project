// routes/leaderboard.routes.js

import express from "express";
import {
  getLeaderboard,
  refreshLeaderboard,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// GET leaderboard
router.get("/communities/:communityId/leaderboard", getLeaderboard);

// POST refresh leaderboard
router.post(
  "/communities/:communityId/leaderboard/refresh",
  refreshLeaderboard
);

export default router;
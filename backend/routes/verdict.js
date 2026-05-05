// routes/verdict.routes.js

import express from "express";
import {
  getVerdicts,
  createVerdict,
  castVote,
  closeVerdictManually,
} from "../controllers/verdict.controller.js";

const router = express.Router();

// get all verdicts
router.get("/communities/:communityId/verdicts", getVerdicts);

// create verdict
router.post("/communities/:communityId/verdicts", createVerdict);

// vote
router.post(
  "/communities/:communityId/verdicts/:verdictId/vote",
  castVote
);

// close manually
router.post(
  "/communities/:communityId/verdicts/:verdictId/close",
  closeVerdictManually
);

export default router;
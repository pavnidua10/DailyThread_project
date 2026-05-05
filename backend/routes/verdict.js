import Groq from "groq-sdk";
import express from "express";
import {
  getVerdicts,
  createVerdict,
  castVote,
  closeVerdictManually,
} from "../controllers/verdict.controller.js";

const router = express.Router();


router.get("/communities/:communityId/verdicts", getVerdicts);


router.post("/communities/:communityId/verdicts", createVerdict);


router.post(
  "/communities/:communityId/verdicts/:verdictId/vote",
  castVote
);


router.post(
  "/communities/:communityId/verdicts/:verdictId/close",
  closeVerdictManually
);

export default router;
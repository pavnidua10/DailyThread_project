
import express from "express";
import {
  getDebate,
  postArgument,
  voteArgument,
  summarize,
} from "../controllers/debate.controller.js";

const router = express.Router();


router.get("/articles/:id/debate", getDebate);

router.post("/articles/:id/debate", postArgument);

router.post(
  "/articles/:id/debate/:argId/vote",
  voteArgument
);

router.post("/articles/:id/debate/summarize", summarize);

export default router;
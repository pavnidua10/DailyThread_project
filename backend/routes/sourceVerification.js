
import express from "express";
import {
  verifySource,
  verifySourceGet,
} from "../controllers/sourceVerification.controller.js";

const router = express.Router();

// POST
router.post("/verify-source", verifySource);

// GET
router.get("/verify-source", verifySourceGet);

export default router;
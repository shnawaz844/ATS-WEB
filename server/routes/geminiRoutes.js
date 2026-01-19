import express from "express";
import { generateJobDescription } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/generate-description", generateJobDescription);

export default router;

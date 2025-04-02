import express from "express";
import { getFeedback } from "../controllers/Feedback/getFeedback.js";
import { updateFeedback } from "../controllers/Feedback/updateFeedback.js";
import {createFeedback} from "../controllers/Feedback/createFeedback.js"
import {getFeedbacks} from "../controllers/Feedback/getFeedbacks.js"

const router = express.Router();

// Use the controller function for the POST route
router.post("/create-feedback", createFeedback);
router.get("/get-feedback/:interviewId", getFeedback);
router.put("/update-feedback/:feedbackId", updateFeedback)
router.get("/get-feedbacks", getFeedbacks);



export default router;

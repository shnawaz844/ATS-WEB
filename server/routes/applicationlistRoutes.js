import express from "express";
import { createInterview } from "../controllers/ScheduledInterview/applicationlist.js";
import { getInterviews } from "../controllers/ScheduledInterview/getApplicationList.js";
import { updateInterview } from "../controllers/ScheduledInterview/updateInterviewApp.js"

const router = express.Router();

// Use the controller function for the POST route
router.post("/interviewer-app", createInterview);
router.get("/scheduled-interviewer-app", getInterviews);
router.put("/update-interview/:id", updateInterview)


export default router;


// app.post("/applicationscheduledlist/interviewer-app", createInterview);

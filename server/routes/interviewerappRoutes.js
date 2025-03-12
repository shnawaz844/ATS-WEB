import express from 'express';

const router = express.Router();


import { addInterviewerApp } from "../controllers/InterviewerApp/addInterviewerApp.js"

router.post('/interviewer-app', addInterviewerApp);

export default router;

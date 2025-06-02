import express from "express";
import JobStatus from "../models/JobStatus.js";

const router = express.Router();

import { getJobStatuses } from "../controllers/JobStatus/getJobStatuses.js";
import { addJobStatus } from "../controllers/JobStatus/addJobStatus.js";
import { getJobStatus } from "../controllers/JobStatus/getJobStatus.js";
import { deleteJobStatus } from "../controllers/JobStatus/deleteJobStatus.js";
import { updateJobStatus } from "../controllers/JobStatus/updateJobStatus.js";
import { updateJobStatusByCandidate } from "../controllers/JobStatus/updateJobStatusByCandidate.js";

router.get("/all-job-statuses", getJobStatuses);
router.post("/add-job-status", addJobStatus);
router.get("/job-status/:id", getJobStatus);
router.delete("/delete-job-status/:id", deleteJobStatus);
router.put("/update-job-status/:id", updateJobStatus);
router.put(
  "/update-job-status-by-candidate/",
  updateJobStatusByCandidate
);

export default router;

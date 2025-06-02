import express from "express";
import ApplicationStatus from "../models/ApplicationStatus.js";

const router = express.Router();

import { getApplicationStatuses } from "../controllers/ApplicationStatus/getApplicationStatuses.js";
import { addApplicationStatus } from "../controllers/ApplicationStatus/addApplicationStatus.js";
import { getApplicationStatus } from "../controllers/ApplicationStatus/getApplicationStatus.js";
import { deleteApplicationStatus } from "../controllers/ApplicationStatus/deleteApplicationStatus.js";
import { updateApplicationStatus } from "../controllers/ApplicationStatus/updateApplicationStatus.js";
import { updateApplicationStatusByCandidate } from "../controllers/ApplicationStatus/updateApplicationStatusByCandidate.js";

router.get( "/all-application-statuses", getApplicationStatuses );
router.post( "/add-application-status", addApplicationStatus );
router.get( "/application-status/:id", getApplicationStatus );

router.delete( "/delete-application-status/:id", deleteApplicationStatus );
router.put( "/update-application-status/:id", updateApplicationStatus );
router.put(
  "/update-application-status-by-candidate/",
  updateApplicationStatusByCandidate
);

export default router;

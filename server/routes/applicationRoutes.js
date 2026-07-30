import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

import { upload, addApplication } from '../controllers/Application/addApplication.js';
import { updateApplication } from '../controllers/Application/updateApplication.js';
import { getCandidateApplications } from '../controllers/Application/applicationController.js';
import { getApplications } from '../controllers/Application/getApplications.js';
import { getApplication } from '../controllers/Application/getApplication.js';
import { getAllApplicationsGroupedByJob } from '../controllers/Application/groupedByJob.js'
import { getApplicationsByJobId } from '../controllers/Application/getApplicationByJobId.js'
import { getCandidateAppDetail } from '../controllers/Application/getCandidateAppDetail.js';
import { getApplicationById } from '../controllers/Application/getApplicationById.js'


router.post("/add-application", upload.fields([{ name: "resume", maxCount: 1 }, { name: "certificate", maxCount: 1 }, { name: "certFile", maxCount: 1 }]), addApplication);
router.put("/update-candidate-application/:id", upload.single("resume"), updateApplication);
router.get('/get-application/:id', getApplication);
router.get( '/get-application-hm/:id', getApplicationById);
router.get('/all-application/', getApplications);
router.get('/candidate/:candidateId', getCandidateApplications);
router.get('/grouped-by-job', getAllApplicationsGroupedByJob);
router.get('/job/:jobId', getApplicationsByJobId);
router.get('/candidate-details/:candidateId/:jobId', getCandidateAppDetail);

export default router;
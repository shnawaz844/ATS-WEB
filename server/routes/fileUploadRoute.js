import express from 'express';
import multer from 'multer';
import { upload, uploadFile, getUserFiles, proxyFile, createJobsFromFile } from "../controllers/ImportApplication/importApplication.js";
import {
    uploadCandidateFile,
    createCandidateApplications,
    getCandidateFiles,
    getCandidateFileDetails
} from "../controllers/ImportApplication/importApplication.js";
const router = express.Router();

router.get('/user-files', getUserFiles);

router.post("/application", upload.single("file"), uploadFile);
router.post("/proxy-file", proxyFile);
router.post("/create-jobs-from-file", createJobsFromFile);
// router.post( "/create-candidate-applications", createCandidateApplications );

// Candidate file routes
router.post("/candidate-upload", upload.single("file"), uploadCandidateFile);
router.post("/create-candidate", createCandidateApplications);
router.get("/candidate-files", getCandidateFiles);
router.get("/candidate-files/:id", getCandidateFileDetails);

export default router;
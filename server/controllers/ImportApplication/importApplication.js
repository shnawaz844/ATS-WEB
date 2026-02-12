import File from "../../models/ImportApplication.js";
import Job from "../../models/Job.js";
import User from "../../models/User.js";
import CandidateApplication from "../../models/CandidateApplication.js";
import CandidateFile from "../../models/CandidateApplication.js";
import connectDB from "../../config/connectDB.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";
import fetch from 'node-fetch';
import uniqid from 'uniqid';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs'
import { generateSimpleTitleCode, generateTitleCode } from "../utils.js";
import Application from "../../models/Application.js";
import ApplicationStatus from "../../models/ApplicationStatus.js";
import { generateDescriptionText } from "../../utils/aiHelper.js";

export const uploadFile = async (req, res) => {
    try {
        await connectDB();

        // Make sure file exists
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Extract user data from request body
        const { userId, companyId, userName } = req.body;

        // Validate required user data
        if (!userId || !companyId) {
            return res.status(400).json({
                error: "User ID and Company ID are required",
                message: "Please provide userId and companyId in the request"
            });
        }

        let fileUrl = null;
        console.log("Uploading to S3...");

        if (req.file) {
            fileUrl = await uploadToS3(req.file);
        } else {
            return res.status(400).json({ message: "File is required." });
        }

        const fileData = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            file: fileUrl, // S3 URL
            userId: userId,
            companyId: companyId,
            userName: userName || 'Unknown User',
            uploadDate: new Date()
        };

        const newFile = new File(fileData);
        await newFile.save();

        res.status(200).json({
            message: "File uploaded successfully",
            fileId: newFile._id,
            fileName: newFile.filename,
            fileUrl: newFile.file
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({
            error: "Failed to upload file",
            details: error.message
        });
    }
};

// Candidate File Upload - Saves to CandidateFile model instead of ImportApplication
export const uploadCandidateFile = async (req, res) => {
    try {
        await connectDB();

        // Make sure file exists
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Extract user data from request body
        const { userId, companyId, userName, fileName } = req.body;

        // Validate required user data
        if (!userId || !companyId) {
            return res.status(400).json({
                error: "User ID and Company ID are required",
                message: "Please provide userId and companyId in the request"
            });
        }

        let fileUrl = null;
        console.log("Uploading candidate file to S3...");

        if (req.file) {
            fileUrl = await uploadToS3(req.file);
        } else {
            return res.status(400).json({ message: "File is required." });
        }

        // Save to CandidateFile model instead of ImportApplication model
        const candidateFileData = {
            fileName: fileName || req.file.originalname,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            fileUrl: fileUrl, // S3 URL
            userId: userId,
            companyId: companyId,
            userName: userName || 'Unknown User',
            uploadDate: new Date(),
            status: 'processing'
        };

        const newCandidateFile = new CandidateFile(candidateFileData);
        await newCandidateFile.save();

        res.status(200).json({
            message: "Candidate file uploaded successfully",
            fileId: newCandidateFile._id,
            candidateFileId: newCandidateFile._id, // Specific ID for candidate files
            fileName: newCandidateFile.fileName,
            fileUrl: newCandidateFile.fileUrl,
            status: newCandidateFile.status
        });
    } catch (error) {
        console.error("Error uploading candidate file:", error);
        res.status(500).json({
            error: "Failed to upload candidate file",
            details: error.message
        });
    }
};

// Get candidate files for a user/company
export const getCandidateFiles = async (req, res) => {
    try {
        await connectDB();

        const { userId, companyId, userName, role } = req.query;

        console.log("Fetching candidate files with filters:", { userId, companyId, userName, role });

        let query = {};

        // Apply filters
        if (userId && companyId) {
            query = { userId, companyId };
        } else if (userId) {
            query = { userId };
        } else if (companyId) {
            query = { companyId };
        }

        // Add userName filter if provided
        if (userName && userName !== 'all') {
            query.userName = { $regex: userName, $options: 'i' };
        }

        // For admin users, they can see all files regardless of user
        if (role === 'admin') {
            // If admin is searching by userName, apply the filter
            if (userName && userName !== 'all') {
                query.userName = { $regex: userName, $options: 'i' };
            } else {
                // If no userName filter, remove user-specific filters for admin
                delete query.userId;
                delete query.companyId;
            }
        }

        const candidateFiles = await CandidateFile.find(query).sort({ uploadDate: -1 });

        const transformedFiles = candidateFiles.map(file => ({
            _id: file._id,
            fileName: file.fileName || file.filename,
            originalName: file.originalName || file.fileName || file.filename,
            fileSize: file.size,
            fileUrl: file.fileUrl,
            uploadDate: file.uploadDate,
            userName: file.userName,
            userId: file.userId,
            companyId: file.companyId,
            mimetype: file.mimetype,
            totalCandidates: file.totalCandidates,
            processedCandidates: file.processedCandidates,
            failedCandidates: file.failedCandidates,
            status: file.status,
            processingErrors: file.processingErrors
        }));

        console.log(`Fetched ${transformedFiles.length} candidate files`);

        res.status(200).json({
            files: transformedFiles,
            total: transformedFiles.length,
            filters: { userId, companyId }
        });
    } catch (error) {
        console.error("Error fetching candidate files:", error);
        res.status(500).json({
            error: "Failed to fetch candidate files",
            details: error.message
        });
    }
};

// Get specific candidate file details
export const getCandidateFileDetails = async (req, res) => {
    try {
        await connectDB();

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Candidate file ID is required" });
        }

        const candidateFile = await CandidateFile.findById(id);

        if (!candidateFile) {
            return res.status(404).json({ error: "Candidate file not found" });
        }

        // Get related candidate applications
        const applications = await CandidateApplication.find({
            source_file: id
        }).populate('candidate_id', 'userName email contactInfo');

        res.status(200).json({
            file: candidateFile,
            applications: applications,
            summary: {
                total: candidateFile.totalCandidates,
                processed: candidateFile.processedCandidates,
                failed: candidateFile.failedCandidates,
                successRate: candidateFile.totalCandidates > 0 ?
                    (candidateFile.processedCandidates / candidateFile.totalCandidates * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error("Error fetching candidate file details:", error);
        res.status(500).json({
            error: "Failed to fetch candidate file details",
            details: error.message
        });
    }
};

// Updated createCandidateApplications function with CandidateFile tracking
export const createCandidateApplications = async (req, res) => {
    try {
        const { userId, companyId, candidates, candidateFileId } = req.body;
        console.log("🔍 DEBUG - Received candidates data:", candidates);

        // Step 1: Validate user & company
        if (!userId || !companyId) {
            return res.status(400).json({
                error: 'User ID and company ID are required'
            });
        }

        // Step 2: Validate candidates array
        if (!candidates || !Array.isArray(candidates)) {
            return res.status(400).json({
                error: 'Candidates data is required and must be an array'
            });
        }

        const createdCandidates = [];
        const errors = [];
        const jobApplications = [];
        let candidateFile = null;

        // Step 3: Candidate file setup
        if (candidateFileId) {
            candidateFile = await CandidateFile.findById(candidateFileId);
            if (candidateFile) {
                console.log("🔍 DEBUG: CandidateFile found, updating status to processing");
                candidateFile.status = 'processing';
                candidateFile.totalCandidates = candidates.length;
                await candidateFile.save();
            }
        }

        // Step 4: Get the first application status
        console.log("🔍 DEBUG: Fetching first application status for company:", companyId);
        const firstApplicationStatus = await ApplicationStatus.findOne({
            company_id: companyId
        }).sort({ applicationStep: 1 }); // Sort by applicationStep ascending to get the first step

        if (!firstApplicationStatus) {
            return res.status(400).json({
                error: 'No application status found for this company. Please set up application statuses first.'
            });
        }

        const firstStatusId = firstApplicationStatus._id.toString();

        // Step 5: Check available jobs first
        const availableJobs = await Job.find({ company_id: companyId });

        // Step 5: Loop over candidates
        for (let i = 0; i < candidates.length; i++) {
            const candidateData = candidates[i];

            try {
                // Validation
                if (!candidateData.userName || !candidateData.email) {
                    throw new Error('Candidate name and email are required');
                }


                // Existing candidate check
                const existingCandidate = await User.findOne({
                    email: candidateData.email,
                    company_id: companyId,
                    role: 'candidate'
                });

                let candidateId;
                let isNewCandidate = false;

                if (existingCandidate) {
                    candidateId = existingCandidate._id;
                    createdCandidates.push({
                        candidate: existingCandidate,
                        status: 'existing',
                        message: 'Candidate already exists'
                    });
                } else {
                    // Create new candidate
                    const hashPassword = await bcrypt.hashSync(candidateData.password || 'DefaultPassword123!', 10);

                    const newCandidate = new User({
                        userName: candidateData.userName,
                        email: candidateData.email,
                        password: hashPassword,
                        address: candidateData.address || '',
                        gender: candidateData.gender || '',
                        titleCode: candidateData.titleCode || '',
                        contactInfo: candidateData.contactInfo || '',
                        experience: candidateData.experience || '',
                        role: 'candidate',
                        company_id: companyId,
                        created_by: userId,
                        status: 'active'
                    });

                    const savedCandidate = await newCandidate.save();
                    candidateId = savedCandidate._id;
                    isNewCandidate = true;

                    createdCandidates.push({
                        candidate: savedCandidate,
                        status: 'created',
                        message: 'Candidate created successfully'
                    });
                }

                // Step 6: Apply candidate to jobs based on titleCode
                if (candidateData.titleCode && candidateData.titleCode.length > 0) {
                    console.log(`🔍 DEBUG: Processing titleCodes for ${candidateData.userName}:`, candidateData.titleCode);

                    for (const code of candidateData.titleCode) {
                        const trimmedCode = code.trim();
                        if (!trimmedCode) continue;

                        try {
                            console.log(`🔍 DEBUG: Looking for job with titleCode: "${trimmedCode}"`);

                            // Find job by titleCode
                            const job = await Job.findOne({
                                titleCode: trimmedCode,
                                company_id: companyId
                            });

                            if (job) {
                                console.log(`✅ DEBUG: Found job: ${job.jobTitle} (${job.titleCode})`);

                                // Check if application already exists
                                const existingApplication = await Application.findOne({
                                    candidateID: candidateId.toString(),
                                    jobID: job._id.toString(),
                                    company_id: companyId
                                });

                                if (!existingApplication) {
                                    // Create job application
                                    const jobApplication = new Application({
                                        jobID: job._id.toString(),
                                        candidateID: candidateId.toString(),
                                        applicationStatusId: firstStatusId,
                                        jobStatusId: 'active',
                                        resume: candidateData.resumeUrl || '',
                                        contactInfo: candidateData.contactInfo || '',
                                        emailInfo: candidateData.email || '',
                                        experience: candidateData.experience || '',
                                        questions: [],
                                        answers: [],
                                        company_id: companyId
                                    });

                                    const savedApplication = await jobApplication.save();
                                    jobApplications.push({
                                        candidateId: candidateId,
                                        candidateName: candidateData.userName,
                                        jobId: job._id,
                                        jobTitle: job.jobTitle,
                                        titleCode: trimmedCode,
                                        applicationId: savedApplication._id,
                                        status: 'applied',
                                        applicationStatus: {
                                            id: firstStatusId,
                                            step: firstApplicationStatus.applicationStep,
                                            name: firstApplicationStatus.applicationStatus
                                        }
                                    });

                                    console.log(`✅ SUCCESS: Applied ${candidateData.userName} to job ${job.jobTitle} (${trimmedCode}) with status: ${firstApplicationStatus.applicationStatus}`);
                                } else {
                                    jobApplications.push({
                                        candidateId: candidateId,
                                        candidateName: candidateData.userName,
                                        jobId: job._id,
                                        jobTitle: job.jobTitle,
                                        titleCode: trimmedCode,
                                        applicationId: existingApplication._id,
                                        status: 'already_applied'
                                    });
                                    console.log(`ℹ️ INFO: ${candidateData.userName} already applied to ${job.jobTitle}`);
                                }
                            } else {
                                console.log(`❌ DEBUG: No job found for titleCode: "${trimmedCode}"`);
                                jobApplications.push({
                                    candidateId: candidateId,
                                    candidateName: candidateData.userName,
                                    titleCode: trimmedCode,
                                    status: 'job_not_found',
                                    error: `No job found with title code: ${trimmedCode}`
                                });
                            }
                        } catch (jobError) {
                            console.error(`❌ ERROR applying candidate to job ${trimmedCode}:`, jobError);
                            jobApplications.push({
                                candidateId: candidateId,
                                candidateName: candidateData.userName,
                                titleCode: trimmedCode,
                                status: 'application_failed',
                                error: jobError.message
                            });
                        }
                    }
                } else {
                    console.log(`ℹ️ DEBUG: No titleCodes found for candidate: ${candidateData.userName}`);
                }

            } catch (error) {
                console.error(`❌ ERROR processing candidate row ${i + 1}:`, error);
                const errorData = {
                    row: i + 1,
                    error: error.message,
                    candidateData: candidateData
                };
                errors.push(errorData);
            }
        }

        // Step 7: Update candidate file
        if (candidateFile) {
            candidateFile.processedCandidates = createdCandidates.length;
            candidateFile.failedCandidates = errors.length;
            candidateFile.status = errors.length === 0 ? 'completed' :
                createdCandidates.length === 0 ? 'failed' : 'partial';
            await candidateFile.save();
        }

        console.log("📊 DEBUG: Final Results:", {
            totalProcessed: candidates.length,
            created: createdCandidates.filter(c => c.status === 'created').length,
            existing: createdCandidates.filter(c => c.status === 'existing').length,
            errors: errors.length,
            jobApplications: jobApplications.filter(app => app.status === 'applied').length,
            jobApplicationsDetail: jobApplications
        });

        return res.status(201).json({
            message: 'Candidate processing completed',
            totalProcessed: candidates.length,
            created: createdCandidates.filter(c => c.status === 'created').length,
            existing: createdCandidates.filter(c => c.status === 'existing').length,
            errors: errors.length,
            jobApplications: jobApplications.filter(app => app.status === 'applied').length,
            createdCandidates: createdCandidates,
            jobApplicationsDetail: jobApplications,
            candidateFileId: candidateFileId,
            processingStatus: candidateFile ? candidateFile.status : 'unknown',
            applicationStatusUsed: {
                id: firstStatusId,
                step: firstApplicationStatus.applicationStep,
                name: firstApplicationStatus.applicationStatus
            }
        });

    } catch (error) {
        console.error("❌ FATAL ERROR in createCandidateApplications:", error);

        if (req.body.candidateFileId) {
            try {
                await CandidateFile.findByIdAndUpdate(req.body.candidateFileId, {
                    status: 'failed',
                    failedCandidates: req.body.candidates ? req.body.candidates.length : 0
                });
            } catch (updateError) {
                console.error("❌ ERROR updating candidateFile status:", updateError.message);
            }
        }

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};


const formatExcelTime = (value) => {
    if (value === null || value === undefined || value === "") return "";

    let numValue = typeof value === 'number' ? value : parseFloat(value);

    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1 && (typeof value === 'number' || (value.toString && value.toString().includes('.')))) {
        const totalMinutes = Math.round(numValue * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return value.toString() || "";
};

// controllers/ImportApplication/importApplication.js - Add this function

export const createJobsFromFile = async (req, res) => {
    try {
        const { fileUrl, fileName, userId, companyId, fileData, jobStatusMap, hiringManagerMap, recruiterMap, useAiDescription, companyUserName } = req.body;

        if (!userId || !companyId) {
            return res.status(400).json({
                error: 'User ID and company ID are required'
            });
        }

        let headers = [];
        let data = [];

        // Check if fileData is provided directly (from frontend)
        if (fileData && fileData.headers && fileData.data) {
            headers = fileData.headers;
            data = fileData.data;
        }
        // Otherwise, fetch from URL (existing logic)
        else if (fileUrl) {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (fileName.toLowerCase().endsWith('.csv')) {
                const text = buffer.toString('utf-8');
                const rows = text.split('\n').filter(row => row.trim());
                if (rows.length > 0) {
                    headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    data = rows.slice(1).map(row => {
                        return row.split(',').map(cell => cell.trim().replace(/"/g, ''));
                    }).filter(row => row.length > 0);
                }
            } else {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (jsonData.length > 0) {
                    headers = jsonData[0] || [];
                    data = jsonData.slice(1).filter(row => row.length > 0);
                }
            }
        } else {
            return res.status(400).json({
                error: 'Either fileUrl or fileData is required'
            });
        }

        if (!headers.length || !data.length) {
            return res.status(400).json({
                error: 'No valid data found in the file'
            });
        }

        // Get existing jobs for title code generation
        const existingJobs = await Job.find({ company_id: companyId });
        console.log(`Found ${existingJobs.length} existing jobs for title code generation`);

        // Process data and create jobs
        const jobs = [];
        const errors = [];

        const headerMap = headers.map(h => h.toLowerCase().trim());

        // Find column indices
        const titleIndex = headerMap.findIndex(h => h.includes('title'));
        const statusIndex = headerMap.findIndex(h => h.includes('status') || h.includes('applicationstatus'));
        const hiringManagerIndex = headerMap.findIndex(h =>
            h.includes('hiring manager') ||
            h.includes('hiring_manager') ||
            h.includes('manager') ||
            h.includes('hiring manager name')
        );

        // Recruiter manager index
        const recruiterManagerIndex = headerMap.findIndex(h =>
            h.includes('recruter manager') ||
            h.includes('recruiter manager') ||
            h.includes('recruiter_manager') ||
            h.includes('recruiter')
        );

        const experienceRequiredIndex = headerMap.findIndex(h =>
            h.includes('experience required') ||
            h.includes('experience') ||
            h.includes('exp required') ||
            h.includes('exp')
        );

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row.some(cell => cell && cell.toString().trim() !== '')) continue;

            try {
                const statusName = row[statusIndex] || 'Active';
                const hiringManagerName = hiringManagerIndex >= 0 ? row[hiringManagerIndex] : '';
                const recruiterManagerName = recruiterManagerIndex >= 0 ? row[recruiterManagerIndex] : '';

                let statusId = '';

                // Use the status ID sent from frontend via jobStatusMap
                if (jobStatusMap && jobStatusMap[statusName]) {
                    statusId = jobStatusMap[statusName];
                } else {
                    console.warn(`Status "${statusName}" not found in jobStatusMap`);
                    // Try to find any status as fallback
                    const firstStatus = Object.values(jobStatusMap)[0];
                    statusId = firstStatus || '';
                }

                // Handle hiring manager mapping
                let hiringManagerId = userId; // Default to current user

                if (hiringManagerName && hiringManagerName.toString().trim() !== '') {
                    const hiringManagerNameStr = hiringManagerName.toString().trim();

                    // Try to find hiring manager ID using different variations
                    let foundId = null;

                    if (hiringManagerMap) {
                        // Create an array of possible variations to check
                        const variations = [
                            hiringManagerNameStr, // Exact match: "shah_nawaz_ahmad"
                            hiringManagerNameStr.toLowerCase(), // Lowercase: "shah_nawaz_ahmad"
                            hiringManagerNameStr.replace(/_/g, ' '), // Replace underscores with spaces: "shah nawaz ahmad"
                            hiringManagerNameStr.replace(/_/g, ' ').toLowerCase(), // "shah nawaz ahmad"
                            hiringManagerNameStr.replace(/\s+/g, '_'), // Replace spaces with underscores: "shah_nawaz_ahmad"
                            hiringManagerNameStr.replace(/\s+/g, '_').toLowerCase(), // "shah_nawaz_ahmad"
                            // Title case variations
                            hiringManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' '), // "Shah Nawaz Ahmad"
                            hiringManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ').toLowerCase() // "shah nawaz ahmad"
                        ];

                        // Try each variation
                        for (const variation of variations) {
                            if (hiringManagerMap[variation]) {
                                foundId = hiringManagerMap[variation];
                                console.log(`✅ Found hiring manager match with variation "${variation}" -> ID: ${foundId}`);
                                break;
                            }
                        }
                    }

                    if (foundId) {
                        hiringManagerId = foundId;
                        console.log(`✅ Final hiring manager mapping: "${hiringManagerNameStr}" -> ID: ${hiringManagerId}`);
                    } else {
                        console.warn(`❌ Hiring manager "${hiringManagerNameStr}" not found in map. Using current user as default.`);
                    }
                } else {
                    console.log('ℹ️ No hiring manager specified, using current user as default');
                }

                // Handle recruiter manager mapping
                let recruiterManagerId = userId; // Default to current user

                if (recruiterManagerName && recruiterManagerName.toString().trim() !== '') {
                    const recruiterManagerNameStr = recruiterManagerName.toString().trim();

                    console.log(`Looking up recruiter manager: "${recruiterManagerNameStr}"`);

                    // Try to find recruiter manager ID using different variations
                    let foundId = null;

                    if (recruiterMap) {
                        // Create an array of possible variations to check
                        const variations = [
                            recruiterManagerNameStr, // Exact match
                            recruiterManagerNameStr.toLowerCase(), // Lowercase
                            recruiterManagerNameStr.replace(/_/g, ' '), // Replace underscores with spaces
                            recruiterManagerNameStr.replace(/_/g, ' ').toLowerCase(),
                            recruiterManagerNameStr.replace(/\s+/g, '_'), // Replace spaces with underscores
                            recruiterManagerNameStr.replace(/\s+/g, '_').toLowerCase(),
                            // Title case variations
                            recruiterManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' '), // "Shah Nawaz Ahmad"
                            recruiterManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ').toLowerCase() // "shah nawaz ahmad"
                        ];

                        // Try each variation
                        for (const variation of variations) {
                            if (recruiterMap[variation]) {
                                foundId = recruiterMap[variation];
                                console.log(`✅ Found recruiter manager match with variation "${variation}" -> ID: ${foundId}`);
                                break;
                            }
                        }
                    }

                    if (foundId) {
                        recruiterManagerId = foundId;
                        console.log(`✅ Final recruiter manager mapping: "${recruiterManagerNameStr}" -> ID: ${recruiterManagerId}`);
                    } else {
                        console.warn(`❌ Recruiter manager "${recruiterManagerNameStr}" not found in map. Using current user as default.`);
                    }
                } else {
                    console.log('ℹ️ No recruiter manager specified, using current user as default');
                }

                // Handle experience required - keep as string/slot format
                const experienceRequiredValue = experienceRequiredIndex >= 0 ? row[experienceRequiredIndex] : undefined;
                let experienceRequired = '0'; // default as string

                if (experienceRequiredValue !== undefined && experienceRequiredValue !== null) {
                    // Keep as string, don't parse to integer
                    experienceRequired = experienceRequiredValue.toString().trim();

                    // Optional: Validate and clean up
                    if (experienceRequired === '') {
                        experienceRequired = '0';
                    }
                }

                // Extract job title for title code generation
                const jobTitle = row[titleIndex] || 'Untitled Position';

                // Generate title code
                let titleCode;
                try {
                    titleCode = generateTitleCode(jobTitle, existingJobs);
                } catch (error) {
                    console.error('Error generating title code, using fallback:', error);
                    titleCode = generateSimpleTitleCode(jobTitle);
                }

                // Extract job data with better field mapping
                const jobData = {
                    title: jobTitle,
                    titleCode: titleCode, // ADD THIS FIELD - THIS IS WHAT'S MISSING
                    locationType: row[headerMap.findIndex(h => h.includes('location type') || h.includes('locationtype'))] || 'On-Site',
                    type: row[headerMap.findIndex(h => h.includes('type') && !h.includes('location') && !h.includes('schedule') && !h.includes('hire'))] || 'Full-Time',
                    scheduleType: row[headerMap.findIndex(h => h.includes('schedule type') || h.includes('scheduletype'))] || 'Flexible',
                    shiftStart: formatExcelTime(row[headerMap.findIndex(h => h.includes('shift start') || h.includes('shiftstart'))]) || '09:00',
                    shiftEnd: formatExcelTime(row[headerMap.findIndex(h => h.includes('shift end') || h.includes('shiftend'))]) || '17:00',
                    hireType: row[headerMap.findIndex(h => h.includes('hire type') || h.includes('hiretype'))] || 'New',
                    country: row[headerMap.findIndex(h => h.includes('country'))] || 'India',
                    state: row[headerMap.findIndex(h => h.includes('state'))] || '',
                    city: row[headerMap.findIndex(h => h.includes('city'))] || '',
                    description: `Position for ${jobTitle}. Imported from file.`,
                    compensation: row[headerMap.findIndex(h => h.includes('compensation') || h.includes('salary'))] || '0',
                    experienceRequired: experienceRequired,
                    requiredResources: parseInt(row[headerMap.findIndex(h => h.includes('required resources') || h.includes('resources'))]) || 1,
                    status: statusId,
                    recruiterId: recruiterManagerId,
                    hiringManagerId: hiringManagerId,
                    applicationForm: {},
                    applicants: [],
                    company_id: companyId
                };

                // Generate AI description if requested
                if (useAiDescription) {
                    try {
                        console.log(`Generating AI description for job title: ${jobTitle}`);
                        jobData.description = await generateDescriptionText(
                            jobTitle,
                            companyUserName,
                            jobData.compensation,
                            jobData.experienceRequired
                        );
                        console.log(`✅ AI description generated for: ${jobTitle}`);

                        // Add delay between requests to avoid rate limiting (1 second)
                        if (i < data.length - 1) { // Don't delay after the last job
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } catch (aiError) {
                        console.error(`Error generating AI description for ${jobTitle}:`, aiError);
                        // Fallback to default description if AI fails
                    }
                }

                console.log(`Job data for row ${i + 1}:`, {
                    title: jobData.title,
                    titleCode: jobData.titleCode, // Log the generated title code
                    recruiterId: jobData.recruiterId,
                    hiringManagerId: jobData.hiringManagerId
                });

                // Validate that we have at least a title
                if (!jobData.title || jobData.title.trim() === '' || jobData.title === 'Untitled Position') {
                    throw new Error('Job title is required and cannot be empty');
                }

                // Validate status ID if required
                if (!statusId) {
                    throw new Error(`Status ID not found for status: ${statusName}`);
                }

                // Create job using your existing job creation logic
                const job = new Job({
                    jobID: uniqid(),
                    ...jobData
                });

                const savedJob = await job.save();
                jobs.push(savedJob);

                console.log(`✅ Job created successfully: ${savedJob.title} (Code: ${savedJob.titleCode}, ID: ${savedJob._id})`);

            } catch (error) {
                console.error(`Error processing row ${i + 1}:`, error);
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        console.log(`Job creation summary: ${jobs.length} created, ${errors.length} errors`);

        res.json({
            success: true,
            totalProcessed: data.length,
            jobsCreated: jobs.length,
            errors: errors,
            jobs: jobs
        });

    } catch (error) {
        console.error('Error creating jobs from file:', error);
        res.status(500).json({
            error: `Failed to create jobs from file: ${error.message}`
        });
    }
};

// In uploadFile backend code
export const getUserFiles = async (req, res) => {
    try {
        await connectDB();

        const { userId, companyId, role, fileType, userName } = req.query;

        console.log("Fetching files with filters:", { userId, companyId, role, fileType, userName });

        let query = {};

        // If user is admin, show all files (no user/company filter)
        if (role === 'admin') {
            // Admin can see all files across the system
            query = {};

            // If admin is filtering by userName, apply that filter
            if (userName && userName !== 'all') {
                query.userName = { $regex: userName, $options: 'i' };
            }
        }
        // For non-admin users, apply normal filters
        else if (userId && companyId) {
            query = { userId, companyId };
        } else if (userId) {
            query = { userId };
        } else if (companyId) {
            query = { companyId };
        }

        // File type filter (for candidate files)
        if (fileType === 'candidate') {
            query.mimetype = {
                $in: [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv',
                    'application/vnd.ms-excel.sheet.macroEnabled.12'
                ]
            };
        }

        // For non-admin users, if userName filter is provided
        if (role !== 'admin' && userName && userName !== 'all') {
            query.userName = { $regex: userName, $options: 'i' };
        }

        // Role filter for non-admin users (optional)
        if (role && role !== 'admin') {
            const usersWithRole = await User.find({ role }).select('_id');
            const userIds = usersWithRole.map(user => user._id.toString());

            if (query.userId) {
                // If userId filter already exists, ensure it matches the role
                query.userId = { $in: userIds.filter(id => id === query.userId) };
            } else {
                query.userId = { $in: userIds };
            }
        }

        console.log("Final database query:", query);

        const files = await File.find(query).sort({ uploadDate: -1 });

        const transformedFiles = files.map(file => ({
            _id: file._id,
            fileName: file.filename,
            fileSize: file.size,
            fileUrl: file.file,
            uploadDate: file.uploadDate,
            userName: file.userName || 'Unknown User',
            userId: file.userId,
            companyId: file.companyId,
            mimetype: file.mimetype,
            userRole: file.userRole || ''
        }));

        console.log(`Fetched ${transformedFiles.length} files for role: ${role}`);

        res.status(200).json({
            files: transformedFiles,
            total: transformedFiles.length,
            filters: { userId, companyId, role, fileType }
        });
    } catch (error) {
        console.error("Error fetching user files:", error);
        res.status(500).json({
            error: "Failed to fetch user files",
            details: error.message
        });
    }
};

export const proxyFile = async (req, res) => {
    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({
                error: 'Missing fileUrl or fileName'
            });
        }
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split("-")[1];

        console.log(`Proxying file request for: ${fileName}`);
        console.log(`File URL: ${fileUrl}`);

        // Fetch the file from S3
        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*',
                'User-Agent': 'Mozilla/5.0 (compatible; FileProxy/1.0)'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        // Get the file data
        const buffer = await response.buffer();

        // Set appropriate headers
        const contentType = response.headers.get('content-type') ||
            (fileName.toLowerCase().endsWith('.csv') ? 'text/csv' :
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.set({
            'Content-Type': contentType,
            'Content-Length': buffer.length,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Send the file data
        res.send(buffer);

    } catch (error) {
        console.error('Proxy file error:', error);
        res.status(500).json({
            error: 'Failed to proxy file',
            details: error.message
        });
    }
};

export const getFile = async (req, res) => {
    try {
        await connectDB();

        const { id } = req.query;
        const { userId, companyId } = req.query; // Optional security check

        if (!id) {
            return res.status(400).json({ error: "File ID is required" });
        }

        // Build query with security filters
        let query = { _id: id };

        // Add user/company filters for additional security
        if (userId && companyId) {
            query.userId = userId;
            query.companyId = companyId;
        }

        const file = await File.findOne(query);

        if (!file) {
            return res.status(404).json({ error: "File not found or access denied" });
        }

        // For S3 URLs, redirect to the file
        if (file.file.startsWith('http')) {
            return res.redirect(file.file);
        }

        // For binary data stored in database (legacy support)
        res.setHeader("Content-Type", file.mimetype);
        res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
        res.send(file.file);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({
            error: "Failed to fetch file",
            details: error.message
        });
    }
};

// New function to delete user files
export const deleteUserFile = async (req, res) => {
    try {
        await connectDB();

        const { id } = req.params;
        const { userId, companyId } = req.body;

        if (!id) {
            return res.status(400).json({ error: "File ID is required" });
        }

        if (!userId || !companyId) {
            return res.status(400).json({ error: "User ID and Company ID are required" });
        }

        // Find and delete file only if it belongs to the user/company
        const deletedFile = await File.findOneAndDelete({
            _id: id,
            userId: userId,
            companyId: companyId
        });

        if (!deletedFile) {
            return res.status(404).json({ error: "File not found or access denied" });
        }

        res.status(200).json({
            message: "File deleted successfully",
            deletedFile: {
                id: deletedFile._id,
                filename: deletedFile.filename
            }
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({
            error: "Failed to delete file",
            details: error.message
        });
    }
};

// Function to get file statistics for a company
export const getCompanyFileStats = async (req, res) => {
    try {
        await connectDB();

        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const stats = await File.aggregate([
            { $match: { companyId: companyId } },
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: "$size" },
                    users: { $addToSet: "$userId" },
                    latestUpload: { $max: "$uploadDate" },
                    oldestUpload: { $min: "$uploadDate" }
                }
            }
        ]);

        const result = stats[0] || {
            totalFiles: 0,
            totalSize: 0,
            users: [],
            latestUpload: null,
            oldestUpload: null
        };

        result.uniqueUsers = result.users.length;

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching company stats:", error);
        res.status(500).json({
            error: "Failed to fetch company statistics",
            details: error.message
        });
    }
};

// Alternative approach using streams (more memory efficient for large files)
export const proxyFileStream = async (req, res) => {
    try {
        const { fileUrl, fileName } = req.body;

        if (!fileUrl || !fileName) {
            return res.status(400).json({
                error: 'Missing fileUrl or fileName'
            });
        }

        console.log(`Streaming file request for: ${fileName}`);

        // Create a fetch request
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
        }

        // Set headers before streaming
        const contentType = response.headers.get('content-type') ||
            (fileName.toLowerCase().endsWith('.csv') ? 'text/csv' :
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Pipe the response directly
        response.body.pipe(res);

    } catch (error) {
        console.error('Proxy file stream error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to proxy file stream',
                details: error.message
            });
        }
    }
};

// Add CORS middleware for the proxy endpoint
export const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
};

export default uploadFile;
export { upload };
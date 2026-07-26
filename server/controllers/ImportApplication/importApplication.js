import File from "../../models/ImportApplication.js";
import Job from "../../models/Job.js";
import User from "../../models/User.js";
import CandidateFile from "../../models/CandidateApplication.js";
import upload, { uploadToS3 } from "../../middleware/upload.js";
import fetch from 'node-fetch';
import uniqid from 'uniqid';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { generateSimpleTitleCode, generateTitleCode } from "../utils.js";
import Application from "../../models/Application.js";
import ApplicationStatus from "../../models/ApplicationStatus.js";
import { generateDescriptionText } from "../../utils/aiHelper.js";
import supabase, { fromDB, fromDBArray } from "../../config/supabaseClient.js";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { userId, companyId, userName } = req.body;

        if (!userId || !companyId) {
            return res.status(400).json({
                error: "User ID and Company ID are required",
                message: "Please provide userId and companyId in the request"
            });
        }

        let fileUrl = null;
        console.log("Uploading to S3...");

        if (req.file) {
            const uploadResult = await uploadToS3(req.file);
            fileUrl = uploadResult.fileUrl;
        } else {
            return res.status(400).json({ message: "File is required." });
        }

        const fileData = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            file: fileUrl,
            userId: userId,
            companyId: companyId,
            userName: userName || 'Unknown User',
            uploadDate: new Date().toISOString()
        };

        const newFile = await File.create(fileData);

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

export const uploadCandidateFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { userId, companyId, userName, fileName } = req.body;

        if (!userId || !companyId) {
            return res.status(400).json({
                error: "User ID and Company ID are required",
                message: "Please provide userId and companyId in the request"
            });
        }

        let fileUrl = null;
        console.log("Uploading candidate file to S3...");

        if (req.file) {
            const uploadResult = await uploadToS3(req.file);
            fileUrl = uploadResult.fileUrl;
        } else {
            return res.status(400).json({ message: "File is required." });
        }

        const candidateFileData = {
            fileName: fileName || req.file.originalname,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            fileUrl: fileUrl,
            userId: userId,
            companyId: companyId,
            userName: userName || 'Unknown User',
            uploadDate: new Date().toISOString(),
            status: 'processing'
        };

        const newCandidateFile = await CandidateFile.create(candidateFileData);

        res.status(200).json({
            message: "Candidate file uploaded successfully",
            fileId: newCandidateFile._id,
            candidateFileId: newCandidateFile._id,
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

export const getCandidateFiles = async (req, res) => {
    try {
        const { userId, companyId, userName, role } = req.query;

        console.log("Fetching candidate files with filters:", { userId, companyId, userName, role });

        let query = supabase.from('candidate_files').select('*').order('"uploadDate"', { ascending: false });

        if (role !== 'admin') {
            if (userId) query = query.eq('"userId"', userId);
            if (companyId) query = query.eq('"companyId"', companyId);
        }

        if (userName && userName !== 'all') {
            query = query.ilike('"userName"', `%${userName}%`);
        }

        const { data: files, error } = await query;
        if (error) throw error;

        const transformedFiles = (files || []).map(file => ({
            _id: file.id,
            fileName: file.fileName,
            originalName: file.originalName || file.fileName,
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

export const getCandidateFileDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Candidate file ID is required" });
        }

        const candidateFile = await CandidateFile.findById(id);

        if (!candidateFile) {
            return res.status(404).json({ error: "Candidate file not found" });
        }

        // Get related candidate applications (source_file field in candidate_files - if the developer queries it, we look in candidate_files table or handle gracefully)
        let applications = [];
        try {
            const { data: rawApps } = await supabase
                .from('candidate_files')
                .select('*')
                .eq('source_file', id);
            
            if (rawApps && rawApps.length > 0) {
                // Populate candidate details (users table)
                const candidateIds = rawApps.map(app => app.candidate_id).filter(Boolean);
                let candMap = {};
                if (candidateIds.length > 0) {
                    const { data: candidates } = await supabase.from('users').select('id, "userName", email, "contactInfo"').in('id', candidateIds);
                    (candidates || []).forEach(c => { candMap[c.id] = c; });
                }
                applications = rawApps.map(app => ({
                    ...app,
                    _id: app.id,
                    candidate_id: candMap[app.candidate_id] || app.candidate_id
                }));
            }
        } catch (dbErr) {
            console.warn("Could not find applications using source_file key", dbErr.message);
        }

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

export const createCandidateApplications = async (req, res) => {
    try {
        const { userId, companyId, candidates, candidateFileId } = req.body;
        console.log("🔍 DEBUG - Received candidates data:", candidates);

        if (!userId || !companyId) {
            return res.status(400).json({
                error: 'User ID and company ID are required'
            });
        }

        if (!candidates || !Array.isArray(candidates)) {
            return res.status(400).json({
                error: 'Candidates data is required and must be an array'
            });
        }

        const createdCandidates = [];
        const errors = [];
        const jobApplications = [];
        let candidateFile = null;

        if (candidateFileId) {
            candidateFile = await CandidateFile.findById(candidateFileId);
            if (candidateFile) {
                console.log("🔍 DEBUG: CandidateFile found, updating status to processing");
                await CandidateFile.findByIdAndUpdate(candidateFileId, {
                    status: 'processing',
                    totalCandidates: candidates.length
                });
            }
        }

        console.log("🔍 DEBUG: Fetching first application status for company:", companyId);
        const { data: firstStatusDoc } = await supabase
            .from('application_statuses')
            .select('*')
            .eq('company_id', companyId)
            .order('"applicationStep"', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (!firstStatusDoc) {
            return res.status(400).json({
                error: 'No application status found for this company. Please set up application statuses first.'
            });
        }

        const firstStatusId = firstStatusDoc.id;

        for (let i = 0; i < candidates.length; i++) {
            const candidateData = candidates[i];

            try {
                if (!candidateData.userName || !candidateData.email) {
                    throw new Error('Candidate name and email are required');
                }

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
                    const hashPassword = await bcrypt.hashSync(candidateData.password || 'DefaultPassword123!', 10);

                    const savedCandidate = await User.create({
                        userName: candidateData.userName,
                        email: candidateData.email,
                        password: hashPassword,
                        address: candidateData.address || '',
                        gender: candidateData.gender || '',
                        role: 'candidate',
                        company_id: companyId,
                        contactInfo: candidateData.contactInfo || '',
                        experience: candidateData.experience || '',
                        status: 'active'
                    });

                    candidateId = savedCandidate._id;
                    isNewCandidate = true;

                    createdCandidates.push({
                        candidate: savedCandidate,
                        status: 'created',
                        message: 'Candidate created successfully'
                    });
                }

                if (candidateData.titleCode && candidateData.titleCode.length > 0) {
                    console.log(`🔍 DEBUG: Processing titleCodes for ${candidateData.userName}:`, candidateData.titleCode);

                    for (const code of candidateData.titleCode) {
                        const trimmedCode = code.trim();
                        if (!trimmedCode) continue;

                        try {
                            console.log(`🔍 DEBUG: Looking for job with titleCode: "${trimmedCode}"`);

                            const job = await Job.findOne({
                                titleCode: trimmedCode,
                                company_id: companyId
                            });

                            if (job) {
                                console.log(`✅ DEBUG: Found job: ${job.title} (${job.titleCode})`);

                                const existingApplication = await Application.findOne({
                                    candidateID: candidateId.toString(),
                                    jobID: job._id.toString(),
                                    company_id: companyId
                                });

                                if (!existingApplication) {
                                    const savedApplication = await Application.create({
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

                                    jobApplications.push({
                                        candidateId: candidateId,
                                        candidateName: candidateData.userName,
                                        jobId: job._id,
                                        jobTitle: job.title,
                                        titleCode: trimmedCode,
                                        applicationId: savedApplication._id,
                                        status: 'applied',
                                        applicationStatus: {
                                            id: firstStatusId,
                                            step: firstStatusDoc.applicationStep,
                                            name: firstStatusDoc.applicationStatus
                                        }
                                    });

                                    console.log(`✅ SUCCESS: Applied ${candidateData.userName} to job ${job.title} (${trimmedCode})`);
                                } else {
                                    jobApplications.push({
                                        candidateId: candidateId,
                                        candidateName: candidateData.userName,
                                        jobId: job._id,
                                        jobTitle: job.title,
                                        titleCode: trimmedCode,
                                        applicationId: existingApplication._id,
                                        status: 'already_applied'
                                    });
                                    console.log(`ℹ️ INFO: ${candidateData.userName} already applied to ${job.title}`);
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
                errors.push({
                    row: i + 1,
                    error: error.message,
                    candidateData: candidateData
                });
            }
        }

        if (candidateFileId) {
            await CandidateFile.findByIdAndUpdate(candidateFileId, {
                processedCandidates: createdCandidates.length,
                failedCandidates: errors.length,
                status: errors.length === 0 ? 'completed' :
                    createdCandidates.length === 0 ? 'failed' : 'partial',
                processingErrors: errors
            });
        }

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
                step: firstStatusDoc.applicationStep,
                name: firstStatusDoc.applicationStatus
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

        if (fileData && fileData.headers && fileData.data) {
            headers = fileData.headers;
            data = fileData.data;
        } else if (fileUrl) {
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

        const existingJobs = await Job.find({ company_id: companyId });
        console.log(`Found ${existingJobs.length} existing jobs for title code generation`);

        const jobs = [];
        const errors = [];

        const headerMap = headers.map(h => h.toLowerCase().trim());

        const titleIndex = headerMap.findIndex(h => h.includes('title'));
        const statusIndex = headerMap.findIndex(h => h.includes('status') || h.includes('applicationstatus'));
        const hiringManagerIndex = headerMap.findIndex(h =>
            h.includes('hiring manager') ||
            h.includes('hiring_manager') ||
            h.includes('manager') ||
            h.includes('hiring manager name')
        );
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

                if (jobStatusMap && jobStatusMap[statusName]) {
                    statusId = jobStatusMap[statusName];
                } else {
                    const firstStatus = Object.values(jobStatusMap)[0];
                    statusId = firstStatus || '';
                }

                let hiringManagerId = userId;
                if (hiringManagerName && hiringManagerName.toString().trim() !== '') {
                    const hiringManagerNameStr = hiringManagerName.toString().trim();
                    let foundId = null;

                    if (hiringManagerMap) {
                        const variations = [
                            hiringManagerNameStr,
                            hiringManagerNameStr.toLowerCase(),
                            hiringManagerNameStr.replace(/_/g, ' '),
                            hiringManagerNameStr.replace(/_/g, ' ').toLowerCase(),
                            hiringManagerNameStr.replace(/\s+/g, '_'),
                            hiringManagerNameStr.replace(/\s+/g, '_').toLowerCase(),
                            hiringManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' '),
                            hiringManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ').toLowerCase()
                        ];

                        for (const variation of variations) {
                            if (hiringManagerMap[variation]) {
                                foundId = hiringManagerMap[variation];
                                break;
                            }
                        }
                    }

                    if (foundId) {
                        hiringManagerId = foundId;
                    }
                }

                let recruiterManagerId = userId;
                if (recruiterManagerName && recruiterManagerName.toString().trim() !== '') {
                    const recruiterManagerNameStr = recruiterManagerName.toString().trim();
                    let foundId = null;

                    if (recruiterMap) {
                        const variations = [
                            recruiterManagerNameStr,
                            recruiterManagerNameStr.toLowerCase(),
                            recruiterManagerNameStr.replace(/_/g, ' '),
                            recruiterManagerNameStr.replace(/_/g, ' ').toLowerCase(),
                            recruiterManagerNameStr.replace(/\s+/g, '_'),
                            recruiterManagerNameStr.replace(/\s+/g, '_').toLowerCase(),
                            recruiterManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' '),
                            recruiterManagerNameStr.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ').toLowerCase()
                        ];

                        for (const variation of variations) {
                            if (recruiterMap[variation]) {
                                foundId = recruiterMap[variation];
                                break;
                            }
                        }
                    }

                    if (foundId) {
                        recruiterManagerId = foundId;
                    }
                }

                const experienceRequiredValue = experienceRequiredIndex >= 0 ? row[experienceRequiredIndex] : undefined;
                let experienceRequired = '0';

                if (experienceRequiredValue !== undefined && experienceRequiredValue !== null) {
                    experienceRequired = experienceRequiredValue.toString().trim();
                    if (experienceRequired === '') {
                        experienceRequired = '0';
                    }
                }

                const jobTitle = row[titleIndex] || 'Untitled Position';

                let titleCode;
                try {
                    titleCode = generateTitleCode(jobTitle, existingJobs);
                } catch (error) {
                    titleCode = generateSimpleTitleCode(jobTitle);
                }

                const jobData = {
                    title: jobTitle,
                    titleCode: titleCode,
                    locationType: row[headerMap.findIndex(h => h.includes('location type') || h.includes('locationtype'))] || 'On-Site',
                    type: row[headerMap.findIndex(h => h.includes('type') && !h.includes('location') && !h.includes('schedule') && !h.includes('hire'))] || 'Full-Time',
                    scheduleType: row[headerMap.findIndex(h => h.includes('schedule type') || h.includes('scheduletype'))] || 'Flexible',
                    shiftStart: formatExcelTime(row[headerMap.findIndex(h => h.includes('shift start') || h.includes('shiftstart'))]) || '08:00',
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

                if (useAiDescription) {
                    try {
                        jobData.description = await generateDescriptionText(
                            jobTitle,
                            companyUserName,
                            jobData.compensation,
                            jobData.experienceRequired
                        );
                        if (i < data.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } catch (aiError) {
                        console.error(`Error generating AI description for ${jobTitle}:`, aiError);
                    }
                }

                if (!jobData.title || jobData.title.trim() === '' || jobData.title === 'Untitled Position') {
                    throw new Error('Job title is required and cannot be empty');
                }

                if (!statusId) {
                    throw new Error(`Status ID not found for status: ${statusName}`);
                }

                const savedJob = await Job.create({
                    jobID: uniqid(),
                    ...jobData
                });
                jobs.push(savedJob);

            } catch (error) {
                console.error(`Error processing row ${i + 1}:`, error);
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

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

export const getUserFiles = async (req, res) => {
    try {
        const { userId, companyId, role, fileType, userName } = req.query;

        console.log("Fetching files with filters:", { userId, companyId, role, fileType, userName });

        let query = supabase.from('import_files').select('*').order('"uploadDate"', { ascending: false });

        if (role !== 'admin') {
            if (userId) query = query.eq('"userId"', userId);
            if (companyId) query = query.eq('"companyId"', companyId);
        }

        if (userName && userName !== 'all') {
            query = query.ilike('"userName"', `%${userName}%`);
        }

        // Apply file type constraints if candidate
        if (fileType === 'candidate') {
            query = query.in('mimetype', [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/vnd.ms-excel.sheet.macroEnabled.12'
            ]);
        }

        // Role filter for non-admin users (optional)
        if (role && role !== 'admin') {
            const { data: roleUsers } = await supabase.from('users').select('id').eq('role', role);
            const userIds = (roleUsers || []).map(user => user.id);
            if (userIds.length > 0) {
                query = query.in('"userId"', userIds);
            }
        }

        const { data: files, error } = await query;
        if (error) throw error;

        const transformedFiles = (files || []).map(file => ({
            _id: file.id,
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

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

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
        const { id, userId, companyId } = req.query;

        if (!id) {
            return res.status(400).json({ error: "File ID is required" });
        }

        let query = supabase.from('import_files').select('*').eq('id', id);
        if (userId) query = query.eq('"userId"', userId);
        if (companyId) query = query.eq('"companyId"', companyId);

        const { data: file, error } = await query.maybeSingle();
        if (error) throw error;

        if (!file) {
            return res.status(404).json({ error: "File not found or access denied" });
        }

        if (file.file.startsWith('http')) {
            return res.redirect(file.file);
        }

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

export const deleteUserFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, companyId } = req.body;

        if (!id) {
            return res.status(400).json({ error: "File ID is required" });
        }

        if (!userId || !companyId) {
            return res.status(400).json({ error: "User ID and Company ID are required" });
        }

        const { data: deletedFile, error } = await supabase
            .from('import_files')
            .delete()
            .eq('id', id)
            .eq('"userId"', userId)
            .eq('"companyId"', companyId)
            .select()
            .maybeSingle();

        if (error) throw error;

        if (!deletedFile) {
            return res.status(404).json({ error: "File not found or access denied" });
        }

        res.status(200).json({
            message: "File deleted successfully",
            deletedFile: {
                id: deletedFile.id,
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

export const getCompanyFileStats = async (req, res) => {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const { data: files, error } = await supabase
            .from('import_files')
            .select('*')
            .eq('"companyId"', companyId);
        
        if (error) throw error;

        let totalFiles = 0;
        let totalSize = 0;
        let userIds = new Set();
        let latestUpload = null;
        let oldestUpload = null;

        (files || []).forEach(file => {
            totalFiles++;
            totalSize += file.size || 0;
            if (file.userId) userIds.add(file.userId);
            const uploadTime = new Date(file.uploadDate).getTime();
            if (!latestUpload || uploadTime > new Date(latestUpload).getTime()) latestUpload = file.uploadDate;
            if (!oldestUpload || uploadTime < new Date(oldestUpload).getTime()) oldestUpload = file.uploadDate;
        });

        res.status(200).json({
            totalFiles,
            totalSize,
            uniqueUsers: userIds.size,
            latestUpload,
            oldestUpload
        });
    } catch (error) {
        console.error("Error fetching company stats:", error);
        res.status(500).json({
            error: "Failed to fetch company statistics",
            details: error.message
        });
    }
};

export const proxyFileStream = async (req, res) => {
    try {
        const { fileUrl, fileName } = req.body;

        if (!fileUrl || !fileName) {
            return res.status(400).json({
                error: 'Missing fileUrl or fileName'
            });
        }

        console.log(`Streaming file request for: ${fileName}`);

        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
        }

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
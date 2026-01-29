import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Upload, FileSpreadsheet, X, Download, Eye, Calendar, FileText, Grid, List, User, Loader, Plus, Filter, FolderPen } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportApplication() {
    const { theme } = useTheme();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('card');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [userFiles, setUserFiles] = useState([]);
    const [loadingFileData, setLoadingFileData] = useState(false);
    const [creatingJobs, setCreatingJobs] = useState(false);
    const [jobCreationStatus, setJobCreationStatus] = useState(null);
    const [jobStatuses, setJobStatuses] = useState([]);
    const [jobStatusMap, setJobStatusMap] = useState({});
    const [loadingStatuses, setLoadingStatuses] = useState(false);
    const [statusError, setStatusError] = useState(null);

    // Hiring managers state
    const [hiringManagersList, setHiringManagersList] = useState([]);
    const [hiringManagerMap, setHiringManagerMap] = useState({});
    const [loadingHiringManagers, setLoadingHiringManagers] = useState(false);

    // Recruiter managers state
    const [recruitersList, setRecruitersList] = useState([]);
    const [recruiterMap, setRecruiterMap] = useState({});
    const [loadingRecruiters, setLoadingRecruiters] = useState(false);

    // Filter state (same as ImportCandidateApplication)
    const [selectedUser, setSelectedUser] = useState('all');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // User state
    const [user, setUser] = useState({
        role: 'hiring_manager',
        userName: '',
        userId: null,
        companyId: null
    });

    const formatMonth = (date) => {
        return new Date(date).toLocaleString("default", { month: "long", year: "numeric" });
    };

    // Filter functions (same as ImportCandidateApplication)
    const handleResetFilter = () => {
        setSelectedUser('all');
    };

    // Fetch available users for filter
    const fetchAvailableUsers = async () => {
        if (user.role !== "admin") {
            return;
        }
        try {
            setLoadingUsers(true);

            const queryParams = new URLSearchParams({
                page: '1',
                limit: '100',
                role: 'recruiter_manager,recruiter,hiring_manager'
            });

            if (user.companyId) {
                queryParams.append('company_id', user.companyId);
            }

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/user/getUsers?${queryParams}`);

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();

            // Extract unique user names from the files and combine with fetched users
            const uniqueUserNames = [...new Set([
                ...userFiles.map(file => file.userName),
                ...(data.users || []).map(user => user.userName)
            ])].filter(name => name && name !== 'Unknown User');

            setAvailableUsers(uniqueUserNames);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch user data from localStorage
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            console.log("User data from localStorage:", userData);

            setUser({
                role: userData.role || 'hiring_manager',
                userName: userData.userName || userData.name || '',
                userId: userData.userId || userData.id || userData._id,
                companyId: userData.companyId || userData.company_id
            });
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    }, []);

    // Fetch hiring managers when companyId is available
    useEffect(() => {
        const fetchHiringManagers = async () => {
            if (!user.companyId) return;

            setLoadingHiringManagers(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/hiringmanager/all-hiring-manager`, {
                    headers: {
                        'company_id': user.companyId
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch hiring managers');
                }

                const data = await response.json();
                console.log('Hiring Managers API Response:', data);

                if (data && Array.isArray(data)) {
                    setHiringManagersList(data);

                    // Build comprehensive lookup map
                    const map = {};
                    data.forEach(manager => {
                        const managerId = manager._id;

                        // Extract different name variations
                        const userName = manager.userName || '';
                        const email = manager.email || '';
                        const name = manager.name || '';

                        if (managerId) {
                            // Map by userName (as-is and cleaned versions)
                            if (userName) {
                                map[userName] = managerId;
                                map[userName.toLowerCase()] = managerId;
                                map[userName.replace(/_/g, ' ')] = managerId;
                                map[userName.replace(/_/g, ' ').toLowerCase()] = managerId;

                                // Handle title case versions
                                const titleCase = userName.replace(/_/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ');
                                map[titleCase] = managerId;
                                map[titleCase.toLowerCase()] = managerId;
                            }

                            // Map by email
                            if (email) {
                                map[email] = managerId;
                                map[email.toLowerCase()] = managerId;
                            }

                            // Map by name field if exists
                            if (name) {
                                map[name] = managerId;
                                map[name.toLowerCase()] = managerId;
                            }
                        }
                    });

                    setHiringManagerMap(map);
                    console.log("Hiring manager map loaded:", map);
                } else {
                    console.warn('Hiring managers data is not an array:', data);
                }
            } catch (error) {
                console.error('Error fetching hiring managers:', error);
            } finally {
                setLoadingHiringManagers(false);
            }
        };

        if (user.companyId) {
            fetchHiringManagers();
        }
    }, [user.companyId]);

    // Fetch recruiters when companyId is available
    useEffect(() => {
        const fetchRecruiters = async () => {
            if (!user.companyId) return;

            setLoadingRecruiters(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/recruiter/all-recruiter`, {
                    headers: {
                        'company_id': user.companyId
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recruiters');
                }

                const data = await response.json();
                console.log('Recruiters API Response:', data);

                if (data && Array.isArray(data)) {
                    setRecruitersList(data);

                    // Build comprehensive lookup map for recruiters
                    const map = {};
                    data.forEach(recruiter => {
                        const recruiterId = recruiter._id;

                        // Extract different name variations
                        const userName = recruiter.userName || '';
                        const email = recruiter.email || '';
                        const name = recruiter.name || '';

                        if (recruiterId) {
                            // Map by userName (as-is and cleaned versions)
                            if (userName) {
                                map[userName] = recruiterId;
                                map[userName.toLowerCase()] = recruiterId;
                                map[userName.replace(/_/g, ' ')] = recruiterId;
                                map[userName.replace(/_/g, ' ').toLowerCase()] = recruiterId;

                                // Handle title case versions
                                const titleCase = userName.replace(/_/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ');
                                map[titleCase] = recruiterId;
                                map[titleCase.toLowerCase()] = recruiterId;
                            }

                            // Map by email
                            if (email) {
                                map[email] = recruiterId;
                                map[email.toLowerCase()] = recruiterId;
                            }

                            // Map by name field if exists
                            if (name) {
                                map[name] = recruiterId;
                                map[name.toLowerCase()] = recruiterId;
                            }
                        }
                    });

                    setRecruiterMap(map);
                    console.log("Recruiter map loaded:", map);
                } else {
                    console.warn('Recruiters data is not an array:', data);
                }
            } catch (error) {
                console.error('Error fetching recruiters:', error);
            } finally {
                setLoadingRecruiters(false);
            }
        };

        if (user.companyId) {
            fetchRecruiters();
        }
    }, [user.companyId]);

    // Fetch job statuses when companyId is available
    useEffect(() => {
        const fetchJobStatuses = async () => {
            setLoadingStatuses(true);
            setStatusError(null);
            try {
                const companyId = user.companyId;
                if (!companyId) return;

                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses`, {
                    headers: {
                        'company_id': companyId
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch job statuses');
                }

                const data = await response.json();
                console.log('Job Statuses API Response:', data);

                if (data.jobStatuses && Array.isArray(data.jobStatuses)) {
                    setJobStatuses(data.jobStatuses);

                    // build lookup: status name → ID
                    const map = {};
                    data.jobStatuses.forEach((st) => {
                        map[st.jobStatus] = st._id;
                    });
                    setJobStatusMap(map);
                    console.log("Job status map loaded:", map);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                console.error('Error fetching job statuses:', error);
                setStatusError(error.message);
                setJobStatuses([]);
            } finally {
                setLoadingStatuses(false);
            }
        };

        if (user.companyId) {
            fetchJobStatuses();
        }
    }, [user.companyId]);

    // Fetch user files when user data is available
    useEffect(() => {
        if (user.userId && user.companyId) {
            fetchUserFiles();
        }
    }, [user.userId, user.companyId, selectedUser]);

    // Fetch available users when userFiles change
    useEffect(() => {
        if (userFiles.length > 0) {
            fetchAvailableUsers();
        }
    }, [userFiles]);

    function capitalizeFirstLetter(string) {
        if (!string) return "";
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const formatExcelTime = (value) => {
        if (value === null || value === undefined || value === "") return "";

        // Handle case where value might be stringified number
        let numValue = typeof value === 'number' ? value : parseFloat(value);

        // Check if it's a valid Excel decimal time (usually between 0 and 1)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 1 && (typeof value === 'number' || value.toString().includes('.'))) {
            const totalMinutes = Math.round(numValue * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return value.toString() || '';
    };

    const fetchUserFiles = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                userId: user.userId,
                companyId: user.companyId,
                fileType: 'application'
            });

            if (selectedUser && selectedUser !== 'all') {
                queryParams.append('userName', selectedUser);
            }

            // If user is admin, we don't need user-specific filters
            if (user.role === 'admin') {
                queryParams.delete('userId');
                queryParams.delete('companyId');
                // Admin can see all files, so we only filter by fileType
            }

            // Add role to query params for backend
            queryParams.append('role', user.role);

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/user-files?${queryParams}`);

            if (!response.ok) throw new Error('Failed to fetch user files');

            const data = await response.json();

            const transformedFiles = (data.files || data || []).map(file => ({
                id: file._id || file.id,
                fileName: file.filename || file.fileName,
                originalName: file.originalName || file.fileName || file.filename,
                fileSize: file.size || file.fileSize,
                fileUrl: file.file || file.fileUrl,
                uploadDate: file.uploadDate,
                userName: file.userName || 'Unknown User',
                userId: file.userId,
                companyId: file.companyId
            }));

            setUserFiles(transformedFiles);
        } catch (err) {
            console.error('Error fetching user files:', err);
            setError('Failed to load user files');
        } finally {
            setLoading(false);
        }
    };

    // Rest of your existing functions remain the same...
    // (createJobsFromExcelData, fetchAndParseFile, handleFileSelect, uploadFileToServer, etc.)

    const createJobsFromExcelData = async (fileData, fileUrl, useAiDesc = false) => {
        if (creatingJobs) {
            console.log('Job creation already in progress');
            return;
        }

        if (loadingHiringManagers || loadingRecruiters || loadingStatuses) {
            console.log('Waiting for hiring managers, recruiters and job statuses to load...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (loadingHiringManagers || loadingRecruiters || loadingStatuses) {
                setError('Hiring managers, recruiters or job statuses are still loading. Please try again in a moment.');
                return;
            }
        }

        if (!fileData || !fileData.headers || !fileData.data) {
            console.error("Invalid file data structure received:", {
                fileDataExists: !!fileData,
                headersExist: !!fileData?.headers,
                dataExist: !!fileData?.data,
                fileData: fileData
            });
            throw new Error('No valid data found in the file');
        }

        setCreatingJobs(true);
        setJobCreationStatus(null);

        try {
            const headers = fileData.headers.map(h => h.toLowerCase().trim());
            const data = fileData.data;

            const titleIndex = headers.findIndex(h => h.includes('title'));
            const locationTypeIndex = headers.findIndex(h => h.includes('location type'));
            const typeIndex = headers.findIndex(h => h.includes('type'));
            const scheduleTypeIndex = headers.findIndex(h => h.includes('schedule type'));
            const shiftStartIndex = headers.findIndex(h => h.includes('shift start'));
            const shiftEndIndex = headers.findIndex(h => h.includes('shift end'));
            const hireTypeIndex = headers.findIndex(h => h.includes('hire type'));
            const countryIndex = headers.findIndex(h => h.includes('country'));
            const stateIndex = headers.findIndex(h => h.includes('state'));
            const cityIndex = headers.findIndex(h => h.includes('city'));
            const compensationIndex = headers.findIndex(h => h.includes('compensation'));
            const experienceRequiredIndex = headers.findIndex(h =>
                h.includes('experience required') ||
                h.includes('experience') ||
                h.includes('exp required') ||
                h.includes('exp')
            );
            const requiredResourcesIndex = headers.findIndex(h => h.includes('required resources'));
            const statusIndex = headers.findIndex(h => h.includes('applicationStatus'));
            const hiringManagerIndex = headers.findIndex(h =>
                h.includes('hiring manager') ||
                h.includes('hiring_manager') ||
                h.includes('manager') ||
                h.includes('hiring manager name')
            );
            const recruiterManagerIndex = headers.findIndex(h =>
                h.includes('recruter manager') ||
                h.includes('recruiter manager') ||
                h.includes('recruiter_manager') ||
                h.includes('recruiter')
            );

            const jobsToCreate = [];
            const errors = [];

            for (let i = 0; i < data.length; i++) {
                const row = data[i];

                if (!row.some(cell => cell && cell.toString().trim() !== '')) continue;

                try {
                    const statusName = row[statusIndex] || 'Active';
                    const hiringManagerName = hiringManagerIndex >= 0 ? row[hiringManagerIndex] : '';
                    const recruiterManagerName = recruiterManagerIndex >= 0 ? row[recruiterManagerIndex] : '';

                    let statusId = '';
                    if (jobStatusMap[statusName]) {
                        statusId = jobStatusMap[statusName];
                    } else {
                        console.warn(`Status "${statusName}" not found in application status map. Available statuses:`, Object.keys(jobStatusMap));
                        statusId = jobStatusMap['Active'] || jobStatusMap['active'] || '';
                    }

                    let hiringManagerId = user.userId;
                    let actualHiringManagerName = hiringManagerName;

                    if (hiringManagerName && hiringManagerName.toString().trim() !== '') {
                        const hiringManagerNameStr = hiringManagerName.toString().trim();

                        console.log(`Looking up hiring manager: "${hiringManagerNameStr}"`);

                        let foundId = hiringManagerMap[hiringManagerNameStr];

                        if (!foundId) {
                            foundId = hiringManagerMap[hiringManagerNameStr.toLowerCase()];
                        }

                        if (!foundId) {
                            const withSpaces = hiringManagerNameStr.replace(/_/g, ' ');
                            foundId = hiringManagerMap[withSpaces] || hiringManagerMap[withSpaces.toLowerCase()];
                        }

                        if (!foundId) {
                            const titleCase = hiringManagerNameStr
                                .toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            foundId = hiringManagerMap[titleCase] || hiringManagerMap[titleCase.toLowerCase()];
                        }

                        if (foundId) {
                            hiringManagerId = foundId;
                            console.log(`✅ Successfully mapped hiring manager "${hiringManagerNameStr}" to ID: ${hiringManagerId}`);
                        } else {
                            console.warn(`❌ Hiring manager "${hiringManagerNameStr}" not found. Available managers:`, Object.keys(hiringManagerMap));
                            console.warn('Using current user as default hiring manager');
                            actualHiringManagerName = user.userName || 'Current User';
                        }
                    } else {
                        console.log('ℹ️ No hiring manager specified in Excel, using current user as default');
                        actualHiringManagerName = user.userName || 'Current User';
                    }

                    let recruiterManagerId = user.userId;
                    let actualRecruiterManagerName = recruiterManagerName;

                    if (recruiterManagerName && recruiterManagerName.toString().trim() !== '') {
                        const recruiterManagerNameStr = recruiterManagerName.toString().trim();

                        console.log(`Looking up recruiter manager: "${recruiterManagerNameStr}"`);

                        let foundId = recruiterMap[recruiterManagerNameStr];

                        if (!foundId) {
                            foundId = recruiterMap[recruiterManagerNameStr.toLowerCase()];
                        }

                        if (!foundId) {
                            const withSpaces = recruiterManagerNameStr.replace(/_/g, ' ');
                            foundId = recruiterMap[withSpaces] || recruiterMap[withSpaces.toLowerCase()];
                        }

                        if (!foundId) {
                            const titleCase = recruiterManagerNameStr
                                .toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            foundId = recruiterMap[titleCase] || recruiterMap[titleCase.toLowerCase()];
                        }

                        if (foundId) {
                            recruiterManagerId = foundId;
                            console.log(`✅ Successfully mapped recruiter manager "${recruiterManagerNameStr}" to ID: ${recruiterManagerId}`);
                        } else {
                            console.warn(`❌ Recruiter manager "${recruiterManagerNameStr}" not found. Available recruiters:`, Object.keys(recruiterMap));
                            console.warn('Using current user as default recruiter manager');
                            actualRecruiterManagerName = user.userName || 'Current User';
                        }
                    } else {
                        console.log('ℹ️ No recruiter manager specified in Excel, using current user as default');
                        actualRecruiterManagerName = user.userName || 'Current User';
                    }

                    const experienceRequiredValue = experienceRequiredIndex >= 0 ? row[experienceRequiredIndex] : undefined;
                    let experienceRequired = '0';

                    if (experienceRequiredValue !== undefined && experienceRequiredValue !== null) {
                        experienceRequired = experienceRequiredValue.toString().trim();

                        if (experienceRequired === '') {
                            experienceRequired = '0';
                        }
                    }

                    const jobData = {
                        title: row[titleIndex] || 'Untitled Position',
                        locationType: row[locationTypeIndex] || 'On-Site',
                        type: row[typeIndex] || 'Full-Time',
                        scheduleType: row[scheduleTypeIndex] || 'Flexible',
                        shiftStart: formatExcelTime(row[shiftStartIndex]) || '09:00',
                        shiftEnd: formatExcelTime(row[shiftEndIndex]) || '17:00',
                        hireType: row[hireTypeIndex] || 'New',
                        country: row[countryIndex] || 'India',
                        state: row[stateIndex] || '',
                        city: row[cityIndex] || '',
                        description: `Position for ${row[titleIndex] || 'Untitled Position'}. Imported from Excel file.`,
                        compensation: row[compensationIndex] || '0',
                        experienceRequired: experienceRequired,
                        requiredResources: parseInt(row[requiredResourcesIndex]) || 1,
                        status: statusId,
                        statusName: statusName,
                        hiringManagerName: actualHiringManagerName,
                        recruiterManagerName: actualRecruiterManagerName,
                        recruiterId: recruiterManagerId,
                        hiringManagerId: hiringManagerId,
                        applicationForm: {},
                        applicants: [],
                        company_id: user.companyId
                    };

                    if (!jobData.title || jobData.title.trim() === '') {
                        throw new Error('Title is required');
                    }

                    jobsToCreate.push(jobData);
                } catch (rowError) {
                    errors.push(`Row ${i + 1}: ${rowError.message}`);
                }
            }

            if (jobsToCreate.length === 0) {
                throw new Error('No valid job data found in the file');
            }

            console.log(`Sending ${jobsToCreate.length} jobs to backend in ONE API call`);
            console.log('Sample job data:', jobsToCreate[0]);

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/create-jobs-from-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl,
                    fileName: 'excel-import.xlsx',
                    userId: user.userId,
                    companyId: user.companyId,
                    fileData: {
                        headers: fileData.headers,
                        data: fileData.data
                    },
                    jobStatusMap: jobStatusMap,
                    hiringManagerMap: hiringManagerMap,
                    recruiterMap: recruiterMap,
                    useAiDescription: useAiDesc,
                    companyUserName: localStorage.getItem("companyUserName")
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create jobs');
            }

            const result = await response.json();

            console.log("Backend response:", result);

            setJobCreationStatus({
                total: result.totalProcessed || jobsToCreate.length,
                successful: result.jobsCreated || 0,
                failed: result.errors ? result.errors.length : 0,
                details: result
            });

            if (result.jobsCreated > 0) {
                alert(`Successfully created ${result.jobsCreated} jobs!`);
            } else {
                alert('No jobs were created. Please check your file format.');
            }

            return result;

        } catch (error) {
            console.error('Error creating jobs:', error);
            setJobCreationStatus({
                total: 0,
                successful: 0,
                failed: 0,
                error: error.message
            });
            throw error;
        } finally {
            setCreatingJobs(false);
        }
    };

    const fetchAndParseFile = async (fileUrl, fileName) => {
        try {
            setLoadingFileData(true);
            setError('');

            const proxyResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                    fileName: fileName
                })
            });

            if (!proxyResponse.ok) {
                throw new Error(`Failed to fetch file through proxy: ${proxyResponse.status}`);
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();

            let headers = [];
            let data = [];

            if (fileName.toLowerCase().endsWith('.csv')) {
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(arrayBuffer);
                const rows = text.split('\n').filter(row => row.trim());

                if (rows.length > 0) {
                    headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    data = rows.slice(1).map(row => {
                        const cells = row.split(',').map(cell => cell.trim().replace(/"/g, ''));
                        return cells;
                    });
                }
            } else {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    headers = jsonData[0] || [];
                    data = jsonData.slice(1);
                }
            }

            const parsedFile = {
                id: 'remote_' + Date.now(),
                name: fileName,
                fileName: fileName,
                headers: headers,
                data: data,
                rowCount: data.length,
                isRemote: true
            };

            setSelectedFile(parsedFile);
        } catch (error) {
            console.error('Error fetching and parsing file:', error);
            setError(`Failed to load and parse the file: ${error.message}. This might be due to CORS restrictions.`);
        } finally {
            setLoadingFileData(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileToUpload(file);
            setError("");
        }
    };

    const uploadFileToServer = async () => {
        if (!fileToUpload) {
            setError("Please select a file before uploading");
            return;
        }

        if (!user.userId || !user.companyId) {
            setError("User information is missing. Please refresh the page and try again.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("userId", user.userId);
        formData.append("companyId", user.companyId);
        formData.append("userName", user.userName || 'Unknown User');

        try {
            setLoading(true);
            const res = await fetch(
                `${process.env.REACT_APP_BASE_URL}/upload/application`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || "Upload failed");
            }

            console.log("File uploaded successfully", data);
            alert("File uploaded successfully!");
            setFileToUpload(null);
            setError("");

            fetchUserFiles();
        } catch (err) {
            console.error("Upload error:", err);
            setError(`Error uploading file: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile && selectedFile.id === fileId) {
            setSelectedFile(null);
        }
    };

    const openFile = (file) => {
        setSelectedFile(file);
    };

    const closeFileView = () => {
        setSelectedFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
    };

    const formatRole = (role) => {
        return role ? role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Role';
    };

    const fetchAndParseFileForJobCreation = async (fileUrl, fileName) => {
        try {
            console.log("Fetching file for job creation from:", fileUrl);

            const proxyResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                    fileName: fileName
                })
            });

            if (!proxyResponse.ok) {
                throw new Error(`Failed to fetch file through proxy: ${proxyResponse.status}`);
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();
            console.log("File fetched successfully, size:", arrayBuffer.byteLength);

            let headers = [];
            let data = [];

            if (fileName.toLowerCase().endsWith('.csv')) {
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(arrayBuffer);
                const rows = text.split('\n').filter(row => row.trim());

                console.log("CSV rows found:", rows.length);

                if (rows.length > 0) {
                    headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    data = rows.slice(1).map(row => {
                        const cells = row.split(',').map(cell => cell.trim().replace(/"/g, ''));
                        return cells;
                    });
                }
            } else {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                console.log("Excel data parsed, rows:", jsonData.length);

                if (jsonData.length > 0) {
                    headers = jsonData[0] || [];
                    data = jsonData.slice(1);
                    data = data.filter(row => row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== ''));
                }
            }

            console.log("Final parsed headers:", headers);
            console.log("Final parsed data rows:", data.length);

            return {
                headers: headers,
                data: data,
                rowCount: data.length
            };

        } catch (error) {
            console.error('Error fetching and parsing file for job creation:', error);
            throw error;
        }
    };

    // User File Card Component
    const UserFileCard = React.memo(({ file }) => {
        const [localAi, setLocalAi] = useState(false);

        const handleCreateJobs = async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }

            if (creatingJobs || loadingHiringManagers || loadingRecruiters) {
                console.log('Job creation or manager loading in progress - ignoring click');
                return;
            }

            try {
                console.log("Starting job creation process for file:", file.fileName);
                console.log("Current hiring manager map:", hiringManagerMap);
                console.log("Current application status map:", jobStatusMap);

                const parsedFileData = await fetchAndParseFileForJobCreation(file.fileUrl, file.fileName);

                console.log("Parsed file data for job creation:", parsedFileData);

                if (!parsedFileData) {
                    throw new Error('Failed to parse file data');
                }

                if (!parsedFileData.headers || !parsedFileData.data) {
                    console.error("Invalid parsed data structure:", parsedFileData);
                    throw new Error('Parsed data is missing headers or data');
                }

                await createJobsFromExcelData(parsedFileData, file.fileUrl, localAi);

            } catch (error) {
                console.error('Error in handleCreateJobs:', error);
                setError(`Failed to create jobs: ${error.message}`);
            }
        };

        const handleViewFile = async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (loadingFileData || creatingJobs) return;

            try {
                setLoadingFileData(true);
                await fetchAndParseFile(file.fileUrl, file.fileName);
            } catch (error) {
                console.error('Error viewing file:', error);
                setError(`Failed to view file: ${error.message}`);
            } finally {
                setLoadingFileData(false);
            }
        };

        return (
            <div className={`rounded-xl shadow-md border p-4 hover:shadow-lg transition-all transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <FileSpreadsheet className="text-green-600 flex-shrink-0" size={24} />
                        <h3
                            className={`font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
                            title={file.fileName || "Job File"}
                        >
                            {file.fileName || "Job File"}
                        </h3>
                    </div>
                    <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download file"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={18} />
                    </a>
                </div>

                <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <User size={14} className="flex-shrink-0" />
                        <span className="truncate">
                            <span className="font-medium">By:</span>{" "}
                            {file.userName || "Unknown User"}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(file.uploadDate)}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>
                            <span className="font-medium">Month:</span>{" "}
                            {formatMonth(file.uploadDate)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleViewFile}
                        disabled={loadingFileData || creatingJobs}
                        className="w-full flex items-center justify-center gap-2 bg-[#9333ea] text-white py-2 px-4 rounded-xl hover:bg-[#9333ea]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium active:scale-95"
                    >
                        {loadingFileData ? (
                            <>
                                <Loader className="animate-spin" size={16} />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Eye size={16} />
                                View File
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCreateJobs}
                        disabled={loadingFileData || creatingJobs || loadingStatuses || loadingHiringManagers}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium active:scale-95"
                    >
                        {creatingJobs ? (
                            <>
                                <Loader className="animate-spin" size={16} />
                                Creating...
                            </>
                        ) : loadingStatuses || loadingHiringManagers ? (
                            <>
                                <Loader className="animate-spin" size={16} />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                Create Jobs
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2 px-1 py-1">
                        <input
                            type="checkbox"
                            id={`useAi-${file.id}`}
                            checked={localAi}
                            onChange={(e) => setLocalAi(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-[#9333ea] focus:ring-[#9333ea]"
                        />
                        <label htmlFor={`useAi-${file.id}`} className="text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                            Generate descriptions using AI ✨
                        </label>
                    </div>
                </div>
            </div>
        );
    });

    const FileCard = ({ file }) => (
        <div className={`rounded-xl shadow-md border p-4 hover:shadow-lg transition-all transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileSpreadsheet className="text-green-600 flex-shrink-0" size={24} />
                    <div className="overflow-hidden">
                        <h3
                            className={`font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
                            title={file.name}
                        >
                            {file.name}
                        </h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete file"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Calendar size={14} className="flex-shrink-0" />
                    <span>{formatDate(file.uploadDate)}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FileText size={14} className="flex-shrink-0" />
                    <span>{file.rowCount} rows</span>
                </div>
            </div>

            <button
                onClick={() => openFile(file)}
                className="w-full flex items-center justify-center gap-2 bg-[#9333ea] text-white py-2 px-4 rounded-xl hover:bg-[#9333ea]/90 transition-all font-medium text-sm active:scale-95"
            >
                <Eye size={16} />
                View Data
            </button>
        </div>
    );

    const FileListItem = ({ file }) => (
        <div className={`rounded-xl shadow-sm border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
                <FileSpreadsheet className="text-green-600 flex-shrink-0" size={32} />
                <div className="overflow-hidden">
                    <h3 className={`font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{file.name}</h3>
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.rowCount} rows</span>
                        <span>{formatDate(file.uploadDate)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                    onClick={() => openFile(file)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#9333ea] text-white py-2 px-4 rounded-xl hover:bg-[#9333ea]/90 transition-all font-medium text-sm active:scale-95"
                >
                    <Eye size={16} />
                    View
                </button>
                <button
                    onClick={() => deleteFile(file.id)}
                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors"
                    title="Delete file"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* User Info Header */}
                <div className="bg-gray-200 shadow-md dark:bg-white/10 rounded-xl p-4 sm:p-6 mb-6 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-4">
                    {/* Left: User Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="bg-[#9333ea] text-white rounded-full p-3 shadow-md flex-shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                                Import Job Applications
                            </h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mt-1">
                                <span className="bg-blue-100 text-[#9333ea] px-2 py-1 rounded-full">
                                    {formatRole(user.role)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-200">| {capitalizeFirstLetter(user.userName) || "User"}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 dark:text-gray-200 max-w-sm">
                                Upload job data from Excel/CSV files to create job positions and applications
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload Section */}
                    <div className="mt-4 lg:mt-0 flex flex-col items-center lg:items-end text-center lg:text-right w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 w-full sm:w-auto">
                            <label className="cursor-pointer w-full sm:w-auto">
                                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#9333ea] text-white text-sm shadow hover:bg-[#9333ea]/90 transition-all font-medium active:scale-95 whitespace-nowrap">
                                    <Upload size={16} />
                                    Upload Job File
                                </div>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>

                            {/* Sample Excel File Download Button */}
                            <button
                                onClick={() => {
                                    const sampleFileUrl = 'https://docs.google.com/spreadsheets/d/1Cj3s75X46plhnxhT19QN-yE5SCHs9cq1/edit?usp=drive_link&ouid=114134967406279256151&rtpof=true&sd=true';
                                    window.open(sampleFileUrl, '_blank');
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#9333ea] text-white text-sm shadow hover:bg-[#9333ea]/90 transition-all font-medium active:scale-95 whitespace-nowrap w-full sm:w-auto"
                                title="Download sample Excel template"
                            >
                                <Download size={16} />
                                Sample Excel File
                            </button>
                        </div>

                        {fileToUpload && (
                            <div className="mt-3 text-sm text-gray-600 w-full sm:max-w-xs bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-dashed border-[#9333ea]/30">
                                <p className="truncate mb-2 font-medium">Selected: {fileToUpload.name}</p>
                                <button
                                    onClick={uploadFileToServer}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-all font-medium active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Start Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <p className="mt-2 text-gray-500 dark:text-gray-200 text-xs">Supports .csv, .xlsx, and .xls</p>
                    </div>
                </div>

                {/* Filter Section (same as ImportCandidateApplication) */}
                {user.role === 'admin' && (
                    <div className="bg-gray-200 dark:bg-white/10 rounded-xl shadow-md p-4 sm:p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Filter size={20} />
                                Admin Filter
                            </h2>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label htmlFor="userFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap dark:text-gray-100">
                                        Filter by User:
                                    </label>
                                    <select
                                        id="userFilter"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] text-black w-full"
                                        disabled={loadingUsers}
                                    >
                                        <option value="all">All Users</option>
                                        {availableUsers.map((userName) => (
                                            <option key={userName} value={userName}>
                                                {userName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedUser !== 'all' && (
                                    <button
                                        onClick={handleResetFilter}
                                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors whitespace-nowrap font-medium"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        </div>

                        {selectedUser !== 'all' && (
                            <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                <p className="text-sm text-[#9333ea] dark:text-blue-300">
                                    Showing files uploaded by: <span className="font-semibold">{selectedUser}</span>
                                    <span className="ml-2">
                                        ({userFiles.length} file{userFiles.length !== 1 ? 's' : ''} found)
                                    </span>
                                </p>
                            </div>
                        )}

                        {availableUsers.length === 0 && !loadingUsers && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-800/20 max-w-md">
                                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                    No other users found. Only your files are visible.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white dark:bg-white/5 rounded-xl shadow-lg p-4 sm:p-6 border dark:border-white/10">
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#9333ea]"></div>
                            <p className="mt-2 text-gray-600">Processing file...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* User Files Section */}
                    {userFiles.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Uploaded Job Files ({userFiles.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {userFiles.map(file => (
                                    <UserFileCard key={file.id} file={file} />
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadedFiles.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Local Files ({uploadedFiles.length})
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('card')}
                                        className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        <Grid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'card' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {uploadedFiles.map(file => (
                                        <FileCard key={file.id} file={file} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {uploadedFiles.map(file => (
                                        <FileListItem key={file.id} file={file} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {uploadedFiles.length === 0 && userFiles.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">No job files uploaded yet</p>
                            <p className="text-sm">Upload job data files to see them here</p>
                        </div>
                    )}
                </div>

                {/* Modal for viewing file data */}
                {selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

                            {/* Header */}
                            <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`text-lg sm:text-xl font-semibold flex items-center gap-2 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    📄 {selectedFile.name || selectedFile.fileName}
                                </h3>
                                <button
                                    onClick={closeFileView}
                                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                >
                                    <X size={26} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className={`px-4 sm:px-6 py-3 border-b ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <p className="text-xs sm:text-sm">
                                    Showing <span className="font-medium text-[#9333ea]">{selectedFile.rowCount}</span> rows
                                    {selectedFile.size && (
                                        <> • <span className="font-medium">{formatFileSize(selectedFile.size)}</span></>
                                    )}
                                </p>
                            </div>

                            {/* Table */}
                            <div className={`p-2 sm:p-6 flex-grow overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                {selectedFile.headers && selectedFile.data ? (
                                    <div className={`border rounded-xl shadow-sm overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                        {/* Horizontal + Vertical Scroll */}
                                        <div className="overflow-auto max-h-[60vh] sm:max-h-[65vh] w-full">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                    <tr>
                                                        {/* Index Column Header */}
                                                        <th className={`px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide sticky left-0 z-20 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-300 text-gray-700'}`}>
                                                            #
                                                        </th>
                                                        {selectedFile.headers.map((header, index) => (
                                                            <th
                                                                key={index}
                                                                className={`px-4 sm:px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                                                            >
                                                                {header || `Col ${index + 1}`}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100'}`}>
                                                    {selectedFile.data.map((row, rowIndex) => (
                                                        <tr
                                                            key={rowIndex}
                                                            className={`hover:bg-blue-500/5 transition-colors ${rowIndex % 2 === 0
                                                                ? (theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50')
                                                                : (theme === 'dark' ? 'bg-gray-800' : 'bg-white')
                                                                }`}
                                                        >
                                                            {/* Index Column Cell */}
                                                            <td className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs font-medium sticky left-0 z-10 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-r border-gray-600' : 'bg-gray-100 text-gray-900 border-r border-gray-200'}`}>
                                                                {rowIndex + 1}
                                                            </td>

                                                            {row.map((cell, cellIndex) => (
                                                                <td
                                                                    key={cellIndex}
                                                                    className={`px-4 sm:px-5 py-3 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}
                                                                >
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500">No data available to display</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                )}

                {/* Loading overlay for file data */}
                {loadingFileData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Loader className="animate-spin text-[#9333ea]" size={24} />
                                <p className="text-gray-700">Loading file data...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
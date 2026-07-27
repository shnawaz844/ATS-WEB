import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, X, Download, Eye, Calendar, FileText, Grid, List, User, Loader, Plus, Send, FolderPen, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function ImportCandidateApplication() {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('card');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [userFiles, setUserFiles] = useState([]);
    const [loadingFileData, setLoadingFileData] = useState(false);
    const [creatingApplications, setCreatingApplications] = useState(false);
    const [applicationCreationStatus, setApplicationCreationStatus] = useState(null);

    const navigate = useNavigate();
    const companyUserName = localStorage.getItem("companyUserName");
    const [selectedUser, setSelectedUser] = useState('all');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // User state
    const [user, setUser] = useState({
        role: 'recruiter_manager',
        userName: '',
        userId: null,
        companyId: null
    });

    const formatMonth = (date) => {
        return new Date(date).toLocaleString("default", { month: "long", year: "numeric" });
    };

    const handleResetFilter = () => {
        setSelectedUser('all');
    };

    // Fetch user data from localStorage
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            console.log("User data from localStorage:", userData);

            setUser({
                role: userData.role || 'recruiter_manager',
                userName: userData.userName || userData.name || '',
                userId: userData.userId || userData.id || userData._id,
                companyId: userData.companyId || userData.company_id
            });
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    }, []);

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
                role: 'recruiter_manager,recruiter'
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

    const fetchUserFiles = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                userId: user.userId,
                companyId: user.companyId,
                fileType: 'candidate'
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

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/candidate-files?${queryParams}`);

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

    // Parse Excel/CSV data for candidate applications
    const parseCandidateData = (fileData) => {
        if (!fileData || !fileData.headers || !fileData.data) {
            throw new Error('Invalid file data structure');
        }

        const headers = fileData.headers.map(h => h.toLowerCase().trim());
        const data = fileData.data;

        // Map Excel columns to candidate fields with exact header matching
        const candidateFields = {
            fullName: headers.findIndex(h =>
                h && (
                    h.includes('candidate full name') ||
                    h.includes('full name') ||
                    h.includes('name')
                )
            ),
            email: headers.findIndex(h =>
                h && (
                    h.includes('candidate email address') ||
                    h.includes('email address') ||
                    (h.includes('email') && !h.includes('info'))
                )
            ),
            password: headers.findIndex(h =>
                h && (
                    h.includes('candidate password') ||
                    h.includes('password')
                )
            ),
            address: headers.findIndex(h =>
                h && (
                    h.includes('candidate full address') ||
                    h.includes('full address') ||
                    (h.includes('address') && !h.includes('email'))
                )
            ),
            gender: headers.findIndex(h =>
                h && h.includes('gender')
            ),
            titleCode: headers.findIndex(h =>
                h && (h.includes('job title') ||
                    h.includes('title code') ||
                    h.includes('code'))
            ),
            contactInfo: headers.findIndex(h =>
                h && (
                    h.includes('candidate contact information') ||
                    h.includes('contact information') ||
                    (h.includes('contact') && !h.includes('email'))
                )
            ),
            experience: headers.findIndex(h =>
                h && (
                    h.includes('candidate relevant experience') ||
                    h.includes('relevant experience') ||
                    h.includes('experience')
                )
            ),
            resume: headers.findIndex(h =>
                h && (
                    h.includes('candidate resume') ||
                    h.includes('resume')
                )
            ),

        };

        console.log('Header mapping:', {
            headers: headers,
            fieldIndices: candidateFields
        });

        const candidates = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Skip empty rows
            if (!row.some(cell => cell && cell.toString().trim() !== '')) continue;

            try {
                const candidate = {
                    userName: row[candidateFields.fullName]?.toString().trim() || '',
                    email: row[candidateFields.email]?.toString().trim() || '',
                    password: row[candidateFields.password]?.toString().trim() || 'DefaultPassword123!',
                    address: row[candidateFields.address]?.toString().trim() || '',
                    gender: row[candidateFields.gender]?.toString().trim() || '',
                    titleCode: row[candidateFields.titleCode]
                        ? row[candidateFields.titleCode].toString().trim().split(',')
                        : [],
                    contactInfo: row[candidateFields.contactInfo]?.toString().trim() || '',
                    experience: row[candidateFields.experience]?.toString().trim() || '',
                    resumeUrl: row[candidateFields.resume]?.toString().trim() || '',
                    role: 'candidate',
                    company_id: user.companyId
                };

                // Log the actual values for debugging
                console.log(`Row ${i + 1} data:`, {
                    userName: candidate.userName,
                    email: candidate.email,
                    address: candidate.address,
                    contactInfo: candidate.contactInfo,
                    titleCode: candidate.titleCode,
                });

                candidates.push(candidate);
            } catch (rowError) {
                errors.push(`Row ${i + 1}: ${rowError.message}`);
            }
        }

        return { candidates, errors, skipped: data.length - candidates.length };
    };

    // Create candidate applications from Excel data
    const createCandidateApplications = async (fileData, fileUrl, candidateFileId) => {
        if (creatingApplications) {
            console.log('Application creation already in progress');
            return;
        }

        setCreatingApplications(true);
        setApplicationCreationStatus(null);

        try {
            const { candidates, errors: parseErrors } = parseCandidateData(fileData);

            if (candidates.length === 0) {
                throw new Error('No valid candidate data found in the file');
            }

            console.log(`Processing ${candidates.length} candidates`);

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/create-candidate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl,
                    fileName: 'excel-import.xlsx',
                    userId: user.userId,
                    companyId: user.companyId,
                    candidateFileId: candidateFileId,
                    fileData: {
                        headers: fileData.headers,
                        data: fileData.data
                    },
                    candidates: candidates
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create candidate applications');
            }

            const result = await response.json();
            console.log("Backend response:", result);

            setApplicationCreationStatus({
                total: result.totalProcessed || candidates.length,
                successful: result.createdCandidates || 0,
                failed: result.errors ? result.errors.length : 0,
                details: result
            });

            const successCount = result.created || 0;
            const errorCount = result.errors?.length || 0;

            if (successCount > 0 && errorCount === 0) {
                alert(`Successfully processed ${successCount} candidates!`);
            } else if (successCount > 0 && errorCount > 0) {
                alert(`Partially successful: ${successCount} candidates processed, ${errorCount} failed. Check console for details.`);
            } else if (errorCount > 0) {
                alert(`Failed to process candidates. ${errorCount} errors occurred. Check console for details.`);
            } else {
                alert('No new candidates were created. All candidates already exist in the system.');
            }

            if (result.errors && result.errors.length > 0) {
                console.error('Processing errors:', result.errors);
            }

            return result;

        } catch (error) {
            console.error('Error creating candidate applications:', error);
            setApplicationCreationStatus({
                total: 0,
                successful: 0,
                failed: 0,
                error: error.message
            });
            throw error;
        } finally {
            setCreatingApplications(false);
        }
    };

    // Fetch and parse file from URL
    const fetchAndParseFile = async (fileUrl, fileName) => {
        try {
            setLoadingFileData(true);
            setError('');

            const safeFileName = fileName || fileUrl || '';

            const proxyResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                    fileName: safeFileName
                })
            });

            if (!proxyResponse.ok) {
                throw new Error(`Failed to fetch file through proxy: ${proxyResponse.status}`);
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();

            let headers = [];
            let data = [];

            if (safeFileName.toLowerCase().endsWith('.csv')) {
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
            setError(`Failed to load and parse the file: ${error.message}`);
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
        formData.append("fileName", fileToUpload.name);
        formData.append("file", fileToUpload);
        formData.append("userId", user.userId);
        formData.append("companyId", user.companyId);
        formData.append("userName", user.userName || 'Unknown User');

        try {
            setLoading(true);

            // First, upload the file to get the candidateFileId
            const uploadRes = await fetch(
                `${process.env.REACT_APP_BASE_URL}/upload/candidate-upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error || uploadData.message || "Upload failed");
            }

            console.log("File uploaded successfully", uploadData);

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

    const fetchAndParseFileForApplicationCreation = async (fileUrl) => {
        try {
            console.log("Fetching file for candidate creation from:", fileUrl);

            const proxyResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/upload/proxy-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                })
            });

            if (!proxyResponse.ok) {
                throw new Error(`Failed to fetch file through proxy: ${proxyResponse.status}`);
            }

            const arrayBuffer = await proxyResponse.arrayBuffer();
            console.log("File fetched successfully, size:", arrayBuffer.byteLength);

            let headers = [];
            let data = [];

            if (fileUrl.toLowerCase().endsWith('.csv')) {
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
            console.error('Error fetching and parsing file for candidate creation:', error);
            throw error;
        }
    };

    // User File Card Component for Candidate Applications
    const UserFileCard = React.memo(({ file }) => {
        // Dummy variables to prevent compile error; replace with real logic as needed
        const isSubmitting = false;
        const isRecruiterManager = user.role === 'recruiter_manager';
        const candidateID = file.id;

        // In your handleCreateCandidateApplications function, update the success handling:

        const handleCreateCandidateApplications = async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }

            if (creatingApplications) {
                console.log('Candidate application creation in progress - ignoring click');
                return;
            }

            try {
                console.log("Starting candidate application creation process for file:", file);

                const parsedFileData = await fetchAndParseFileForApplicationCreation(file.fileUrl);
                console.log("Parsed file data for candidate creation:", parsedFileData);

                if (!parsedFileData) {
                    throw new Error('Failed to parse file data');
                }

                if (!parsedFileData.headers || !parsedFileData.data) {
                    console.error("Invalid parsed data structure:", parsedFileData);
                    throw new Error('Parsed data is missing headers or data');
                }

                const result = await createCandidateApplications(parsedFileData, file.fileUrl, file.id);

                const newCandidates = result.created || 0;
                const existingCandidates = result.existing || 0;
                const successfulApps = result.jobApplications || 0;

                let message = `✅ Candidates Processed:\n` +
                    `• ${newCandidates} new candidates created\n` +
                    `• ${existingCandidates} existing candidates found\n` +
                    `• ${successfulApps} job applications submitted`;

                if (result.jobApplicationsDetail) {
                    const failedApps = result.jobApplicationsDetail.filter(app =>
                        app.status === 'job_not_found' || app.status === 'application_failed'
                    ).length;

                    if (failedApps > 0) {
                        message += `\n• ${failedApps} job applications failed`;
                    }
                }

                alert(message);

                // Log detailed results for debugging
                console.log('Detailed Application Results:', result);

            } catch (error) {
                console.error('Error in handleCreateCandidateApplications:', error);
                setError(`Failed to create candidate applications: ${error.message}`);
            }
        };

        const handleViewFile = async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (loadingFileData || creatingApplications) return;

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
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" size={24} />
                        <div>
                            <p className="text-sm text-gray-500"></p>
                        </div>
                    </div>
                    <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Download file"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={16} />
                    </a>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>
                            <span className="font-medium text-gray-800">File Uploaded By:</span>{" "}
                            {file.userName || "Unknown User"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FolderPen size={14} />
                        <span>
                            <span className="font-medium text-gray-800">File Name:</span>{" "}
                            {file.originalName || "Unknown User"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>
                            <span className="font-medium text-gray-800">Created at:</span>{" "}
                            {formatDate(file.uploadDate)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>
                            <span className="font-medium text-gray-800">Month:</span>{" "}
                            {formatMonth(file.uploadDate)}
                        </span>
                    </div>
                </div>
                <div className="space-y-3 w-full max-w-md mx-auto">
                    {/* View File Button */}
                    <button
                        onClick={handleViewFile}
                        disabled={loadingFileData || creatingApplications}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Create Candidate Applications Button */}
                    <button
                        onClick={handleCreateCandidateApplications}
                        disabled={loadingFileData || creatingApplications}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {creatingApplications ? (
                            <>
                                <Loader className="animate-spin" size={16} />
                                Creating Candidates...
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                Create Candidate Applications
                            </>
                        )}
                    </button>
                </div>


            </div>
        );
    });

    const FileCard = ({ file }) => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="text-green-600" size={24} />
                    <div>
                        <h3 className="font-semibold text-gray-800 truncate max-w-40" title={file.name}>
                            {file.name}
                        </h3>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete file"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(file.uploadDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={14} />
                    <span>{file.rowCount} rows</span>
                </div>
            </div>

            <button
                onClick={() => openFile(file)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
                <Eye size={16} />
                View Data
            </button>
        </div>
    );

    const FileListItem = ({ file }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <FileSpreadsheet className="text-green-600" size={24} />
                <div>
                    <h3 className="font-semibold text-gray-800">{file.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.rowCount} rows</span>
                        <span>{formatDate(file.uploadDate)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => openFile(file)}
                    className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Eye size={16} />
                    View
                </button>
                <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete file"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* User Info Header */}
                <div className="bg-gray-200 dark:bg-white/10 rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row items-start justify-between">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-4">
                        <div className="bg-[#9333ea] text-white rounded-full p-3 shadow-md">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                Import Candidate Applications
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {formatRole(user.role)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-100">| {capitalizeFirstLetter(user.userName) || "User"}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 dark:text-gray-100">
                                Upload candidate data from Excel/CSV files to create candidate accounts and applications
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload Section */}
                    {/* { user.role !== 'admin' && ( */}
                    <div className="mt-4 md:mt-0 flex flex-col items-end text-right">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="cursor-pointer">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#9333ea] text-white text-sm shadow hover:bg-[#9333ea] transition-colors">
                                    <Upload size={16} />
                                    Upload Candidate File
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
                                    const sampleFileUrl = 'https://docs.google.com/spreadsheets/d/1apSokkTG55Zq5wVncIS3DJA1NcQYhQlv/edit?usp=drive_link&ouid=114134967406279256151&rtpof=true&sd=true';
                                    window.open(sampleFileUrl, '_blank');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#9333ea] text-white text-sm shadow hover:bg-[#9333ea] transition-colors"
                                title="Download sample Excel template"
                            >
                                <Download size={16} />
                                Sample Excel File
                            </button>
                        </div>

                        {fileToUpload && (
                            <div className="mt-3 text-sm text-gray-600 w-full md:w-auto">
                                <p className="truncate mb-2">Selected: {fileToUpload.name}</p>
                                <button
                                    onClick={uploadFileToServer}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#9333ea] text-white rounded-lg shadow hover:bg-[#9333ea] transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        )}

                        <p className="mt-2 text-gray-500 text-xs">Supports .csv, .xlsx, and .xls</p>
                    </div>
                    {/* // ) } */}
                </div>

                {/* Filter Section */}
                {user.role === 'admin' && (
                    <div className="bg-gray-200 dark:bg-white/10 rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <Filter size={20} />
                                Admin Filter
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="userFilter" className="text-sm font-medium text-gray-700 dark:text-gray-100 whitespace-nowrap">
                                        Filter by User:
                                    </label>
                                    <select
                                        id="userFilter"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="dark:text-[#000] border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-[#9333ea] dark:focus:ring-[#9333ea] dark:focus:border-[#9333ea]"
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
                                        className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        </div>

                        {selectedUser !== 'all' && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    Showing files uploaded by: <span className="font-semibold">{selectedUser}</span>
                                    <span className="ml-2 text-[#9333ea]">
                                        ({userFiles.length} file{userFiles.length !== 1 ? 's' : ''} found)
                                    </span>
                                </p>
                            </div>
                        )}

                        {availableUsers.length === 0 && !loadingUsers && (
                            <div className="w-[25vw] flex justify-center items-center mt-3 p-3 bg-yellow-50 dark:bg-white/20 rounded-full">
                                <p className="text-sm text-yellow-700 dark:text-white">
                                    No other users found. Only your files are visible.
                                </p>
                            </div>
                        )}
                    </div>
                )}


                <div className="bg-white rounded-xl shadow-lg p-6">
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                                Uploaded Candidate Files ({userFiles.length})
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
                            <p className="text-lg">No candidate files uploaded yet</p>
                            <p className="text-sm">Upload candidate data files to see them here</p>
                        </div>
                    )}
                </div>

                {/* Modal for viewing file data */}
                {selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-100">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    📄 {selectedFile.name || selectedFile.fileName}
                                </h3>
                                <button
                                    onClick={closeFileView}
                                    className="text-gray-500 hover:text-red-500 transition"
                                >
                                    <X size={26} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="px-6 py-3 bg-gray-50 border-b">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{selectedFile.rowCount}</span> rows
                                    {selectedFile.size && (
                                        <> • <span className="font-medium">{formatFileSize(selectedFile.size)}</span></>
                                    )}
                                </p>
                            </div>

                            {/* Table */}
                            <div className="p-6 flex-grow">
                                {selectedFile.headers && selectedFile.data ? (
                                    <div className="border rounded-xl shadow-sm overflow-hidden">
                                        {/* Horizontal + Vertical Scroll */}
                                        <div className="overflow-auto max-h-[65vh] w-full">
                                            <table className="min-w-max divide-y divide-gray-200">
                                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10">
                                                    <tr>
                                                        {/* Index Column Header */}
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide bg-gray-300 sticky left-0 z-20">
                                                            #
                                                        </th>
                                                        {selectedFile.headers.map((header, index) => (
                                                            <th
                                                                key={index}
                                                                className="px-5 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                                                            >
                                                                {header || `Column ${index + 1}`}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {selectedFile.data.map((row, rowIndex) => (
                                                        <tr
                                                            key={rowIndex}
                                                            className={`hover:bg-gray-50 transition ${rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                                                                }`}
                                                        >
                                                            {/* Index Column Cell */}
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-100 sticky left-0 z-10">
                                                                {rowIndex + 1}
                                                            </td>

                                                            {row.map((cell, cellIndex) => (
                                                                <td
                                                                    key={cellIndex}
                                                                    className="px-5 py-3 whitespace-nowrap text-sm text-gray-800"
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
                                    <div className="text-center py-10">
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
                                <Loader className="animate-spin text-blue-500" size={24} />
                                <p className="text-gray-700">Loading file data...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

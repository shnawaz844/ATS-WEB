import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { toast } from 'react-toastify';
import {
    Briefcase,
    MapPin,
    Clock,
    EyeIcon,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Phone,
    FileText,
    AlertCircle,
    X,
    Save,
    Check,
    FileUp,
    CircleUser,
    Mail,
    FolderDown,
    BookText,
    Video
} from 'lucide-react';
import BackButtonMobile from '../../components/Mob-back-btn';
import { useTheme } from '../../context/ThemeContext';

const fetchApplicationStatuses = async ({ filters = {}, page = 1, limit = 100 }) => {
    const queryParams = new URLSearchParams(filters).toString();
    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
    const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses?${queryParams}`,
        {
            headers: {
                'Company_id': companyId
            }
        }
    );
    if (!res.ok) {
        throw new Error("Error fetching application statuses");
    }
    return res.json();
};


const MyJobs = () => {
    const { theme } = useTheme();
    const [loginData, setLoginData] = useState(null);
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [file, setFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updatedApplication, setUpdatedApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 9;
    const [applicationStatuses, setApplicationStatuses] = useState([]);
    const [loadingStatuses, setLoadingStatuses] = useState(true);

    // 1️⃣ Build lookup map: _id -> applicationStatus
    const statusMap = useMemo(() => {
        return applicationStatuses.reduce((map, s) => {
            map[s._id] = s.applicationStatus;
            return map;
        }, {});
    }, [applicationStatuses]);

    const getStatusName = id => statusMap[id] ?? 'Unknown';

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            if (!loginData?._id) return;
            const res = await fetch(
                `${process.env.REACT_APP_BASE_URL}/application/candidate/${loginData._id}?page=${currentPage}&limit=${limit}`
            );
            const data = await res.json();
            setApplications(data.applications);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        // Theme-aware status colors could be handled here if needed, 
        // but these are specific status colors. I'll leave them as is or adjust brightness for dark mode if requested.
        // For now, these colors (bg-blue-100, etc.) are light.
        // I will make them slightly darker for dark mode if possible, but they are semantic.
        // Let's stick to these for now or use opacities.
        // Actually, for dark mode consistency, I should use darker backgrounds or text.
        // But let's check if I can just use existing ones for now.
        switch (status) {
            case 'New Submission':
                return theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800';
            case 'In Review':
                return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' : 'bg-yellow-100 text-yellow-800';
            case 'Accepted':
                return theme === 'dark' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-800';
            case 'Rejected':
                return theme === 'dark' ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-100 text-red-800';
            default:
                return theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'New Submission':
                return <FileText className="h-4 w-4" />;
            case 'In Review':
                return <EyeIcon className="h-4 w-4" />;
            case 'Accepted':
                return <Check className="h-4 w-4" />;
            case 'Rejected':
                return <X className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedApplication((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleQuestionAnswerChange = (index, field, value) => {
        const updatedQuestionsAnswers = [...updatedApplication[field]];
        updatedQuestionsAnswers[index] = value;
        setUpdatedApplication((prevState) => ({
            ...prevState,
            [field]: updatedQuestionsAnswers,
        }));
    };

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmitEdit = async () => {
        try {
            const formData = new FormData();

            formData.append("candidateID", updatedApplication.candidateID._id);
            formData.append("jobID", updatedApplication.jobID._id);
            formData.append("contactInfo", updatedApplication.contactInfo);
            formData.append("experience", updatedApplication.experience);
            formData.append("questions", JSON.stringify(updatedApplication.questions));
            formData.append("answers", JSON.stringify(updatedApplication.answers));
            if (file) {
                formData.append("resume", file);
            }

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/application/update-candidate-application/${selectedApp._id}`,
                {
                    method: 'PUT',
                    body: formData
                }
            );
            const result = await response.json();
            if (response.ok) {
                setIsEditModalOpen(false);
                fetchApplications();
                toast.success('Application updated successfully');
            } else {
                toast.error('Failed to update application');
            }
        } catch (error) {
            console.error('Error updating application:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('user');
        const user = JSON.parse(token);
        setLoginData(user);
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [loginData, currentPage]);

    // Fetch all application statuses
    useEffect(() => {
        const loadStatuses = async () => {
            if (!loginData) return;
            setLoadingStatuses(true);
            try {
                const data = await fetchApplicationStatuses({ page: 1, limit: 100 });
                setApplicationStatuses(data.applicationStatuses);
            } catch (err) {
                console.error('Error fetching statuses:', err);
            } finally {
                setLoadingStatuses(false);
            }
        };
        loadStatuses();
    }, [loginData]);


    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    };

    const isMeetingActive = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        try {
            const interviewDate = new Date(dateStr);
            const [hours, minutes] = timeStr.split(':').map(Number);
            interviewDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            const fiveMinutesBefore = new Date(interviewDate.getTime() - 5 * 60 * 1000);
            return now >= fiveMinutesBefore;
        } catch (e) {
            return false;
        }
    };


    return (
        <div className={`px-8 py-4 w-full min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}
        >
            <BackButtonMobile />
            <div className={`mb-6 h-[15vh] flex items-center rounded-xl p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                <div className="flex justify-center items-center w-full">
                    <h1 className="text-center text-2xl md:text-3xl font-bold text-white flex justify-start items-center">
                        <Briefcase className="inline-block mr-4 mb-1 text-white" />
                        My Applications
                    </h1>
                </div>
            </div>


            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : applications.length > 0 ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {applications.map(app => {
                        const name = getStatusName(app.applicationStatusId);
                        return (
                            <div
                                key={app._id}
                                className={`flex flex-col h-full rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h2 className={`text-xl font-bold capitalize line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                {capitalizeFirstLetter(app.jobID?.title)}
                                            </h2>
                                            <span
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(name)
                                                    }`}
                                            >
                                                {getStatusIcon(name)}
                                                {capitalizeFirstLetter(name)}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <CircleUser className="h-4 w-4 mr-2" />
                                                Name : {capitalizeFirstLetter(app.candidateID.userName)}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Mail className="h-4 w-4 mr-2" />
                                                Email : {app.candidateID.email}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FolderDown className="h-4 w-4 mr-2" />
                                                Location Type : {app.jobID?.locationType}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Location : {[app.jobID?.city, app.jobID?.state, app.jobID?.country].filter(Boolean).join(', ')}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Clock className="h-4 w-4 mr-2" />
                                                Shift : {app.jobID?.shiftStart} - {app.jobID?.shiftEnd}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <div className="h-14 overflow-y-auto pr-1 flex">
                                                    <BookText className="h-4 w-4 mr-2" />
                                                    Experience : {capitalizeFirstLetter(app.experience || 'No experience specified')}
                                                </div>
                                            </p>
                                            {app.submittedAt && (
                                                <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <CalendarDays className="h-4 w-4 mr-2" />
                                                    Applied: {new Date(app.submittedAt).toLocaleDateString()}
                                                </p>
                                            )}

                                            {/* Interview Details */}
                                            {app.interview && (
                                                <div className={`mt-4 p-3 rounded-lg border ${theme === 'dark' ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>Interview Scheduled</h4>
                                                        {app.interview.interviewerType === 'online' && isMeetingActive(app.interview.date, app.interview.scheduledTime) && (
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700`}>
                                                                Active Now
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            <CalendarDays className="h-3.5 w-3.5 mr-2 text-purple-500" />
                                                            {new Date(app.interview.date).toLocaleDateString()} at {app.interview.scheduledTime}
                                                        </p>
                                                        {app.interview.interviewerType === 'online' && app.interview.meetingLink && (
                                                            isMeetingActive(app.interview.date, app.interview.scheduledTime) ? (
                                                                <a
                                                                    href={app.interview.meetingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm flex items-center text-blue-500 hover:text-blue-600 font-bold mt-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Video className="h-3.5 w-3.5 mr-2" />
                                                                    Join Meeting
                                                                </a>
                                                            ) : (
                                                                <div className="text-sm flex items-center text-gray-400 font-medium mt-1 cursor-default">
                                                                    <Video className="h-3.5 w-3.5 mr-2" />
                                                                    Join Meeting (Locked) - Will activate 5 mins before
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`flex justify-between mt-5 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <button
                                            onClick={() => {
                                                if (app && app._id) {
                                                    setSelectedApp(app);
                                                    setIsModalOpen(true);
                                                } else {
                                                    toast.error('Unable to load application details');
                                                }
                                            }}
                                            className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-300 hover:text-black transition-colors text-sm shadow-md"
                                        >
                                            <EyeIcon className="h-4 w-4 mr-1" /> View
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (app && app._id) {
                                                    setSelectedApp(app);
                                                    setUpdatedApplication({
                                                        candidateID: app.candidateID,
                                                        jobID: app.jobID,
                                                        contactInfo: app.contactInfo || '',
                                                        experience: app.experience || '',
                                                        questions: app.questions || [],
                                                        answers: app.answers || []
                                                    });
                                                    setFile(null);
                                                    setIsEditModalOpen(true);
                                                } else {
                                                    toast.error('Unable to load application details');
                                                }
                                            }}
                                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md"
                                        >
                                            <FileText className="h-4 w-4 mr-1" /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div >
            ) : (
                <div className={`rounded-xl shadow-lg border p-12 text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-center mb-4">
                        <Briefcase className={`h-16 w-16 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    </div>
                    <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>No applications yet</h3>
                    <p className={`mt-2 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>You haven't submitted any job applications yet. Start exploring open positions to begin your journey.</p>
                    <button className="mt-6 bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-500 transition-colors shadow-md">
                        Find Jobs
                    </button>
                </div>
            )}

            {
                totalPages > 1 && (
                    <div className="flex justify-center mt-10 space-x-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="flex items-center w-32 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-center justify-center hover:bg-gray-800 transition-colors shadow-md"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </button>
                        <span className={`px-4 py-2 rounded-lg shadow-md border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="flex items-center w-32 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-center justify-center hover:bg-gray-800 transition-colors shadow-md"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                )
            }

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} app={selectedApp} getStatusColor={getStatusColor} getStatusName={getStatusName} />

            {/* Enhanced Edit Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300">
                            {/* Header */}
                            <div className="flex justify-between items-center p-5 border-b bg-gray-700 border border-white rounded-t-xl">
                                <h2 className="text-xl font-semibold text-white">Edit Application</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-300 hover:text-white bg-transparent rounded-full p-2 hover:bg-gray-500 transition-colors duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className={`max-h-[calc(90vh-80px)] overflow-y-auto p-8 space-y-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : ''}`}>
                                {/* Job Info */}
                                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-blue-100'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                                        <Briefcase className="h-5 w-5 mr-2" />
                                        Job Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Title</p>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedApp?.jobID?.title}</p>
                                        </div>
                                        <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                {[selectedApp?.jobID?.city, selectedApp?.jobID?.state, selectedApp?.jobID?.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Schedule</p>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedApp?.jobID?.shiftStart} - {selectedApp?.jobID?.shiftEnd}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resume Upload */}
                                <div className="space-y-1">
                                    <label className={`block font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Upload Resume</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="resume"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            required
                                        />
                                        <div className={`flex items-center justify-between px-4 py-3 border border-dashed rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                                            <div className="flex items-center">
                                                <FileUp size={18} className="mr-2" />
                                                <span>{file ? file.name : "Upload your resume"}</span>
                                            </div>
                                            <span className="text-sm text-blue-500">Browse</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, DOCX, or RTF (Max 5MB)</p>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <label className={`font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Contact Information
                                    </label>
                                    <input
                                        type="text"
                                        name="contactInfo"
                                        value={updatedApplication?.contactInfo || ''}
                                        onChange={handleInputChange}
                                        placeholder="Phone, email, or other contact methods"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                                            }`}
                                    />
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className={`font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Work Experience
                                    </label>
                                    <textarea
                                        name="experience"
                                        value={updatedApplication?.experience || ''}
                                        onChange={handleInputChange}
                                        placeholder="Describe your relevant work experience"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                                            }`}
                                        rows="4"
                                    />
                                </div>

                                {/* Questions */}
                                {updatedApplication?.questions?.map((question, index) => (
                                    <div key={index} className={`p-4 border rounded-xl space-y-2 ${theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                                        <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Question {index + 1}</label>
                                        <div className={`p-3 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>{question}</div>
                                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Your Answer</label>
                                        <textarea
                                            value={updatedApplication?.answers[index] || ''}
                                            onChange={(e) => handleQuestionAnswerChange(index, 'answers', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                }`}
                                            rows="3"
                                        />
                                    </div>
                                ))}

                                {/* Footer */}
                                <div className={`flex justify-end space-x-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitEdit}
                                        className="flex items-center px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition-colors shadow-md"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                )
            }
        </div >
    );
};

export default MyJobs;

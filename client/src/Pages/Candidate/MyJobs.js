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
    Video,
    Search
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

    // Interview specific state
    const [isRoundsModalOpen, setIsRoundsModalOpen] = useState(false);
    const [selectedApplicationRounds, setSelectedApplicationRounds] = useState([]);
    const [selectedApplicationForRounds, setSelectedApplicationForRounds] = useState(null);
    const [loadingRounds, setLoadingRounds] = useState(false);
    const [interviewers, setInterviewers] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second for the countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            console.log("Fetched Applications:", data.applications);
            setApplications(data.applications);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInterviewers = async () => {
        try {
            const companyId = JSON.parse(localStorage.getItem("user"))?.company_id;
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/interviewers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Company_id": companyId,
                },
            });
            const data = await response.json();
            setInterviewers(data);
        } catch (error) {
            console.error("Error fetching interviewers:", error);
        }
    };

    // Helper to get interviewer name from ID or object
    const getInterviewerName = (idOrObj) => {
        if (!idOrObj) return "N/A";
        // If it's already an object with userName
        if (typeof idOrObj === 'object' && idOrObj.userName) return idOrObj.userName;

        // If it's an ID string, look it up in the interviewers list
        const interviewer = interviewers.find(i => i._id === idOrObj);
        return interviewer ? interviewer.userName : "N/A";
    };

    const getStatusColor = (status) => {

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

    // --- Interview Helpers (Ported/Adapted) ---

    // Format date for better display
    const formatDate = (dateString) => {
        if (!dateString) return "Not scheduled";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Check if interview date is today
    const isToday = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const interviewDate = new Date(dateString);
        interviewDate.setHours(0, 0, 0, 0);

        return today.getTime() === interviewDate.getTime();
    };

    // Check interview status (Upcoming vs Done)
    const getInterviewRoundStatus = (dateString, timeString, interview) => {
        // 1. Explicit manual statuses take priority
        if (interview?.interviewProgressStatus === "Completed") {
            return { label: "INTERVIEW DONE", isDone: true, color: "green" };
        }
        if (interview?.interviewProgressStatus === "Missed") {
            return { label: "INTERVIEW MISSED", isDone: true, color: "red" };
        }
        if (interview?.interviewProgressStatus === "Pending") {
            return { label: "INTERVIEW PENDING", isDone: true, color: "black" };
        }

        if (!dateString || !timeString) return { label: "UPCOMING INTERVIEW", isDone: false, color: "purple" };
        const interviewDate = new Date(dateString);
        const [hours, minutes] = timeString.split(':').map(Number);
        interviewDate.setHours(hours, minutes, 0, 0);

        const now = currentTime; // Use stable currentTime from state
        const joinDeadline = new Date(interviewDate.getTime() + 15 * 60 * 1000); // 15 mins (Link Expiration)
        const joinActiveStart = new Date(interviewDate.getTime() - 5 * 60 * 1000); // 5 mins before

        // 2. Post-Expiration Logic (After 15 mins)
        if (now > joinDeadline) {
            if (interview?.interviewProgressStatus === "In Progress") {
                return { label: "INTERVIEW DONE", isDone: true, color: "green" };
            }
            return { label: "INTERVIEW MISSED", isDone: true, color: "red" };
        }

        if (currentTime > joinDeadline) {
            // After 15 mins, if not joined, it's Missed. If joined, it's In Progress.
            if (interview?.interviewProgressStatus === "In Progress") {
                return { label: "IN PROGRESS", isDone: false, color: "blue" };
            }
            return { label: "INTERVIEW MISSED", isDone: true, color: "red" };
        }

        // 3. Current active states
        if (interview?.interviewProgressStatus === "In Progress") {
            return { label: "IN PROGRESS", isDone: false, color: "blue" };
        }

        return {
            label: "UPCOMING INTERVIEW",
            isDone: false,
            color: "purple"
        };
    };

    const handleJoinMeeting = async (interviewId, meetingLink) => {
        window.open(meetingLink, '_blank', 'noopener,noreferrer');

        try {
            await fetch(`${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/update-interview/${interviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    interviewProgressStatus: "In Progress"
                }),
            });
            fetchApplications();
        } catch (error) {
            console.error("Error updating interview status to In Progress:", error);
        }
    };

    // Get specific status color for interview rounds
    const getRoundStatusColor = (status) => {
        const statusName = statusMap[status] || status;

        switch (statusName?.toLowerCase()) {
            case 'scheduled':
            case 'in progress': // Added 'in progress'
                return theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
            case 'completed':
            case 'interview complete':
                return theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
            case 'cancelled':
                return theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
            case 'missed':
            case 'interview missed':
                return theme === 'dark' ? 'bg-red-900/10 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-100';
            case 'rescheduled':
                return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            default:
                return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
        }
    };

    const fetchRoundsForApplication = async (applicationId) => {
        setLoadingRounds(true);
        try {
            // For now, I'll simulate it with the single interview available.
            const app = applications.find(a => a._id === applicationId);
            if (app && app.interview) {
                setSelectedApplicationRounds([app.interview]);
            } else {
                setSelectedApplicationRounds([]);
            }

        } catch (error) {
            console.error("Error fetching rounds", error);
        } finally {
            setLoadingRounds(false);
        }
    };

    const handleSeeAllRounds = (app) => {
        setSelectedApplicationForRounds(app);

        let interviewsToUse = [];
        if (app.interviews && Array.isArray(app.interviews) && app.interviews.length > 0) {
            interviewsToUse = app.interviews;
        } else if (app.interview) {
            interviewsToUse = [app.interview];
        }

        const sortedRounds = [...interviewsToUse].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const [hA, mA] = (a.scheduledTime || "00:00").split(':').map(Number);
            const [hB, mB] = (b.scheduledTime || "00:00").split(':').map(Number);
            dateA.setHours(hA || 0, mA || 0, 0, 0);
            dateB.setHours(hB || 0, mB || 0, 0, 0);
            return dateA.getTime() - dateB.getTime();
        });
        setSelectedApplicationRounds(sortedRounds);
        setIsRoundsModalOpen(true);
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
        fetchInterviewers();
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
            const fifteenMinutesAfter = new Date(interviewDate.getTime() + 15 * 60 * 1000);
            return now >= fiveMinutesBefore && now <= fifteenMinutesAfter;
        } catch (e) {
            return false;
        }
    };

    const isMeetingExpired = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        try {
            const interviewDate = new Date(dateStr);
            const [hours, minutes] = timeStr.split(':').map(Number);
            interviewDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            return now > new Date(interviewDate.getTime() + 15 * 60 * 1000);
        } catch (e) {
            return false;
        }
    };

    // Helper to calculate time left for interview
    const getTimeLeft = (dateString, timeString) => {
        if (!dateString || !timeString) return null;
        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const interviewDate = new Date(dateString);
            interviewDate.setHours(hours, minutes, 0, 0);

            const diff = interviewDate - currentTime;
            if (diff <= 0) return null;

            const totalSeconds = Math.floor(diff / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            if (h > 0) return `${h}h ${m}m ${s}s`;
            return `${m}m ${s}s`;
        } catch (e) {
            return null;
        }
    };

    const getUpcomingInterview = (interviews) => {
        if (!interviews || interviews.length === 0) return null;

        const getCompareValue = (r) => {
            const d = new Date(r.date);
            const [h, m] = (r.scheduledTime || "00:00").split(':').map(Number);
            d.setHours(h || 0, m || 0, 0, 0);
            return d.getTime();
        };

        const sortedRounds = [...interviews].sort((a, b) => getCompareValue(a) - getCompareValue(b));

        const todayRounds = sortedRounds.filter(r => isToday(r.date));
        if (todayRounds.length > 0) {
            // Priority to today's upcoming round, or latest today if all done
            return todayRounds.find(r => !getInterviewRoundStatus(r.date, r.scheduledTime, r).isDone)
                || todayRounds[todayRounds.length - 1];
        }

        // Falling back to future upcoming or latest past
        const upcoming = sortedRounds.find(r => !getInterviewRoundStatus(r.date, r.scheduledTime, r).isDone);
        return upcoming || sortedRounds[sortedRounds.length - 1] || sortedRounds[0];
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
                                            <p className={`text-sm flex items-center  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <CircleUser className="h-4 w-4 mr-2 " />
                                                <span className="font-semibold mr-1"><b>Name :</b></span>
                                                {capitalizeFirstLetter(app.candidateID.userName)}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Mail className="h-4 w-4 mr-2" />
                                                <span className="font-semibold mr-1"><b>Email :</b></span>
                                                {app.candidateID.email}
                                            </p>
                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FolderDown className="h-4 w-4 mr-2" />
                                                <span className="font-semibold mr-1"><b>Location Type :</b></span>
                                                {app.jobID?.locationType}
                                            </p>
                                            {/* Interview Details Card UI */}
                                            {(() => {
                                                let interviewsToUse = [];
                                                if (app.interviews && Array.isArray(app.interviews) && app.interviews.length > 0) {
                                                    interviewsToUse = app.interviews;
                                                } else if (app.interview) {
                                                    interviewsToUse = [app.interview];
                                                }

                                                const interview = getUpcomingInterview(interviewsToUse);
                                                const showInterviewAddress = interview?.interviewerType === 'walkin' && interview.meetingLink;

                                                return (
                                                    <>
                                                        <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            {showInterviewAddress ? (
                                                                <>
                                                                    <span className="font-semibold mr-1"><b>Address :</b></span>
                                                                    {interview.meetingLink}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="font-semibold mr-1"><b>Location :</b></span>
                                                                    {[app.jobID?.city, app.jobID?.state, app.jobID?.country].filter(Boolean).join(', ')}
                                                                </>
                                                            )}
                                                        </p>
                                                        <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            <span className="font-semibold mr-1"><b>Shift :</b></span>
                                                            {app.jobID?.shiftStart} - {app.jobID?.shiftEnd}
                                                        </p>
                                                        <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            <div className="h-14 overflow-y-auto pr-1 flex">
                                                                <BookText className="h-4 w-4 mr-2" />
                                                                <span className="font-semibold mr-1"><b>Experience :</b></span>
                                                                {capitalizeFirstLetter(app.experience || 'No experience specified')}
                                                            </div>
                                                        </p>
                                                        {app.submittedAt && (
                                                            <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                <CalendarDays className="h-4 w-4 mr-2" />
                                                                <b>Applied:</b> {new Date(app.submittedAt).toLocaleDateString()}
                                                            </p>
                                                        )}

                                                        {interview && (() => {
                                                            const { label, isDone, color: roundStatusColor } = getInterviewRoundStatus(interview.date, interview.scheduledTime, interview);
                                                            return (
                                                                <>
                                                                    <div className={`mt-4 flex items-center gap-2 mb-1`}>
                                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${roundStatusColor === 'green' ? (theme === 'dark' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200') : roundStatusColor === 'blue' ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200') : roundStatusColor === 'red' ? (theme === 'dark' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200') : (theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200')}`}>
                                                                            {label}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`relative mt-2 p-4 rounded-xl border-l-4 flex flex-col gap-3 shadow-md transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700 border-l-purple-500' : 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border-gray-100 border-l-purple-600'}`}>
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusName(interview.status).toLowerCase().includes('scheduled') || getStatusName(interview.status).toLowerCase().includes('upcoming') ? (theme === 'dark' ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-100 text-purple-800') : (theme === 'dark' ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800')}`}>
                                                                                    {getStatusName(interview.status)}
                                                                                </span>
                                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                                                                    {capitalizeFirstLetter(interview.interviewerType)}
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleSeeAllRounds(app); }}
                                                                                className={`text-[11px] font-extrabold hover:underline flex items-center gap-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}
                                                                            >
                                                                                History <ChevronRight className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/50 border border-white/80'}`}>
                                                                            <div className="flex items-center gap-2 text-xs">
                                                                                <CalendarDays className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                                                                <div className="flex flex-col">
                                                                                    <span className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                                        {formatDate(interview.date)}
                                                                                    </span>
                                                                                    <div className="mt-0.5 flex items-center">
                                                                                        <span className={`text-[15px] font-bold px-1.5 py-0.5 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-700'}`}>
                                                                                            {interview.scheduledTime}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs max-w-full">
                                                                                <CircleUser className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                                                <div className="flex flex-col min-w-0">
                                                                                    <span className={`truncate font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                                        {getInterviewerName(interview.interviewerID)}
                                                                                    </span>
                                                                                    <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                        Interviewer
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {interview.interviewerType === 'online' && interview.meetingLink && (
                                                                            <div className="mt-1 flex justify-start">
                                                                                {isMeetingActive(interview.date, interview.scheduledTime) ? (
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleJoinMeeting(interview._id, interview.meetingLink); }}
                                                                                            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-black rounded-full transition-all transform hover:scale-105 shadow-md shadow-purple-200/50 w-fit uppercase tracking-tight"
                                                                                        >
                                                                                            <Video className="w-3.5 h-3.5" />
                                                                                            Join Interview Now
                                                                                        </button>
                                                                                        {getTimeLeft(interview.date, interview.scheduledTime) && (
                                                                                            <div className={`text-[10px] font-extrabold flex items-center gap-1 mt-0.5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                                                                                <Clock className="w-3 h-3 animate-pulse" />
                                                                                                Starts in {getTimeLeft(interview.date, interview.scheduledTime)}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        {isMeetingExpired(interview.date, interview.scheduledTime) ? (
                                                                                            <span className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border ${theme === 'dark' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                                                <Clock className="w-3 h-3" />
                                                                                                Link expired
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${theme === 'dark' ? 'bg-amber-900/40 text-amber-400 border-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                                                                <Clock className="w-3 h-3" />
                                                                                                Link active 5m before
                                                                                            </span>
                                                                                        )}
                                                                                        {getTimeLeft(interview.date, interview.scheduledTime) && (
                                                                                            <div className={`text-[10px] font-bold ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                                Starts in {getTimeLeft(interview.date, interview.scheduledTime)}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </>
                                                );
                                            })()}
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
                </div>

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
                                {updatedApplication?.questions?.map((question, index) => {
                                    const isBlank = !question || (typeof question === 'string' && (question.trim() === '' || question === '[]'));
                                    if (isBlank) return null;

                                    return (
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
                                    );
                                })}

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

            {/* See All Rounds Modal */}
            {
                isRoundsModalOpen && selectedApplicationForRounds && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                        <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex items-start gap-5">
                                {(() => {
                                    const initial = selectedApplicationForRounds.candidateID?.userName?.[0] || "?";
                                    return (
                                        <>
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${theme === 'dark' ? 'bg-purple-900/40 text-purple-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {capitalizeFirstLetter(initial)}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {capitalizeFirstLetter(selectedApplicationForRounds.jobID?.title) || "N/A"}
                                                </h2>
                                                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {capitalizeFirstLetter(selectedApplicationForRounds.candidateID?.userName) || "N/A"}
                                                </p>
                                            </div>
                                            <button onClick={() => setIsRoundsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                                <X className="h-6 w-6" />
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Subheader */}
                            <div className="px-8 mb-4 flex justify-between items-center">
                                <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Scheduled Rounds</h3>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                    {selectedApplicationRounds.length} Rounds
                                </span>
                            </div>

                            {/* Scrollable Rounds List */}
                            <div className="px-8 pb-8 overflow-y-auto space-y-4">
                                {selectedApplicationRounds.length > 0 ? (
                                    selectedApplicationRounds.map((round) => {
                                        // Handle if status is an ID or string
                                        const appStatusName = getStatusName(round.status) !== 'Unknown' ? getStatusName(round.status) : round.status;

                                        return (
                                            <div key={round._id} className={`p-5 rounded-2xl border transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 hover:border-purple-500/30' : 'bg-[#f8fafc] border-gray-100 hover:border-indigo-100'}`}>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getRoundStatusColor(round.status)}`}>
                                                        {capitalizeFirstLetter(appStatusName)}
                                                    </span>
                                                    {round.interviewProgressStatus && round.interviewProgressStatus !== 'Upcoming' && (
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getRoundStatusColor(round.interviewProgressStatus)}`}>
                                                            {capitalizeFirstLetter(round.interviewProgressStatus)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {formatDate(round.date)} at {round.scheduledTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>T</div>
                                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{capitalizeFirstLetter(round.interviewerType)} Interview</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>I</div>
                                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Interviewer: {getInterviewerName(round?.interviewerID)}</span>
                                                    </div>

                                                    {/* Interview Address for Walk-in */}
                                                    {round.interviewerType === 'walkin' && round.meetingLink && (
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Address: {round.meetingLink}</span>
                                                        </div>
                                                    )}

                                                    {/* Meeting Link for Online Interviews */}
                                                    {round.interviewerType === 'online' && round.meetingLink && !getInterviewRoundStatus(round.date, round.scheduledTime, round).isDone && (
                                                        <div className="mt-3 pt-3 border-t border-purple-100/50">
                                                            {isMeetingActive(round.date, round.scheduledTime) ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        onClick={() => handleJoinMeeting(round._id, round.meetingLink)}
                                                                        className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 underline"
                                                                    >
                                                                        <Video className="w-4 h-4" />
                                                                        Join Meeting Now
                                                                    </button>
                                                                    {getTimeLeft(round.date, round.scheduledTime) && (
                                                                        <div className={`text-[11px] font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                                                            Interview starts in {getTimeLeft(round.date, round.scheduledTime)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-0.5">
                                                                    {isMeetingExpired(round.date, round.scheduledTime) ? (
                                                                        <div className="flex items-center gap-2 text-[11px] text-red-600 font-medium">
                                                                            <Clock className="w-4 h-4" />
                                                                            Link expired
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-[11px] text-amber-600 font-medium">
                                                                            <Clock className="w-4 h-4" />
                                                                            Link will be active 5 mins before
                                                                        </div>
                                                                    )}
                                                                    {getTimeLeft(round.date, round.scheduledTime) && (
                                                                        <div className={`text-[10px] font-bold ml-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                            Starts in {getTimeLeft(round.date, round.scheduledTime)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No interview rounds details found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >

    );
};

export default MyJobs;


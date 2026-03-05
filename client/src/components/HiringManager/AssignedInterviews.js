import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAssignedInterview from "../../hooks/useAssignedInterview";
import { useTheme } from "../../context/ThemeContext";
import { Briefcase, Search, Clock, Trash2, PenTool, ChevronDown } from "lucide-react";
import BackButtonMobile from "../Mob-back-btn";
import AiGeneratedInterviews from "./AiGeneratedInterviews";

const AssignedInterviews = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const itemsPerPage = 1; // Number of interviews per page
    const limit = 9; // Set the number of items per page
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterInterviewType, setFilterInterviewType] = useState("all");
    const companyUserName = localStorage.getItem("companyUserName");
    const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(localStorage.getItem(`ai_features_${companyUserName}`) === 'true');
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'ai'
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second for the countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch company settings to sync AI features
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/companies/companies/${companyUserName}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.aiFeaturesEnabled !== undefined) {
                        setAiFeaturesEnabled(data.aiFeaturesEnabled);
                        localStorage.setItem(`ai_features_${companyUserName}`, data.aiFeaturesEnabled);
                    }
                }
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };

        if (companyUserName) {
            fetchCompanyDetails();
        }
    }, [companyUserName]);


    // Fetch company_id and role from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user.company_id;
    const userRole = user.role;
    const {
        assignedInterviews,
        error,
        isLoading,
        refetchAssignedInterviews
    } = useAssignedInterview(page, limit, search, filterStatus);

    useEffect(() => {
        console.log("assigned interview", assignedInterviews)
    }, [assignedInterviews])


    const [interviewers, setInterviewers] = useState([]);
    const [detailedInterview, setDetailedInterview] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewProgressStatus: "Upcoming",
        interviewerID: "",
        company_id: "",
    });
    const [isRoundsModalOpen, setIsRoundsModalOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    console.log("editForm>>>>>>>", editForm);

    // New state to store the fetched statuses
    const [statuses, setStatuses] = useState([]);

    // Fetch statuses from API
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`, {
            headers: {
                "Company_id": companyId
            }
        })
            .then(response => response.json())
            .then(data => setStatuses(data.applicationStatuses))
            .catch(error => console.error("Error fetching statuses:", error));
    }, [companyId]);

    const capitalizeFirstLetter = (string) => {
        if (string == null) return '';
        const str = (typeof string === 'object') ? (string?.applicationStatus || String(string)) : String(string);
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

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
            return dateString; // Fallback to the original string if parsing fails
        }
    };

    // Get status color for visual indication // 
    const getStatusColor = (status) => {
        const isDark = theme === 'dark';
        const statusStr = (status?.applicationStatus || status || "").toString().toLowerCase();
        switch (statusStr) {
            case 'scheduled':
                return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
            case 'completed':
            case 'interview complete':
                return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
            case 'cancelled':
                return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
            case 'missed':
            case 'interview missed':
                return isDark ? 'bg-red-900/10 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-100';
            case 'rescheduled':
                return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            default:
                return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
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

    // Check if meeting link should be active (5 mins before)
    const isMeetingLinkActive = (dateString, timeString) => {
        if (!dateString || !timeString) return false;
        const [hours, minutes] = timeString.split(':').map(Number);
        const interviewDate = new Date(dateString);
        interviewDate.setHours(hours, minutes, 0, 0);
        const activeTime = new Date(interviewDate.getTime() - 5 * 60 * 1000);
        const endTime = new Date(interviewDate.getTime() + 15 * 60 * 1000);
        return currentTime >= activeTime && currentTime <= endTime;
    };

    const isMeetingExpired = (dateString, timeString) => {
        if (!dateString || !timeString) return false;
        const [hours, minutes] = timeString.split(':').map(Number);
        const interviewDate = new Date(dateString);
        interviewDate.setHours(hours, minutes, 0, 0);
        return currentTime > new Date(interviewDate.getTime() + 15 * 60 * 1000);
    };

    // Helper to calculate time left for interview
    const getTimeLeft = (dateString, timeString) => {
        if (!dateString || !timeString) return null;
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
            if (interview?.interviewProgressStatus === "Pending") {
                return { label: "INTERVIEW PENDING", isDone: true, color: "black" };
            }
            return { label: "INTERVIEW MISSED", isDone: true, color: "red" };
        }

        // 3. Active Window Logic (-5m to +15m)
        if (now >= joinActiveStart) {
            if (interview?.interviewProgressStatus === "In Progress") {
                return { label: "IN PROGRESS", isDone: false, color: "blue" };
            }
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
            await refetchAssignedInterviews();
        } catch (error) {
            console.error("Error updating interview status to In Progress:", error);
        }
    };

    // Filter interviews based on search and status filter
    const filteredInterviews = assignedInterviews?.interviews
    const totalPages = assignedInterviews?.totalPages;

    // Group interviews by applicationID
    const groupedInterviews = assignedInterviews?.interviews ? Object.values(assignedInterviews.interviews.reduce((acc, interview) => {
        const appId = interview.applicationID?._id;
        if (!appId) return acc;
        if (!acc[appId]) {
            acc[appId] = {
                applicationID: interview.applicationID,
                rounds: []
            };
        }
        acc[appId].rounds.push(interview);
        return acc;
    }, {})).map(group => {
        const getCompareValue = (r) => {
            const d = new Date(r.date);
            const [h, m] = (r.scheduledTime || "00:00").split(':').map(Number);
            d.setHours(h || 0, m || 0, 0, 0);
            return d.getTime();
        };

        // Sort rounds by date and time
        const sortedRounds = [...group.rounds].sort((a, b) => getCompareValue(a) - getCompareValue(b));

        // Find the most relevant round:
        // 1. First upcoming round today
        // 2. Latest rounded today if all today are done
        // 3. First upcoming round in future
        // 4. Fallback to the latest round overall
        const todayRounds = sortedRounds.filter(r => isToday(r.date));
        let upcomingRound;
        if (todayRounds.length > 0) {
            upcomingRound = todayRounds.find(r => !getInterviewRoundStatus(r.date, r.scheduledTime, r).isDone)
                || todayRounds[todayRounds.length - 1];
        } else {
            upcomingRound = sortedRounds.find(r => !getInterviewRoundStatus(r.date, r.scheduledTime, r).isDone)
                || sortedRounds[sortedRounds.length - 1];
        }

        return { ...group, rounds: sortedRounds, upcomingRound };
    }).filter(group => {
        if (filterInterviewType === 'all') return true;
        // Keep group if ANY round matches the selected type
        return group.rounds.some(r => r.interviewerType === filterInterviewType);
    }) : [];

    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];

    // Handle click outside modal to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsEditModalOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Validate form before update
    const validateForm = () => {
        if (!editForm.date) {
            toast.error('Please select interview date');
            return false;
        }
        if (!editForm.time) {
            toast.error('Please select interview time');
            return false;
        }
        if (!editForm.interviewType) {
            toast.error('Please select interview type');
            return false;
        }
        if (editForm.interviewType === 'online' && !editForm.meetingLink) {
            toast.error('Please provide meeting link for online interview');
            return false;
        }
        return true;
    };

    // Fetch interviewers
    useEffect(() => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/interviewers`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Company_id": companyId,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setInterviewers(data);
            } catch (error) {
                console.error("Error fetching interviewers:", error.message);
                // setInterviewers( data );
            }
        };

        fetchInterviewers();
    }, [companyId]);

    console.log("interviewers", interviewers)

    // Handle Pagination
    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    // Handle updating interview details
    const handleUpdateInterview = async () => {
        if (!detailedInterview?._id) {
            toast.error("Interview details not found");
            return;
        }

        if (!validateForm()) {
            return; // Stop if validation fails
        }

        const loadingToast = toast.loading("Updating interview details...");

        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/update-interview/${detailedInterview._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        date: editForm.date,
                        scheduledTime: editForm.time,
                        interviewerType: editForm.interviewType,
                        meetingLink: editForm.meetingLink,
                        status: editForm.status || detailedInterview.status,
                        interviewProgressStatus: editForm.interviewProgressStatus,
                        interviewerID: editForm.interviewerID,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update interview");
            }

            await refetchAssignedInterviews(); // Refresh list after update
            toast.dismiss(loadingToast);
            toast.success("Interview updated successfully!");
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating interview:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Error updating interview. Please try again.");
        }
    };

    // Handle deleting an interview
    const handleDeleteInterview = async (id, e) => {
        if (e) e.stopPropagation(); // Prevent card click event

        if (!window.confirm("Are you sure you want to delete this interview assignment? This action cannot be undone.")) {
            return;
        }

        const loadingToast = toast.loading("Deleting interview...");

        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/delete-interview/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete interview");
            }

            await refetchAssignedInterviews();
            toast.dismiss(loadingToast);
            toast.success("Interview deleted successfully!");
            if (isEditModalOpen) setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error deleting interview:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Error deleting interview. Please try again.");
        }
    };

    // Handle clicking on an interview card
    const handleInterviewClick = (interview) => {
        console.log("interviewww", interview)

        setDetailedInterview(interview);
        console.log("interview", interview)
        setEditForm({
            date: interview.date || "",
            time: interview.scheduledTime || "",
            interviewType: interview.interviewerType || "",
            meetingLink: interview.meetingLink || "",
            status: interview.status,
            interviewProgressStatus: interview.interviewProgressStatus || "Upcoming",
            interviewerID: interview.interviewerID || "",
        });
        setIsEditModalOpen(true);
    };

    // Handle "See All Rounds" click
    const handleSeeAllRounds = (applicationId, e) => {
        if (e) e.stopPropagation();
        setSelectedApplicationId(applicationId);
        setIsRoundsModalOpen(true);
    };




    return (
        <div className={`px-4 md:px-8 py-4 w-full min-h-screen overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'
            }`}>
            <BackButtonMobile />
            <div className="max-w-screen-2xl">
                {/* Header Section */}
                <div className={`mb-6 h-auto md:h-[15vh] flex items-center rounded-xl p-3 md:p-6 transition-colors duration-300 ${theme === 'dark' ? ' border border-gray-600 hover:shadow-xl hover:border-purple-500/50' : 'backdrop-blur-xl bg-gray-200 shadow-md'
                    }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-[#9333ea] flex items-center">
                                <div className="p-3 mx-2 bg-[#9333ea]/10 rounded-full">
                                    <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-gray-900 dark:text-white" />
                                </div>
                                Assigned Interviews
                            </h2>
                        </div>

                        {/* Search and Filters */}
                        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto'>
                            {/* Search Bar */}
                            <div className="relative flex-1 lg:flex-initial">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by job, candidate..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full md:w-48 lg:w-64 pl-10 pr-4 py-2 border shadow-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 duration-200 text-sm ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>
                            <div className="flex flex-row gap-3">
                                <div className="relative flex-1 md:flex-none md:w-40 lg:w-44">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className={`w-full appearance-none rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm border transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                                            }`}
                                    >
                                        <option value="all">All Statuses</option>
                                        {statuses?.map(status => (
                                            <option key={status._id} value={status._id}>
                                                {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="relative flex-1 md:flex-none md:w-40 lg:w-44">
                                    <select
                                        value={filterInterviewType}
                                        onChange={(e) => setFilterInterviewType(e.target.value)}
                                        className={`w-full appearance-none rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm border transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                                            }`}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="online">Online</option>
                                        <option value="walkin">Walk-in</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl shadow-sm mb-6">
                    <div className="flex border-b rounded-t-xl">
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'manage'
                                ? `border-b-2 border-purple-500 text-xl ${theme === 'dark' ? 'text-white' : 'text-purple-600'}`
                                : `hover:border-b-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                                }`}
                        >
                            Assigned Interviews
                        </button>

                        {(aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && (
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'ai'
                                    ? `border-b-2 border-purple-500 text-xl ${theme === 'dark' ? 'text-white' : 'text-purple-600'}`
                                    : `hover:border-b-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                                    }`}
                            >
                                AI Selected Interviews
                            </button>
                        )}
                    </div>
                </div>

                {/* Manage Interviews View */}
                {activeTab === 'manage' && (
                    <>
                        {/* Today's Interviews Section */}
                        {groupedInterviews?.some(group => group.rounds.some(interview => isToday(interview.date))) && (
                            <div className="mb-8 relative">
                                {/* Background decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-xl pointer-events-none"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 blur-xl pointer-events-none"></div>

                                {/* Header section with title and controls */}
                                <div className="relative z-10 flex flex-col sm:flex-row justify-start items-start sm:items-center mb-6 gap-4">
                                    <div className={`shadow-sm px-5 py-3 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 backdrop-blur-sm' : ''}`}>
                                        <h2 className={`text-2xl font-bold  bg-clip-text ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Today's Interviews
                                        </h2>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Cards container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedInterviews
                                        .filter(group => group.rounds.some(interview => isToday(interview.date)))
                                        .map((group) => {
                                            const interview = group.rounds[0]; // Use first round for common info
                                            // Determine status colors
                                            const statusColors = {
                                                "Completed": "bg-emerald-500 text-emerald-800 bg-emerald-50",
                                                "Cancelled": "bg-red-500 text-red-800 bg-red-50",
                                                "In Progress": "bg-amber-500 text-amber-800 bg-amber-50",
                                                "Scheduled": "bg-blue-500 text-blue-800 bg-blue-50"
                                            };

                                            const status = interview.status?.applicationStatus || interview.status;
                                            const colorString = statusColors[status] || statusColors[interview.status] || "bg-gray-500 text-gray-800 bg-gray-50";
                                            const [bgColor, textColor, bgLight] = colorString.split(" ");

                                            // Get candidate initial
                                            const initial = interview.applicationID?.candidateID?.userName?.[0] || "?";

                                            return (
                                                <div
                                                    key={group.applicationID._id}
                                                    className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border flex flex-col h-full ${theme === 'dark'
                                                        ? 'bg-gray-800 border-gray-700'
                                                        : 'bg-[#f0f9f9] border-gray-100'
                                                        }`}
                                                >
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        {/* Header with job title and round count */}
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h3 className={`text-lg font-semibold line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                                    {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                                                </h3>
                                                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                    {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold bg-gray-100 text-gray-600`}>
                                                                {group.rounds.length} {group.rounds.length === 1 ? 'Round' : 'Rounds'}
                                                            </span>
                                                        </div>

                                                        {/* Upcoming Enterview inside card */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                {(() => {
                                                                    const { label, isDone, color } = getInterviewRoundStatus(group.upcomingRound?.date, group.upcomingRound?.scheduledTime, group.upcomingRound);
                                                                    const dotColorClass = color === 'green' ? (theme === 'dark' ? 'bg-green-400' : 'bg-green-600 shadow-[0_0_8px_rgba(34,197,94,0.5)]')
                                                                        : color === 'blue' ? (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse')
                                                                            : color === 'red' ? (theme === 'dark' ? 'bg-red-400' : 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]')
                                                                                : (theme === 'dark' ? 'bg-purple-400 animate-pulse' : 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)] animate-pulse');

                                                                    const textColorClass = color === 'green' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                                                                        : color === 'blue' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')
                                                                            : color === 'red' ? (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                                                                                : (theme === 'dark' ? 'text-purple-400' : 'text-purple-600');
                                                                    return (
                                                                        <>
                                                                            <div className={`h-2 w-2 rounded-xl ${dotColorClass}`}></div>
                                                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColorClass}`}>
                                                                                {label}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                            {(() => {
                                                                const round = group.upcomingRound;
                                                                if (!round) return null;
                                                                const roundStatus = round.status?.applicationStatus || round.status;
                                                                const roundStatusId = round.status?._id || round.status;
                                                                const appStatus = statuses?.find(s => s._id === roundStatusId)?.applicationStatus || roundStatus;
                                                                return (
                                                                    <div key={round._id} className={`p-3 rounded-xl border relative group/round bg-gray-200 border-purple-200 shadow-sm transition-all hover:bg-white/80`}>
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <div className="flex gap-2">
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(round.status)}`}>
                                                                                    {capitalizeFirstLetter(appStatus)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleInterviewClick(round)} className="p-1 rounded hover:bg-gray-200 text-gray-600">
                                                                                    <PenTool className="h-5 w-5" />
                                                                                </button>
                                                                                {(userRole === 'admin' || userRole === 'hiring_manager') && (
                                                                                    <button onClick={(e) => handleDeleteInterview(round._id, e)} className="p-1 rounded hover:bg-red-50 text-red-500">
                                                                                        <Trash2 className="h-5 w-5" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-[11px] text-black mb-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span className="font-semibold">{isToday(round.date) ? 'Today' : formatDate(round.date)} at : <span className={`px-2 py-0.5 rounded-xl font-bold ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'}`}>{round.scheduledTime}</span></span>
                                                                        </div>
                                                                        <div className="text-[11px] text-black mb-2">
                                                                            <span className="font-semibold">Interviewer:</span>{" "}
                                                                            {round?.interviewerID?.userName || "N/A"}
                                                                        </div>

                                                                        {/* Meeting Link for Online Interviews */}
                                                                        {round.interviewerType === 'online' && round.meetingLink && !getInterviewRoundStatus(round.date, round.scheduledTime, round).isDone && (
                                                                            <div className="mt-2 pt-2 border-t border-purple-100">
                                                                                {(isMeetingLinkActive(round.date, round.scheduledTime) || userRole === 'admin') ? (
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <button
                                                                                            onClick={() => handleJoinMeeting(round._id, round.meetingLink)}
                                                                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:text-purple-700 underline"
                                                                                        >
                                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                                            </svg>
                                                                                            Join Meeting Now
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        {isMeetingExpired(round.date, round.scheduledTime) ? (
                                                                                            <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                                                                                                <Clock className="w-3 h-3" />
                                                                                                Link expired
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-medium">
                                                                                                <Clock className="w-3 h-3" />
                                                                                                Link will be active 5 mins before
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className={`relative z-10 flex justify-between items-center px-4 py-3 gap-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                                        <button
                                                            onClick={(e) => handleSeeAllRounds(interview?.applicationID?._id, e)}
                                                            className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
                                                        >
                                                            See All Rounds
                                                        </button>
                                                        <button
                                                            onClick={() => handleInterviewClick(interview)}
                                                            className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                                                        >
                                                            Details
                                                            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* Empty state */}
                                {filteredInterviews?.filter(interview => isToday(interview.date)).length === 0 && (
                                    <div className="bg-white rounded-2xl shadow p-8 text-center">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Your schedule is clear today</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">No interviews are scheduled for today. Would you like to set up a new interview?</p>
                                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg transition-all duration-200 font-medium inline-flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                            </svg>
                                            Schedule New Interview
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* All Other Interviews */}
                        {/* <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>All Assigned Interviews</h2> */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error! </strong>
                                <span className="block sm:inline">{error.message || "Failed to load interviews"}</span>
                            </div>
                        ) : filteredInterviews?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="bg-gray-100 p-5 rounded-full mb-4">
                                    <Briefcase className="h-12 w-12 text-gray-400" />
                                </div>
                                <div className="text-center animate-fade-in transition-all duration-500">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight leading-snug">
                                        No Interviews Found
                                    </h3>
                                    <p className="text-md text-gray-600 max-w-md mx-auto leading-relaxed">
                                        We're currently in the process of assigning interviewers.
                                        <br className="hidden sm:block" />
                                        <span className="text-blue-500 font-medium">Please wait</span> while your interview schedule is being prepared.
                                    </p>
                                </div>
                            </div>
                        ) : groupedInterviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className={`p-5 rounded-full mb-4 ${filterInterviewType === 'walkin' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                    <Briefcase className={`h-12 w-12 ${filterInterviewType === 'walkin' ? 'text-amber-400' : 'text-blue-400'}`} />
                                </div>
                                <div className="text-center animate-fade-in transition-all duration-500">
                                    <h3 className={`text-2xl font-bold mb-3 tracking-tight leading-snug ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        No {filterInterviewType === 'walkin' ? 'Walk-in' : filterInterviewType === 'online' ? 'Online' : ''} Assigned Interviews
                                    </h3>
                                    <p className={`text-md max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        There are currently no <span className="font-semibold">{filterInterviewType === 'walkin' ? 'walk-in' : 'online'}</span> interviews assigned to you.
                                        <br className="hidden sm:block" />
                                        Try switching to <span className={`font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>All Types</span> to see all interviews.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedInterviews
                                    .filter(group => !group.rounds.some(interview => isToday(interview.date)))
                                    .map((group) => {
                                        const interview = group.rounds[0];
                                        const round = group.upcomingRound;
                                        if (!round) return null;
                                        const appStatus = statuses?.find(s => s._id === round.status)?.applicationStatus || round.status;

                                        return (
                                            <div
                                                key={group.applicationID._id}
                                                className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border flex flex-col h-full ${theme === 'dark'
                                                    ? 'bg-gray-800 border-gray-700'
                                                    : 'bg-white border-gray-100'
                                                    }`}
                                            >
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className={`text-lg font-semibold line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                                {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                                            </h3>
                                                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Applicant: {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold bg-gray-100 text-gray-600`}>
                                                            {group.rounds.length} {group.rounds.length === 1 ? 'Round' : 'Rounds'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const { label, isDone, color } = getInterviewRoundStatus(round?.date, round?.scheduledTime, round);
                                                                const dotColorClass = color === 'green' ? (theme === 'dark' ? 'bg-green-400' : 'bg-green-600 shadow-[0_0_8px_rgba(34,197,94,0.5)]')
                                                                    : color === 'blue' ? (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse')
                                                                        : color === 'red' ? (theme === 'dark' ? 'bg-red-400' : 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]')
                                                                            : (theme === 'dark' ? 'bg-purple-400 animate-pulse' : 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)] animate-pulse');

                                                                const textColorClass = color === 'green' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                                                                    : color === 'blue' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')
                                                                        : color === 'red' ? (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                                                                            : (theme === 'dark' ? 'text-purple-400' : 'text-purple-600');
                                                                return (
                                                                    <>
                                                                        <div className={`h-2 w-2 rounded-xl ${dotColorClass}`}></div>
                                                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColorClass}`}>
                                                                            {label}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>

                                                        <div className={`p-3 rounded-xl border relative group/round ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-purple-200 shadow-sm'} transition-all hover:bg-white/80`}>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex gap-2">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(round.status)}`}>
                                                                        {capitalizeFirstLetter(appStatus)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleInterviewClick(round)} className="p-1 rounded hover:bg-gray-200 text-gray-500">
                                                                        <PenTool className="h-5 w-5" />
                                                                    </button>
                                                                    {(userRole === 'admin' || userRole === 'hiring_manager') && (
                                                                        <button onClick={(e) => handleDeleteInterview(round._id, e)} className="p-1 rounded hover:bg-red-50 text-red-400">
                                                                            <Trash2 className="h-5 w-5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span>{formatDate(round.date)} at <span className={`px-2 py-0.5 rounded-md font-bold ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-700'}`}>{round.scheduledTime}</span></span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    Type: {capitalizeFirstLetter(round.interviewerType)} Interview
                                                                </div>

                                                                {/* Meeting Link for Online Interviews */}
                                                                {round.interviewerType === 'online' && round.meetingLink && (
                                                                    <div className="mt-2 pt-2 border-t border-purple-100">
                                                                        {isMeetingLinkActive(round.date, round.scheduledTime) ? (
                                                                            <a
                                                                                href={round.meetingLink}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 underline"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                                </svg>
                                                                                Join Meeting Now
                                                                            </a>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-medium">
                                                                                <Clock className="w-3 h-3" />
                                                                                Link will be active 5 mins before
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Shared Countdown Logic */}
                                                                {(() => {
                                                                    const timeLeft = getTimeLeft(round?.date, round?.scheduledTime);
                                                                    if (!timeLeft) return null;
                                                                    return (
                                                                        <div className="mt-2 text-[10px] text-gray-400 font-medium">
                                                                            Interview starts in {timeLeft}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className={`relative z-10 flex justify-between items-center px-4 py-3 gap-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                                    <button
                                                        onClick={(e) => handleSeeAllRounds(interview?.applicationID?._id, e)}
                                                        className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
                                                    >
                                                        See All Rounds
                                                    </button>
                                                    <button
                                                        onClick={() => handleInterviewClick(interview)}
                                                        className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                                                    >
                                                        View Details
                                                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </>
                )
                }

                {
                    (activeTab === 'manage' || activeTab === 'ai') && (
                        <>

                            {/* Interview Details Modal */}
                            {isEditModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">

                                    <div
                                        ref={modalRef}
                                        className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'
                                            }`}
                                    >
                                        {/* Modal Header */}
                                        <div className={`sticky top-0 z-10 border rounded-t-xl px-6 py-4 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200 shadow-md'
                                            }`}>
                                            <h2 className="text-xl font-bold dark:text-white text-gray-800">Update Interview Details</h2>
                                            <button
                                                onClick={() => setIsEditModalOpen(false)}
                                                className="text-red-500 hover:text-black focus:outline-none p-1 rounded-full hover:bg-gray-300"
                                                aria-label="Close"
                                            >
                                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                        </div>

                                        <div className={`p-5 rounded-xl m-6 mt-4 mb-6 border ${theme === 'dark' ? 'bg-white/10 border-gray-600' : 'bg-gray-200 border-gray-200 shadow-md'
                                            }`}>
                                            <h3 className={`font-semibold text-lg mb-3 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Application Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>JOB TITLE</p>
                                                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{capitalizeFirstLetter(detailedInterview?.applicationID?.jobID?.title) || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>APPLICANT</p>
                                                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{capitalizeFirstLetter(detailedInterview?.applicationID?.candidateID?.userName) || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>STATUS</p>
                                                    <span className={`font-medium ${getStatusColor(detailedInterview?.status)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs`}>
                                                        {(() => {
                                                            const statusId = detailedInterview?.status?._id || detailedInterview?.status;
                                                            const statusObj = statuses?.find(s => s._id === statusId);
                                                            const statusName = statusObj?.applicationStatus || detailedInterview?.status?.applicationStatus || detailedInterview?.status;
                                                            return capitalizeFirstLetter(statusName) || "N/A";
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Date</label>
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                        className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                            }`}
                                                        min={new Date().toISOString()?.split('T')[0]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Time</label>
                                                    <input
                                                        type="time"
                                                        value={editForm.time}
                                                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                                        className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Type</label>
                                                <select
                                                    value={editForm.interviewType}
                                                    onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                                                    className={`sm:w-full w-32 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select Interview Type</option>
                                                    {interviewTypes?.map((type) => (
                                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {editForm.interviewType === 'online' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Link</label>
                                                        {(isMeetingLinkActive(editForm.date, editForm.time) || userRole === 'admin') ? (
                                                            <input
                                                                type="text"
                                                                value={editForm.meetingLink}
                                                                onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                                                placeholder="Enter meeting link (e.g., Google Meet, Zoom)"
                                                                className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                                                                    }`}
                                                            />
                                                        ) : (
                                                            <div>
                                                                {isMeetingExpired(editForm.date, editForm.time) ? (
                                                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                                                                        <Clock className="w-4 h-4" />
                                                                        Link expired
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        Meeting link will be visible 5 minutes before the scheduled time.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {editForm.meetingLink && (isMeetingLinkActive(editForm.date, editForm.time) || userRole === 'admin') && (
                                                        <div>
                                                            <button
                                                                onClick={() => handleJoinMeeting(detailedInterview._id, editForm.meetingLink)}
                                                                className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 underline p-2 bg-purple-50 rounded-lg w-full"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                Join Meeting Now
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Manual progress status – only for walk-in interviews */}
                                            {editForm.interviewType === 'walkin' && (
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Progress Status</label>
                                                    <select
                                                        value={editForm.interviewProgressStatus}
                                                        onChange={(e) => setEditForm({ ...editForm, interviewProgressStatus: e.target.value })}
                                                        className={`sm:w-full w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                            }`}
                                                    >
                                                        <option value="Upcoming">Upcoming Interview</option>
                                                        <option value="Completed">Interview Complete</option>
                                                        <option value="Missed">Interview Missed</option>
                                                        <option value="Pending">Interview Pending</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Update Application Status</label>
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                    className={`sm:w-full w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                        }`}
                                                >
                                                    {statuses?.map((status) => (
                                                        <option key={status._id} value={status._id}>
                                                            {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {editForm.interviewerID
                                                        ? `Assigned Interviewer: ${interviewers.find(i => i._id === editForm?.interviewerID?._id)?.userName || "Not Found"}`
                                                        : "Assign Interviewer"}
                                                </label>
                                                <select
                                                    className={`sm:w-full w-32 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                                        }`}
                                                    value={editForm?.interviewerID?._id || ""}
                                                    onChange={(e) => setEditForm({ ...editForm, interviewerID: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Interviewer</option>
                                                    {interviewers?.map((interviewer) => (
                                                        <option key={interviewer._id} value={interviewer._id}>{interviewer.userName}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Notes (Optional)</label>
                                                <textarea
                                                    className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                                                        }`}
                                                    rows="3"
                                                    placeholder="Add any additional notes about this interview..."
                                                ></textarea>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className={`sticky bottom-0 z-10 border-t px-6 py-4 flex justify-end gap-3 mt-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                                <button
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className={`px-6 py-2 rounded-xl font-medium transition-all ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateInterview}
                                                    className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5"
                                                >
                                                    Update Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* See All Rounds Modal */}
                            {isRoundsModalOpen && selectedApplicationId && (
                                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                                    <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                        {/* Modal Header per screenshot */}
                                        <div className="p-8 pb-4 flex items-start gap-5">
                                            {(() => {
                                                const rounds = assignedInterviews?.interviews?.filter(i => i.applicationID?._id === selectedApplicationId) || [];
                                                const first = rounds[0];
                                                const initial = first?.applicationID?.candidateID?.userName?.[0] || "?";
                                                return (
                                                    <>
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${theme === 'dark' ? 'bg-purple-900/40 text-purple-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                            {capitalizeFirstLetter(initial)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                {capitalizeFirstLetter(first?.applicationID?.jobID?.title) || "N/A"}
                                                            </h2>
                                                            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {capitalizeFirstLetter(first?.applicationID?.candidateID?.userName) || "N/A"}
                                                            </p>
                                                        </div>
                                                        <button onClick={() => setIsRoundsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* Subheader */}
                                        <div className="px-8 mb-4 flex justify-between items-center">
                                            <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Scheduled Rounds</h3>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                                {assignedInterviews?.interviews?.filter(i => i.applicationID?._id === selectedApplicationId).length} Rounds
                                            </span>
                                        </div>

                                        {/* Scrollable Rounds List */}
                                        <div className="px-8 pb-8 overflow-y-auto space-y-4">
                                            {assignedInterviews?.interviews
                                                ?.filter(i => i.applicationID?._id === selectedApplicationId)
                                                .sort((a, b) => {
                                                    const getCompareValue = (r) => {
                                                        const d = new Date(r.date);
                                                        const [h, m] = (r.scheduledTime || "00:00").split(':').map(Number);
                                                        d.setHours(h || 0, m || 0, 0, 0);
                                                        return d.getTime();
                                                    };
                                                    return getCompareValue(a) - getCompareValue(b);
                                                })
                                                .map((round) => {
                                                    const appStatus = statuses?.find(s => s._id === round.status)?.applicationStatus || round.status;
                                                    const roundStatus = getInterviewRoundStatus(round.date, round.scheduledTime, round);
                                                    return (
                                                        <div key={round._id} className={`p-5 rounded-2xl border transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 hover:border-purple-500/30' : 'bg-[#f8fafc] border-gray-100 hover:border-indigo-100'}`}>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${roundStatus.color === 'green' ? (theme === 'dark' ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700') : roundStatus.color === 'blue' ? (theme === 'dark' ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700') : roundStatus.color === 'red' ? (theme === 'dark' ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700') : (theme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700')}`}>
                                                                        {roundStatus.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex gap-2">
                                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(round.status)}`}>
                                                                        {capitalizeFirstLetter(statuses?.find(s => s._id === round.status)?.applicationStatus || round.status)}
                                                                    </span>
                                                                    {round.interviewProgressStatus !== 'Upcoming' && (
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(round.interviewProgressStatus)}`}>
                                                                            {capitalizeFirstLetter(round.interviewProgressStatus)}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex gap-2">

                                                                    {(userRole === 'admin' || userRole === 'hiring_manager') && (
                                                                        <button
                                                                            onClick={(e) => handleDeleteInterview(round._id, e)}
                                                                            className={`p-2 rounded-lg border transition-all ${theme === 'dark' ? 'border-gray-700 text-red-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-red-500 hover:shadow-md'}`}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {formatDate(round.date)} at <span className={`px-2 py-0.5 rounded-md font-bold ${theme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>{round.scheduledTime}</span>
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>T</div>
                                                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{capitalizeFirstLetter(round.interviewerType)} Interview</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>I</div>
                                                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Interviewer: {round?.interviewerID?.userName || "N/A"}</span>
                                                                </div>

                                                                {/* Meeting Link for Online Interviews */}
                                                                {round.interviewerType === 'online' && round.meetingLink && !getInterviewRoundStatus(round.date, round.scheduledTime, round).isDone && (
                                                                    <div className="mt-3 pt-3 border-t border-purple-100/50">
                                                                        {isMeetingLinkActive(round.date, round.scheduledTime) ? (
                                                                            <div className="flex flex-col gap-1">
                                                                                <button
                                                                                    onClick={() => handleJoinMeeting(round._id, round.meetingLink)}
                                                                                    className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 underline"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                    Join Meeting Now
                                                                                </button>
                                                                                {getTimeLeft(round.date, round.scheduledTime) && (
                                                                                    <div className="text-[11px] text-purple-600 font-bold">
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
                                                                                    <div className="text-[10px] text-gray-400 font-bold ml-6">
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
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {
                                (aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && activeTab === 'ai' && (
                                    <AiGeneratedInterviews />
                                )
                            }

                            {filteredInterviews && filteredInterviews?.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-100 mt-4">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={page === 1}
                                            className={`px-4 py-2 rounded-xl text-white ${page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400 hover:text-black"}`}
                                        >
                                            Previous
                                        </button>
                                        <div className="hidden sm:flex items-center space-x-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPage(i + 1)}
                                                    className={`px-3.5 py-2 text-sm rounded-md ${page === i + 1
                                                        ? 'bg-gray-700 text-white cursor-not-allowed rounded-xl'
                                                        : 'bg-gray-300 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <span className="sm:hidden text-sm text-gray-600">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={page >= totalPages}
                                            className={`px-4 py-2 rounded-xl text-white ${page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400 hover:text-black"}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )
                }

            </div >
        </div >
    );
};

export default AssignedInterviews;

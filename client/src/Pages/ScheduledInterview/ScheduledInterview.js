import React, { useState, useEffect, useRef } from 'react';

import { Briefcase, ChevronLeft, ChevronRight, Filter, Search, X, Clock } from 'lucide-react';
import axios from 'axios';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

import useScheduledInterview from '../../hooks/useScheduledInterview';
import BackButtonMobile from '../../components/Mob-back-btn';
import { useTheme } from '../../context/ThemeContext';

export const ScheduledInterview = () => {
    const { theme: currentTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('scheduled');
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const companyUserName = localStorage.getItem("companyUserName");
    const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(localStorage.getItem(`ai_features_${companyUserName}`) === 'true');

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

    const mockedAiInterviews = [
        {
            _id: 'ai-int-1',
            date: new Date().toISOString(),
            scheduledTime: '10:00 AM',
            interviewerType: 'online',
            status: 'Scheduled',
            interviewerID: { userName: 'AI Assistant' },
            applicationID: {
                candidateID: { userName: 'John Doe (AI Simulation)' },
                jobID: { title: 'Senior Software Engineer' },
                resume: "mock-resume-path"
            },
            meetingLink: "https://meet.google.com/ai-mock-1",
            feedbackTitle: "Excellent",
            roundName: "Technical Round"
        },
        {
            _id: 'ai-int-2',
            date: new Date().toISOString(),
            scheduledTime: '11:30 AM',
            interviewerType: 'walkin',
            status: 'In Progress',
            interviewerID: { userName: 'AI Recruiter' },
            applicationID: {
                candidateID: { userName: 'Jane Smith (AI Simulation)' },
                jobID: { title: 'UX Designer' },
                resume: "mock-resume-path"
            },
            meetingLink: "",
            feedbackTitle: "Good",
            roundName: "HR Round"
        },
        {
            _id: 'ai-int-3',
            date: new Date(Date.now() + 86400000).toISOString(),
            scheduledTime: '02:00 PM',
            interviewerType: 'online',
            status: 'Scheduled',
            interviewerID: { userName: 'AI Evaluator' },
            applicationID: {
                candidateID: { userName: 'Mike Brown (AI Simulation)' },
                jobID: { title: 'Product Manager' },
                resume: "mock-resume-path"
            },
            meetingLink: "https://zoom.us/ai-mock-3",
            feedbackTitle: "Above Average",
            roundName: "Manager Round"
        },
        {
            _id: 'ai-int-4',
            date: new Date(Date.now() + 86400000).toISOString(),
            scheduledTime: '04:15 PM',
            interviewerType: 'walkin',
            status: 'Completed',
            interviewerID: { userName: 'AI System' },
            applicationID: {
                candidateID: { userName: 'Sarah Wilson (AI Simulation)' },
                jobID: { title: 'Marketing Lead' },
                resume: "mock-resume-path"
            },
            meetingLink: "",
            feedbackTitle: "Very Good",
            roundName: "Initial Screening"
        }
    ];
    const companyId = JSON.parse(localStorage.getItem("user"))?.company_id;
    const storedUser = localStorage.getItem("user");
    const interviewer = storedUser ? JSON.parse(storedUser) : null;
    const interviewerID = interviewer?._id || "";
    const isAdmin = interviewer?.role === 'admin' || interviewer?.isAdmin; // Check if user is admin
    // Filter states
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRound, setFilterRound] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [statuses, setStatuses] = useState([]);
    const [selectedInterviewerId, setSelectedInterviewerId] = useState(isAdmin ? "admin" : interviewerID);
    console.log("selectedInterviewerId", selectedInterviewerId)


    // ✅ Correctly using the custom hook inside the component
    const {
        assignedInterviews,
        error,
        isLoading,
        refetchScheduledInterviews
    } = useScheduledInterview({
        page,
        limit,
        searchTerm,
        filterStatus,
        filterRound,
        interviewerID: selectedInterviewerId,
    });

    const [interviewers, setInterviewers] = useState([]);
    const [detailedInterview, setDetailedInterview] = useState(null);
    const [editForm, setEditForm] = useState({
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewerID: "",
        reasonRescheduled: "",
        company_id: "",
        starRating: "",
    });
    console.log("assignedInterviewseeeeeee", assignedInterviews)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [feedbackForm, setFeedbackForm] = useState({
        feedbackTitle: "",
        feedback: "",
        starRating: "",
    });


    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];
    const feedbackTitles = [
        "Poor",
        "Below Average",
        "Average",
        "Above Average",
        "Good",
        "Very Good",
        "Excellent",
        "Above Expectation"
    ];
    // Check if any filters are active
    const hasActiveFilters = searchTerm || filterStatus || filterRound;

    // Fetch statuses from the API
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`, {
            headers: {
                "company_id": companyId
            }
        })
            .then(response => response.json())
            .then(data => setStatuses(data.applicationStatuses))
            .catch(error => console.error("Error fetching statuses:", error));
    }, [companyId]);

    // Handle click outside modal to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsEditModalOpen(false);
                setIsFeedbackModalOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch interviewers
    useEffect(() => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/interviewers`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "company_id": companyId // Adding company_id to the request headers
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setInterviewers(data);
            } catch (error) {
                console.error('Error fetching interviewers:', error.message);
            }
        };

        fetchInterviewers();
    }, [companyId]);


    // Handle interviewer filter change
    const handleInterviewerFilterChange = (interviewerId) => {
        setSelectedInterviewerId(interviewerId);
        setPage(1); // Reset to first page when filter changes
    };

    const handleEdit = (interview) => {
        setDetailedInterview(interview);
        setEditForm({
            date: interview.date || "",
            time: interview.scheduledTime || "",
            interviewType: interview.interviewerType || "",
            meetingLink: interview.meetingLink || "",
            status: interview.status || "",
            interviewerID: interview.interviewerID?._id || interview.interviewerID || "",
            reasonRescheduled: interview.reasonRescheduled || "",
        });
        setIsEditModalOpen(true);
    };

    useEffect(() => {
        const fetchInterviewRounds = async () => {
            try {
                const companyId = JSON.parse(localStorage.getItem("user"))?.company_id;
                const res = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/interviews/all-interviews?page=1&limit=100&searchTerm=`,
                    {
                        headers: { company_id: companyId },
                    }
                );
                // Assuming API returns { interviews: [ { roundName: "Round 1" }, ... ] }
                // Extract distinct roundNames
                const rounds = res.data?.interviews;
                console.log("rounds", rounds)
                // Remove duplicates
                setInterviewRounds(rounds);
            } catch (error) {
                console.error("Failed to fetch interview rounds", error);
            }
        };

        fetchInterviewRounds();
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
        if (editForm.status === 'rescheduled' && !editForm.reasonRescheduled) {
            toast.error('Please provide a reason for rescheduling interview');
            return false;
        }
        return true;
    };

    // Handle updating interview details
    const handleUpdate = async () => {
        if (!detailedInterview?._id) {
            toast.error("Interview details not found");
            return;
        }
        console.log("detailedInterview", detailedInterview)


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
                        "company_id": companyId,  // Add company_id here
                    },
                    body: JSON.stringify({
                        date: editForm.date,
                        scheduledTime: editForm.time,
                        interviewerType: editForm.interviewType,
                        meetingLink: editForm.meetingLink,
                        status: editForm.status,
                        interviewerID: editForm.interviewerID,
                        reasonRescheduled: editForm.reasonRescheduled,
                        starRating: feedbackForm.starRating,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update interview");
            }

            await refetchScheduledInterviews(); // Refresh list after update
            toast.dismiss(loadingToast);
            toast.success("Interview updated successfully!");
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating interview:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Error updating interview. Please try again.");
        }
    };

    const handleFeedbackClick = async (selectedInterview) => {
        setDetailedInterview(selectedInterview);
        console.log("selectedInterview", selectedInterview)

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/interviewerfeedback/get-feedback/${selectedInterview._id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch feedback");
            }

            const feedbackData = await response.json();

            setFeedbackForm({
                _id: feedbackData?._id || selectedInterview?._id || "",
                feedbackTitle: feedbackData?.feedbackTitle || selectedInterview?.feedbackTitle || "",
                feedback: feedbackData?.feedback || selectedInterview?.feedback || "",
                starRating: feedbackData?.starRating || selectedInterview?.starRating,
            });

        } catch (error) {
            console.error("Error fetching feedback:", error);
            // toast.error( "Error fetching feedback details" );

            // If fetching feedback fails, set the initial data from the interview
            setFeedbackForm({
                feedbackTitle: selectedInterview?.feedbackTitle || "",
                feedback: selectedInterview?.feedback || "",
            });
        }

        setIsFeedbackModalOpen(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            rescheduled: "bg-yellow-100 text-yellow-800"
        };
        return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    const handleFeedbackSubmit = async () => {
        if (!detailedInterview?._id) {
            toast.error("Interview details not found");
            return;
        }

        const loadingToast = toast.loading("Submitting feedback...");

        try {
            const isUpdate = feedbackForm?._id;
            const url = isUpdate
                ? `${process.env.REACT_APP_BASE_URL}/interviewerfeedback/update-feedback/${feedbackForm._id}`
                : `${process.env.REACT_APP_BASE_URL}/interviewerfeedback/create-feedback`;

            const formData = {
                feedbackTitle: feedbackForm.feedbackTitle,
                feedback: feedbackForm.feedback,
                starRating: feedbackForm.starRating,
                interviewId: detailedInterview._id,
                applicationID: detailedInterview.applicationID._id,
            };

            const response = await fetch(url, {
                method: isUpdate ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_id": companyId,
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            console.log("API Response:", responseData);

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to submit feedback");
            }

            await refetchScheduledInterviews();
            toast.dismiss(loadingToast);
            toast.success(`Feedback ${isUpdate ? "updated" : "submitted"} successfully!`);
            setIsFeedbackModalOpen(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Error submitting feedback. Please try again.");
        }
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

    // Handle Pagination
    const handleNextPage = () => {
        if (page < (assignedInterviews?.totalPages || 1)) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return "N/A";
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    };

    const handleResumeView = (resumeUrl) => {
        if (!resumeUrl) {
            toast.error("Resume not available");
            return;
        }

        // If it's a full URL, open directly
        if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
            window.open(resumeUrl, '_blank', 'noopener,noreferrer');
        }
        // If it's a relative path, construct the full URL
        else {
            const fullUrl = `${process.env.REACT_APP_BASE_URL}/${resumeUrl}`;
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="px-8 py-10 w-full min-h-screen bg-white dark:bg-black transition-colors duration-300"
        >
            <BackButtonMobile />
            <div className='mb-6 h-auto min-h-[80px] md:h-[15vh] flex items-center rounded-xl p-3 sm:p-4 backdrop-blur-xl dark:bg-black/10  bg-gray-200 border border-white/20 shadow-md'>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3 sm:gap-4">
                    {/* Title Section */}
                    <div className="flex items-center w-full md:w-auto">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#9333ea] flex items-center">
                            <div className="p-3 mx-2 bg-[#9333ea]/10 rounded-full">

                                <Briefcase className=" h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
                            </div>
                            {isAdmin ? "All Scheduled Interviews" : "My Scheduled Interviews"}
                        </h1>
                    </div>

                    {/* Filter/Search Section */}
                    <div className="w-full md:w-auto bg-transparent rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Admin Filter Section */}
                        {isAdmin && (
                            <div className="w-36 sm:w-auto bg-transparent rounded-xl flex items-center justify-center ">
                                <div className="w-full sm:min-w-[200px]">
                                    <select
                                        value={selectedInterviewerId}
                                        onChange={(e) => handleInterviewerFilterChange(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:border-gray-400 transition-colors h-[40px] sm:h-auto"
                                    >
                                        <option value="admin">All Scheduled Interviews</option>
                                        {interviewers.map((interviewer) => (
                                            <option key={interviewer._id} value={interviewer._id}>
                                                {capitalizeFirstLetter(interviewer.userName || interviewer.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="w-full sm:w-[30vw]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search by candidate name, job title, or round..."
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[40px] sm:h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Enhanced Filter Button (Mobile Optimized) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-gray-700 text-white border border-blue-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Filter className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="hidden sm:inline text-sm whitespace-nowrap">
                                Filters
                            </span>
                            {hasActiveFilters && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] flex items-center justify-center flex-shrink-0">
                                    {[searchTerm, filterStatus, filterRound].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl shadow-sm mt-6 mb-4">
                <div className="flex border-b rounded-t-xl">
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'scheduled'
                            ? `border-b-2 border-purple-500 text-xl text-purple-600 dark:text-white`
                            : `hover:border-b-2 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500`
                            }`}
                    >
                        Scheduled Interviews
                    </button>
                    {(aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && (
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'ai'
                                ? `border-b-2 border-purple-500 text-xl text-purple-600 dark:text-white`
                                : `hover:border-b-2 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500`
                                }`}
                        >
                            AI Scheduled Interviews
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'scheduled' && (
                <>
                    {/* Search and Filter Section */}
                    <div className="bg-transparent rounded-xl pb-5">
                        {/* Expandable Filters */}
                        {showFilters && (
                            <div>
                                <div className="  grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2
  gap-4 pt-1
  border-t border-gray-200 dark:border-gray-700
  w-full lg:w-[50vw] mx-auto
">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-[35vw] sm:w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                        >
                                            <option value="">All Statuses</option>
                                            {statuses.map((status) => (
                                                <option key={status._id} value={status._id}>
                                                    {capitalizeFirstLetter(status.applicationStatus)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Round Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Round</label>
                                        <select
                                            value={filterRound}
                                            onChange={(e) => {
                                                setFilterRound(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-[35vw] sm:w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                        >
                                            <option value="">All Rounds</option>
                                            {interviewRounds.map((round) => (
                                                <option key={round._id} value={round._id}>
                                                    {round.roundName || 'Unknown Round'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                {/* Reset Filters Button - Only shown when filters are active */}
                                {hasActiveFilters && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setFilterStatus("");
                                                setFilterRound("");
                                                setPage(1);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            Reset All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            <span className="block sm:inline">{error.message || "Failed to load interviews"}</span>
                        </div>
                    ) : (isAdmin && !selectedInterviewerId) || assignedInterviews?.interviews?.length === 0 ? (
                        <div className="text-center animate-fade-in transition-all duration-500 py-16">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight leading-snug">
                                🕒 No Interviews Found
                            </h3>
                            <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                {isAdmin && !selectedInterviewerId
                                    ? "Please select an interviewer to view their scheduled interviews."
                                    : "We're currently in the process of assigning interviewers."}
                                <br className="hidden sm:block" />
                                <span className="text-blue-500 font-medium">
                                    {isAdmin && !selectedInterviewerId
                                        ? "Choose an interviewer from the dropdown above."
                                        : "Please wait while your interview schedule is being prepared."}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-t-xl shadow backdrop-blur-xl bg-white/10 border border-white/20">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-200 dark:bg-white/10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Candidate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Resume</th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Interviewer</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Meet Link</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Round</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-gray-100 dark:bg-[#1a1a1a] dark:divide-gray-700">
                                    {assignedInterviews?.interviews?.map((interview) => (
                                        <tr key={interview?._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                                                {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words max-w-xs">
                                                {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-sm whitespace-normal break-words max-w-xs">
                                                {interview?.applicationID?.resume ? (
                                                    <button
                                                        onClick={() => handleResumeView(interview.applicationID.resume)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors duration-200 break-words"
                                                    >
                                                        Open Resume
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">No Resume</span>
                                                )}
                                            </td>

                                            {isAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{capitalizeFirstLetter(interview?.interviewerID?.userName) || "N/A"}</td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words max-w-xs">
                                                {formatDate(interview.date)}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{interview.scheduledTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                                                    {statuses?.length && statuses?.filter(status => status._id === interview?.status)[0]?.applicationStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-normal break-words max-w-xs">
                                                {interview?.meetingLink ? (
                                                    <a
                                                        href={interview.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors duration-200 underline break-words"
                                                    >
                                                        Join Meeting
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">Walk In</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleFeedbackClick(interview)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                                                >
                                                    {interview?.feedbackTitle || "Add Feedback"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                <button
                                                    onClick={() => handleEdit(interview)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {interviewRounds?.length && interviewRounds?.filter(round => round._id === interview?.roundID)[0]?.roundName || "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {assignedInterviews?.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 1}
                                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${page === 1
                                    ? 'bg-gray-400 dark:bg-gray-700 text-white dark:text-gray-500 cursor-not-allowed rounded-xl'
                                    : 'bg-gray-700 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-white hover:bg-gray-400 dark:hover:bg-gray-700 rounded-xl'
                                    }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                <span className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-full font-medium">{page}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">of {assignedInterviews?.totalPages}</span>
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= assignedInterviews?.totalPages}
                                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${page === assignedInterviews?.totalPages
                                    ? 'bg-gray-400 dark:bg-gray-700 text-white dark:text-gray-500 cursor-not-allowed rounded-xl'
                                    : 'bg-gray-700 dark:bg-gray-800 text-white hover:bg-gray-400 dark:hover:bg-gray-700 rounded-xl'
                                    }`}
                            >
                                <ChevronRight className="ml-1 h-4 w-4" />
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* AI Generated Interviews Tab */}
            {(aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && activeTab === 'ai' && (
                <div className="overflow-x-auto rounded-t-xl shadow backdrop-blur-xl bg-white/10 border border-white/20 mt-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-200 dark:bg-white/10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Resume</th>
                                {isAdmin && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Interviewer</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Meet Link</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Round</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-gray-100 dark:bg-[#1a1a1a] dark:divide-gray-700">
                            {mockedAiInterviews.map((interview) => (
                                <tr key={interview._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                                        {interview.applicationID.jobID.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words max-w-xs">
                                        {interview.applicationID.candidateID.userName}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-normal break-words max-w-xs">
                                        <button
                                            onClick={() => toast.info("AI Resume View (Mocked)")}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                                        >
                                            Open Resume
                                        </button>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {interview.interviewerID.userName}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words max-w-xs">
                                        {formatDate(interview.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {interview.scheduledTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-normal break-words max-w-xs">
                                        {interview.meetingLink ? (
                                            <button
                                                onClick={() => toast.info(`AI Meeting: ${interview.meetingLink}`)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors duration-200 underline"
                                            >
                                                Join Meeting
                                            </button>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">Walk In</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => toast.info("AI Feedback (Mocked)")}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                                        >
                                            {interview.feedbackTitle || "Add Feedback"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <button
                                            onClick={() => toast.info("AI Edit (Mocked)")}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {interview.roundName}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
                    <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[97vh] overflow-hidden shadow-2xl transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-xl">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h2 className="text-xl text-white font-bold">Edit Interview Details</h2>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-white hover:bg-gray-600 rounded-full p-2 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
                            {/* Application Details Card */}
                            <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-xl mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Application Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Job Title</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">{capitalizeFirstLetter(detailedInterview?.applicationID?.jobID?.title) || "N/A"}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Applicant</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">{capitalizeFirstLetter(detailedInterview?.applicationID?.candidateID?.userName) || "N/A"}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Candidate Id</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">
                                            {detailedInterview?.applicationID?.candidateID?._id || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Current Status</p>
                                        <p className={`font-medium ${getStatusColor(detailedInterview?.status)} inline-block px-2 py-1 rounded-full text-xs mt-1`}>
                                            {statuses?.length && statuses?.filter(status => status._id === detailedInterview.status)[0]?.applicationStatus}

                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Date & Time Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="time"
                                                value={editForm.time}
                                                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Interview Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Type</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.interviewType}
                                            onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 sm:py-3 pl-3 sm:pl-4 pr-8 sm:pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                                        >
                                            <option value="">Select Interview Type</option>
                                            {interviewTypes?.map(type => (
                                                <option key={type} value={type}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center px-2 sm:px-3 text-gray-500">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Interviewer
                                        </label>

                                        <div className="relative">
                                            {/* Left Icon */}
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg
                                                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Select */}
                                            <select
                                                value={editForm.interviewerID}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, interviewerID: e.target.value })
                                                }
                                                className="
        block w-full
        border border-gray-300 dark:border-gray-600
        rounded-lg shadow-sm
        py-2 sm:py-3
        pl-8 sm:pl-10 pr-8 sm:pr-10
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        appearance-none
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        text-sm sm:text-base
      "
                                            >
                                                <option value="" className="text-gray-500">
                                                    Select Interviewer
                                                </option>

                                                {interviewers?.map((interviewer) => (
                                                    <option
                                                        key={interviewer._id}
                                                        value={interviewer._id}
                                                        className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                                                    >
                                                        {capitalizeFirstLetter(interviewer.userName || interviewer.name)}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Right Arrow */}
                                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center px-2 sm:px-3 text-gray-500 dark:text-gray-400">
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                )}

                                {/* Conditional Meeting Link */}
                                {editForm.interviewType === 'online' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            <input
                                                type="url"
                                                value={editForm.meetingLink}
                                                onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={editForm.status || detailedInterview?.status}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, status: e.target.value })
                                            }
                                            className="
        block w-full
        border border-gray-300 dark:border-gray-600
        rounded-lg shadow-sm
        py-2 sm:py-3
        pl-3 sm:pl-4 pr-8 sm:pr-10
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        appearance-none
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        text-sm sm:text-base
      "
                                        >
                                            {statuses?.map((status) => (
                                                <option
                                                    key={status.applicationStatus}
                                                    value={status._id}
                                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                >
                                                    {status.applicationStatus.charAt(0).toUpperCase() +
                                                        status.applicationStatus.slice(1)}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center px-2 sm:px-3 text-gray-500 dark:text-gray-400">
                                            <svg
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>


                                {/* Conditional Reschedule Reason */}
                                {editForm.status === 'rescheduled' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Why Interview Rescheduled?</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={editForm.reasonRescheduled}
                                                onChange={(e) => setEditForm({ ...editForm, reasonRescheduled: e.target.value })}
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                placeholder="Why Interview Rescheduled?"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer with Actions */}
                        <div className="px-6 py-4 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-400 border border-gray-300 rounded-xl text-black font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-400 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full mx-2 sm:mx-4 md:max-w-4xl max-h-[97vh] overflow-hidden shadow-2xl transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 sm:p-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-xl">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h2 className="text-lg sm:text-xl text-white font-bold">Interview Feedback</h2>
                            </div>
                            <button
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="text-white hover:bg-gray-600 rounded-full p-1 sm:p-2 transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 sm:p-6 max-h-[calc(90vh-120px)]">
                            {/* Candidate Details Card */}
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-5 rounded-xl mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h3 className="font-semibold text-md sm:text-lg text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 flex items-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Candidate Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                    <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Job Title</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">{capitalizeFirstLetter(detailedInterview?.applicationID?.jobID?.title) || "N/A"}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Applicant</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">{capitalizeFirstLetter(detailedInterview?.applicationID?.candidateID?.userName) || "N/A"}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Interview Date</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">{formatDate(detailedInterview?.date)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">Round</p>
                                        <p className="font-medium text-gray-800 dark:text-white mt-1">
                                            {interviewRounds?.length && interviewRounds?.filter(round => round._id === detailedInterview?.roundID)[0]?.roundName || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Form */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className='flex flex-col sm:flex-row justify-between gap-3 sm:gap-0'>
                                    <div className='w-full sm:w-[48%]'>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback Rating</label>
                                        <div className="relative">
                                            <select
                                                value={feedbackForm.feedbackTitle}
                                                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackTitle: e.target.value })}
                                                className="block w-36 sm:w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 sm:py-3 pl-3 sm:pl-4 pr-8 sm:pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                                            >
                                                <option value="">Select a rating</option>
                                                {feedbackTitles?.map(title => (
                                                    <option key={title} value={title}>
                                                        {title}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Custom chevron - hidden on mobile, visible on desktop */}
                                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center px-2 sm:px-3 text-gray-500">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-[48%] relative">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Star Rating</label>
                                        <select
                                            value={feedbackForm.starRating || ""}
                                            onChange={(e) =>
                                                setFeedbackForm({
                                                    ...feedbackForm,
                                                    starRating: Number(e.target.value),
                                                })
                                            }
                                            className="block sm:w-full w-36 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select rating (1 to 5)</option>
                                            {[1, 2, 3, 4, 5]?.map((star) => (
                                                <option key={star} value={star}>
                                                    {`${star} Star${star > 1 ? "s" : ""}`}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Custom Chevron Icon */}
                                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center px-2 sm:px-3 text-gray-500 mt-5">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Feedback</label>
                                    <textarea
                                        value={feedbackForm.feedback}
                                        onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                                        rows="5"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Provide specific examples and constructive feedback about the candidate's performance..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer with Actions */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 border-t rounded-xl border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFeedbackSubmit}
                                className="px-3 sm:px-5 py-1 sm:py-2 bg-gray-700 dark:bg-gray-900 border border-gray-600 text-white rounded-xl font-medium hover:bg-gray-400 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center text-sm sm:text-base"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {feedbackForm._id ? "Update Feedback" : "Submit Feedback"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* {(aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && (
                <div className="mt-12 mb-10">
                    <div className={`mb-6 h-auto flex items-center rounded-xl p-4 transition-colors duration-300 ${currentTheme === 'dark' ? 'border border-purple-500/30 bg-purple-900/10' : 'bg-purple-50 shadow-sm border border-purple-100'}`}>
                        <h2 className="text-xl md:text-3xl font-bold text-purple-700 dark:text-purple-400 flex items-center">
                            <div className="p-3 mx-2 bg-purple-500/10 rounded-full">
                                <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            AI Scheduled Interviews
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockedAiInterviews.map((interview) => (
                            <div
                                key={interview._id}
                                className={`p-6 rounded-xl border group transition-all duration-300 ${currentTheme === 'dark'
                                    ? 'bg-purple-900/10 border-purple-800/50 hover:border-purple-500/50'
                                    : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                                            {interview.applicationID.jobID.title}
                                        </h3>
                                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                                            Candidate: {interview.applicationID.candidateID.userName}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${currentTheme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                                        AI Mock
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {interview.scheduledTime}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        {interview.interviewerType}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 text-purple-600 dark:text-purple-400 font-medium">
                                        Interviewer: {interview.interviewerID.userName}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )} */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default ScheduledInterview;
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAssignedInterview from "../../hooks/useAssignedInterview";
import { useTheme } from "../../context/ThemeContext";
import { Briefcase, Search, Clock } from "lucide-react";
import BackButtonMobile from "../Mob-back-btn";

const AssignedInterviews = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const itemsPerPage = 1; // Number of interviews per page
    const limit = 9; // Set the number of items per page
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const companyUserName = localStorage.getItem("companyUserName");
    const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(localStorage.getItem(`ai_features_${companyUserName}`) === 'true');
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'ai'

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


    // Fetch company_id from localStorage
    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
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
        interviewerID: "",
        company_id: "",
    });
    console.log("editForm>>>>>>>", editForm);

    // New state to store the fetched statuses
    const [statuses, setStatuses] = useState([]);

    // Fetch statuses from API
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

    // Filter interviews based on search and status filter
    const filteredInterviews = assignedInterviews?.interviews
    const totalPages = assignedInterviews?.totalPages;

    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];

    const capitalizeFirstLetter = (string) => {
        if (string) {
            return string?.charAt(0).toUpperCase() + string.slice(1);
        }
        return;
    };
    console.log("statuses", statuses)

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
                        "company_id": companyId,
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
            interviewerID: interview.interviewerID || "",
        });
        setIsEditModalOpen(true);
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
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
            case 'completed':
                return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
            case 'cancelled':
                return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
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

    console.log("interviewers", interviewers)
    console.log("assignedInterviews:", assignedInterviews);
    console.log("editform", editForm)

    return (
        <div className={`px-8 py-4 w-full min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'
            }`}>
            <BackButtonMobile />
            <div className="max-w-screen-2xl">
                {/* Manage Interviews View */}
                {activeTab === 'manage' && (
                    <>
                        {/* Today's Interviews Section */}
                        {filteredInterviews?.some(interview => isToday(interview.date)) && (
                            <div className="mb-8 relative">
                                {/* Background decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 blur-xl"></div>

                                {/* Header section with title and controls */}
                                <div className="relative z-10 flex flex-col sm:flex-row justify-start items-start sm:items-center mb-6 gap-4">
                                    <div className={`shadow-sm px-5 py-3 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 backdrop-blur-sm' : ''}`}>
                                        <h2 className={`text-2xl font-bold  bg-clip-text ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Today's Interviews
                                        </h2>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Cards container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredInterviews
                                        .filter(interview => isToday(interview.date))
                                        .map((interview) => {
                                            // Determine status colors
                                            const statusColors = {
                                                "Completed": "bg-emerald-500 text-emerald-800 bg-emerald-50",
                                                "Cancelled": "bg-red-500 text-red-800 bg-red-50",
                                                "In Progress": "bg-amber-500 text-amber-800 bg-amber-50",
                                                "Scheduled": "bg-blue-500 text-blue-800 bg-blue-50"
                                            };

                                            const status = interview.status;
                                            const colorString = statusColors[status] || "bg-gray-500 text-gray-800 bg-gray-50"; // Add fallback here
                                            const [bgColor, textColor, bgLight] = colorString.split(" ");

                                            // Get candidate initial
                                            const initial = interview.applicationID?.candidateID?.userName?.[0] || "?";

                                            return (
                                                <div
                                                    key={interview._id}
                                                    onClick={() => handleInterviewClick(interview)}
                                                    className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border ${theme === 'dark'
                                                        ? 'bg-gray-800 border-gray-700'
                                                        : 'bg-[#b8e1e1] border-gray-100'
                                                        }`}
                                                >
                                                    <div className="p-4">
                                                        {/* Header with job title and status */}
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h3 className={`text-lg font-semibold line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                                {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                                            </h3>
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${textColor} ${bgLight}`}>
                                                                {statuses?.length && statuses.find(statusItem => statusItem._id === interview.status)?.applicationStatus
                                                                    ? statuses.find(statusItem => statusItem._id === interview.status).applicationStatus.charAt(0).toUpperCase() + statuses.find(statusItem => statusItem._id === interview.status).applicationStatus.slice(1)
                                                                    : capitalizeFirstLetter(status)}
                                                            </span>
                                                        </div>

                                                        {/* Main content */}
                                                        <div className="space-y-3">
                                                            {/* Candidate info */}
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgLight}`}>
                                                                    <span className={`${textColor} text-sm font-medium`}>
                                                                        {capitalizeFirstLetter(initial)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                        Applicant Name :   {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                                                    </p>
                                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Interview Type :    {capitalizeFirstLetter(interview.interviewerType) || "N/A"} Interview
                                                                    </p>
                                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Interviewer :   {capitalizeFirstLetter(interview?.interviewerID?.userName) || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Time info */}
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                </svg>
                                                                <span className="text-gray-700">Today at {interview.scheduledTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className={`flex justify-end items-center px-4 py-3 mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                                        <button className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                                            Details
                                                            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Status indicator line */}
                                                    <div className={`h-1 w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}></div>
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
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>All Assigned Interviews</h2>
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
                                        We’re currently in the process of assigning interviewers.
                                        <br className="hidden sm:block" />
                                        <span className="text-blue-500 font-medium">Please wait</span> while your interview schedule is being prepared.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInterviews
                                    .filter(interview => !isToday(interview.date))
                                    .map((interview) => (
                                        <div
                                            key={interview._id}
                                            className={`p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${theme === 'dark'
                                                ? 'bg-white/10 border-gray-700 hover:border-purple-500/50'
                                                : 'bg-white border-gray-100 hover:border-indigo-50'
                                                }`}
                                            onClick={() => handleInterviewClick(interview)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-white group-hover:text-purple-500' : 'text-gray-900 group-hover:text-purple-500'
                                                        }`}>
                                                        {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                                    </h3>
                                                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Applicant Name :  {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(interview.status)}`}>
                                                    {statuses?.length && statuses?.filter(status => status._id === interview.status)[0]?.applicationStatus}
                                                </span>
                                            </div>

                                            <div className="space-y-3 mt-4">
                                                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Interview Type :   {capitalizeFirstLetter(interview.interviewerType) || "N/A"}
                                                </div>

                                                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Scheduled Date :   {formatDate(interview.date)}
                                                </div>

                                                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Scheduled Time :   {interview.scheduledTime}
                                                </div>
                                                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Interviewer :   {interview?.interviewerID?.userName || "N/A"}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <button className={`text-sm font-medium flex items-center ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-500 group-hover:text-purple-600'
                                                    }`}>
                                                    View Details
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                    </>
                )}
            </div>

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
                                                    {statuses?.length && statuses.find(statusItem => statusItem._id === detailedInterview?.status)?.applicationStatus
                                                        ? capitalizeFirstLetter(statuses.find(statusItem => statusItem._id === detailedInterview?.status).applicationStatus)
                                                        : capitalizeFirstLetter(detailedInterview?.status) || "N/A"}
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
                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Link</label>
                                                <input
                                                    type="url"
                                                    value={editForm.meetingLink}
                                                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                                    className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                                                        }`}
                                                    placeholder="https://meet.google.com/..."
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Update Status</label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className={`sm:w-full w-32 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
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

                                        {/* Buttons - No Logic Changes */}
                                        <div className="flex justify-end space-x-3 pt-4 ">
                                            <button
                                                onClick={() => setIsEditModalOpen(false)}
                                                className=" dark:text-white text-gray-800 px-4 py-2.5 border border-gray-300 rounded-xl font-medium  dark:hover:bg-purple-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdateInterview}
                                                className="px-4 py-2.5 bg-[#9333ea] rounded-xl text-white hover:text-white  font-medium hover:bg-purple-800 transition-colors"
                                            >
                                                Update Interview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
    );
};

export default AssignedInterviews;
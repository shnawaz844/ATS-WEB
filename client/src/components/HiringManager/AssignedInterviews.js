import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useScheduledInterview from "../../hooks/useScheduledInterview";

const AssignedInterviews = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const itemsPerPage = 1; // Number of interviews per page
    const limit = 1; // Set the number of items per page

    const { assignedInterviews, error, isLoading, refetchAssignedInterviews } = useScheduledInterview(page, limit);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [interviewers, setInterviewers] = useState([]);
    const [detailedInterview, setDetailedInterview] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewerID: ""

    });

    // Filter interviews based on search and status filter
    const filteredInterviews = assignedInterviews?.interviews
        
    const totalPages = assignedInterviews?.totalPages;
  
    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];
    const interviewStatuses = ["scheduled", "completed", "cancelled", "rescheduled"];

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
                const response = await fetch("http://localhost:8080/users/interviewers");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setInterviewers(data);
            } catch (error) {
                console.error("Error fetching interviewers:", error.message);
            }
        };

        fetchInterviewers();
    }, []);

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
                `http://localhost:8080/applicationscheduledlist/update-interview/${detailedInterview._id}`,
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
                        interviewerID: editForm.interviewerID, // Ensure interviewerId is sent
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
            status: interview.status || "scheduled",
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

    // Get status color for visual indication
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'rescheduled':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Assigned Interviews</h1>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Search:
                        </label>
                        <input
                            type="text"
                            placeholder="Search by job, candidate or interview type"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="p-3 border rounded-md w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="md:w-1/3">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Filter by Status:
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-3 border rounded-md w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            {interviewStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Today's Interviews Section */}
                {filteredInterviews?.some(interview => isToday(interview.date)) && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Interviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredInterviews
                                .filter(interview => isToday(interview.date))
                                .map((interview) => (
                                    <div
                                        key={interview._id}
                                        className="bg-white p-5 shadow-md rounded-lg border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                        onClick={() => handleInterviewClick(interview)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800">{interview?.applicationID?.jobID?.title || "N/A"}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                                                {interview.status || "Scheduled"}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Applicant:</span> {interview.applicationID?.candidateID?.userName || "N/A"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Type:</span> {interview.interviewerType || "N/A"}
                                            </p>
                                            <p className="text-sm font-medium text-blue-600">
                                                Today at {interview.scheduledTime}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* All Other Interviews */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">All Assigned Interviews</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error.message || "Failed to load interviews"}</span>
                    </div>
                ) : filteredInterviews.length === 0 ? (
                    <div className="bg-white p-8 shadow rounded-md text-center">
                        <p className="text-gray-500 text-lg">No interviews found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInterviews
                            .filter(interview => !isToday(interview.date)) // Exclude today's interviews as they're shown above
                            .map((interview) => (
                                <div
                                    key={interview._id}
                                    className="bg-white p-5 shadow-md rounded-lg border cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                    onClick={() => handleInterviewClick(interview)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{interview?.applicationID?.jobID?.title || "N/A"}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                                            {interview.status || "Scheduled"}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Applicant:</span> {interview.applicationID?.candidateID?.userName || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Type:</span> {interview.interviewerType || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Date:</span> {formatDate(interview.date)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Time:</span> {interview.scheduledTime}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Interview Details Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 min-h-screen overflow-y-auto">
                    <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl h-[95vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Update Interview Details</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close"
                            >
                                Back
                                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Interview Details */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Application Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Job Title:</p>
                                    <p className="font-medium">{detailedInterview?.applicationID?.jobID?.title || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Applicant:</p>
                                    <p className="font-medium">{detailedInterview?.applicationID?.candidateID?.userName || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email:</p>
                                    <p className="font-medium">{detailedInterview?.applicationID?.candidateID?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Current Status:</p>
                                    <p className={`font-medium ${getStatusColor(detailedInterview?.status)} inline-block px-2 py-1 rounded-full text-xs`}>
                                        {detailedInterview?.status || "Scheduled"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Update Form */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                                    <input
                                        type="date"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time</label>
                                    <input
                                        type="time"
                                        value={editForm.time}
                                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                                <select
                                    value={editForm.interviewType}
                                    onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Interview Type</option>
                                    {interviewTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {editForm.interviewType === 'online' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={editForm.meetingLink}
                                        onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {interviewStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editForm.interviewerID
                                        ? `Assigned Interviewer: ${interviewers.find(i => i._id === editForm.interviewerID)?.userName || "Not Found"}`
                                        : "Assign Interviewer"}
                                </label>

                                <select
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editForm.interviewerID || ""}
                                    onChange={(e) => setEditForm({ ...editForm, interviewerID: e.target.value })}
                                    required
                                >
                                    <option value="">Select Interviewer</option>
                                    {interviewers.map((interviewer) => (
                                        <option key={interviewer._id} value={interviewer._id}>
                                            {interviewer.userName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes Field (Optional Enhancement) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Add any additional notes about this interview..."
                                ></textarea>
                            </div>
                        </div>


                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateInterview}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Update Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> */}
            {/* {totalPages > 1 && ( */}
            <div className="flex justify-center mt-8 space-x-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-md text-white ${page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    Previous
                </button>
                <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    // disabled={page >= totalPages}
                    className={`px-4 py-2 rounded-md text-white ${page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    Next
                </button>
            </div>
            {/* )} */}

        </div>
    );
};

export default AssignedInterviews;
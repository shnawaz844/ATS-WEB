import React, { useEffect, useState, useRef } from 'react';
import useDebounce from '../../hooks/useDebounce.js';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useManagerApplications from '../../hooks/useManagerApplications';

const ApplicationList = () => {
    const navigate = useNavigate();
    const [selectedJobField, setSelectedJobField] = useState("All");
    const [search, setSearch] = useState("");
    const [detailedApplication, setDetailedApplication] = useState(null);
    const [interviewers, setInterviewers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        applicationID: "",
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        interviewerId: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 2; // Increased from 2 to 5 for better UX
    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];
    const storedUser = localStorage.getItem("user");
    const debouncedSearch = useDebounce(search, 1000);

    // if (!storedUser) {
    //     navigate('/login'); // Redirect if not logged in
    //     return;
    // }
    const hiringManager = JSON.parse(storedUser); // Parse the stored email
    const hiringManagerEmail = hiringManager.email;

    console.log("Hiring Manager Email:", hiringManagerEmail);

    // Fetch applications with pagination and search
    const {
        data: applicationsData,
        isLoading,
        isError,
        refetch
    } = useManagerApplications(hiringManagerEmail, page, limit, debouncedSearch);

    const applications = applicationsData?.applications || [];
    const totalPages = applicationsData?.totalPages || 1;

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

    // Fetch interviewers
    useEffect(() => {
        const fetchInterviewers = async () => {
            try {
                // Get email from localStorage

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
    console.log("applicationsData", applicationsData)

    // Create a unique list of job fields from applications
    const jobFields = ["All", ...new Set(applications
        .map(app => app.jobDetails?.title || "Unknown")
        .filter(title => title !== "Unknown"))];

    // Filter applications based on job field and search term
    const filteredApplications = applications

    // Validate form before submission
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
        if (!editForm.interviewerId) {
            toast.error('Please select an interviewer');
            return false;
        }
        return true;
    };

    // Handle clicking on an application card
    const handleApplicationClick = (application) => {
        setDetailedApplication(application);
        setEditForm({
            applicationID: application._id,
            date: application.interview?.date || "",
            time: application.interview?.time || "",
            interviewType: application.interview?.interviewType || "",
            meetingLink: application.interview?.meetingLink || "",
            interviewerId: application.interview?.interviewerId || ""
        });
        setEditingId(application._id);
        setIsEditModalOpen(true);
    };

    // Handle assigning interviewer and scheduling interview
    const assignInterviewer = async () => {
        if (!editingId) {
            toast.error("No application selected");
            return;
        }

        if (!validateForm()) {
            return; // Stop if validation fails
        }

        const loadingToast = toast.loading('Scheduling interview...');

        const payload = {
            applicationID: editingId,
            interviewerID: editForm.interviewerId,
            date: editForm.date,
            scheduledTime: editForm.time,
            interviewerType: editForm.interviewType,
            meetingLink: editForm.interviewType === "online" ? editForm.meetingLink : ""
        };

        try {
            const response = await fetch("http://localhost:8080/applicationscheduledlist/interviewer-app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to assign interviewer");
            }

            toast.dismiss(loadingToast);
            toast.success('Interview scheduled successfully! 🎉');

            // Close modal and refetch applications
            setIsEditModalOpen(false);
            refetch();
        } catch (error) {
            console.error("Error assigning interviewer:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Failed to schedule interview");
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Not scheduled";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get status color based on application status
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Applications</h1>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Search by Status:
                        </label>
                        <input
                            type="text"
                            placeholder="Enter status (e.g., pending, approved)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="p-3 border rounded-md w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Filter by Job:
                        </label>
                        <select
                            className="w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={selectedJobField}
                            onChange={(e) => setSelectedJobField(e.target.value)}
                        >
                            {jobFields.map((field, index) => (
                                <option key={index} value={field}>{field}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Applications Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : isError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">Failed to load applications. Please try again later.</span>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="bg-white p-8 shadow rounded-md text-center">
                        <p className="text-gray-500 text-lg">No applications found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApplications.map(app => (
                            <div
                                key={app._id}
                                className="bg-white p-6 shadow-md rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => handleApplicationClick(app)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800">{app.jobDetails?.title || "Untitled Position"}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.applicationStatus)}`}>
                                        {app.applicationStatus || "Unknown"}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Applicant:</span> {app.candidateDetails?.userName || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {app.candidateDetails?.email || "N/A"}
                                    </p>
                                    {app.interview && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-indigo-600 font-medium">
                                                Interview: {formatDate(app.interview.date)} at {app.interview.time}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && !isError && totalPages > 1 && (
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="flex items-center text-lg font-semibold">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Interview Scheduling Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close"
                            >
                                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Application Details */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Application Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Job Title:</p>
                                    <p className="font-medium">{detailedApplication?.jobDetails?.title || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Applicant:</p>
                                    <p className="font-medium">{detailedApplication?.candidateDetails?.userName || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email:</p>
                                    <p className="font-medium">{detailedApplication?.candidateDetails?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Status:</p>
                                    <p className="font-medium">{detailedApplication?.applicationStatus || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Interview Scheduling Form */}
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
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time</label>
                                    <input
                                        type="time"
                                        value={editForm.time}
                                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                                <select
                                    value={editForm.interviewType}
                                    onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Interview Type</option>
                                    {interviewTypes.map(type => (
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
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editForm.interviewerId}
                                    onChange={(e) => setEditForm({ ...editForm, interviewerId: e.target.value })}
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
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignInterviewer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Schedule Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default ApplicationList;
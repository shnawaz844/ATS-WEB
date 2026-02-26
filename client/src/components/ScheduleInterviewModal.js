import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Briefcase, Calendar, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import axios from 'axios';
import useScheduledInterview from '../hooks/useScheduledInterview';
import { useTheme } from '../context/ThemeContext';

const ScheduleInterviewModal = ({ isOpen, onClose, application }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [detailedApplication, setDetailedApplication] = useState(null);
    const [interviewers, setInterviewers] = useState([]);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [editForm, setEditForm] = useState({
        applicationID: "",
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        interviewerId: "",
        company_id: "",
        roundName: "",
        applicationStatusId: "",
        status: ""
    });
    const [formErrors, setFormErrors] = useState({});


    // Parameters for fetching assigned interviews
    const [page] = useState(1);
    const [limit] = useState(10);
    const [search] = useState('');
    const [filterStatus] = useState('all');
    const [candidateID] = useState(application?.candidateDetails?.candidateID);
    const [jobID] = useState(application?.jobDetails?.id);
    const [showAssignedInterviews, setShowAssignedInterviews] = useState(false);

    // Use the custom hook to fetch assigned interviews
    const {
        assignedInterviews,
        error: assignedInterviewsError,
    } = useScheduledInterview({ page, limit, search, candidateID, jobID, filterStatus });

    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
    const companyUserName = localStorage.getItem("companyUserName");
    const [companyDetails, setCompanyDetails] = useState(null);

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    };

    const toggleAssignedInterviews = () => {
        setShowAssignedInterviews(!showAssignedInterviews);
    };

    const modalRef = useRef();
    const interviewTypes = ["online", "walkin"];
    const [statusMap, setStatusMap] = useState({});
    const [roundsMap, setRoundsMap] = useState({});

    // Log assigned interviews data when it changes
    useEffect(() => {
        if (assignedInterviews && Object.keys(assignedInterviews).length > 0) {
            console.log("Assigned Interviews Data:", assignedInterviews);
        }
    }, [assignedInterviews]);

    // Handle assigned interviews error
    useEffect(() => {
        if (assignedInterviewsError) {
            console.error("Error fetching assigned interviews:", assignedInterviewsError);
            toast.error("Failed to fetch assigned interviews data");
        }
    }, [assignedInterviewsError]);

    // Fetch company details based on companyUserName
    useEffect(() => {
        const stored = localStorage.getItem("companyUserName");
        const company = companyUserName || stored;
        if (!company) return;

        axios
            .get(`${process.env.REACT_APP_BASE_URL}/companies/companies/${company}`)
            .then((res) => {
                setCompanyDetails(res.data);
                localStorage.setItem("companyUserName", company);
            })
            .catch((err) => {
                console.error("Error fetching company details:", err);
            });
    }, [companyUserName]);


    // Set application data when modal opens
    useEffect(() => {
        if (isOpen && application) {
            setDetailedApplication(application);
            setEditForm({
                applicationID: application._id,
                date: application.interview?.date || "",
                time: application.interview?.time || "",
                interviewType: application.interview?.interviewType || "",
                meetingLink: application.interview?.meetingLink || "",
                interviewerId: application.interview?.interviewerId || "",
                company_id: application.company_id || companyId,
                roundName: application.interview?.roundName || "",
                applicationStatusId: application.applicationStatusId || "",
                status: application.applicationStatusId || ""
            });
        }
        console.log("application>>>>", application)
    }, [isOpen, application, companyId]);

    // Fetch all application statuses once
    useEffect(() => {
        if (isOpen) {
            axios.get(
                `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`,
                { headers: { company_id: companyId } }
            )
                .then(res => {
                    const map = {};
                    res.data.applicationStatuses.forEach(s => {
                        map[s._id] = s.applicationStatus;
                    });
                    setStatusMap(map);
                })
                .catch(err => console.error("Failed to load statuses", err));
        }
    }, [companyId, isOpen]);

    // Handle click outside modal to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Fetch interviewers
    useEffect(() => {
        if (isOpen) {
            const fetchInterviewers = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/interviewers`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Company_id': companyId
                        }
                    });
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
        }
    }, [isOpen, companyId]);

    // Fetch Interview Rounds
    useEffect(() => {
        if (isOpen) {
            const fetchInterviewRounds = async () => {
                try {
                    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
                    const res = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/interviews/all-interviews?page=1&limit=100&search=`,
                        {
                            headers: { company_id: companyId },
                        }
                    );
                    const rounds = res.data.interviews;
                    const map = {};
                    rounds.forEach(round => {
                        map[round._id] = round.roundName;
                    });
                    setRoundsMap(map);
                    setInterviewRounds(rounds);
                } catch (error) {
                    console.error("Failed to fetch interview rounds", error);
                }
            };

            fetchInterviewRounds();
        }
    }, [isOpen]);


    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        if (!editForm.date) {
            errors.date = 'Interview date is required';
        }
        if (!editForm.time) {
            errors.time = 'Interview time is required';
        } else {
            // Time validation for current day
            const today = new Date().toISOString().split('T')[0];
            if (editForm.date === today) {
                const now = new Date();
                const currentHour = now.getHours().toString().padStart(2, '0');
                const currentMinute = now.getMinutes().toString().padStart(2, '0');
                const currentTime = `${currentHour}:${currentMinute}`;

                if (editForm.time < currentTime) {
                    errors.time = 'Time cannot be in the past';
                }
            }
        }
        if (!editForm.interviewType) {
            errors.interviewType = 'Interview type is required';
        }
        if (editForm.interviewType === 'online' && !editForm.meetingLink) {
            errors.meetingLink = 'Meeting link is required for online interviews';
        }
        if (editForm.interviewType === 'walkin' && !editForm.meetingLink) {
            errors.meetingLink = 'Address is required for walk-in interviews';
        }
        if (!editForm.interviewerId) {
            errors.interviewerId = 'Interviewer is required';
        }
        if (!editForm.status) {
            errors.status = 'Status is required';
        }
        if (!editForm.roundName) {
            errors.roundName = 'Interview round is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const updateApplicationStatus = async (applicationID, applicationStatusId, companyId) => {
        try {
            if (!applicationID) {
                throw new Error("Application ID is required");
            }
            if (!applicationStatusId) {
                throw new Error("Application Status ID is required");
            }

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/application/update-candidate-application/${applicationID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(companyId && { 'Company_id': companyId }),
                },
                body: JSON.stringify({
                    applicationStatusId: applicationStatusId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Application status updated successfully:', data);
            return data;

        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    };

    // Handle assigning interviewer and scheduling interview
    const assignInterviewer = async () => {
        if (!editForm.applicationID) {
            toast.error("No application selected");
            return;
        }

        if (!validateForm()) {
            return;
        }

        const loadingToast = toast.loading('Scheduling interview...');

        const payload = {
            applicationID: editForm.applicationID,
            interviewerID: editForm.interviewerId,
            date: editForm.date,
            scheduledTime: editForm.time,
            interviewerType: editForm.interviewType,
            meetingLink: editForm.meetingLink || "",
            roundID: editForm.roundName,
            status: editForm.status,
            company_id: companyId,
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/interviewer-app`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Company_id": companyId,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to assign interviewer");
            }

            console.log("response123", response);
            await updateApplicationStatus(editForm.applicationID, editForm.status);
            toast.dismiss(loadingToast);
            toast.success('Interview scheduled successfully! 🎉 Redirecting to Assigned interviews');

            setTimeout(() => {
                navigate(`/${companyUserName}/assigned-interviews`);
            }, 2000);

            onClose();

        } catch (error) {
            console.error("Error assigning interviewer:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Failed to schedule interview");
        }
    };

    // Don't render if modal is not open
    if (!isOpen || !detailedApplication) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 max-h-[100vh] z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className={`rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl transform transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div ref={modalRef}>
                    <div className={`flex justify-between items-center p-5 border-b rounded-t-xl ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-white'}`}>
                        <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-black rounded-xl hover:bg-gray-300 focus:outline-none"
                            aria-label="Close"
                        >
                            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Application Details */}
                    <div className="overflow-y-auto px-10 py-6 space-y-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
                        <div className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                            <h3 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Application Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Job Title:</p>
                                    <p className="font-medium">{capitalizeFirstLetter(detailedApplication?.jobDetails?.title) || "N/A"}</p>
                                </div>
                                <div>
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Applicant:</p>
                                    <p className="font-medium">{capitalizeFirstLetter(detailedApplication?.candidateDetails?.userName) || "N/A"}</p>
                                </div>
                                <div>
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email:</p>
                                    <p className="font-medium">{detailedApplication?.candidateDetails?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Application Status:</p>
                                    <p className="font-medium">{capitalizeFirstLetter(statusMap[detailedApplication?.applicationStatusId]) || "N/A"}</p>
                                </div>
                                <div>
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Company Name:</p>
                                    <p className="font-medium">
                                        {companyDetails?.companyName ||
                                            companyDetails?.name ||
                                            detailedApplication?.company_id ||
                                            "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Button for All Scheduled Interviews */}
                        <div className="p-4">
                            <button
                                onClick={toggleAssignedInterviews}
                                className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors duration-200 border ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        All Assigned Interviews
                                        {assignedInterviews?.interviews?.length > 0 && (
                                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                {assignedInterviews?.interviews?.length}
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                {showAssignedInterviews ? (
                                    <ChevronUp className="h-5 w-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-600" />
                                )}
                            </button>

                            {/* Assigned Interviews Section - Only shown when toggle is active */}
                            {showAssignedInterviews && (
                                <div className={`mt-4 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <table className="w-full rounded-xl">
                                        <thead className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-white'} text-white border`}>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Application Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Date of interview</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Scheduled Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Interview Round</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Interviewer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {assignedInterviews?.interviews?.map((interview) => (
                                                <tr
                                                    key={interview._id}
                                                    className="group hover:bg-gray-700 transition-colors duration-200"
                                                >
                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                                                            {(statusMap[interview?.title || interview?.status || "Interview"]) || "N/A"}
                                                        </span>
                                                    </td>
                                                    {/* Date */}
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            {interview.date ? (() => {
                                                                const date = new Date(interview.date);
                                                                const day = date.getDate().toString().padStart(2, '0');
                                                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                                                const year = date.getFullYear();
                                                                return `${day}/${month}/${year}`;
                                                            })() : "TBD"}
                                                        </span>
                                                    </td>
                                                    {/* Time */}
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            {interview?.scheduledTime || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            {roundsMap[interview?.roundID?._id] || "N/A"}

                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            {capitalizeFirstLetter(interview?.interviewerID?.userName) || "N/A"}

                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Empty state */}
                                    {(!assignedInterviews?.interviews || assignedInterviews.interviews?.length === 0) && (
                                        <div className="p-8 text-center text-gray-500">
                                            <p className="text-sm">No interviews assigned</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interview Scheduling Form */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Status
                                    </label>
                                    <select
                                        value={editForm.status || detailedApplication?.applicationStatusId}
                                        onChange={e => {
                                            setEditForm({ ...editForm, status: e.target.value });
                                            if (formErrors.status) setFormErrors({ ...formErrors, status: "" });
                                        }}
                                        className={`w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.status ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')}`}
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        {Object.entries(statusMap)?.map(([id, name]) => (
                                            <option key={id} value={id}>
                                                {capitalizeFirstLetter(name)}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}

                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Interview Round
                                    </label>
                                    <select
                                        value={editForm.roundName}
                                        onChange={e => {
                                            setEditForm({ ...editForm, roundName: e.target.value });
                                            if (formErrors.roundName) setFormErrors({ ...formErrors, roundName: "" });
                                        }}
                                        className={`w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.roundName ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')}`}
                                        required
                                    >
                                        <option value="">Select Interview Round</option>
                                        {interviewRounds?.map(round => (
                                            <option key={round._id} value={round._id}>
                                                {round.roundName}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.roundName && <p className="text-red-500 text-xs mt-1">{formErrors.roundName}</p>}

                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Date</label>
                                    <input
                                        type="date"
                                        value={editForm.date}
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            const today = new Date().toISOString().split('T')[0];
                                            let newTime = editForm.time;
                                            let newErrors = { ...formErrors, date: "" };

                                            if (selectedDate === today && editForm.time) {
                                                const now = new Date();
                                                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                                if (editForm.time < currentTime) {
                                                    newTime = "";
                                                    newErrors.time = "Previous time was invalid for today";
                                                }
                                            }
                                            setEditForm({ ...editForm, date: selectedDate, time: newTime });
                                            setFormErrors(newErrors);
                                        }}
                                        className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.date ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : '')}`}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Time</label>
                                    <input
                                        type="time"
                                        value={editForm.time}
                                        onChange={(e) => {
                                            setEditForm({ ...editForm, time: e.target.value });
                                            if (formErrors.time) setFormErrors({ ...formErrors, time: "" });
                                        }}
                                        min={editForm.date === new Date().toISOString().split('T')[0] ? (() => {
                                            const now = new Date();
                                            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                        })() : ""}
                                        className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.time ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : '')}`}
                                        required
                                    />
                                    {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Interview Type</label>
                                    <select
                                        value={editForm.interviewType}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            let address = editForm.meetingLink;
                                            if (type === 'walkin') {
                                                address = companyDetails?.address || "";
                                            }
                                            setEditForm({ ...editForm, interviewType: type, meetingLink: type === 'walkin' ? address : (type === 'online' ? "" : "") });
                                            if (formErrors.interviewType) setFormErrors({ ...formErrors, interviewType: "" });
                                        }}
                                        className={`w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-gray-500 ${formErrors.interviewType ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')}`}
                                        required
                                    >
                                        <option value="">Select Interview Type</option>
                                        {interviewTypes?.map(type => (
                                            <option key={type} value={type}>
                                                {type?.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.interviewType && <p className="text-red-500 text-xs mt-1">{formErrors.interviewType}</p>}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Assign Interviewer</label>
                                    <select
                                        className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.interviewerId ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')}`}
                                        value={editForm.interviewerId}
                                        onChange={(e) => {
                                            setEditForm({ ...editForm, interviewerId: e.target.value });
                                            if (formErrors.interviewerId) setFormErrors({ ...formErrors, interviewerId: "" });
                                        }}
                                        required
                                    >
                                        <option value="">Select Interviewer</option>
                                        {interviewers?.map((interviewer) => (
                                            <option key={interviewer._id} value={interviewer._id}>
                                                {interviewer.userName}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.interviewerId && <p className="text-red-500 text-xs mt-1">{formErrors.interviewerId}</p>}
                                </div>

                            </div>

                            {(editForm.interviewType === 'online' || editForm.interviewType === 'walkin') && (
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {editForm.interviewType === 'online' ? 'Meeting Link' : 'Interview Address'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.meetingLink}
                                        onChange={(e) => {
                                            setEditForm({ ...editForm, meetingLink: e.target.value });
                                            if (formErrors.meetingLink) setFormErrors({ ...formErrors, meetingLink: "" });
                                        }}
                                        className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.meetingLink ? 'border-red-500' : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : '')}`}
                                        placeholder={editForm.interviewType === 'online' ? "https://meet.google.com/..." : "Enter walk-in address"}
                                        required
                                    />
                                    {formErrors.meetingLink && <p className="text-red-500 text-xs mt-1">{formErrors.meetingLink}</p>}

                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded-xl transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignInterviewer}
                                className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition"
                            >
                                Schedule Interview
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

        </div>
    );
};

export default ScheduleInterviewModal;

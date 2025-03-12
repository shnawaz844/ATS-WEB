import React, { useState, useEffect } from 'react';

const dummyScheduledInterviews = [
    {
        id: 1,
        applicantId: "APP001",
        candidateName: "John Doe",
        time: "10:00",
        date: "2025-02-15",
        status: "pending",
        interviewType: "online",
        meetingLink: "https://meet.google.com/abc",
        feedbackTitle: "",
        feedback: "",
        attachment: null
    },
    {
        id: 2,
        applicantId: "APP002",
        candidateName: "Jane Smith",
        time: "14:30",
        date: "2025-02-16",
        status: "complete",
        interviewType: "walkin",
        meetingLink: "",
        feedbackTitle: "Good",
        feedback: "Great communication skills, technical knowledge needs improvement",
        attachment: null
    },
    {
        id: 3,
        applicantId: "APP003",
        candidateName: "Mike Johnson",
        time: "11:00",
        date: "2025-02-14",
        status: "postpone",
        interviewType: "online",
        meetingLink: "https://zoom.us/xyz",
        feedbackTitle: "Average",
        feedback: "Candidate requested reschedule due to emergency",
        attachment: null
    }
];

export const ScheduledInterview = () => {
    const [interviews, setInterviews] = useState(dummyScheduledInterviews);
    const [editingId, setEditingId] = useState(null);
    const [interviewers, setInterviewers] = useState([]);

    const [assignments, setAssignments] = useState({});
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    const [editForm, setEditForm] = useState({
        time: "",
        date: "",
        interviewType: "",
        meetingLink: ""
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        feedbackTitle: "",
        feedback: "",
        attachment: null
    });


    const statusOptions = ["pending", "complete", "cancel", "postpone"];
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

    const handleEdit = (interview) => {
        setEditingId(interview.id);
        setEditForm({
            time: interview.time,
            date: interview.date,
            interviewType: interview.interviewType,
            meetingLink: interview.meetingLink
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        setInterviews(interviews.map(interview =>
            interview.id === editingId
                ? { ...interview, ...editForm }
                : interview
        ));
        setIsEditModalOpen(false);
        setEditingId(null);
    };

    const handleStatusChange = (id, newStatus) => {
        setInterviews(interviews.map(interview =>
            interview.id === id
                ? { ...interview, status: newStatus }
                : interview
        ));
    };

    const handleFeedbackClick = (interview) => {
        setEditingId(interview.id);
        setFeedbackForm({
            feedbackTitle: interview.feedbackTitle,
            feedback: interview.feedback,
            attachment: interview.attachment
        });
        setIsFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = () => {
        setInterviews(interviews.map(interview =>
            interview.id === editingId
                ? { ...interview, ...feedbackForm }
                : interview
        ));
        setIsFeedbackModalOpen(false);
        setEditingId(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setFeedbackForm({ ...feedbackForm, attachment: file });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            complete: "bg-green-100 text-green-800",
            cancel: "bg-red-100 text-red-800",
            postpone: "bg-blue-100 text-blue-800"
        };
        return colors[status] || colors.pending;
    };
    useEffect(() => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch('http://localhost:8080/users/interviewers');
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
    }, []);
    const handleAssign = (candidateId, interviewerId) => {
        setAssignments((prev) => ({ ...prev, [candidateId]: interviewerId }));
    };

    return (
        <div className="max-w-screen-xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Scheduled Interviews</h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {interviews.map((interview) => (
                            <tr key={interview.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.applicantId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.candidateName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={interview.status}
                                        onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                                        className={`px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)} border-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleFeedbackClick(interview)}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        {interview.feedbackTitle || "Add Feedback"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={() => handleEdit(interview)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Edit Interview Details</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input
                                    type="time"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <td className={`${tableDataCss}`}>
                                {/* Dropdown for Assigning Interviewer */}
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => handleAssign(e.target.value)}
                                >
                                    <option value="">Select Interviewer</option>
                                    {interviewers.map((interviewer) => (
                                        <option key={interviewer._id} value={interviewer._id}>
                                            {interviewer.userName}
                                        </option>
                                    ))}
                                </select>
                            </td>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Interview Type</label>
                                <select
                                    value={editForm.interviewType}
                                    onChange={(e) => setEditForm({ ...editForm, interviewType: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {interviewTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                                <input
                                    type="url"
                                    value={editForm.meetingLink}
                                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Feedback Modal */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Interview Feedback</h2>
                            <button
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Feedback Title</label>
                                <select
                                    value={feedbackForm.feedbackTitle}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackTitle: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a rating</option>
                                    {feedbackTitles.map(title => (
                                        <option key={title} value={title}>
                                            {title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Detailed Feedback</label>
                                <textarea
                                    value={feedbackForm.feedback}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                                    rows="4"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter detailed feedback..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attachment</label>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFeedbackSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ScheduledInterview;


// i want that Action button to be in last and feedback between status and action
// in edit remove the feedback instead make a meeting link inputbox and in feed back
// the title should be in the outer list and when the title is clicked a modal should
// open where 2 sections should appear where first should be of dropdown of title the
// dropdown items are(Poor, below average, Average, Above Average, good, very good, excelent,
// above expectation,) and lower box should be of feedback input box where a attachment could be added 
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Search, User, Briefcase, X, ChevronDown } from 'lucide-react';
import useFeedbacks from '../../hooks/useFeedbacks';
import useScheduledInterview from '../../hooks/useAssignedInterview';
import InfiniteScroll from 'react-infinite-scroll-component';

const AiGeneratedInterviewsTable = () => {
    const companyId = JSON.parse(localStorage.getItem("user"))?.company_id;
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [detailedInterview, setDetailedInterview] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
    const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedStatus, setDebouncedStatus] = useState('');
    const [debouncedRating, setDebouncedRating] = useState('all');

    const [feedbackForm, setFeedbackForm] = useState({
        feedbackTitle: '',
        feedback: '',
        attachment: null,
        status: '',
        starRating: ''
    });

    const [statuses, setStatuses] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`, {
            headers: { "Company_id": companyId }
        })
            .then(response => response.json())
            .then(data => setStatuses(data.applicationStatuses))
            .catch(error => console.error("Error fetching statuses:", error));
    }, [companyId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setDebouncedStatus(filterStatus);
            setDebouncedRating(ratingFilter);
            setPage(1);
            setHasMore(true);
            setFilteredInterviews([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, ratingFilter]);

    const { feedbacks } = useFeedbacks(page, limit, debouncedRating);
    const { assignedInterviews, refetchAssignedInterviews, isLoading: interviewLoading } = useScheduledInterview(page, limit, debouncedSearch, debouncedStatus, debouncedRating);

    const mergeInterviewsWithFeedbacks = (interviews, feedbacks) => {
        return interviews?.map(interview => {
            const feedback = feedbacks.find(f => f?.interviewId?._id === interview?._id);
            return {
                ...interview,
                starRating: feedback?.starRating || 0,
                feedbackTitle: feedback?.feedbackTitle || '',
                feedbackText: feedback?.feedback || '',
                feedbackId: feedback?._id || null
            };
        });
    };

    const applyRatingFilter = (interviews) => {
        if (debouncedRating === 'all') return interviews;
        if (debouncedRating === '0') {
            return interviews?.filter(interview => !interview?.starRating || interview?.starRating === 0);
        } else {
            return interviews?.filter(interview => interview?.starRating === parseInt(debouncedRating));
        }
    };

    useEffect(() => {
        if (assignedInterviews?.interviews?.length) {
            let mergedData = mergeInterviewsWithFeedbacks(assignedInterviews?.interviews, feedbacks);
            mergedData = applyRatingFilter(mergedData);
            if (page === 1) {
                setFilteredInterviews(mergedData);
            } else {
                setFilteredInterviews(prev => [...prev, ...mergedData]);
            }
            if (debouncedRating !== 'all') {
                setHasMore(mergedData?.length > 0 && page < assignedInterviews?.totalPages);
            } else {
                setHasMore(page < assignedInterviews?.totalPages);
            }
        } else {
            if (page === 1) setFilteredInterviews([]);
            setHasMore(false);
        }
    }, [assignedInterviews?.interviews, feedbacks, page, debouncedRating]);

    const fetchMoreData = () => {
        if (hasMore) setPage(prevPage => prevPage + 1);
    };

    const handleFeedbackClick = async (selectedInterview) => {
        setDetailedInterview(selectedInterview);
        try {
            let feedbackData = feedbacks.filter(f => f?.interviewId?._id === selectedInterview._id);
            if (!feedbackData.length) throw new Error("No feedback found for this interview");
            feedbackData = feedbackData[0];
            setFeedbackForm({
                _id: feedbackData._id,
                feedbackTitle: feedbackData.feedbackTitle || "",
                feedback: feedbackData.feedback || "",
                starRating: feedbackData.starRating || 0,
            });
        } catch (error) {
            console.error("Error fetching feedback:", error);
            setFeedbackForm({ feedbackTitle: "", feedback: "", starRating: "" });
        }
        setIsFeedbackModalOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        let dateObj = timeString.includes("T") ? new Date(timeString) : new Date(`1970-01-01T${timeString}`);
        if (isNaN(dateObj.getTime())) return "Invalid Time";
        return dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    };

    const getStatusName = (statusId) => {
        const status = statuses.find(s => s._id === statusId);
        return status ? status.applicationStatus : statusId || 'Unknown';
    };

    const handleStatusChange = async (feedbackId, newStatus) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/update-interview/${feedbackId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update status");
            refetchAssignedInterviews();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800';
            case 'In Process': return theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800';
            case 'Scheduled': return theme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-800';
            case 'Selected': return theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800';
            case 'Rejected': return theme === 'dark' ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800';
            case 'Hold': return theme === 'dark' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            default: return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
        }
    };

    const getRatingStars = (rating) => {
        return Array(5).fill(0)?.map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>★</span>
        ));
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    };

    return (
        <div className="w-full">
            <InfiniteScroll
                dataLength={filteredInterviews?.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<div className="text-center py-4">Loading more interviews...</div>}
                endMessage={
                    filteredInterviews?.length > 0 && (
                        <p className="text-center py-4 text-gray-500">
                            You've seen all interviews
                        </p>
                    )
                }
            >
                <div className="overflow-x-auto rounded-t-xl">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-20'}`}>
                        <thead>
                            <tr className={`${theme === 'dark' ? 'bg-[#313131]' : 'bg-gray-200'}`}>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Job & Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Interviewer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        {filteredInterviews?.length > 0 && (
                            filteredInterviews?.map((feedback) => (
                                <tbody key={feedback._id}>
                                    <tr className={`group transition-colors duration-200 ${theme === 'dark' ? 'bg-white/10 hover:bg-gray-800 border-b border-gray-800' : 'hover:bg-gray-700 bg-gray-100'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <User size={20} className="text-indigo-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium group-hover:text-white ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        {capitalizeFirstLetter(feedback?.applicationID?.candidateID?.userName) || "N/A"}
                                                    </div>
                                                    <div className={`text-sm group-hover:text-white ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {capitalizeFirstLetter(feedback.applicationID?.jobID?.title) || "N/A"}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {feedback.skills?.map((skill, index) => (
                                                            <span key={index} className={`px-2 py-0.5 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                                {skill}
                                                            </span>
                                                        )) || <span className="text-xs text-gray-500 group-hover:text-white">No skills listed</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm group-hover:text-white ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{capitalizeFirstLetter(feedback?.interviewerID?.userName) || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm group-hover:text-white ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feedback.date ? formatDate(feedback.date) : "No date"}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-white">{feedback.scheduledTime ? formatTime(feedback.scheduledTime) : "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={feedback.status || ""}
                                                onChange={(e) => handleStatusChange(feedback._id, e.target.value)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border focus:outline-none ${getStatusColor(feedback.status)}`}
                                            >
                                                <option value="">Select status</option>
                                                {statuses?.map((status) => (
                                                    <option key={status._id} value={status._id}>
                                                        {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getRatingStars(feedback.starRating || 0)}
                                                {feedback.starRating ? <span className="ml-2 text-sm text-gray-600 group-hover:text-white">({feedback.starRating} star)</span> : <span className="ml-2 text-sm text-gray-400 group-hover:text-white">No rating</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => { setDetailedInterview(feedback); setIsDetailModalOpen(true); }} className={`group-hover:text-white mr-3 ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}>View</button>
                                            <button onClick={() => { setDetailedInterview(feedback); handleFeedbackClick(feedback); }} className={`group-hover:text-white ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}>Feedback</button>
                                        </td>
                                    </tr>
                                </tbody>
                            ))
                        )}
                    </table>
                </div>
            </InfiniteScroll>

            {isDetailModalOpen && detailedInterview && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                    <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`flex justify-between items-center border-b px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-gray-200'}`}>
                            <div><h2 className="text-xl font-semibold text-white">Interview Details</h2></div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-white hover:text-gray-200 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Candidate</h3>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(detailedInterview?.applicationID?.candidateID?.userName)}</p>
                                </div>
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Position</h3>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{detailedInterview?.applicationID?.jobID?.title}</p>
                                </div>
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Interviewer</h3>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(detailedInterview?.interviewerID?.userName)}</p>
                                </div>
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Status</h3>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(getStatusName(detailedInterview?.status))}`}>
                                            {capitalizeFirstLetter(getStatusName(detailedInterview?.status))}
                                        </span>
                                    </div>
                                </div>
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Date & Time</h3>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{formatDate(detailedInterview?.date)}</p>
                                </div>
                                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Round Name</h3>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{detailedInterview?.roundID.roundID}</p>
                                </div>
                            </div>
                            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {detailedInterview?.skills?.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsDetailModalOpen(false)} className={`px-5 py-2 border rounded-xl transition-colors font-medium ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-300'}`}>Close</button>
                                <button onClick={() => { setPdfPreviewUrl(detailedInterview?.applicationID?.resume); setIsPdfModalOpen(true); }} className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition-colors font-medium flex items-center gap-2">View Resume</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPdfModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`rounded-lg shadow-lg max-w-4xl w-full p-5 relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Resume Preview</h2>
                            <button onClick={() => setIsPdfModalOpen(false)} className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>&times;</button>
                        </div>
                        <iframe src={pdfPreviewUrl} className={`w-full h-[600px] border ${theme === 'dark' ? 'border-gray-700' : ''}`} title="Resume PDF"></iframe>
                    </div>
                </div>
            )}

            {isFeedbackModalOpen && detailedInterview && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                    <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`flex justify-between items-center border-b px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-gray-200'}`}>
                            <div><h2 className="text-xl font-semibold text-white">Interview Feedback</h2><p className="text-sm text-white mt-1">Review and submit your evaluation</p></div>
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="flex items-center mb-4"><div><h3 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{detailedInterview?.candidateName}</h3><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{detailedInterview?.jobTitle}</p></div></div>
                            <form className="space-y-5">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Feedback Title</label>
                                    <input type="text" readOnly className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-100 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-300 border-gray-200 text-black'}`} value={feedbackForm.feedbackTitle} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Detailed Feedback</label>
                                    <div className="relative">
                                        <textarea className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none min-h-[20vh] max-h-[30vh] ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-300 border-gray-200 text-black'}`} value={capitalizeFirstLetter(feedbackForm.feedback)} readOnly rows={isFeedbackExpanded ? 6 : 2}></textarea>
                                        {feedbackForm.feedback && feedbackForm.feedback.split('\n').length > 2 && (
                                            <button type="button" className={`absolute right-3 bottom-2 text-xs font-medium px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'text-white bg-gray-600 hover:bg-gray-500' : 'text-black bg-red hover:bg-indigo-50'}`} onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}>{isFeedbackExpanded ? 'Show less' : 'Show more'}</button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center py-3">
                                    <label className={`block text-base font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
                                    <div className="flex items-center space-x-3"><div className="text-2xl text-amber-400 transform transition-all duration-300">{getRatingStars(feedbackForm.starRating)}</div></div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {!filteredInterviews?.length && !interviewLoading && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="bg-gray-100 p-5 rounded-full mb-4"><Briefcase className="h-12 w-12 text-gray-400" /></div>
                    <div className="text-center animate-fade-in transition-all duration-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight leading-snug">No Interviews Scheduled Yet</h3>
                        <p className="text-md text-gray-600 max-w-md mx-auto leading-relaxed">It seems there are no interviews matching your criteria right now.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiGeneratedInterviewsTable;


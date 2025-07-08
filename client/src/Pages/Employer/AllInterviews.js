import React, { useState, useEffect } from 'react';

import { Search, User, Briefcase, X, ChevronDown } from 'lucide-react';
import useFeedbacks from '../../hooks/useFeedbacks';
import useScheduledInterview from '../../hooks/useAssignedInterview';
import InfiniteScroll from 'react-infinite-scroll-component';
import BackButtonMobile from '../../components/Mob-back-btn';

const AllInterviews = () => {
  const [activeTab, setActiveTab] = useState('interviews');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailedInterview, setDetailedInterview] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedStatus, setDebouncedStatus] = useState('');

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

  // Fetch statuses from API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`)
      .then(response => response.json())
      .then(data => setStatuses(data.applicationStatuses))
      .catch(error => console.error("Error fetching statuses:", error));
  }, []);


  // Implement search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedStatus(filterStatus)
      setPage(1);
      setHasMore(true);
    }, 500);

    // Clear the timer if searchTerm changes before 500ms
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // Fetch feedbacks
  const { feedbacks, total: totalFeedbacks, error: feedbackError, isLoading: feedbackLoading } = useFeedbacks(page, limit);

  // Fetch scheduled interviews
  const { assignedInterviews, error: interviewError, isLoading: interviewLoading, refetchAssignedInterviews } = useScheduledInterview(page, limit, debouncedSearch, debouncedStatus);

  useEffect(() => {
    if (assignedInterviews?.interviews?.length) {
      if (page === 1) {
        setFilteredInterviews(assignedInterviews.interviews);
      } else {
        setFilteredInterviews(prev => [...prev, ...assignedInterviews.interviews]);
      }
      setHasMore(page < assignedInterviews.totalPages);
    } else {
      setHasMore(false);
    }
  }, [assignedInterviews?.interviews, page]);

  const fetchMoreData = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleFeedbackClick = async (selectedInterview) => {
    setDetailedInterview(selectedInterview);

    try {
      let feedbackData = feedbacks.filter(f => f?.interviewId?._id === selectedInterview._id);

      if (!feedbackData.length) {
        throw new Error("No feedback found for this interview");
      }

      feedbackData = feedbackData[0];
      setFeedbackForm({
        _id: feedbackData._id,
        feedbackTitle: feedbackData.feedbackTitle || "",
        feedback: feedbackData.feedback || "",
        starRating: feedbackData.starRating || 0,
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);

      // Reset form if no feedback exists
      setFeedbackForm({
        feedbackTitle: "",
        feedback: "",
        starRating: "",
      });
    }

    setIsFeedbackModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  // Format time to display only HH:MM AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    let dateObj;

    // If timeString is a full ISO date-time string
    if (timeString.includes("T")) {
      dateObj = new Date(timeString);
    }
    // If timeString is only a time (e.g., "15:30:00"), add a dummy date
    else {
      dateObj = new Date(`1970-01-01T${timeString}`);
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid time format:", timeString);
      return "Invalid Time";
    }

    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // ✅ Update local state so the UI re-renders
      refetchAssignedInterviews()

      console.log("Status updated successfully");

      // Optionally: refresh data or update state here
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Process': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };
  // Add state to track click position
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Modify your button click handler to capture position
  const handleFeedbackButtonClick = (e) => {
    setClickPosition({
      x: e.clientX,
      y: e.clientY
    });
    setIsFeedbackModalOpen(true);
  };


  return (
    <div className="px-8 py-4 w-full min-h-screen"
      style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
    >
      <BackButtonMobile />
      <div className="max-w-screen-2xl">

        <div className='mb-6 h-auto md:h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-white flex items-center">
                <Briefcase className="mr-2 h-5 w-5 md:h-6 md:w-6 text-white" />
                Interview Management
              </h2>
            </div>

            {/* Search and Filter */}
            <div className='flex items-center w-full md:w-auto'>
              <div className="flex flex-col md:flex-row md:justify-between gap-3 w-full md:w-[50vw]">
                <div className="w-full md:w-[67%]">
                  <label className="block text-white text-xs font-bold mb-1 md:mb-2">
                    Search:
                  </label>
                  <form onSubmit={handleSearchSubmit} autoComplete="off">
                    <div className="relative rounded-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by candidate name, job title, interviewer..."
                        className="w-full pl-9 md:pl-10 pr-8 md:pr-4 py-1.5 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[5vh] md:h-[6.3vh]"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          <X className="h-3 w-3 md:h-4 md:w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative w-full">
                    <label className="block text-white text-xs font-bold mb-1 md:mb-2">
                      Filter by Status:
                    </label>
                    <select
                      className="w-[32vw] sm:w-auto  appearance-none bg-gray-200 rounded-xl py-1.5 pl-4 pr-8 md:pr-10 focus:outline-none focus:ring-none hover:bg-white h-[5vh] md:h-auto border border-red"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {statuses?.map((status) => (
                        <option key={status} value={status._id}>
                          {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                        </option>

                      ))}

                    </select>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Tabs */}
        <div className=" rounded-xl shadow-sm">
          <div className="flex border-b rounded-t-xl">
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'interviews'
                ? 'border-b-2 border-indigo-500 text-black text-xl'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2'
                }`}
            >
              Interviews
            </button>
          </div>
        </div>

        {/* Content */}
        <div className=" rounded-t-xl shadow-sm p-2 sm:p-6 ">
          {activeTab === 'interviews' && (
            <InfiniteScroll
              dataLength={filteredInterviews.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<div className="text-center py-4">Loading more interviews...</div>}
              endMessage={
                filteredInterviews.length > 0 && (
                  <p className="text-center py-4 text-gray-500">
                    You've seen all interviews
                  </p>
                )
              }
            >

              <div className="overflow-x-auto rounded-t-xl">
                <table className="min-w-full divide-y divide-gray-20">
                  <thead>
                    <tr className='bg-gray-700'>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Job & Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Interviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  {filteredInterviews?.length > 0 && (
                    filteredInterviews?.map((feedback) => (
                      <tbody key={feedback._id}>
                        <tr className="group hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User size={20} className="text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-white">
                                  {capitalizeFirstLetter(feedback?.applicationID?.candidateID?.userName) || "N/A"}
                                </div>
                                <div className="text-sm text-gray-700 group-hover:text-white">
                                  {capitalizeFirstLetter(feedback.applicationID?.jobID?.title) || "N/A"}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {feedback.skills?.map((skill, index) => (
                                    <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                      {skill}
                                    </span>
                                  )) || <span className="text-xs text-gray-500 group-hover:text-white">No skills listed</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 group-hover:text-white">{capitalizeFirstLetter(feedback?.interviewerID?.userName) || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 group-hover:text-white">
                              {feedback.date ? formatDate(feedback.date) : "No date"}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-white">
                              {feedback.scheduledTime ? formatTime(feedback.scheduledTime) : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={feedback.status || ""}
                              onChange={(e) => handleStatusChange(feedback._id, e.target.value)}
                              className={`px-2 py-1 text-xs font-semibold rounded-full border focus:outline-none ${getStatusColor(feedback.status)}`}
                            >
                              <option value="">Select status</option>
                              {statuses?.map((status) => (
                                <option key={status} value={status._id}>
                                  {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setDetailedInterview(feedback);
                                setIsDetailModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 group-hover:text-white mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setDetailedInterview(feedback);
                                handleFeedbackClick(feedback);
                              }}
                              className="text-indigo-600 group-hover:text-white hover:text-indigo-900"
                            >
                              Feedback
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    ))
                  )}
                </table>
              </div>
            </InfiniteScroll>
          )}
        </div>

        {/* interview Detail Modal */}
        {isDetailModalOpen && detailedInterview && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-white">Interview Details</h2>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Candidate */}

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Candidate</h3>
                    <p className="text-lg font-semibold text-gray-800">{capitalizeFirstLetter(detailedInterview.applicationID?.candidateID?.userName)}</p>
                  </div>

                  {/* Position */}

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Position</h3>
                    <p className="text-lg font-semibold text-gray-800">{detailedInterview.applicationID?.jobID?.title}</p>
                  </div>

                  {/* Interviewer */}

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Interviewer</h3>
                    <p className="text-lg font-semibold text-gray-800">{capitalizeFirstLetter(detailedInterview?.interviewerID?.userName)}</p>
                  </div>

                  {/* Status */}

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                    <div className="mt-1">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(getStatusName(detailedInterview.status))}`}>
                        {capitalizeFirstLetter(getStatusName(detailedInterview.status))}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date & Time</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(detailedInterview.date)}</p>
                  </div>

                  {/* { Round Name } */}
                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Round Name</h3>
                    <p className="text-lg font-semibold text-gray-800">{detailedInterview.roundID.roundID}</p>
                  </div>
                </div>

                {/* Skills Section */}

                <div className="bg-gray-200 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailedInterview.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Close Button */}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsDetailModalOpen(false)} // Closes the modal
                    className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-300 text-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>

                  {/* View Resume Button */}
                  <button
                    onClick={() => {
                      setPdfPreviewUrl(detailedInterview?.applicationID?.resume);
                      setIsPdfModalOpen(true);
                    }}
                    className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition-colors font-medium flex items-center gap-2"
                  >
                    View Resume
                  </button>
                </div>


              </div>
            </div>
          </div>
        )}

        {isPdfModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-5 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resume Preview</h2>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[600px] border"
                title="Resume PDF"
              ></iframe>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {isFeedbackModalOpen && detailedInterview && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-white">Interview Feedback</h2>
                  <p className="text-sm text-white mt-1">Review and submit your evaluation</p>
                </div>
                <button
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">

                {/* Candidate Info */}
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-medium">{detailedInterview.candidateName}</h3>
                    <p className="text-sm text-gray-500">{detailedInterview.jobTitle}</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Title</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-100"
                      value={feedbackForm.feedbackTitle}
                      placeholder="e.g., Strong Technical Skills"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                    <div className="relative">
                      <textarea
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none bg-gray-300"
                        value={capitalizeFirstLetter(feedbackForm.feedback)}
                        readOnly
                        rows={isFeedbackExpanded ? 6 : 2}
                        style={{ overflow: 'hidden' }}
                      ></textarea>
                      {feedbackForm.feedback && feedbackForm.feedback.split('\n').length > 2 && (
                        <button
                          type="button"
                          className="absolute right-3 bottom-2 text-indigo-600 text-xs font-medium bg-white px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                        >
                          {isFeedbackExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  </div>


                  <div className="flex flex-col items-center justify-center py-3">
                    <label className="block text-base font-medium text-gray-700 mb-3">Rating</label>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl text-amber-400 transform transition-all duration-300">
                        {getRatingStars(feedbackForm.starRating)}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
            </div>
    </div>
  )
}

      </div >

  {!filteredInterviews.length && !interviewLoading && (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 p-5 rounded-full mb-4">
        <Briefcase className="h-12 w-12 text-gray-400" />
      </div>
      <div className="text-center animate-fade-in transition-all duration-500">
        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight leading-snug">
          No Interviews Scheduled Yet
        </h3>
        <p className="text-md text-gray-600 max-w-md mx-auto leading-relaxed">
          It seems there are no interviews matching your criteria right now.
          <br className="hidden sm:block" />
          <span className="text-blue-500 font-medium">Please wait</span> while your schedule is being finalized.
        </p>
      </div>
    </div>
  )}
    </div >
  );
};

export default AllInterviews;
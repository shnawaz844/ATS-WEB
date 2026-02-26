import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast as toastNotify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Search, User, Briefcase, X, ChevronDown, Calendar, Video, MapPin, Clock, ThumbsUp, ThumbsDown, ChevronRight, ChevronLeft } from 'lucide-react';
import useFeedbacks from '../../hooks/useFeedbacks';
import useScheduledInterview from '../../hooks/useAssignedInterview';
import InfiniteScroll from 'react-infinite-scroll-component';
import BackButtonMobile from '../../components/Mob-back-btn';
import AiGeneratedInterviewsTable from './AiGeneratedInterviewsTable';
import { ToastContainer, toast } from 'react-toastify';

const AllInterviews = () => {
  const companyId = JSON.parse(localStorage.getItem("user"))?.company_id;
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('interviews');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [detailedInterview, setDetailedInterview] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [isRoundsModalOpen, setIsRoundsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedStatus, setDebouncedStatus] = useState('');
  const [debouncedRating, setDebouncedRating] = useState('all');

  console.log('pdfPreviewUrl', pdfPreviewUrl, detailedInterview);


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
  const companyUserName = localStorage.getItem("companyUserName");
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(localStorage.getItem(`ai_features_${companyUserName}`) === 'true');

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


  // Implement search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedStatus(filterStatus);
      setDebouncedRating(ratingFilter);
      setPage(1);
      setHasMore(true);
      setFilteredInterviews([]);
    }, 500);

    // Clear the timer if searchTerm changes before 500ms
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, ratingFilter]);

  // Fetch feedbacks
  const { feedbacks, total: totalFeedbacks, error: feedbackError, isLoading: feedbackLoading } = useFeedbacks(page, limit, debouncedRating);

  // Fetch scheduled interviews
  const { assignedInterviews, error: interviewError, isLoading: interviewLoading, refetchAssignedInterviews } = useScheduledInterview(page, limit, debouncedSearch, debouncedStatus, debouncedRating);

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

  // Apply frontend filtering for ratings if backend doesn't handle it properly
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
      // Merge interviews with feedback data
      let mergedData = mergeInterviewsWithFeedbacks(assignedInterviews?.interviews, feedbacks);

      // Apply rating filter on merged data
      mergedData = applyRatingFilter(mergedData);

      console.log('Filtered data after rating filter:', mergedData?.length, 'items', assignedInterviews);

      if (page === 1) {
        setFilteredInterviews(mergedData);
      } else {
        setFilteredInterviews(prev => [...prev, ...mergedData]);
      }
      // ✅ FIXED: Properly handle hasMore for filtered results
      // If we have filtered results or if we're on page 1, check if there are more pages
      // If filtering returns no results, don't try to load more
      if (debouncedRating !== 'all') {
        // When filtering by rating, stop pagination if no results found
        setHasMore(mergedData?.length > 0 && page < assignedInterviews?.totalPages);
      } else {
        // Normal pagination logic for unfiltered results
        setHasMore(page < assignedInterviews?.totalPages);
      }

    } else {
      if (page === 1) {
        setFilteredInterviews([]);
      }
      setHasMore(false); // ✅ No more data available
    }
  }, [assignedInterviews?.interviews, feedbacks, page, debouncedRating]);



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

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isMeetingLinkActive = (interviewDate, scheduledTime) => {
    const now = currentTime;
    const interview = new Date(interviewDate);
    const [hours, minutes] = (scheduledTime || "00:00").split(':').map(Number);
    interview.setHours(hours, minutes, 0, 0);

    // Active 5 minutes before and until it's finished
    const activeTime = new Date(interview.getTime() - 5 * 60000);
    return now >= activeTime;
  };

  const isMeetingExpired = (interviewDate, scheduledTime) => {
    const now = currentTime;
    const interview = new Date(interviewDate);
    const [hours, minutes] = (scheduledTime || "00:00").split(':').map(Number);
    interview.setHours(hours + 1, minutes, 0, 0); // Assuming 1 hour duration
    return now > interview;
  };

  const getTimeLeft = (interviewDate, scheduledTime) => {
    const now = currentTime;
    const interview = new Date(interviewDate);
    const [hours, minutes] = (scheduledTime || "00:00").split(':').map(Number);
    interview.setHours(hours, minutes, 0, 0);

    const diff = interview.getTime() - now.getTime();
    if (diff <= 0) return null;

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${Math.floor((diff % 60000) / 1000)}s`;
  };

  const getInterviewRoundStatus = (date, scheduledTime, interview) => {
    const now = currentTime;
    const intDate = new Date(date);
    const [hours, minutes] = (scheduledTime || "00:00").split(':').map(Number);
    intDate.setHours(hours, minutes, 0, 0);

    // Manual progress status takes priority (set for walk-in interviews)
    if (interview.interviewProgressStatus === 'Completed' || interview.status === 'completed') {
      return { label: 'Completed', color: 'green', isDone: true };
    }
    if (interview.interviewProgressStatus === 'Missed') {
      return { label: 'Missed', color: 'red', isDone: true };
    }
    if (interview.interviewProgressStatus === 'Pending') {
      return { label: 'Pending', color: 'gray', isDone: true };
    }

    const diffMinutes = (intDate.getTime() - now.getTime()) / 60000;

    if (diffMinutes < -60) return { label: 'Finished', color: 'gray', isDone: true };
    if (diffMinutes <= 0 && diffMinutes >= -60) return { label: 'In Progress', color: 'blue', isLive: true };
    if (diffMinutes <= 5 && diffMinutes > 0) return { label: 'Starting Soon', color: 'purple', isLive: true };
    if (isToday(date)) return { label: 'Today', color: 'blue' };

    return { label: 'Upcoming', color: 'purple' };
  };

  const handleSeeAllRounds = (applicationId, e) => {
    if (e) e.stopPropagation();
    setSelectedApplicationId(applicationId);
    setIsRoundsModalOpen(true);
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
      hour12: false,
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
      case 'Completed': return theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800';
      case 'In Process': return theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Scheduled': return theme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-800';
      case 'Selected': return theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800';
      case 'Rejected': return theme === 'dark' ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800';
      case 'Hold': return theme === 'dark' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      default: return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const groupedInterviewsData = filteredInterviews ? Object.values(filteredInterviews.reduce((acc, interview) => {
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
  }) : [];

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

  const renderRatingFilter = () => (
    <div className="relative w-full">
      <label className="block text-gray-900 dark:text-white text-xs font-bold mb-2">
        Filter by Rating:
      </label>
      <select
        className={`w-full sm:min-w-[180px] lg:w-auto appearance-none rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-gray-200 hover:bg-white border-gray-300'}`}
        value={ratingFilter}
        onChange={(e) => setRatingFilter(e.target.value)}
      >
        <option value="all">All Ratings</option>
        <option value="0">No Rating</option>
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="3">3 Stars</option>
        <option value="4">4 Stars</option>
        <option value="5">5 Stars</option>
      </select>
      <ChevronDown className="absolute right-3 top-11 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className={`px-8 py-4 w-full min-h-screen ${theme === 'dark' ? 'bg-black' : ''}`}

    >
      <BackButtonMobile />
      <div className="max-w-screen-2xl">
        <div className={`mb-6 h-auto md:h-[15vh] flex items-center rounded-xl p-4 ${theme === 'dark' ? 'border border-gray-600 hover:shadow-xl hover:border-purple-500/50' : 'bg-gray-200 backdrop-blur-xl shadow-md'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-[#9333ea] flex items-center">
                <div className="p-3 mx-2 bg-[#9333ea]/10 rounded-full">
                  <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-gray-900 dark:text-white" />
                </div>
                Interview Management
              </h2>
            </div>

            {/* Search and Filter */}
            <div className='flex items-center w-full lg:w-auto px-4 sm:px-0'>
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4 w-full lg:w-[50vw]">
                <div className="w-full lg:w-[67%]">
                  <label className="block text-gray-900 dark:text-white text-xs font-bold mb-2">
                    Search:
                  </label>
                  <form onSubmit={handleSearchSubmit} autoComplete="off">
                    <div className="relative rounded-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by candidate name, job title, interviewer..."
                        className={`w-full pl-10 pr-10 py-2.5 border shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 duration-200 text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative w-full sm:flex-1 lg:w-auto">
                    <label className="block text-gray-900 dark:text-white text-xs font-bold mb-2">
                      Filter by Status:
                    </label>
                    <select
                      className={`w-full sm:min-w-[180px] lg:w-auto appearance-none rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-gray-200 hover:bg-white border-gray-300'}`}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {statuses?.map((status) => (
                        <option key={status._id} value={status._id}>
                          {status.applicationStatus.charAt(0).toUpperCase() + status.applicationStatus.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {renderRatingFilter()}
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
                ? `border-b-2 border-indigo-500 text-xl ${theme === 'dark' ? 'text-white' : 'text-black'}`
                : `hover:border-b-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              Interviews
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

        {/* Content */}
        <div className=" rounded-t-xl shadow-sm p-2 sm:p-6 ">
          {activeTab === 'interviews' && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedInterviewsData.map((group) => {
                  const interview = group.upcomingRound;
                  const roundStatus = getInterviewRoundStatus(interview.date, interview.scheduledTime, interview);

                  return (
                    <div
                      key={group.applicationID._id}
                      className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-[#f0f9f9] border-gray-100 text-gray-900'
                        }`}
                    >
                      <div className="p-4">
                        {/* Header with job title and round count */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                            </h3>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {group.rounds.length} {group.rounds.length === 1 ? 'Round' : 'Rounds'}
                          </span>
                        </div>

                        {/* Upcoming Interview inside card */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${roundStatus.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${roundStatus.color === 'green' ? 'text-green-500' : roundStatus.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>
                              {roundStatus.label}
                            </span>
                          </div>

                          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white'}`}>
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatDate(interview.date)} at {formatTime(interview.scheduledTime)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                              {interview.interviewerType === 'online' ? (
                                <Video className="h-3.5 w-3.5 text-gray-400" />
                              ) : (
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              )}
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {capitalizeFirstLetter(interview.interviewerType)} Interview
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-semibold">Interviewer:</span>{" "}
                                {interview?.interviewerID?.userName || "N/A"}
                              </span>
                            </div>

                            <div className="mt-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(interview.status)}`}>
                                {capitalizeFirstLetter(statuses?.find(s => s._id === interview.status)?.applicationStatus || interview.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className={`relative z-10 flex justify-end items-end px-4 py-3 mt-2 gap-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                        <button
                          onClick={(e) => handleSeeAllRounds(interview?.applicationID?._id, e)}
                          className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <ThumbsDown className="h-4 w-4" />
                          Feedback
                        </button>
                        {/* <button
                          onClick={() => {
                            setDetailedInterview(interview);
                            setIsFeedbackModalOpen(true);
                          }}
                          className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </InfiniteScroll>
          )}

          {/* AI Generated Interviews Section */}
          {(aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && activeTab === 'ai' && (
            <AiGeneratedInterviewsTable />
          )}

        </div>

        {/* See All Rounds Modal */}
        {isRoundsModalOpen && selectedApplicationId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-start gap-5">
                {(() => {
                  const group = groupedInterviewsData.find(g => g.applicationID?._id === selectedApplicationId);
                  const rounds = group?.rounds || [];
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
                  {groupedInterviewsData.find(g => g.applicationID?._id === selectedApplicationId)?.rounds?.length} Rounds
                </span>
              </div>

              {/* Scrollable Rounds List */}
              <div className="px-8 pb-8 overflow-y-auto space-y-4 text-gray-900 dark:text-gray-100">
                {groupedInterviewsData.find(g => g.applicationID?._id === selectedApplicationId)?.rounds
                  ?.map((round) => {
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
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFeedbackClick(round)}
                              className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${theme === 'dark' ? 'border-gray-700 text-blue-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-blue-500 hover:shadow-md'}`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <ThumbsDown className="h-4 w-4" />
                              Feedback
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatDate(round.date)} at <span className={`px-2 py-0.5 rounded-md font-bold ${theme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>{formatTime(round.scheduledTime)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>T</div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{capitalizeFirstLetter(round.interviewerType)} Interview</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>I</div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Interviewer: {round?.interviewerID?.userName || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* interview Detail Modal */}
        {isDetailModalOpen && detailedInterview && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`flex justify-between items-center border-b px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-gray-200'}`}>
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
                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Candidate</h3>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(detailedInterview?.applicationID?.candidateID?.userName)}</p>
                  </div>

                  {/* Position */}

                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Position</h3>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{detailedInterview?.applicationID?.jobID?.title}</p>
                  </div>

                  {/* Interviewer */}

                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Interviewer</h3>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(detailedInterview?.interviewerID?.userName)}</p>
                  </div>

                  {/* Status */}

                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Status</h3>
                    <div className="mt-1">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(getStatusName(detailedInterview?.status))}`}>
                        {capitalizeFirstLetter(getStatusName(detailedInterview?.status))}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}

                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Date & Time</h3>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{formatDate(detailedInterview?.date)}</p>
                  </div>

                  {/* { Round Name } */}
                  <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Round Name</h3>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{detailedInterview?.roundID.roundID}</p>
                  </div>
                </div>

                {/* Skills Section */}

                {/* Skills Section */}

                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailedInterview?.skills?.map((skill, index) => (
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
                    className={`px-5 py-2 border rounded-xl transition-colors font-medium ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-300'}`}
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
            <div className={`rounded-lg shadow-lg max-w-4xl w-full p-5 relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resume Preview</h2>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  &times;
                </button>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className={`w-full h-[600px] border ${theme === 'dark' ? 'border-gray-700' : ''}`}
                title="Resume PDF"
              ></iframe>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {isFeedbackModalOpen && detailedInterview && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`flex justify-between items-center border-b px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-gray-200'}`}>
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
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{detailedInterview?.candidateName}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{detailedInterview?.jobTitle}</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Feedback Title</label>
                    <input
                      type="text"
                      readOnly
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-100 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-300 border-gray-200 text-black'}`}
                      value={feedbackForm.feedbackTitle}
                      placeholder="e.g., Strong Technical Skills"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Detailed Feedback</label>
                    <div className="relative">
                      <textarea
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none min-h-[20vh] max-h-[30vh] ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-300 border-gray-200 text-black'}`}
                        value={capitalizeFirstLetter(feedbackForm.feedback)}
                        readOnly
                        rows={isFeedbackExpanded ? 6 : 2}
                      // style={ { overflow: 'hidden' } }
                      ></textarea>
                      {feedbackForm.feedback && feedbackForm.feedback.split('\n').length > 2 && (
                        <button
                          type="button"
                          className={`absolute right-3 bottom-2 text-xs font-medium px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'text-white bg-gray-600 hover:bg-gray-500' : 'text-black bg-red hover:bg-indigo-50'}`}
                          onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                        >
                          {isFeedbackExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  </div>


                  <div className="flex flex-col items-center justify-center py-3">
                    <label className={`block text-base font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
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
        )
        }

      </div >


      {/* {filter ////} */}
      {!filteredInterviews?.length && !interviewLoading && (
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

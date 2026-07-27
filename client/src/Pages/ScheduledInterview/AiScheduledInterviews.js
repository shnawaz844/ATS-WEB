import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Video, MapPin, Calendar, Trash2, PenTool, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from "react-toastify";

const AiScheduledInterviews = ({
    assignedInterviews,
    isAdmin,
    capitalizeFirstLetter,
    formatDate,
    handleResumeView,
    handleFeedbackClick,
    handleEdit,
    handleDeleteInterview,
    statuses,
    interviewRounds,
    currentTheme
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRoundsModalOpen, setIsRoundsModalOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    // Update current time every second for the countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Helper functions for interview status
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
        interview.setHours(hours + 1, minutes, 0, 0);
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

        if (interview.status === 'completed' || interview.interviewProgressStatus === 'Completed') {
            return { label: 'Completed', color: 'green', isDone: true };
        }

        const diffMinutes = (intDate.getTime() - now.getTime()) / 60000;

        if (diffMinutes < -60) return { label: 'Finished', color: 'gray', isDone: true };
        if (diffMinutes <= 0 && diffMinutes >= -60) return { label: 'In Progress', color: 'blue', isLive: true };
        if (diffMinutes <= 5 && diffMinutes > 0) return { label: 'Starting Soon', color: 'purple', isLive: true };
        if (isToday(date)) return { label: 'Today', color: 'blue' };

        return { label: 'Upcoming', color: 'purple' };
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

    const handleJoinMeeting = (id, link) => {
        if (!link) {
            toast.error("Meeting link not available");
            return;
        }
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const handleSeeAllRounds = (applicationId, e) => {
        if (e) e.stopPropagation();
        setSelectedApplicationId(applicationId);
        setIsRoundsModalOpen(true);
    };

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

        const sortedRounds = [...group.rounds].sort((a, b) => getCompareValue(a) - getCompareValue(b));

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

    return (
        <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedInterviews.map((group) => {
                    const interview = group.upcomingRound;
                    const roundStatus = getInterviewRoundStatus(interview.date, interview.scheduledTime, interview);

                    return (
                        <div
                            key={group.applicationID._id}
                            className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border ${currentTheme === 'dark'
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-purple-50/30 border-purple-100'
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-sm truncate ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {capitalizeFirstLetter(interview?.applicationID?.jobID?.title) || "N/A"}
                                        </h3>
                                        <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {capitalizeFirstLetter(interview?.applicationID?.candidateID?.userName) || "N/A"}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${currentTheme === 'dark' ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                        {group.rounds.length} {group.rounds.length === 1 ? 'Round' : 'Rounds'} (AI)
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${roundStatus.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${roundStatus.color === 'green' ? 'text-green-500' : roundStatus.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>
                                            {roundStatus.label}
                                        </span>
                                    </div>

                                    <div className={`p-3 rounded-xl ${currentTheme === 'dark' ? 'bg-gray-900/50' : 'bg-white'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {formatDate(interview.date)} at {interview.scheduledTime}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            {interview.interviewerType === 'online' ? (
                                                <Video className="h-3.5 w-3.5 text-gray-400" />
                                            ) : (
                                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            )}
                                            <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {capitalizeFirstLetter(interview.interviewerType)} Interview
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                AI Interviewer: {interview?.interviewerID?.userName || "N/A"}
                                            </span>
                                        </div>

                                        {/* Join Button & Countdown for active AI meetings */}
                                        {interview.interviewerType === 'online' && interview.meetingLink && !roundStatus.isDone && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                {isMeetingLinkActive(interview.date, interview.scheduledTime) ? (
                                                    <button
                                                        onClick={() => handleJoinMeeting(interview._id, interview.meetingLink)}
                                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Video className="h-3.5 w-3.5" />
                                                        Join AI Interview
                                                    </button>
                                                ) : (
                                                    !isMeetingExpired(interview.date, interview.scheduledTime) && (
                                                        <div className="flex items-center gap-2 text-[11px] text-amber-600 font-medium">
                                                            <Clock className="w-4 h-4" />
                                                            Link active 5m before
                                                        </div>
                                                    )
                                                )}
                                                {getTimeLeft(interview.date, interview.scheduledTime) && (
                                                    <div className={`text-[11px] font-bold ${isMeetingLinkActive(interview.date, interview.scheduledTime) ? 'text-purple-600' : 'text-gray-400'}`}>
                                                        Interview starts in {getTimeLeft(interview.date, interview.scheduledTime)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`relative z-10 flex justify-between items-center px-4 py-3 mt-2 gap-3 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
                                <button
                                    onClick={(e) => handleSeeAllRounds(interview?.applicationID?._id, e)}
                                    className={`text-sm font-medium flex items-center gap-1 ${currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
                                >
                                    See All Rounds
                                </button>
                                <button
                                    onClick={() => handleEdit(interview)}
                                    className={`text-sm font-medium flex items-center gap-1 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`}
                                >
                                    Edit Details
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI Rounds Modal */}
            {isRoundsModalOpen && selectedApplicationId && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                    <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="p-8 pb-4 flex items-start gap-5">
                            {(() => {
                                const rounds = assignedInterviews?.interviews?.filter(i => i.applicationID?._id === selectedApplicationId) || [];
                                const first = rounds[0];
                                const initial = first?.applicationID?.candidateID?.userName?.[0] || "?";
                                return (
                                    <>
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${currentTheme === 'dark' ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                            {capitalizeFirstLetter(initial)}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {capitalizeFirstLetter(first?.applicationID?.jobID?.title) || "N/A"} (AI)
                                            </h2>
                                            <p className={`text-lg ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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

                        <div className="px-8 mb-4 flex justify-between items-center">
                            <h3 className={`text-xs font-bold uppercase tracking-widest ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>AI Scheduled Rounds</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${currentTheme === 'dark' ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                {assignedInterviews?.interviews?.filter(i => i.applicationID?._id === selectedApplicationId).length} Rounds
                            </span>
                        </div>

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
                                    const roundStatus = getInterviewRoundStatus(round.date, round.scheduledTime, round);
                                    return (
                                        <div key={round._id} className={`p-5 rounded-2xl border transition-all duration-200 ${currentTheme === 'dark' ? 'bg-gray-800/40 border-gray-700' : 'bg-[#f8fafc] border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${roundStatus.color === 'green' ? (currentTheme === 'dark' ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700') : roundStatus.color === 'blue' ? (currentTheme === 'dark' ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700') : (currentTheme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700')}`}>
                                                        {roundStatus.label}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(round.status)}`}>
                                                        {capitalizeFirstLetter(statuses?.find(s => s._id === round.status)?.applicationStatus || round.status)}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleDeleteInterview(round._id, e)}
                                                        className={`p-2 rounded-lg border transition-all ${currentTheme === 'dark' ? 'border-gray-700 text-red-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-red-500 hover:shadow-md'}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedbackClick(round)}
                                                        className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-medium ${currentTheme === 'dark' ? 'border-gray-700 text-blue-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-blue-500 hover:shadow-md'}`}
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <ThumbsDown className="h-4 w-4" />
                                                        Give feedback
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {formatDate(round.date)} at <span className={`px-2 py-0.5 rounded-md font-bold ${currentTheme === 'dark' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>{round.scheduledTime}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Video className="h-4 w-4 text-gray-400" />
                                                    <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{capitalizeFirstLetter(round.interviewerType)} AI Interview</span>
                                                </div>

                                                {/* Countdown for Round Modal */}
                                                {round.interviewerType === 'online' && round.meetingLink && !roundStatus.isDone && (
                                                    <div className="mt-2 pt-2 border-t border-purple-100/30">
                                                        {isMeetingLinkActive(round.date, round.scheduledTime) ? (
                                                            <button
                                                                onClick={() => handleJoinMeeting(round._id, round.meetingLink)}
                                                                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                                                            >
                                                                <Video className="w-3 h-3" />
                                                                Join AI Interview Now
                                                            </button>
                                                        ) : (
                                                            !isMeetingExpired(round.date, round.scheduledTime) && (
                                                                <div className="text-[10px] text-amber-600 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    Link active 5m before
                                                                </div>
                                                            )
                                                        )}
                                                        {getTimeLeft(round.date, round.scheduledTime) && !isMeetingExpired(round.date, round.scheduledTime) && (
                                                            <div className={`text-[11px] font-bold mt-1 ${isMeetingLinkActive(round.date, round.scheduledTime) ? 'text-purple-600' : 'text-gray-400'}`}>
                                                                Starts in {getTimeLeft(round.date, round.scheduledTime)}
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
        </div>
    );
};

export default AiScheduledInterviews;


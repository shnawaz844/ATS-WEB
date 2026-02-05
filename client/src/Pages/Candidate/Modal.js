import React, { useState } from 'react'

import { useTheme } from '../../context/ThemeContext';

const Modal = ({ getStatusColor, isOpen, onClose, app, getStatusName }) => {
    const { theme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'resume'

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1) || '';
    };

    const isMeetingActive = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        try {
            const interviewDate = new Date(dateStr);
            const [hours, minutes] = timeStr.split(':').map(Number);
            interviewDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            const fiveMinutesBefore = new Date(interviewDate.getTime() - 5 * 60 * 1000);
            return now >= fiveMinutesBefore;
        } catch (e) {
            return false;
        }
    };

    // Safe JSON parsing for questions and answers
    const parseQuestionsAndAnswers = () => {
        try {
            // Check if questions is already an array
            if (Array.isArray(app.questions)) {
                return {
                    questions: app.questions,
                    answers: app.answers || []
                };
            }

            // Try to parse questions if it's a string
            const questions = typeof app.questions?.[0] === 'string'
                ? JSON.parse(app.questions[0])
                : app.questions || [];

            // Try to parse answers if it's a string
            const answers = typeof app.answers?.[0] === 'string'
                ? JSON.parse(app.answers[0])
                : app.answers || [];

            return { questions, answers };
        } catch (error) {
            console.error('Error parsing questions or answers:', error);
            return { questions: [], answers: [] };
        }
    };

    if (!isOpen) return null;

    const { questions, answers } = parseQuestionsAndAnswers();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header section with improved styling */}
                <div className={`flex justify-between items-center p-5 border-b rounded-t-xl ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-700 border-white'}`}>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${activeTab === 'details'
                                ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'hover:bg-gray-100 text-black bg-gray-300')
                                : (theme === 'dark' ? 'bg-gray-800 text-gray-400 border border-gray-600' : 'bg-gray-700 text-white border border-white shadow-md')
                                }`}
                        >
                            Application Details
                        </button>
                        {app.resume && (
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${activeTab === 'resume'
                                    ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'text-black hover:bg-gray-100 bg-gray-300')
                                    : (theme === 'dark' ? 'bg-gray-800 text-gray-400 border border-gray-600' : 'bg-gray-700 text-white border border-white shadow-md')
                                    }`}
                            >
                                Resume
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 bg-transparent rounded-full p-2 hover:bg-gray-500 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={`max-h-[calc(90vh-80px)] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : ''}`}>
                    {activeTab === 'details' ? (
                        <div className="p-8 space-y-8">
                            {/* Job Information Section */}
                            <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-blue-100'}`}>
                                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Job Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Title</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(app?.jobID?.title)}</p>
                                    </div>
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{app?.jobID?.city}, {app?.jobID?.state}</p>
                                    </div>
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{app?.jobID?.type}</p>
                                    </div>
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Schedule</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{app?.jobID?.scheduleType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Application Status */}
                            <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Application Status
                                </h3>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(app.applicationStatus)}`}>
                                    {capitalizeFirstLetter(getStatusName(app.applicationStatusId))}
                                </span>
                            </div>

                            {/* Your Information */}
                            <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-800' : 'bg-blue-100 border-indigo-100'}`}>
                                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-800'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Your Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Contact</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{app.contactInfo}</p>
                                    </div>
                                    <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Experience</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(app.experience)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Details Section */}
                            {app.interview && (
                                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-purple-400' : 'text-purple-800'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Interview Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Schedule</p>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                {new Date(app.interview.date).toLocaleDateString()} at {app.interview.scheduledTime}
                                            </p>
                                        </div>
                                        <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{capitalizeFirstLetter(app.interview.interviewerType)}</p>
                                        </div>
                                        {app.interview.interviewerType === 'online' && app.interview.meetingLink && (
                                            <div className={`rounded-xl p-4 shadow-sm md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Meeting Link</p>
                                                    {isMeetingActive(app.interview.date, app.interview.scheduledTime) && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700`}>
                                                            Active Now
                                                        </span>
                                                    )}
                                                </div>
                                                {isMeetingActive(app.interview.date, app.interview.scheduledTime) ? (
                                                    <a
                                                        href={app.interview.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-500 hover:text-blue-600 font-bold break-all"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        {app.interview.meetingLink}
                                                    </a>
                                                ) : (
                                                    <div className="inline-flex items-center text-gray-400 font-medium break-all cursor-not-allowed">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Meeting link is locked (Will activate 5 mins before)
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Application Questions */}
                            {questions.length > 0 && (
                                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-100 border-green-100'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Application Questions
                                    </h3>
                                    <div className="space-y-4">
                                        {questions.map((question, index) => (
                                            <div key={index} className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{capitalizeFirstLetter(question)}</p>
                                                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{answers[index] || 'No answer provided'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[calc(90vh-80px)]">
                            <object
                                data={app.resume}
                                className="w-full h-full"
                                width="800"
                                height="500"
                            >
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                    <p className="text-gray-500">Unable to display resume preview</p>
                                </div>
                            </object>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal
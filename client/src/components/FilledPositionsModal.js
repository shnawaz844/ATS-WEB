import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Edit } from "lucide-react";

export default function FilledPositionsModal({
    isOpen,
    onClose,
    filledJobs,
    jobStatuses,
    companyUserName,
}) {
    const navigate = useNavigate();
    const { theme } = useTheme();

    if (!isOpen) return null;

    // Helper function to get status name from status ID
    const getStatusNameById = (statusId) => {
        if (!statusId || !jobStatuses || jobStatuses.length === 0) {
            return "Unknown";
        }

        const statusObj = jobStatuses.find(
            (status) => status._id === statusId || status.id === statusId
        );

        return (
            statusObj?.jobStatus || statusObj?.status || statusObj?.name || "Unknown"
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-[#121212] border border-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Filled Positions</h2>
                    <button
                        onClick={onClose}
                        className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {filledJobs && filledJobs.length > 0 ? (
                        <div className="space-y-6">
                            {filledJobs.map((job, index) => {
                                const statusName = getStatusNameById(job.status);

                                return (
                                    <div
                                        key={job._id || job.id || index}
                                        className={`${theme === 'dark' ? 'bg-[#1c1c1c] border-gray-800' : 'bg-white border-gray-200'} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
                                    >
                                        {/* Job Title and Status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {job.title || "No Title"}
                                            </h3>
                                            <span
                                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border
                        ${/closed|filled|completed/i.test(statusName)
                                                        ? (theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200')
                                                        : (theme === 'dark' ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200')
                                                    }`}
                                            >
                                                {statusName}
                                            </span>
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.type && (
                                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium ${theme === 'dark' ? 'bg-blue-900/20 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'} rounded-full border`}>
                                                    {job.type}
                                                </span>
                                            )}
                                            {job.locationType && (
                                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium ${theme === 'dark' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-200'} rounded-full border`}>
                                                    {job.locationType}
                                                </span>
                                            )}
                                            {(job.workType || job.schedule) && (
                                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium ${theme === 'dark' ? 'bg-purple-900/20 text-purple-400 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'} rounded-full border`}>
                                                    {job.workType || job.schedule || "Schedule"}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className={`flex justify-between items-center mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={(e) => {
                                                        const path = `/${companyUserName}/post-job`;
                                                        console.log("Navigating to:", path);
                                                        console.log("companyUserName:", companyUserName);
                                                        navigate(path, {
                                                            state: { job },
                                                        });
                                                    }}
                                                    className={`flex items-center ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-blue-50'} text-white font-medium transition-colors duration-200 text-sm px-2 py-1 rounded-xl`}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    View & Edit
                                                </button>
                                                <button className={`inline-flex items-center px-4 py-2 text-sm font-medium ${theme === 'dark' ? 'text-red-400 bg-red-900/20 border-red-800 hover:bg-red-900/40' : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'} border rounded-xl transition-colors`}>
                                                    Delete
                                                </button>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button className={`flex items-center ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'} text-sm font-medium`}>
                                                    Open
                                                </button>
                                                <button className={`flex items-center ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'} text-sm font-medium`}>
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">✅</div>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} text-lg font-medium`}>
                                No filled positions found
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>
                                All positions are currently open or in other statuses
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex justify-end`}>
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 text-white rounded-xl ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-700'} transition-colors`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

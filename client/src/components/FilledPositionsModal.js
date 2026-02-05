import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";

export default function FilledPositionsModal({
    isOpen,
    onClose,
    filledJobs,
    jobStatuses,
    companyUserName,
}) {
    const navigate = useNavigate();

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 rounded-xl">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Filled Positions</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
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
                                        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Job Title and Status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {job.title || "No Title"}
                                            </h3>
                                            <span
                                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border
                        ${/closed|filled|completed/i.test(statusName)
                                                        ? "bg-red-50 text-red-700 border-red-200"
                                                        : /inactive|expired|draft/i.test(statusName)
                                                            ? "bg-gray-50 text-gray-700 border-gray-200"
                                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                                    }`}
                                            >
                                                {statusName}
                                            </span>
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.type && (
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                                    {job.type}
                                                </span>
                                            )}
                                            {job.locationType && (
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                                                    {job.locationType}
                                                </span>
                                            )}
                                            {(job.workType || job.schedule) && (
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                                                    {job.workType || job.schedule || "Schedule"}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
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
                                                    className="flex items-center text-white bg-slate-600 font-medium transition-colors duration-200 text-sm hover:bg-blue-50 px-2 py-1 rounded-xl"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    View & Edit
                                                </button>
                                                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                                                    Delete
                                                </button>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium">
                                                    Open
                                                </button>
                                                <button className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium">
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
                            <p className="text-gray-500 text-lg font-medium">
                                No filled positions found
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                All positions are currently open or in other statuses
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2  text-white rounded-xl bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
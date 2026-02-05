import React from 'react';
import { useNavigate } from 'react-router-dom';

const OpenPositionsModal = ({
    isOpen,
    onClose,
    openJobs,
    jobStatuses,
    companyUserName, // This should be passed from parent
    onEditJob // Optional callback if you want to handle edit differently
}) => {
    const navigate = useNavigate(); // Use the hook directly in the component

    if (!isOpen) return null;

    // Helper function to get status name from status ID
    const getStatusNameById = (statusId) => {
        if (!statusId || !jobStatuses || jobStatuses.length === 0) {
            return 'Unknown';
        }

        const statusObj = jobStatuses.find(status =>
            status._id === statusId || status.id === statusId
        );

        return statusObj?.jobStatus || statusObj?.status || statusObj?.name || 'Unknown';
    };

    // Handle edit job navigation
    const handleEditJob = (job) => {
        console.log('Editing job:', job);
        console.log('Company username:', companyUserName);

        if (companyUserName) {
            // Navigate to the post-job form with job data
            navigate(`/${companyUserName}/post-job`, {
                state: { job }
            });
        } else {
            // Fallback: try to get company info from localStorage or use a default route
            const user = JSON.parse(localStorage.getItem("user"));
            const fallbackCompanyName = user?.companyUserName || user?.company_username || 'company';

            console.log('Using fallback company name:', fallbackCompanyName);
            navigate(`/${fallbackCompanyName}/post-job`, {
                state: { job }
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Open Positions</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {openJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">No open positions found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {openJobs.map((job, index) => (
                                <div key={job._id || job.id || index} className="border rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title || 'No Title'}</h3>

                                            {/* Job metadata row 1 */}
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {job.type || 'Full-Time'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {job.locationType === 'remote' ? 'Remote' : 'On-site'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {job.shift || 'Morning Shift'}
                                                </div>
                                            </div>

                                            {/* Job metadata row 2 */}
                                            <div className="flex items-center gap-4 mb-3">
                                                {job.compensation && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Compensation: {job.compensation}
                                                    </div>
                                                )}
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {job.city || 'Noida'}, {job.state || 'UP'}, {job.country || 'IN'}
                                                </div>
                                                {job.createdAt && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Posted: {new Date(job.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Department and Hiring Manager */}
                                            <div className="flex items-center gap-4 mb-4">
                                                {job.department && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9m0 12h2" />
                                                        </svg>
                                                        {job.department}
                                                    </div>
                                                )}
                                                {job.hiringManager && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Hiring Manager: {job.hiringManager}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border
                      ${'bg-green-50 text-green-700 border-green-200'}`}>
                                            {getStatusNameById(job.status)}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditJob(job);
                                                }}
                                                className="flex items-center text-white bg-slate-600 font-medium transition-colors duration-200 text-sm hover:bg-blue-50 px-2 py-1 rounded-xl"
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                View & Edit
                                            </button>
                                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Open
                                            </button>
                                            <button className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white rounded-xl bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenPositionsModal;
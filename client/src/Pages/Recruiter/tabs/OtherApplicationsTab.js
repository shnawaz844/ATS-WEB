import React, { useState, useEffect } from 'react';

const OtherApplicationsTab = ({ candidateId,statuses }) => {
    const [applications, setApplications] = useState([]);

    const capitalizeFirstLetter = (string) =>
        string ? string.charAt(0).toUpperCase() + string.slice(1) : '';

    const formatIndianRupee = (num) => {
        if (!num) return '0';
        const numStr = num.toString().replace(/[^\d]/g, '');
        if (parseInt(numStr) === 0) return '0';
        let lastThree = numStr.substring(numStr.length - 3);
        let otherNumbers = numStr.substring(0, numStr.length - 3);
        if (otherNumbers !== '') {
            lastThree = ',' + lastThree;
        }
        const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        return formattedOtherNumbers + lastThree;
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/application/candidate/${candidateId}`)
            .then((res) => res.json())
            .then((data) => setApplications(data.applications || []));
    }, [candidateId]);

    return (
        <div className="mb-8 relative">
            {/* Decorative background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 blur-xl"></div>

            {/* Title */}
            <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-bold text-black">Other Applications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {applications.length > 0 ? (
                    applications.map((app) => {
                        const initial = app?.jobID?.title?.[0] || '?';
                        return (
                            <div
                                key={app._id}
                                className="group bg-[#b8e1e1] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                            >
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                            {capitalizeFirstLetter(app.jobID?.title) || 'N/A'}
                                        </h3>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                                            { capitalizeFirstLetter( app.applicationStatusId ) || 'N/A'}
                                            
                                        </span>
                                    </div>

                                    {/* Job & candidate info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
                                                <span className="text-blue-800 text-sm font-medium">
                                                    {capitalizeFirstLetter(initial)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {app.jobID?.locationType || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">Location</p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-700">
                                            <p>
                                                <strong>Schedule:</strong>{' '}
                                                {app.jobID?.scheduleType || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Shift:</strong>{' '}
                                                {app.jobID?.shiftStart} - {app.jobID?.shiftEnd}
                                            </p>
                                            <p>
                                                <strong>Compensation:</strong> ₹
                                                {formatIndianRupee(app.jobID?.compensation)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center px-4 py-3 bg-gray-300">
                                    <a
                                        href={app.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-black font-medium flex items-center gap-1 underline"
                                    >
                                        View Resume
                                    </a>
                                </div>

                                {/* Bottom line */}
                                <div className="h-1 w-full bg-white"></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full bg-white rounded-2xl shadow p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Other Applications</h3>
                        <p className="text-gray-500 mb-4 max-w-md mx-auto">
                            The candidate has not applied to any other positions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtherApplicationsTab;

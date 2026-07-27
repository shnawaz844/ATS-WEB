import axios from 'axios';
import React, { useState, useEffect } from 'react';

const OtherApplicationsTab = ({ candidateId, statuses }) => {
    const [applications, setApplications] = useState([]);
    const [statusMap, setStatusMap] = useState({});

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

    useEffect(() => {
        // Fetch applications
        fetch(`${process.env.REACT_APP_BASE_URL}/application/candidate/${candidateId}`)
            .then((res) => res.json())
            .then((data) => setApplications(data.applications || []));

        // Fetch statuses
        axios.get(`${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`)
            .then(res => {
                const map = {};
                res.data.applicationStatuses.forEach(s => {
                    map[s._id] = s.applicationStatus;
                });
                setStatusMap(map);
            })
            .catch(err => console.error("Failed to load statuses", err));
    }, [candidateId]);

    return (
        <div className="mb-8 relative">
            {/* Decorative background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>

            {/* Title */}
            <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Other Applications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {applications.length > 0 ? (
                    applications.map((app) => {
                        const initial = app?.jobID?.title?.[0] || '?';
                        return (
                            <div
                                key={app._id}
                                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                                            {capitalizeFirstLetter(app.jobID?.title) || 'N/A'}
                                        </h3>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                            {capitalizeFirstLetter(statusMap[app.applicationStatusId]) || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Job & candidate info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                                <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                                                    {capitalizeFirstLetter(initial)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {app.jobID?.locationType || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <p>
                                                <strong className="text-gray-800 dark:text-gray-200">Schedule:</strong>{' '}
                                                {app.jobID?.scheduleType || 'N/A'}
                                            </p>
                                            <p>
                                                <strong className="text-gray-800 dark:text-gray-200">Shift:</strong>{' '}
                                                {app.jobID?.shiftStart} - {app.jobID?.shiftEnd}
                                            </p>
                                            <p>
                                                <strong className="text-gray-800 dark:text-gray-200">Compensation:</strong> ₹
                                                {formatIndianRupee(app.jobID?.compensation)}{app.jobID?.compensation?.toString().toLowerCase().includes("month") || app.jobID?.compensation?.toString().toLowerCase().includes("/mo") ? "/Month" : "/Year"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                                    <a
                                        href={app.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
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
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Other Applications</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            The candidate has not applied to any other positions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtherApplicationsTab;


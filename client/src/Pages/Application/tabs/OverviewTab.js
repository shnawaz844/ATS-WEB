import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const OverviewTab = ({ job, applications, statusCounts: backendStatusCounts, totalApplications }) => {
    const { theme } = useTheme();
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const fetchApplicationStatuses = async () => {
            try {
                console.log('ComponentA useEffect fired, reloadKey=',);
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const companyId = storedUser?.company_id;
                if (!companyId) return;

                const res = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses`,
                    { headers: { 'Company_id': companyId } }
                );
                if (!res.ok) throw new Error('Failed to fetch statuses');

                const { applicationStatuses } = await res.json();
                applicationStatuses.sort(
                    (a, b) => Number(a.applicationStep) - Number(b.applicationStep)
                );
                console.log('componentA fetched statuses:', applicationStatuses);
                setStatuses(applicationStatuses);
            } catch (err) {
                console.error('Error fetching statuses:', err);
            }
        };

        fetchApplicationStatuses();
    }, []);

    const totalApps = totalApplications || applications.length;

    const statusCounts = useMemo(() => {
        if (backendStatusCounts) return backendStatusCounts;
        return statuses.reduce((acc, status) => {
            acc[status._id] = applications.filter(
                app => app.applicationStatusId === status._id
            ).length;
            return acc;
        }, {});
    }, [statuses, applications, backendStatusCounts]);

    // Color palette for status cards
    const statusColors = [
        'from-blue-500 to-blue-600',
        'from-green-500 to-green-600',
        'from-yellow-500 to-yellow-600',
        'from-purple-500 to-purple-600',
        'from-red-500 to-red-600',
        'from-indigo-500 to-indigo-600',
        'from-pink-500 to-pink-600',
        'from-teal-500 to-teal-600'
    ];

    return (
        <div className="min-h-screen bg-transparent p-1">
            <div className="max-w-7xl mx-auto flex flex-col justify-center items-center">

                {/* Combined Header and Stats Section */}
                <div className={`rounded-2xl shadow-xl border overflow-hidden mb-6 p-5 sm:p-6 lg:p-8 w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-white border-gray-200 shadow-md'
                    }`}>
                    <div className="flex flex-col lg:flex-row h-auto lg:h-[32vh] min-h-[280px]">
                        {/* Header Section - 30% width on large screens */}
                        <div className={`lg:w-[30%] w-full p-5 sm:p-6 lg:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r transition-colors duration-300 rounded-xl  ${theme === 'dark'
                            ? 'bg-white/10 border-gray-700'
                            : 'bg-gray-100 shadow-md border-gray-200'
                            }`}>
                            <div className="text-center lg:text-left">
                                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start mb-4 gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 dark:bg-white/10 bg-white shadow-lg  rounded-full lg:rounded-full flex items-center justify-center  flex-shrink-0">
                                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#9333ea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="lg:hidden w-full text-center sm:text-left">
                                        <h1 className={`text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                            <span className="block break-words overflow-wrap-anywhere">
                                                {job?.title || 'Job'}
                                            </span>
                                            <span className="block mt-1 text-lg">Overview</span>
                                        </h1>
                                        <p className={`text-base mt-2 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                                            Track and manage your application pipeline
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden lg:block space-y-3">
                                    <div className="space-y-1">
                                        <span className={`block text-2xl xl:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                            Overview
                                        </span>
                                        <h1
                                            className="text-[#9333ea] font-bold leading-tight break-words overflow-wrap-anywhere"
                                            style={{
                                                fontSize: `clamp(1.25rem, ${Math.max(1.25, 2.25 - (job?.title || 'Job').length * 0.02)}rem, 2.25rem)`,
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            {job?.title || 'Job'}
                                        </h1>
                                    </div>
                                    <p className={`text-sm lg:text-base leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Track and manage your application pipeline with real-time insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section - 70% width on large screens */}
                        <div className="lg:w-[70%] w-full p-5 sm:p-6 lg:p-8 flex flex-col">
                            <div className="dark:bg-white/10 bg-gray-100 dark:shadow-inner shadow-md rounded-xl lg:rounded-2xl flex-1 min-h-[200px] lg:min-h-0 relative overflow-hidden">
                                {/* Content */}
                                <div className="relative z-10 p-5 sm:p-6 lg:p-8 h-full flex flex-col">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-5 sm:mb-6 gap-4 sm:gap-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center mb-3">
                                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                                <p className="dark:text-gray-300 text-gray-700 text-sm sm:text-sm font-medium uppercase tracking-wider">
                                                    Total Applications
                                                </p>
                                            </div>
                                            <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold dark:text-white text-gray-900 leading-none mb-2">
                                                {totalApps.toLocaleString()}
                                            </p>
                                            <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-sm">
                                                Active candidates in pipeline
                                            </p>
                                        </div>

                                        <div className="dark:bg-white/20
                                        w-10 h-10 lg:w-12 lg:h-12 dark:backdrop-blur-sm bg-white backdrop-blur-sm p-3 sm:p-3 lg:p-4 rounded-full lg:rounded-full flex-shrink-0 sm:ml-4 shadow-sm dark:shadow-none">
                                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#9333ea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Bottom Status Bar */}
                                    <div className="mt-auto">
                                        <div className="dark:bg-white/10 bg-white dark:backdrop-blur-sm backdrop-blur-sm rounded-xl p-3 sm:p-3 lg:p-4 shadow-sm dark:shadow-none">
                                            <div className="flex flex-col sm:flex-row items-center justify-between text-sm sm:text-sm gap-2 sm:gap-0">
                                                <div className="flex items-center dark:text-gray-300 text-gray-700">
                                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                                    <span className="font-medium">Live tracking enabled</span>
                                                </div>
                                                <div className="flex items-center text-green-600 dark:text-green-300">
                                                    <svg className="w-4 h-4 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    <span className="font-medium">Real-time updates</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Status Breakdown Section */}
                <div className={`rounded-2xl shadow-xl p-8 border w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 shadow-mdborder-gray-200'
                    }`}>
                    <div className="mb-8">
                        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                            Status Breakdown
                        </h2>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Detailed view of applications across different stages
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {statuses.map((status, index) => {
                            const count = statusCounts[status._id] || 0;
                            const colorClass = statusColors[index % statusColors.length];
                            const percentage = totalApps > 0 ? ((count / totalApps) * 100).toFixed(1) : 0;

                            return (
                                <div
                                    key={status._id}
                                    className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <div className={`bg-gradient-to-r ${colorClass} p-6 relative`}>
                                        <div className="absolute top-2 right-2 opacity-20">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-white text-sm font-medium uppercase tracking-wider mb-2">
                                            {status.applicationStatus}
                                        </p>
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {count}
                                        </p>
                                        <p className="text-white text-opacity-80 text-sm">
                                            {percentage}% of total
                                        </p>
                                    </div>
                                    <div className={`p-4 bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'}`}>
                                        <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                            <div
                                                className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {statuses.length === 0 && (
                        <div className="text-center py-12">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No application statuses found</p>
                            <p className="text-gray-400 text-sm mt-1">Set up your application pipeline to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;

import React, { useState, useEffect, useCallback } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import OverviewTab from './tabs/OverviewTab';
import ApplicationsListTab from './tabs/ApplicationsListTab';
import JobDetailsTab from './tabs/JobDetailsTab';
import { ChevronLeft } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext';

const ApplicationJobDetail = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const [ job, setJob ] = useState( null );
    const companyUserName = localStorage.getItem( "companyUserName" );
    const [ page, setPage ] = useState( '1' );
    const [ limit, setLimit ] = useState( '20' );
    const [ search, setSearch ] = useState( '' );
    const [ monthFilter, setMonthFilter ] = useState( '' );
    const [ yearFilter, setYearFilter ] = useState( );
    const [ applications, setApplications ] = useState( [] );
    const [ loading, setLoading ] = useState( true );
    
    const [ error, setError ] = useState( '' );
    const [ activeTab, setActiveTab ] = useState( 'applications' );
    const navigate = useNavigate();
    // NEW: state for job-statuses
    const [jobStatuses, setJobStatuses] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [loadingStatuses, setLoadingStatuses] = useState(false);
    const [toggleCount, setToggleCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user'));
    const isRecruiterManager = user?.role === 'recruiter_manager';
    const isAdmin = user?.role === 'admin';

    const onStatusChange = useCallback(() => {
        setToggleCount(count => count + 1);
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const jobRes = await fetch(`${process.env.REACT_APP_BASE_URL}/jobs/current-job/${id}`);
                if (!jobRes.ok) throw new Error('Error fetching job data');
                const jobData = await jobRes.json();

                // Build query parameters with filters
                const params = new URLSearchParams({
                    page: page,
                    limit: limit,
                    search: search
                });

                if (monthFilter) {
                    params.append('month', monthFilter);
                }
                if (yearFilter) {
                    params.append('year', yearFilter);
                }

                const appsRes = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/application/job/${id}?${params.toString()}`
                );
                if (!appsRes.ok) throw new Error('Error fetching applications');
                const appsData = await appsRes.json();

                setJob(jobData);
                setApplications(appsData);
            } catch (err) {
                console.error(err);
                setError('Failed to load job data or applications.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, page, limit, search, monthFilter, yearFilter, toggleCount]);

    // NEW: fetch job-statuses on mount
    useEffect(() => {
        const fetchJobStatuses = async () => {
            setLoadingStatuses(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const companyId = storedUser?.company_id;
                if (!companyId) return;

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses`,
                    { headers: { company_id: companyId } }
                );
                const data = await response.json();
                if (data.jobStatuses && Array.isArray(data.jobStatuses)) {
                    setJobStatuses(data.jobStatuses);
                    const mapping = {};
                    data.jobStatuses.forEach(entry => {
                        mapping[entry._id] = entry.jobStatus;
                    });
                    setStatusMap(mapping);
                }
            } catch (error) {
                console.error('Error fetching job statuses:', error);
            } finally {
                setLoadingStatuses(false);
            }
        };

        fetchJobStatuses();
    }, []);


    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const getMonthOptions = () => {
        return [
            { value: '', label: 'All Months' },
            { value: '1', label: 'January' },
            { value: '2', label: 'February' },
            { value: '3', label: 'March' },
            { value: '4', label: 'April' },
            { value: '5', label: 'May' },
            { value: '6', label: 'June' },
            { value: '7', label: 'July' },
            { value: '8', label: 'August' },
            { value: '9', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' }
        ];
    };

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i);
        }
        return years;
    };

    const clearFilters = () => {
        setMonthFilter('');
        setYearFilter(new Date().getFullYear());
        setSearch('');
        setPage('1');
    };

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">No job found.</p>
            </div>
        );
    }

    const { title, status: statusId } = job;
    const displayStatus = statusMap[statusId] || statusId;
    const candidateCount = applications.applications.length;

    const getStatusColor = (status) => {
        const isDark = theme === 'dark';
        switch (status?.toLowerCase()) {
            case 'active': return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
            case 'closed': return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
            case 'draft': return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            default: return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className={`px-8 py-10 w-full min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'
            }`}>
            <button
                className={`flex items-center transition-colors ml-10 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-500'
                    }`}
                onClick={() => window.history.back()}
            >
                <ChevronLeft size={18} />
                <span className="ml-1">Back</span>
            </button>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className={`rounded-xl shadow-sm p-6 mb-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border border-gray-700' : 'bg-gray-200 shadow-md border border-gray-200'
                    }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">

                        {/* Left Side: Title + Tags */}
                        <div className="mb-4 md:mb-0">
                            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {capitalizeFirstLetter(title) || 'Untitled Job'}
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayStatus)}`}>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {capitalizeFirstLetter(displayStatus) || 'N/A'}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {candidateCount} Candidates
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Button */}
                        <div>
                            {(isRecruiterManager || isAdmin) && (
                                <button
                                    onClick={() => navigate(`/${companyUserName}/current-job/${id}`)}
                                    className="bg-[#9333ea] hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                                >
                                    Create Application
                                </button>
                            )}
                        </div>

                    </div>
                </div>


                {/* Tabs Navigation */}
                <div className="bg-transparent rounded-xl shadow-sm mb-6">
                    {/* Tabs Navigation - Horizontal on all devices */}
                    <div className="border-b border-gray-200 overflow-x-auto">
                        <nav className="flex flex-nowrap px-2 sm:px-6" aria-label="Tabs">
                            {[
                                {
                                    id: 'overview',
                                    name: 'Overview',
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'applications',
                                    name: 'Applications',
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'details',
                                    name: 'Job Details',
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )
                                }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
            flex items-center py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
            ${activeTab === tab.id
                                            ? 'border-[#9333ea] text-[#9333ea]'
                                            : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                                        }
          `}
                                >
                                    {tab.icon}
                                    <span className="ml-2">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6">
                        {activeTab === 'overview' && <OverviewTab job={job} applications={applications.applications} />}
                        {activeTab === 'applications' &&
                            <ApplicationsListTab
                                job={job}
                                onStatusChange={onStatusChange}
                                applications={applications.applications}
                                page={page}
                                limit={limit}
                                search={search}
                                setPage={setPage}
                                setLimit={setLimit}
                                setSearch={setSearch}
                                setMonthFilter={setMonthFilter}   // ✅ add this
                                setYearFilter={setYearFilter}     // ✅ add this
                                monthFilter={monthFilter}         // ✅ also pass values
                                yearFilter={yearFilter}           // ✅ also pass values
                                currentPage={applications.currentPage}
                                totalApplications={applications.totalApplications}
                                totalPages={applications.totalPages}
                                getMonthOptions={getMonthOptions}
                                getYearOptions={getYearOptions}
                                clearFilters={clearFilters}
                            />}
                        {activeTab === 'details' && <JobDetailsTab job={job} setJob={setJob} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationJobDetail;
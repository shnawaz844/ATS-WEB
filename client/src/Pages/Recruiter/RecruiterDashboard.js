import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Stats from "../../components/Stats";
import BarChart from "../../components/BarChart";
import DoughnutChart from "../../components/DoughnutChart";
import OpenPositionsModal from "../../components/OpenPositionsModal";
import FilledPositionsModal from "../../components/FilledPositionsModal";

export default function Dashboard() {
    const { theme } = useTheme();
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [jobStatuses, setJobStatuses] = useState([]);
    const [applicationStatuses, setApplicationStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [statusesLoading, setStatusesLoading] = useState(true);
    const [appStatusesLoading, setAppStatusesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobsError, setJobsError] = useState(null);
    const [statusesError, setStatusesError] = useState(null);
    const [appStatusesError, setAppStatusesError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(true);
    const [interviewsError, setInterviewsError] = useState(null);
    const [statsData, setStatsData] = useState({
        total: 0,
        openPositions: 0,
        filledPositions: 0,
        interviewsScheduled: 0,
        offersExtended: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilledModalOpen, setIsFilledModalOpen] = useState(false);
    const [openJobs, setOpenJobs] = useState([]);
    const [filledJobs, setFilledJobs] = useState([]);
    const [applicationsByStatus, setApplicationsByStatus] = useState([]);

    const limit = 50;
    const navigate = useNavigate();
    const companyUserName = localStorage.getItem("companyUserName");
    const [totalCount, setTotalCount] = useState(0);

    const handleInterviewsClick = () => {
        navigate(`/${companyUserName}/all-interviews`);
    };

    const handleTotalApplicationsClick = () => {
        navigate(`/${companyUserName}/all-applications`);
    };

    // Fetch application statuses
    useEffect(() => {
        const fetchApplicationStatuses = async () => {
            try {
                const companyId = localStorage.getItem('companyId') || '';

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses?page=1&limit=100`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const statusesData = Array.isArray(data.applicationStatuses) ? data.applicationStatuses :
                    Array.isArray(data) ? data : [];

                console.log('Fetched application statuses:', statusesData);
                setApplicationStatuses(statusesData);
                setAppStatusesError(null);
            } catch (err) {
                console.error('Error fetching application statuses:', err);
                setAppStatusesError(err.message);
            } finally {
                setAppStatusesLoading(false);
            }
        };

        fetchApplicationStatuses();
    }, []);

    // Fetch interviews
    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const companyId = localStorage.getItem('companyId') || '';

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/scheduled-interviewer-app?page=1&limit=1000`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const interviewsData = Array.isArray(data.interviews) ? data.interviews :
                    Array.isArray(data) ? data : [];

                const count = data.totalCount || interviewsData.length;

                setInterviews(interviewsData);
                setTotalCount(count);
                setInterviewsError(null);
            } catch (err) {
                console.error('Error fetching interviews:', err);
                setInterviewsError(err.message);
            } finally {
                setInterviewsLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    // Fetch applications from backend API
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const companyId = localStorage.getItem('companyId') || '';

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/application/all-application?page=${page}&limit=${limit}`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const apps = Array.isArray(data.applications) ? data.applications :
                    Array.isArray(data) ? data : [];

                console.log('Fetched applications:', apps);

                if (page === 1) {
                    setApplications(apps);
                } else {
                    setApplications(prev => [...prev, ...apps]);
                }

                if (apps.length < limit) {
                    setHasMore(false);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [page]);

    // Fetch jobs from your API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const companyId = localStorage.getItem('companyId') || '';
                console.log('Fetching jobs with company_id:', companyId);

                const countResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/jobs/all-jobs?page=1&limit=1000`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (countResponse.ok) {
                    const countData = await countResponse.json();
                    const allJobs = Array.isArray(countData.jobs) ? countData.jobs :
                        Array.isArray(countData) ? countData : [];
                    setTotalJobs(allJobs.length);
                    setJobs(allJobs.slice(0, 6));
                }

                setJobsError(null);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setJobsError(err.message);
            } finally {
                setJobsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Fetch job statuses from backend API
    useEffect(() => {
        const fetchJobStatuses = async () => {
            try {
                const companyId = localStorage.getItem('companyId') || '';
                console.log('Fetching job statuses with company_id:', companyId);

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses?page=1&limit=100`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Job Statuses API response:', data);

                const statusesData = Array.isArray(data.jobStatuses) ? data.jobStatuses :
                    Array.isArray(data) ? data : [];

                console.log('Job statuses data to set:', statusesData);

                setJobStatuses(statusesData);
                setStatusesError(null);
            } catch (err) {
                console.error('Error fetching job statuses:', err);
                setStatusesError(err.message);
            } finally {
                setStatusesLoading(false);
            }
        };

        fetchJobStatuses();
    }, []);

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

    // Helper function to get application status name from status ID
    const getApplicationStatusNameById = (statusId) => {
        if (!statusId || !applicationStatuses || applicationStatuses.length === 0) {
            return 'Unknown';
        }

        const statusObj = applicationStatuses.find(status =>
            status._id === statusId || status.id === statusId
        );

        return statusObj?.applicationStatus || statusObj?.status || statusObj?.name || 'Unknown';
    };

    // Calculate stats from applications and jobs data
    useEffect(() => {
        if ((applications.length > 0 || jobs.length > 0) && jobStatuses.length > 0) {
            console.log('Applications data:', applications);
            console.log('Jobs data:', jobs);
            console.log('Job statuses data:', jobStatuses);

            const interviewsScheduled = totalCount;

            const offersExtended = applications.filter(app =>
                app.status && /offer/i.test(getApplicationStatusNameById(app.status))
            ).length;

            let openPositions = 0;
            let filledPositions = 0;
            const openJobsList = [];
            const filledJobsList = [];

            jobs.forEach(job => {
                const statusName = getStatusNameById(job.status);
                console.log(`Job "${job.title}" has status ID: ${job.status}, status name: "${statusName}"`);

                if (/open|active|available|hiring|live|published/i.test(statusName)) {
                    openPositions++;
                    openJobsList.push(job);
                } else if (/closed|filled|completed|inactive|expired/i.test(statusName)) {
                    filledPositions++;
                    filledJobsList.push(job);
                }
            });

            setOpenJobs(openJobsList);
            setFilledJobs(filledJobsList);

            console.log('Calculated openPositions:', openPositions);
            console.log('Calculated filledPositions:', filledPositions);

            setStatsData({
                total: applications.length,
                openPositions,
                filledPositions,
                interviewsScheduled,
                offersExtended
            });
        }
    }, [applications, jobs, jobStatuses, totalCount, applicationStatuses]);

    // Calculate applications by status for DoughnutChart - FIXED VERSION
    useEffect(() => {
        console.log('=== Starting Applications by Status Calculation ===');
        console.log('Applications length:', applications.length);
        console.log('Application Statuses length:', applicationStatuses.length);

        if (applications.length > 0 && applicationStatuses.length > 0) {
            console.log('Applications sample:', applications.slice(0, 3));
            console.log('Application Statuses sample:', applicationStatuses.slice(0, 3));

            // Use the reduce approach to map status IDs to names
            const applicationsByStatus = applications.reduce((acc, app) => {
                // Get the status ID from the application
                const statusId = app.status || app.applicationStatusId;

                // Find the corresponding status object
                const statusObj = applicationStatuses.find(
                    (status) => status._id === statusId || status.id === statusId
                );

                // Get the status name (trying different possible field names)
                const statusName = statusObj ?
                    (statusObj.applicationStatus || statusObj.status || statusObj.name || 'Unknown') :
                    'Unknown';

                console.log(`Application with status ID "${statusId}" -> Resolved to: "${statusName}"`);

                // Find if this status already exists in our accumulator
                const existing = acc.find((item) => item.status === statusName);
                if (existing) {
                    existing.count += 1;
                } else {
                    acc.push({ status: statusName, count: 1 });
                }
                return acc;
            }, []);

            console.log('Final applications by status:', applicationsByStatus);

            // Sort by count descending
            const sortedData = applicationsByStatus.sort((a, b) => b.count - a.count);

            setApplicationsByStatus(sortedData);
        } else {
            console.log('Waiting for data:', {
                applicationsLength: applications.length,
                applicationStatusesLength: applicationStatuses.length
            });
            setApplicationsByStatus([]);
        }
    }, [applications, applicationStatuses]);

    const fetchMoreData = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    // Process data for charts
    const processJobApplicationsData = () => {
        console.log('Processing job applications data...');
        console.log('Applications:', applications);
        console.log('Jobs:', jobs);

        if (!applications || !Array.isArray(applications) || applications.length === 0) {
            console.log('No applications data');
            return [];
        }

        const jobMap = {};
        if (jobs && Array.isArray(jobs)) {
            jobs.forEach(job => {
                const jobId = job._id || job.id;
                if (jobId) {
                    jobMap[jobId] = job.title || job.name || 'Untitled Job';
                }
            });
        }

        console.log('Job map:', jobMap);

        const jobCounts = {};

        applications.forEach(app => {
            console.log('Processing application:', app);

            let jobTitle = 'Unknown Job';

            if (app.jobID) {
                if (typeof app.jobID === 'object' && app.jobID.title) {
                    jobTitle = app.jobID.title;
                }
                else if (typeof app.jobID === 'string' && jobMap[app.jobID]) {
                    jobTitle = jobMap[app.jobID];
                }
            }

            if (jobTitle === 'Unknown Job' && app.jobTitle) {
                jobTitle = app.jobTitle;
            }

            if (jobTitle === 'Unknown Job' && app.job) {
                if (typeof app.job === 'object' && app.job.title) {
                    jobTitle = app.job.title;
                } else if (typeof app.job === 'string') {
                    jobTitle = app.job;
                }
            }

            if (jobTitle === 'Unknown Job') {
                jobTitle = app.position || app.role || app.jobName || 'Unknown Job';
            }

            console.log(`Application job title resolved to: "${jobTitle}"`);

            if (jobCounts[jobTitle]) {
                jobCounts[jobTitle]++;
            } else {
                jobCounts[jobTitle] = 1;
            }
        });

        console.log('Final job counts:', jobCounts);

        const result = Object.entries(jobCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([job, count]) => ({
                job,
                applications: count
            }));

        console.log('Processed data for chart:', result);
        return result;
    };

    const processDailyApplicationsData = () => {
        if (!applications || !Array.isArray(applications) || applications.length === 0) {
            return [];
        }

        const dateCounts = {};

        applications.forEach(app => {
            const date = new Date(app.createdAt || app.date || Date.now())
                .toISOString().split('T')[0];

            if (dateCounts[date]) {
                dateCounts[date]++;
            } else {
                dateCounts[date] = 1;
            }
        });

        return Object.keys(dateCounts)
            .sort()
            .map(date => ({
                date,
                applications: dateCounts[date]
            }));
    };

    // Process jobs data for status chart
    const processJobsByStatusData = () => {
        if (!jobs || !Array.isArray(jobs) || jobs.length === 0 || jobStatuses.length === 0) {
            return [];
        }

        const statusCounts = {};

        jobs.forEach(job => {
            const statusName = getStatusNameById(job.status);

            if (statusCounts[statusName]) {
                statusCounts[statusName]++;
            } else {
                statusCounts[statusName] = 1;
            }
        });

        return Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status]
        }));
    };

    // Function to handle opening the open positions modal
    const handleOpenPositionsClick = () => {
        setIsModalOpen(true);
    };

    // Function to handle closing the open positions modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Function to handle opening the filled positions modal
    const handleFilledPositionsClick = () => {
        setIsFilledModalOpen(true);
    };

    // Function to handle closing the filled positions modal
    const handleCloseFilledModal = () => {
        setIsFilledModalOpen(false);
    };

    if ((loading && page === 1) || statusesLoading || jobsLoading || appStatusesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const jobApplicationsData = processJobApplicationsData();
    const dailyApplicationsData = processDailyApplicationsData();
    const jobsByStatusData = processJobsByStatusData();

    // Ensure arrays are safe
    const safeJobStatuses = Array.isArray(jobStatuses) ? jobStatuses : [];
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const safeApplicationStatuses = Array.isArray(applicationStatuses) ? applicationStatuses : [];

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="dashboard-header mb-8">
                    <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> Recruiter Dashboard</h1>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    {error && (
                        <div className={`mt-4 p-6 ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200'} rounded-lg border`}>
                            ⚠️ Error fetching applications: {error}
                        </div>
                    )}
                    {jobsError && (
                        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200'} rounded-lg border`}>
                            ⚠️ Error fetching jobs: {jobsError}
                        </div>
                    )}
                    {statusesError && (
                        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200'} rounded-lg border`}>
                            ⚠️ Error fetching job statuses: {statusesError}
                        </div>
                    )}
                    {appStatusesError && (
                        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200'} rounded-lg border`}>
                            ⚠️ Error fetching application statuses: {appStatusesError}
                        </div>
                    )}
                </div>

                {/* Stats Section */}
                <div className="mb-8">
                    <Stats
                        stats={statsData}
                        jobStatuses={safeJobStatuses}
                        jobs={safeJobs}
                        onOpenPositionsClick={handleOpenPositionsClick}
                        onFilledPositionsClick={handleFilledPositionsClick}
                        onInterviewsClick={handleInterviewsClick}
                        onTotalApplicationsClick={handleTotalApplicationsClick}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Applications per Job Chart */}
                    <div className={`${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-100'} p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow lg:col-span-1 flex flex-col`}>
                        <div className="chart-header flex justify-between items-center mb-6">
                            <div>
                                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Applications per Job</h2>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Distribution of candidates across positions</p>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} px-3 py-1 rounded-full border`}>
                                <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} text-xs font-bold uppercase tracking-wider`}>Total: {applications.length}</span>
                            </div>
                        </div>
                        <div className="flex-1 h-[350px]">
                            <BarChart data={jobApplicationsData} />
                        </div>
                    </div>

                    {/* Applications by Status Chart */}
                    <div className={`${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-100'} p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow lg:col-span-1 flex flex-col`}>
                        <div className="chart-header flex justify-between items-center mb-6">
                            <div>
                                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Application Pipeline</h2>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Current status of all active candidates</p>
                            </div>
                            <button
                                onClick={handleTotalApplicationsClick}
                                className={`${theme === 'dark' ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'} hover:text-blue-800 text-sm font-semibold transition-colors flex items-center px-3 py-2 rounded-xl`}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="flex-1 h-[300px]">
                            <DoughnutChart
                                data={applicationsByStatus}
                                applicationStatuses={safeApplicationStatuses}
                            />
                        </div>

                        {/* Status Summary / Legend Below Chart */}
                        {applicationsByStatus.length > 0 && (
                            <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {applicationsByStatus.slice(0, 6).map((item, index) => {
                                        const getColor = (status) => {
                                            const s = status?.toLowerCase() || '';
                                            if (s.includes('applied')) return '#3B82F6';
                                            if (s.includes('review')) return '#F59E0B';
                                            if (s.includes('interview')) return '#8B5CF6';
                                            if (s.includes('offer')) return '#10B981';
                                            if (s.includes('hired')) return '#059669';
                                            if (s.includes('rejected')) return '#EF4444';
                                            if (s.includes('withdrawn')) return '#6B7280';
                                            if (s.includes('hold')) return '#F97316';
                                            if (s.includes('new')) return '#6366F1';
                                            return '#94A3B8';
                                        };

                                        return (
                                            <div key={index} className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: getColor(item.status) }}
                                                    ></div>
                                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} truncate`}>{item.status}</span>
                                                </div>
                                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} ml-4 mt-0.5`}>{item.count} candidates</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Jobs Section - Limited to 5 jobs */}
                <div className={`${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} p-8 rounded-xl shadow-md mb-8 border`}>
                    <div className="chart-header flex justify-between items-center mb-6">
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Recent Jobs</h2>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-50'}`}>Showing {Math.min(5, safeJobs.length)} of {totalJobs} jobs</span>
                    </div>

                    {/* Jobs List Table - Limited to 5 jobs */}
                    <div className={`overflow-x-auto ${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border`}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${theme === 'dark' ? 'bg-[#1c1c1c]' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                                        Job Title
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                                        Employment Type
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                                        Location
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                                        Current Status
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                                        Date Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${theme === 'dark' ? 'bg-[#121212] divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}`}>
                                {safeJobs.slice(0, 5).map((job, index) => {
                                    const statusName = getStatusNameById(job.status);

                                    return (
                                        <tr key={job._id || job.id || index} className={`${theme === 'dark' ? 'hover:bg-[#1c1c1c]' : 'hover:bg-gray-50'} transition-colors`}>
                                            <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    {job.title || 'No Title'}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-md`}>
                                                    {job.type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {job.city || job.state ?
                                                            `${job.city || ''}${job.city && job.state ? ', ' : ''}${job.state || ''}` :
                                                            (job.locationType?.toLowerCase() === 'remote' && job.country ? job.country : 'Not specified')}
                                                    </span>
                                                    {job.locationType && (
                                                        <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>({job.locationType})</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border
                                                    ${/open|active|available|hiring|live|published/i.test(statusName)
                                                        ? (theme === 'dark' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-200') :
                                                        /closed|filled|completed|inactive|expired|draft/i.test(statusName)
                                                            ? (theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200') :
                                                            (theme === 'dark' ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200')}`}>
                                                    {statusName}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* View All Jobs Button */}
                    {totalJobs > 0 ? (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate(`/${companyUserName}/all-jobs`)}
                                className={`inline-flex items-center px-6 py-3 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition-colors duration-200 font-medium shadow-sm`}
                            >
                                View All {totalJobs} Jobs
                            </button>
                        </div>
                    ) : (
                        <div className={`text-center py-12 ${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border`}>
                            <div className="text-gray-400 text-3xl mb-4">📋</div>
                            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No jobs found</p>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>
                                {jobsLoading ? 'Loading jobs...' : 'Check if your API is returning data correctly'}
                            </p>
                        </div>
                    )}
                </div>

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={fetchMoreData}
                            disabled={loading}
                            className={`px-6 py-3 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium`}
                        >
                            {loading ? 'Loading...' : 'Load More Applications'}
                        </button>
                    </div>
                )}

                {/* Open Positions Modal */}
                <OpenPositionsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    openJobs={openJobs}
                    jobStatuses={safeJobStatuses}
                    companyUserName={companyUserName}
                />

                {/* Filled Positions Modal */}
                <FilledPositionsModal
                    isOpen={isFilledModalOpen}
                    onClose={handleCloseFilledModal}
                    filledJobs={filledJobs}
                    jobStatuses={safeJobStatuses}
                    companyUserName={companyUserName}
                />
            </div>
        </div>
    );
}

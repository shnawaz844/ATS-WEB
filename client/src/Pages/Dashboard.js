import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Stats from "../components/Stats";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobStatuses, setJobStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsError, setJobsError] = useState(null);
  const [statusesError, setStatusesError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [statsData, setStatsData] = useState({
    total: 0,
    openPositions: 0,
    filledPositions: 0,
    interviewsScheduled: 0,
    offersExtended: 0
  });
  const limit = 50;
  const navigate = useNavigate();
  const companyUserName = localStorage.getItem("companyUserName");

  // Fetch applications from backend API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/application/all-application?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const apps = Array.isArray(data.applications) ? data.applications :
          Array.isArray(data) ? data : [];

        if (page === 1) {
          setApplications(apps);
        } else {
          setApplications(prev => [...prev, ...apps]);
        }

        // Check if there are more pages
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

  // Fetch jobs from your API (get all jobs to know total count)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const companyId = localStorage.getItem('company_id') || '';
        console.log('Fetching jobs with company_id:', companyId);

        // First, get total count of jobs
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

          // Set only first 5 jobs for display
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
        const companyId = localStorage.getItem('company_id') || '';
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

  // Calculate stats from applications and jobs data
  useEffect(() => {
    if ((applications.length > 0 || jobs.length > 0) && jobStatuses.length > 0) {
      console.log('Applications data:', applications);
      console.log('Jobs data:', jobs);
      console.log('Job statuses data:', jobStatuses);

      // Count interviews and offers based on status
      const interviewsScheduled = applications.filter(app =>
        app.status && /interview/i.test(app.status)
      ).length;

      const offersExtended = applications.filter(app =>
        app.status && /offer/i.test(app.status)
      ).length;

      // Count open and filled positions from jobs data using actual status names
      let openPositions = 0;
      let filledPositions = 0;

      jobs.forEach(job => {
        const statusName = getStatusNameById(job.status);
        console.log(`Job "${job.title}" has status ID: ${job.status}, status name: "${statusName}"`);

        if (/open|active|available|hiring|live|published/i.test(statusName)) {
          openPositions++;
        } else if (/closed|filled|completed|inactive|expired|draft/i.test(statusName)) {
          filledPositions++;
        }
      });

      console.log('Calculated openPositions:', openPositions);
      console.log('Calculated filledPositions:', filledPositions);

      // Update stats data
      setStatsData({
        total: applications.length,
        openPositions,
        filledPositions,
        interviewsScheduled,
        offersExtended
      });
    }
  }, [applications, jobs, jobStatuses]);

  const fetchMoreData = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Process data for charts
  const processJobApplicationsData = () => {
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return [];
    }

    const jobCounts = {};

    applications.forEach(app => {
      const jobTitle = app.jobID?.title || app.jobTitle || 'Unknown Job';

      if (jobCounts[jobTitle]) {
        jobCounts[jobTitle]++;
      } else {
        jobCounts[jobTitle] = 1;
      }
    });

    return Object.keys(jobCounts).map(job => ({
      job,
      applications: jobCounts[job]
    }));
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

  if ((loading && page === 1) || statusesLoading || jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const jobApplicationsData = processJobApplicationsData();
  const dailyApplicationsData = processDailyApplicationsData();
  const jobsByStatusData = processJobsByStatusData();

  // Ensure jobStatuses is always an array
  const safeJobStatuses = Array.isArray(jobStatuses) ? jobStatuses : [];
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${theme === "dark" ? "bg-black" : "bg-gray-50"
      }`}>
      <div className="max-w-7xl mx-auto">
        <div className="dashboard-header mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${theme === "dark" ? "text-gray-200" : "text-gray-900"
            }`}>ATS Admin Dashboard</h1>
          <p className={`mt-2 transition-colors duration-300 ${theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {error && (
            <div className="mt-4 p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
              ⚠️ Error fetching applications: {error}
            </div>
          )}
          {jobsError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              ⚠️ Error fetching jobs: {jobsError}
            </div>
          )}
          {statusesError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              ⚠️ Error fetching job statuses: {statusesError}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <Stats stats={statsData} jobStatuses={safeJobStatuses} jobs={safeJobs} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
          <div className={`p-12 rounded-xl shadow-md border transition-all duration-300 ${theme === "dark"
              ? "bg-transparent border-purple-600"
              : "bg-white border-purple-200 shadow-lg"
            }`}>
            <div className="chart-header flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}>Applications per Job</h2>
              <span className={`rounded-full p-1 font-semibold text-purple-800 ${theme === "dark" ? "bg-gray-100" : "bg-purple-100"
                }`}>Total: {applications.length} applications</span>
            </div>
            <div className="h-80">
              <BarChart data={jobApplicationsData} />
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-md border transition-all duration-300 ${theme === "dark"
              ? "border-purple-600"
              : "bg-white border-purple-200 shadow-lg"
            }`}>
            <div className="chart-header flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}>Daily Applications</h2>
              <span className={`transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-600"
                }`}>Historical Trend</span>
            </div>
            <div className="h-80">
              <LineChart data={dailyApplicationsData} />
            </div>
          </div>
        </div>

        {/* Jobs Section - Limited to 5 jobs */}
        <div className={`p-8 rounded-xl shadow-md mb-8 border transition-all duration-300 ${theme === "dark"
            ? "border-purple-600"
            : "bg-white border-purple-200 shadow-lg"
          }`}>
          <div className="chart-header flex justify-between items-center mb-6">
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}>Recent Jobs</h2>
            <span className={`transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-600"
              }`}>Showing {Math.min(5, safeJobs.length)} of {totalJobs} jobs</span>
          </div>

          {/* Jobs List Table - Limited to 5 jobs */}
          <div className={`overflow-x-auto rounded-lg transition-all duration-300 ${theme === "dark"
              ? "backdrop-blur-xl bg-white/10 border border-white/20"
              : "bg-white border border-gray-200"
            }`}>
            <table className={`min-w-full divide-y ${theme === "dark" ? "divide-gray-700 text-gray-100" : "divide-gray-200 text-gray-900"
              }`}>
              <thead className={`${theme === "dark"
                  ? "backdrop-blur-xl bg-white/10 border border-white/20"
                  : "bg-gray-50 border-b border-gray-200"
                }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider border-b ${theme === "dark" ? "text-gray-300 border-gray-700" : "text-gray-500 border-gray-200"
                    }`}>
                    Job Title
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider border-b ${theme === "dark" ? "text-gray-300 border-gray-700" : "text-gray-500 border-gray-200"
                    }`}>
                    Employment Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider border-b ${theme === "dark" ? "text-gray-300 border-gray-700" : "text-gray-500 border-gray-200"
                    }`}>
                    Location
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider border-b ${theme === "dark" ? "text-gray-300 border-gray-700" : "text-gray-500 border-gray-200"
                    }`}>
                    Current Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider border-b ${theme === "dark" ? "text-gray-300 border-gray-700" : "text-gray-500 border-gray-200"
                    }`}>
                    Date Created
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-gray-800" : "divide-gray-200"
                }`}>
                {safeJobs.slice(0, 5).map((job, index) => {
                  const statusName = getStatusNameById(job.status);

                  return (
                    <tr key={job._id || job.id || index} className={`transition-colors ${theme === "dark" ? "hover:bg-gray-900/50" : "hover:bg-gray-50"
                      }`}>
                      <td className={`px-6 py-4 text-sm font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          {job.title || 'No Title'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${theme === "dark"
                            ? "bg-gray-800 text-gray-300 border-gray-700"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}>
                          {job.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"
                            }`}>{job.city || 'Not specified'}</span>
                          {job.locationType && (
                            <span className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                              }`}>({job.locationType})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border
                ${/open|active|available|hiring|live|published/i.test(statusName)
                            ? theme === "dark" ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200' :
                            /closed|filled|completed|inactive|expired|draft/i.test(statusName)
                              ? theme === "dark" ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200' :
                              theme === "dark" ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {statusName}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
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

          {/*  View All Jobs Button - */}
          {totalJobs > 0 ? (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate(`/${companyUserName}/all-jobs`)}
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-full transition-colors duration-200 shadow-sm ${theme === "dark"
                    ? "bg-white text-purple-600 hover:bg-purple-600 hover:text-white"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
              >
                View All {totalJobs} Jobs
              </button>
            </div>
          ) : (
            <div className={`text-center py-12 rounded-lg border ${theme === "dark"
                ? "bg-transparent border-gray-700"
                : "bg-white border-gray-200"
              }`}>
              <div className="text-gray-400 text-3xl mb-4">📋</div>
              <p className={`text-lg font-medium ${theme === "dark" ? "text-gray-500" : "text-gray-600"
                }`}>No jobs found</p>
              <p className="text-gray-400 text-sm mt-2">
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Applications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
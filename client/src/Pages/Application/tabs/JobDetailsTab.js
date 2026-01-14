import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const JobDetailsTab = ({ job }) => {
  const { theme } = useTheme();

  const [hiringManagers, setHiringManagers] = useState([]);
  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  const [recruitersList, setRecruitersList] = useState([]);
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };
  const [jobStatuses, setJobStatuses] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // Function to format number in Indian Rupee format (e.g., 1,00,000)
  const formatIndianRupee = (num) => {
    if (!num) return "0";

    // Convert to string and remove any non-digit characters
    const numStr = num.toString().replace(/[^\d]/g, "");

    // Handle the case if it's just 0
    if (parseInt(numStr) === 0) return "0";

    let lastThree = numStr.substring(numStr.length - 3);
    let otherNumbers = numStr.substring(0, numStr.length - 3);

    if (otherNumbers !== '') {
      // Add commas after every two digits in the other numbers part
      lastThree = ',' + lastThree;
    }

    // Format remaining digits with commas after every 2 digits
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

    return formattedOtherNumbers + lastThree;
  };

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/recruiter/all-recruiter`, {
          headers: {
            'company_id': companyId  // Pass company_id in headers
          }
        });
        const data = await response.json();
        setRecruitersList(data);
      } catch (error) {
        console.error('Error fetching recruiters:', error);
      }
    };

    fetchRecruiters();
  }, []);

  useEffect(() => {
    const fetchHiringManagers = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/hiringmanager/all-hiring-manager`,
          { headers: { company_id: companyId } }
        );
        const data = await res.json();
        setHiringManagers(data);
      } catch (err) {
        console.error('Error fetching hiring managers', err);
      }
    };
    fetchHiringManagers();
  }, [companyId]);

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

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job data available</h3>
        </div>
      </div>
    );
  }

  const {
    jobID,
    title,
    locationType,
    type,
    scheduleType,
    shiftStart,
    shiftEnd,
    hireType,
    country,
    state,
    city,
    description,
    compensation,
    experienceRequired,
    requiredResources,
    status,
    recruiterId,
    hiringManagerId,
  } = job;

  const displayStatus = statusMap[status] || status || 'N/A';
  const recruiter = recruitersList.find(u => u._id === recruiterId)
  const hiringManager = hiringManagers.find(u => u._id === hiringManagerId)

  // Status badge styles based on status
  // Status badge styles based on status
  const getStatusStyle = (status) => {
    const isDark = theme === 'dark';
    const styles = {
      Active: isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      Paused: isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      Closed: isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      Draft: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    return styles[status] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  return (
    <div className="max-w-4xl w-full px-4 sm:px-6 mx-auto flex flex-col items-center">
      {/* Header Section */}
      <div className={`w-full mb-6 sm:mb-8 border-b pb-4 sm:pb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {capitalizeFirstLetter(title) || 'N/A'}
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Job ID: {jobID || 'N/A'}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusStyle(displayStatus)}`}>
            {displayStatus || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
        {/* Main Details Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Job Overview */}
          <section className={`rounded-xl border p-4 sm:p-5 lg:p-6 space-y-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 border-gray-200 shadow-md'
            }`}>
            <h2 className={`text-base sm:text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 mr-2 text-[#9333ea]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Job Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Job Type</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{type || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Schedule</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{scheduleType || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Shift Hours</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{shiftStart ? `${shiftStart} - ${shiftEnd}` : 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Hire Type</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{hireType || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Location Details */}
          <section className={`rounded-xl border p-4 sm:p-5 lg:p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 shadow-md border-gray-200'
            }`}>
            <h2 className={`text-base sm:text-lg font-semibold flex items-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 mr-2 text-[#9333ea]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Location Type</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{locationType || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Country</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{country || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>State</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{state || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>City</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{city || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Job Description */}
          <section className={`rounded-xl border p-4 sm:p-5 lg:p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 shadow-md border-gray-200'
            }`}>
            <h2 className={`text-base sm:text-lg font-semibold flex items-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 mr-2 text-[#9333ea]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Job Description
            </h2>
            <div className={`prose max-w-full text-sm ${theme === 'dark' ? 'prose-invert text-gray-300' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: description || 'No description available.' }} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Requirements */}
          <section className={`rounded-xl border p-4 sm:p-5 lg:p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 shadow-md border-gray-200'
            }`}>
            <h2 className={`text-base sm:text-lg font-semibold flex items-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <svg className="text-[#9333ea] w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Requirements
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Experience Required</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{experienceRequired || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Resources Required</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{requiredResources || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Compensation</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{formatIndianRupee(compensation) || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className={`rounded-xl border p-4 sm:p-5 lg:p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 border-gray-700' : 'bg-gray-100 shadow-md border-gray-200'
            }`}>
            <h2 className={`text-base sm:text-lg font-semibold flex items-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <svg className="text-[#9333ea] w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recruiter Name</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{recruiter?.userName || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Hiring Manager Name</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{hiringManager?.userName || 'N/A'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

  );
};

export default JobDetailsTab;
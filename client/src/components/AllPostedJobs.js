import React, { useState, useEffect } from "react";

import axios from "axios";
import { Link } from "react-router-dom";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import JobDescriptionModal from "./JobDescriptionModal";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import BackButtonMobile from "./Mob-back-btn";
import { useTheme } from "../context/ThemeContext";

// Dropdown Options
const jobTypeOptions = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
];

const locationTypeOptions = [
  { value: "Remote", label: "Remote" },
  { value: "On-Site", label: "On-Site" },
  { value: "Hybrid", label: "Hybrid" },
];

const scheduleTypeOptions = [
  { value: "Flexible", label: "Flexible" },
  { value: "Morning Shift", label: "Morning Shift" },
  { value: "Day Shift", label: "Day Shift" },
  { value: "Night Shift", label: "Night Shift" },
];



const AllPostedJobs = () => {
  const { theme } = useTheme();
  const companyUserName = localStorage.getItem("companyUserName");
  const [companyDetails, setCompanyDetails] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [locationType, setLocationType] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const companyId = companyDetails?._id;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [jobStatuses, setJobStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  const [applicationStatuses, setApplicationStatuses] = useState([]);
  const [applicationStatusMap, setApplicationStatusMap] = useState({});
  const [loadingAppStatuses, setLoadingAppStatuses] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  console.log("companyId", companyId)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/companies/companies/${companyUserName}`);
        setCompanyDetails(response.data);
      } catch (error) {
        console.error("Error fetching company details", error);
      }
    };
    fetchCompanyDetails();
  }, [companyUserName]);

  useEffect(() => {
    const fetchJobStatuses = async () => {
      setLoadingStatuses(true);
      try {
        const companyId = companyDetails?._id;
        if (!companyId) return;

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses`, {
          headers: {
            "Company_id": companyId
          }
        });

        const data = await response.json();
        if (data.jobStatuses && Array.isArray(data.jobStatuses)) {
          setJobStatuses(data.jobStatuses);
          const statusMapping = {};
          data.jobStatuses.forEach((status) => {
            statusMapping[status._id] = status.jobStatus;
          });
          setStatusMap(statusMapping);
        }
      } catch (error) {
        console.error("Error fetching job statuses:", error);
      } finally {
        setLoadingStatuses(false);
      }
    };

    if (companyDetails?._id) {
      fetchJobStatuses();
    }
  }, [companyDetails]);


  useEffect(() => {
    const fetchApplicationStatuses = async () => {
      setLoadingAppStatuses(true);
      try {
        const companyId = companyDetails?._id;
        if (!companyId) return;

        // if you need pagination or filters, build query string:
        const params = new URLSearchParams({ page: 1, limit: 100 }).toString();

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses?${params}`,
          {
            headers: {
              "Company_id": companyId
            },
          }
        );
        const data = await response.json();
        if (data.applicationStatuses && Array.isArray(data.applicationStatuses)) {
          setApplicationStatuses(data.applicationStatuses);

          // build lookup: ID → label
          const map = {};
          data.applicationStatuses.forEach((st) => {
            map[st._id] = st.applicationStatus;
            // adjust `applicationStatus` field name if your API uses something else
          });
          setApplicationStatusMap(map);
        }
      } catch (error) {
        console.error("Error fetching application statuses:", error);
      } finally {
        setLoadingAppStatuses(false);
      }
    };

    if (companyDetails?._id) {
      fetchApplicationStatuses();
    }
  }, [companyDetails]);

  useEffect(() => {
    const fetchCandidateApplications = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (!user?._id) return;

        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/application/candidate/${user._id}`);
        if (response.data && Array.isArray(response.data.applications)) {
          const ids = new Set(response.data.applications.map(app => app.jobID?._id || app.jobID));
          setAppliedJobIds(ids);
        }
      } catch (error) {
        console.error("Error fetching candidate applications:", error);
      }
    };
    fetchCandidateApplications();
  }, []);

  const fetchJobs = async ({ queryKey }) => {
    const [_, page, limit, debouncedSearch, jobType, locationType, scheduleType] = queryKey;
    const params = { page, limit, search: debouncedSearch };

    if (jobType) params.type = jobType.value;
    if (locationType) params.locationType = locationType.value;
    if (scheduleType) params.scheduleType = scheduleType.value;

    // Add status filter to only show Open and Filled job.
    params.status = "Open,Filled,Applied";

    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
      params, headers: {
        "Company_id": companyId
      }
    });
    return response.data;
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["jobs", page, limit, debouncedSearch, jobType, locationType, scheduleType, companyId],
    queryFn: fetchJobs,
    keepPreviousData: true,
    enabled: !!companyId, // Only fetch when companyId is available
  });

  if (isError) return <div>Error fetching jobs</div>;
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff", // gray-800
      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db", // gray-600
      boxShadow: "none", // ❌ removes white glow
      "&:hover": {
        borderColor: theme === "dark" ? "#6b7280" : "#a855f7",
      },
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
      border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? theme === "dark"
          ? "#374151"
          : "#ede9fe"
        : "transparent",
      color: theme === "dark" ? "#e5e7eb" : "#111827",
    }),

    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#f9fafb" : "#111827",
    }),

    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
    }),

    input: (base) => ({
      ...base,
      color: theme === "dark" ? "#ffffff" : "#111827",
    }),

    indicatorSeparator: () => ({
      display: "none", // optional clean look
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
      "&:hover": {
        color: "#a855f7",
      },
    }),
  };


  return (
    <div className={`px-8 py-4 w-full min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-black" : "bg-gradient-to-r from-gray-100 to-white"
      }`}
    >
      <BackButtonMobile />
      <div className="max-w-screen-2xl">
        <div>
          {/* Header Section */}
          <div className={`mb-6 h-auto sm:h-[25vh] relative flex flex-col sm:flex-row items-center justify-center rounded-xl p-4 sm:p-6 md:p-8 transition-colors duration-300 ${theme === "dark" ? "bg-white/10 border-white/20 hover:border-purple-500/50" : "bg-gray-200 shadow-md"
            }`}>
            {/* Main content centered */}
            <div className="text-center w-full">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-black dark:text-white mb-4 sm:mb-6">
                Explore Our Opportunities
              </h1>
              <p className="text-sm sm:text-base dark:text-white/90  text-black mb-4 sm:mb-8 px-2 sm:px-0">
                Find your perfect role from our wide range of positions across different departments and locations.
              </p>
            </div>

            {/* Filter button — responsive placement */}
            <div className="w-full sm:w-auto flex justify-center sm:absolute sm:top-4 sm:right-4">
              <button
                className={`inline-flex items-center px-4 py-2 text-sm sm:text-base border rounded-xl font-medium transition-colors duration-200 shadow-sm ${theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                  : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                  }`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>


          {/* Filters */}
          <div
            className={`transition-all duration-300 ${isFilterOpen
              ? "max-h-full opacity-100"
              : "max-h-0 opacity-0 overflow-hidden md:max-h-full md:opacity-100"
              }`}
          >
            <div className={`${isFilterOpen ? "block" : "hidden"} px-4 sm:px-8`}>
              <div className="mb-6 flex flex-wrap justify-center items-center gap-4 w-full max-w-6xl mx-auto">
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full sm:w-64 p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 h-[6.3vh] transition-colors duration-200 ${theme === "dark"
                    ? "bg-[#1a1a1a] text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                    }`}
                />

                {/* Job Type Dropdown */}
                <div className="w-full sm:w-48">
                  <Select
                    options={jobTypeOptions}
                    value={jobType}
                    onChange={setJobType}
                    placeholder="Job Type"
                    isClearable
                    styles={selectStyles}
                  />
                </div>

                {/* Location Type Dropdown */}
                <div className="w-full sm:w-48">
                  <Select
                    options={locationTypeOptions}
                    value={locationType}
                    onChange={setLocationType}
                    placeholder="Location Type"
                    isClearable
                    styles={selectStyles}
                  />
                </div>

                {/* Schedule Type Dropdown */}
                <div className="w-full sm:w-48">
                  <Select
                    options={scheduleTypeOptions}
                    value={scheduleType}
                    onChange={setScheduleType}
                    placeholder="Schedule Type"
                    isClearable
                    styles={selectStyles}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* Jobs List or No Jobs Found Message */}
          {data?.jobs && data.jobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.jobs.map((job) => (
                <Card
                  key={job._id}
                  job={job}
                  jobStatusLabel={statusMap[job.status]} // pass status text
                  onViewDetails={() => setSelectedJob(job)}
                  companyUserName={companyUserName}
                  theme={theme}
                  isApplied={appliedJobIds.has(job._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className={`p-5 rounded-full mb-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                }`}>
                <Briefcase className={`h-12 w-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`} />
              </div>
              <h3 className={`text-lg font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"
                }`}>No jobs found</h3>
              <p className={`max-w-md mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                Opportunities are on the way. Stay tuned!
              </p>
            </div>
          )}


          {/* Pagination Controls */}
          <div className={`flex items-center justify-between border-t pt-6 mt-2 ${theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className={`flex items-center px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${page === 1
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : theme === "dark"
                  ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              <span className={`px-3 py-1 rounded-full font-medium ${theme === "dark" ? "bg-[#9333ea] text-white" : "bg-[#9333ea]/10 text-[#9333ea]"
                }`}>{page}</span>
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>of {data?.totalPages}</span>
            </div>

            <button
              onClick={() => setPage((old) => Math.min(data?.totalPages, old + 1))}
              disabled={page === data?.totalPages}
              className={`flex items-center px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${page === data?.totalPages
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : theme === "dark"
                  ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {/* Job Description Modal */}
          {selectedJob && (
            <JobDescriptionModal
              job={selectedJob}
              isOpen={!!selectedJob}
              onClose={() => setSelectedJob(null)}
              isApplied={appliedJobIds.has(selectedJob._id)}
            />
          )}
        </div>
      </div>
    </div>

  );
};

const Card = ({ job, onViewDetails, companyUserName, jobStatusLabel, theme, isApplied }) => {

  const capitalizeFirstLetter = (string) => {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
  };

  // Function to format number in Indian Rupee format (e.g., 1,00,000)
  const formatIndianRupee = (num) => {
    if (!num) return "0";

    const formatSingle = (n) => {
      const clean = n.replace(/[^\d]/g, "");
      if (!clean || clean === "0") return "0";
      return clean.replace(/\B(?=(\d{2})+(?=\d{3}))/g, ",").replace(/(\d{3})$/, ",$1");
    };

    const str = num.toString();

    // Check for range pattern
    if (str.includes("-") || str.toLowerCase().includes("to")) {
      const numbers = str.split(/[-–—]|\s+to\s+/i);
      if (numbers.length === 2) {
        return `${formatSingle(numbers[0].trim())} - ${formatSingle(numbers[1].trim())}`;
      }
    }

    return formatSingle(str);
  };
  return (
    <div
      className={`relative rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-all group backdrop-blur-xl ${theme === "dark"
        ? "bg-white/10 border-white/20 hover:border-purple-500/50"
        : "bg-gray-100 border-gray-200 hover:border-purple-500/30"
        }`}
    >


      {/* ✅ Main Content */}
      <div className="p-5 pt-5">
        <h2 className={`text-lg font-bold capitalize ${theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
          {job.title || "Software Engineer"}
        </h2>
        <p className={`text-[1rem] pt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
          {job.type} | {job.scheduleType}
        </p>
        <p className={`text-sm pt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"
          }`}>
          {[job.city, job.state, job.country].filter(Boolean).join(", ")}
        </p>
        <p className={`text-sm pt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"
          }`}>
          {job.locationType}
        </p>
        <p className={`text-sm pt-2 font-medium ${theme === "dark" ? "text-green-400" : "text-gray-600"
          }`}>
          ₹{formatIndianRupee(job.compensation)}{job.compensation?.toString().toLowerCase().includes("month") || job.compensation?.toString().toLowerCase().includes("/mo") ? "/Month" : "/Year"}
        </p>

        <div className={`text-sm mb-4 min-h-16 line-clamp-3 pt-2 mt-2 ${theme === "dark" ? "text-purple-300" : "text-purple-800"
          }`}>
          <div
            dangerouslySetInnerHTML={{
              __html: capitalizeFirstLetter(job.description),
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
            {job.experienceRequired} Years Experience.
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={onViewDetails}
              className={`px-3 py-2 rounded-full transition-colors text-sm ${theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
            >
              View Details
            </button>
            {isApplied ? (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-full cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
              >
                Applied
              </button>
            ) : (
              <Link to={`/${companyUserName}/current-job/${job._id}`}>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
                  Apply Now
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPostedJobs;

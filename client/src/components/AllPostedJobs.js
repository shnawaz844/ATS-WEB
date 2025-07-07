import React, { useState, useEffect } from "react";

import axios from "axios";
import { Link } from "react-router-dom";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import JobDescriptionModal from "./JobDescriptionModal";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import BackButtonMobile from "./Mob-back-btn";

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
            company_id: companyId
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
              company_id: companyId,
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

  const fetchJobs = async ({ queryKey }) => {
    const [_, page, limit, debouncedSearch, jobType, locationType, scheduleType] = queryKey;
    const params = { page, limit, search: debouncedSearch };

    if (jobType) params.type = jobType.value;
    if (locationType) params.locationType = locationType.value;
    if (scheduleType) params.scheduleType = scheduleType.value;

    // Add status filter to only show Open and Filled jobs
    params.status = "Open,Filled";

    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
      params, headers: {
        company_id: companyId
      }
    });
    return response.data;
  };

  const { data, isError } = useQuery({
    queryKey: ["jobs", page, limit, debouncedSearch, jobType, locationType, scheduleType, companyId],
    queryFn: fetchJobs,
    keepPreviousData: true,
  });

  if (isError) return <div>Error fetching jobs</div>;

  return (
    <div className="px-8 py-4 w-full min-h-screen"
      style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
    >
      <BackButtonMobile />
      <div className="max-w-screen-2xl">
        <div>
          {/* Header Section */}
          <div className="mb-6 h-auto sm:h-[25vh] relative flex flex-col sm:flex-row items-center justify-center rounded-xl p-4 sm:p-6 md:p-8 bg-gray-700">
            {/* Main content centered */}
            <div className="text-center w-full">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                Explore Our Opportunities
              </h1>
              <p className="text-sm sm:text-base text-white mb-4 sm:mb-8 px-2 sm:px-0">
                Find your perfect role from our wide range of positions across different departments and locations.
              </p>
            </div>

            {/* Filter button — responsive placement */}
            <div className="w-full sm:w-auto flex justify-center sm:absolute sm:top-4 sm:right-4">
              <button
                className="inline-flex items-center px-4 py-2 text-sm sm:text-base border bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm"
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
                  className="w-full sm:w-64 p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 h-[6.3vh]"
                />

                {/* Job Type Dropdown */}
                <div className="w-full sm:w-48">
                  <Select
                    options={jobTypeOptions}
                    value={jobType}
                    onChange={setJobType}
                    placeholder="Job Type"
                    isClearable
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
                  />
                </div>
              </div>
            </div>
          </div>



          {/* Jobs List or No Jobs Found Message */}
          {data?.jobs && data.jobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.jobs
                .filter((job) => statusMap[job.status] === "Open" || statusMap[job.status] === "Filled")
                .map((job) => (
                  <Card
                    key={job._id}
                    job={job}
                    jobStatusLabel={statusMap[job.status]} // pass status text
                    onViewDetails={() => setSelectedJob(job)}
                    companyUserName={companyUserName}
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 p-5 rounded-full mb-4">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
              <p className="text-gray-500 max-w-md mb-6">
                Opportunities are on the way. Stay tuned!
              </p>
            </div>
          )}


          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${page === 1
                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                }`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              <span className="px-3 py-1 bg-gray-300 text-black rounded-full font-medium">{page}</span>
              <span className="text-sm text-gray-500">of {data?.totalPages}</span>
            </div>

            <button
              onClick={() => setPage((old) => Math.min(data?.totalPages, old + 1))}
              disabled={page === data?.totalPages}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${page === data?.totalPages
                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
                }`}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {/* Job Description Modal */}
          {selectedJob && (
            <JobDescriptionModal job={selectedJob} isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </div>
      </div>
    </div>

  );
};

const Card = ({ job, onViewDetails, companyUserName, jobStatusLabel }) => {

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
    <div className="bg-white relative rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">

      {/* ✅ Main Content */}
      <div className="p-5 pt-5">
        <h2 className="text-lg font-bold text-gray-800 capitalize">
          {job.title || "Software Engineer"}
        </h2>
        <p className="text-[1rem] text-gray-600 pt-2">
          {job.type} | {job.scheduleType}
        </p>
        <p className="text-sm text-gray-700 pt-2">
          {job.city}, {job.state} | {job.locationType}
        </p>
        <p className="text-sm text-gray-600 pt-2">
          ₹{formatIndianRupee(job.compensation)}/Annum
        </p>

        <div className="text-sm text-purple-800 mb-4 min-h-16 line-clamp-3 pt-2 mt-2">
          <div
            dangerouslySetInnerHTML={{
              __html: capitalizeFirstLetter(job.description),
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {job.experienceRequired} Years Experience.
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={onViewDetails}
              className="bg-gray-300 text-black px-3 py-2 rounded-full hover:bg-gray-400 hover:text-black transition-colors text-sm"
            >
              View Details
            </button>
            <Link to={`/${companyUserName}/current-job/${job._id}`}>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors text-sm sm:text-base w-full sm:w-auto">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPostedJobs;
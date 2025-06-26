import React, { useState, useEffect } from "react";

import ReactQuill from "react-quill";
import { useParams } from "react-router-dom";
import { ApplicationForm } from "../ApplicationForm/ApplicationForm";
import "react-quill/dist/quill.snow.css";
import { useApplicationStatuses } from "../../hooks/useApplication";
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Award,
  Building,
  ChevronLeft,
  IndianRupee
} from "lucide-react";

export const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [jobStatuses, setJobStatuses] = useState([]);

  console.log("jobStatuses", jobStatuses)
  // 1. Fetch the logged-in user (if any)
  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      const user = JSON.parse(token);
      setLoginData(user);
    }
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
  };

  // 2. Fetch the job details
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/jobs/current-job/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error("Error fetching job data:", err));
  }, [id]);


  // 3. We also fetch the application statuses (and can pass them to the form)
  const {
    data: applicationStatusesData,
  } = useApplicationStatuses({});

  console.log("this is statuses", applicationStatusesData);

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

  useEffect(() => {
    const fetchJobStatuses = async () => {
      try {
        const companyId = job?.company_id;
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
        }
      } catch (error) {
        console.error("Error fetching job statuses:", error);
      }
    };

    if (job?.company_id) {
      fetchJobStatuses();
    }
  }, [job?.company_id]);

  if (!job) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mb-4"></div>
          <div className="h-4 w-48 bg-blue-100 rounded mb-3"></div>
          <div className="h-3 w-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-4 w-full min-h-screen"
      style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
    >
      <div className="mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={18} />
          <span className="ml-1">Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* -- Left: Job Details Section -- */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-700">
            <div className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-white font-medium mb-2">
                    <Briefcase size={16} />
                    <span>{job.department || "Full-time"}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3">
                    {capitalizeFirstLetter(job.title)}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-white text-sm mb-4">
                    <div className="flex items-center">
                      <Building size={16} className="mr-1" />
                      <span>{job.companyName || "Company Name"}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      <span>
                        {job.city}, {job.state}, {job.country}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{job.locationStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-200 p-6 rounded-xl">
              <div className="flex items-start">
                <IndianRupee size={20} className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Compensation</p>
                  <p className="font-semibold text-gray-800">₹{formatIndianRupee(job.compensation)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Award size={20} className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-gray-800">{job.experienceRequired} years</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar size={20} className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Schedule</p>
                  <p className="font-semibold text-gray-800">{job.scheduleType}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <ReactQuill
                  value={job.description}
                  readOnly
                  theme="bubble"
                  className="text-gray-700"
                />
              </div>
            </div>

            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Requirements
                </h2>
                <div className="prose max-w-none">
                  <ReactQuill
                    value={job.requirements}
                    readOnly
                    theme="bubble"
                    className="text-gray-700"
                  />
                </div>
              </div>
            )}

            {job.benefits && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Benefits
                </h2>
                <div className="prose max-w-none">
                  <ReactQuill
                    value={job.benefits}
                    readOnly
                    theme="bubble"
                    className="text-gray-700"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -- Right: Application Form Section -- */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Apply Now</h2>
              <ApplicationForm
                job={job}
                loginData={loginData}
                applicationStatusesData={applicationStatusesData}
                jobStatuses={jobStatuses}
              />
            </div>

            {job.postedDate && (
              <div className="bg-white p-6 rounded-xl shadow-sm text-sm text-gray-500">
                <p>Posted {new Date(job.postedDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
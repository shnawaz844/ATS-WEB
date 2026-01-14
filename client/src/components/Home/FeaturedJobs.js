import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoURL from "../../assets/img/logo.jpeg";

import { useTheme } from "../../context/ThemeContext";

export const FeaturedJobs = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    console.log("hello");
    fetch(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  return (
    <div className="">
      <h1 className={`text-center text-xl md:text-2xl font-bold mt-8 md:mt-6 ${theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
        Our Featured Jobs
      </h1>
      <div className="w-full grid sm:grid-cols-2 md:grid-cols-3  gap-4">
        {jobs.map((job, key) => (
          <Card key={key} job={job} />
        ))}
      </div>
    </div>
  );
};

function Card({ job }) {
  const { theme } = useTheme();
  return (
    <div className={`shadow-lg rounded-xl p-4 transition-all duration-300 border ${theme === "dark"
      ? "bg-white/5 border-white/10 hover:bg-white/10"
      : "bg-white border-red-100 hover:shadow-xl hover:border-purple-200"
      }`}>
      {/* Card Header */}
      <div className="flex items-center gap-3">
        <div>
          {/* company image */}
          <img
            src={logoURL}
            alt={job.companyName}
            className="w-12 rounded-full"
          />
        </div>
        <div>
          <div className="flex items-center">
            <box-icon size="18px" name="time"></box-icon>
            <span className={`pl-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{job.employmentType} </span>
          </div>
          <h1 className={`font-bold text-md lg:text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{job.jobTitle}</h1>
        </div>
      </div>
      <div>
        <p className={`text-sm py-4 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{job.description}</p>
      </div>
      {/* Footer - apply now and location */}
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center">
          <box-icon size="19px" name="pin" color={theme === "dark" ? "#cbd5e1" : "#64748b"}></box-icon>
          <span className={`pl-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{job.location} </span>
        </div>
        <Link to={`/current-job/${job._id}`}>
          <button className={`hidden lg:block text-sm py-1 px-4 rounded-md transition-colors ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-purple-600 text-white hover:bg-purple-700"
            }`}>
            Apply Now
          </button>
        </Link>
      </div>
    </div>
  );
}

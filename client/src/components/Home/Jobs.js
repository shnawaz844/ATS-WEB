// src/components/Hero/Jobs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";

const Jobs = () => {
    const { companyUserName } = useParams();
    const storedSlug = localStorage.getItem("companyUserName");
    const slug = companyUserName || storedSlug;

    // 1) track company‐fetch state
    const [companyDetails, setCompanyDetails] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState(false);

    // once we have the company's _id, we can fetch jobs
    const companyId = companyDetails?._id;

    // 2) track jobs‐fetch state
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ————————————————————————————
    // STEP A: validate slug & load companyDetails
    // ————————————————————————————
    useEffect(() => {
        if (!slug) {
            setCompanyLoading(false);
            setCompanyError(true);
            return;
        }

        setCompanyLoading(true);
        setCompanyError(false);

        axios
            .get(`${process.env.REACT_APP_BASE_URL}/companies/companies/${slug}`)
            .then(res => {
                setCompanyDetails(res.data);
                localStorage.setItem("companyUserName", slug);
                setCompanyLoading(false);
            })
            .catch(err => {
                console.error("Invalid company slug:", err);
                setCompanyLoading(false);
                setCompanyError(true);
            });
    }, [slug]);

    // ————————————————————————————
    // STEP B: once we know companyId, fetch jobs
    // ————————————————————————————
    useEffect(() => {
        if (!companyId) return;

        setLoading(true);
        setError(null);

        axios
            .get(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
                headers: { company_id: companyId }
            })
            .then(res => {
                // normalize your payload however you like
                const payload = res.data.jobs || res.data.data || res.data;
                setJobs(Array.isArray(payload) ? payload : []);
            })
            .catch(err => {
                console.error("Failed to fetch jobs:", err);
                setError(err.message || "Unknown error");
            })
            .finally(() => setLoading(false));
    }, [companyId]);

    // ————————————————————————————
    // CONDITIONAL RENDERING
    // ————————————————————————————
    // 1) if slug‑check is still in flight, render nothing
    if (companyLoading) return null;

    // 2) if slug was invalid, hide the entire section
    if (companyError) return null;

    // 3) otherwise, you can show your normal loading / error / empty states for jobs
    if (loading) {
        return <div className="text-center py-8 text-white">Loading jobs…</div>;
    }
    if (error) {
        return (
            <div className="text-center py-8 text-red-400">
                Error loading jobs: {error}
            </div>
        );
    }
    if (jobs.length === 0) {
        return (
            <div className="text-center py-8 text-slate-300">
                No jobs found.
            </div>
        );
    }

    // 6) Render the cards
    return (
        <div className="py-5 backdrop-blur-sm">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-800 mb-4">
                        Featured Jobs
                    </h2>
                    <p className="dark:text-slate-300 text-gray-600 max-w-2xl mx-auto">
                        Discover top opportunities from companies using our platform
                    </p>

                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <Card key={job._id || job.id} job={job} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to={
                            companyUserName
                                ? `/${companyUserName}/all-posted-jobs`
                                : "/all-posted-jobs"
                        }
                    >
                        <button className="bg-white/10 hover:bg-white/20 dark:text-white  text-gray-800 py-3 px-8 rounded-full font-medium backdrop-blur-sm transition-all duration-300 border border-black">
                            View All Jobs
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Card component for displaying each job
const Card = ({ job }) => {
    const navigate = useNavigate();
    const companyUserName = localStorage.getItem("companyUserName");

    // Function to check if user is logged in
    const isUserLoggedIn = () => {
        // Check for authentication token or user data in localStorage
        // Adjust this based on how you store authentication state
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const user = localStorage.getItem("user");
        return !!(token || user);
    };

    // Handle navigation based on login status
    const handleNavigation = (action) => {
        const isLoggedIn = isUserLoggedIn();

        if (isLoggedIn) {
            // User is logged in, navigate to the job details page
            const jobId = job._id || job.id;
            navigate(`/${companyUserName}/current-job/${jobId}`);
        } else {
            // User is not logged in, navigate to login page
            navigate(`/${companyUserName}/login`);
        }
    };

    return (
        <div
            className="
  bg-gradient-to-br from-white via-white to-purple-50/40
  dark:bg-white/5
  dark:from-transparent dark:via-transparent dark:to-transparent
  rounded-xl
  shadow-sm
  overflow-hidden
  border border-gray-200 dark:border-white/10
  hover:shadow-xl hover:-translate-y-1 hover:border-purple-200
  transition-all
  group
"

        >

            <div className="p-5">
                <h2 className="text-lg font-bold dark:text-white text-gray-800 capitalize">
                    {job.title || ""}
                </h2>
                <p className="text-sm dark:text-white text-gray-800 pt-2">
                    {job.type} | {job.scheduleType}
                </p>
                <p className="text-sm dark:text-white text-gray-800 pt-2">
                    {job.city}, {job.state} | {job.locationType}
                </p>
                <p className="text-sm dark:text-white text-gray-800 pt-2">₹{job.compensation}/Annum</p>

                <div className="text-sm dark:text-white text-gray-800 mb-4 line-clamp-3 pt-2">
                    <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div className="text-sm dark:text-gray-500 text-gray-600">{job.experienceRequired} Years Experience.</div>
                    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => handleNavigation('view')}
                            className="bg-white/10 hover:bg-white/20 dark:text-white text-gray-800 px-3 py-2 rounded-full hover:bg-purple-200 transition-colors text-sm w-full "
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => handleNavigation('apply')}
                            className="bg-purple-600 text-white px-3 py-2 rounded-full hover:bg-purple-700 transition-colors text-sm w-full"
                        >
                            Apply Now
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
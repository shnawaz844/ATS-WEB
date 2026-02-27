import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    MapPin,
    Clock,
    IndianRupee,
    Calendar,
    ArrowRight,
    ChevronRight,
    Search,
    Users,
    Sparkles
} from "lucide-react";

const Jobs = () => {
    const { companyUserName } = useParams();
    const storedSlug = localStorage.getItem("companyUserName");
    const slug = companyUserName || storedSlug;

    const [companyDetails, setCompanyDetails] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState(false);

    const companyId = companyDetails?._id;

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (!companyId) return;

        setLoading(true);
        setError(null);

        axios
            .get(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
                headers: { company_id: companyId },
                params: { status: "Open,Filled,Applied" }
            })
            .then(res => {
                const payload = res.data.jobs || res.data.data || res.data;
                setJobs(Array.isArray(payload) ? payload : []);
            })
            .catch(err => {
                console.error("Failed to fetch jobs:", err);
                setError(err.message || "Unknown error");
            })
            .finally(() => setLoading(false));
    }, [companyId]);

    if (companyLoading) return null;
    if (companyError) return null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Curating opportunities...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto my-12 p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Failed to Load Jobs</h3>
                <p className="text-red-600 dark:text-red-300/80 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all font-medium"
                >
                    Retry Fetching
                </button>
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden py-12 bg-transparent border-t border-gray-100 dark:border-white/5">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200 dark:border-purple-800/50"
                        >
                            <Sparkles className="w-3 h-3" />
                            Open Jobs
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
                        >
                            Elevate Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Career Journey</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
                        >
                            Explore exclusively curated opportunities from innovative companies. Your next milestone starts here.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Link
                            to={companyUserName ? `/${companyUserName}/all-posted-jobs` : "/all-posted-jobs"}
                            className="group flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 transition-all no-underline"
                        >
                            Explore All Vacancies
                            <span className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-all">
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-gray-100 dark:border-white/10">
                            <Briefcase className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">No Open Roles Currently</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            We're currently refilling our pipeline. Check back soon for new opportunities!
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {jobs.map((job) => (
                            <JobCard key={job._id || job.id} job={job} />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

const JobCard = ({ job }) => {
    const navigate = useNavigate();
    const companyUserName = localStorage.getItem("companyUserName");

    const isUserLoggedIn = () => {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const user = localStorage.getItem("user");
        return !!(token || user);
    };

    const handleNavigation = (action) => {
        const isLoggedIn = isUserLoggedIn();
        if (isLoggedIn) {
            const jobId = job._id || job.id;
            navigate(`/${companyUserName}/current-job/${jobId}`);
        } else {
            navigate(`/${companyUserName}/login`);
        }
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } }
            }}
            className="group relative flex flex-col h-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-7 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(109,40,217,0.1)] hover:-translate-y-2"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:border-purple-100 dark:group-hover:border-purple-800/30 transition-colors duration-300">
                    <Briefcase className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="flex flex-col items-end gap-2">

                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-800/30">
                        {job.type}
                    </span>
                </div>
            </div>

            {/* Title & info */}
            <div className="flex-grow">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors capitalize">
                    {job.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-5">
                    <MapPin className="w-4 h-4" />
                    <span>{[job.city, job.state].filter(Boolean).join(', ') || job.locationType}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <span>{job.scheduleType}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-7 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                            <IndianRupee className="w-3 h-3" />
                            Compensation
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">₹{job.compensation}/yr</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                            <Clock className="w-3 h-3" />
                            Experience
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{job.experienceRequired} Years+</span>
                    </div>
                </div>

                <div
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-8 prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-4">
                <button
                    onClick={() => handleNavigation('view')}
                    className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Details
                </button>
                <button
                    onClick={() => handleNavigation('apply')}
                    className="flex-[1.5] px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
                >
                    Apply Now
                </button>
            </div>
        </motion.div>
    );
};

export default Jobs;

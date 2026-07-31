import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Briefcase, Search, Download, Eye, X } from "lucide-react";
import BackButtonMobile from "../Mob-back-btn";
import { toast } from "react-toastify";

const AssignedInterviews = () => {
    const { theme } = useTheme();
    const [waitlist, setWaitlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedResume, setSelectedResume] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applyingId, setApplyingId] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = user.company_id;

    const fetchWaitlist = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/waitlist/get-waitlist`, {
                headers: {
                    "Company_id": companyId
                }
            });
            const result = await response.json();
            if (result.success) {
                setWaitlist(result.data || []);
            } else {
                toast.error(result.message || "Failed to fetch waitlist");
            }
        } catch (error) {
            console.error("Error fetching waitlist:", error);
            toast.error("Error fetching waitlist data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
                headers: {
                    "Company_id": companyId
                }
            });
            const result = await response.json();
            if (result && result.jobs) {
                setJobs(result.jobs);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchWaitlist();
            fetchJobs();
        }
    }, [companyId]);

    const filteredWaitlist = waitlist.filter(item =>
        (item.name?.toLowerCase().includes(search.toLowerCase())) ||
        (item.email?.toLowerCase().includes(search.toLowerCase())) ||
        (item.department?.toLowerCase().includes(search.toLowerCase())) ||
        (item.role?.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const capitalizeWords = (str) => {
        if (!str) return "";

        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleApply = async (waitlistId, jobId) => {
        setApplyingId(waitlistId);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/waitlist/apply-to-job`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Company_id": companyId
                },
                body: JSON.stringify({ waitlistId, jobId })
            });
            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                fetchWaitlist(); // Refresh list to update status
            } else {
                toast.error(result.message || "Failed to apply");
            }
        } catch (error) {
            console.error("Error applying to job:", error);
            toast.error("An error occurred while applying");
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className={`px-4 md:px-8 py-4 w-full min-h-screen overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
            <BackButtonMobile />
            <div className="max-w-screen-2xl">
                {/* Header Section */}
                <div className={`mb-6 h-auto md:h-[15vh] flex items-center rounded-xl p-3 md:p-6 transition-colors duration-300 ${theme === 'dark' ? ' border border-gray-600 hover:shadow-xl hover:border-purple-500/50' : 'backdrop-blur-xl bg-gray-200 shadow-md'}`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-[#9333ea] flex items-center">
                                <div className="p-3 mx-2 bg-[#9333ea]/10 rounded-full">
                                    <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-gray-900 dark:text-white" />
                                </div>
                                Waitlist
                            </h2>
                        </div>
                        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto'>
                            <div className="relative flex-1 lg:flex-initial">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full md:w-64 pl-10 pr-4 py-2 border shadow-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 duration-200 text-sm ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className={`rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className={`uppercase tracking-wider border-b ${theme === 'dark' ? 'bg-gray-900/50 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Candidate</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Department & Role</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Applied On</th>
                                    <th className="px-6 py-4 font-semibold">Resume</th>
                                    {/* <th className="px-6 py-4 font-semibold">Action</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredWaitlist.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Briefcase className="h-10 w-10 text-gray-400 mb-3" />
                                                <p className={`text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No waitlist entries found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWaitlist.map((item, idx) => (
                                        <tr key={item.id || idx} className={`transition-colors hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <td className="px-6 py-4">
                                                <div className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{capitalizeWords(item.name)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item.email}</div>
                                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.phone || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{capitalizeWords(item.department) || "N/A"}</div>
                                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{capitalizeWords(item.role) || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {capitalizeWords(item.currentCity) || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                                                        item.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(item.createdAt || item.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.resumeUrl || item.resume_url ? (
                                                    <button
                                                        onClick={() => setSelectedResume(item.resumeUrl || item.resume_url)}
                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Resume
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">No Resume</span>
                                                )}
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                {(() => {
                                                    if (item.status === 'Applied') {
                                                        return <span className="text-xs text-green-600 font-medium italic">Already Applied</span>;
                                                    }

                                                    // Find matching job (case insensitive and trimmed match on title vs role)
                                                    const waitlistRole = item.role?.trim().toLowerCase();
                                                    const matchingJob = jobs.find(job => {
                                                        const jobTitle = job.title?.trim().toLowerCase();
                                                        if (!waitlistRole || !jobTitle) return false;
                                                        return jobTitle.includes(waitlistRole) || waitlistRole.includes(jobTitle);
                                                    });

                                                    if (matchingJob && item.role) {
                                                        return (
                                                            <button
                                                                onClick={() => handleApply(item.id, matchingJob._id || matchingJob.id)}
                                                                disabled={applyingId === item.id}
                                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${applyingId === item.id
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                    }`}
                                                            >
                                                                {applyingId === item.id ? (
                                                                    <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Briefcase className="w-3 h-3" />
                                                                )}
                                                                Apply to {matchingJob.title}
                                                            </button>
                                                        );
                                                    }

                                                    return <span className="text-xs text-gray-400 italic">No matching job</span>;
                                                })()}
                                            </td> */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Resume Modal */}
            {selectedResume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`relative w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Resume View
                            </h3>
                            <button
                                onClick={() => setSelectedResume(null)}
                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className="flex-1 w-full h-full bg-gray-100 dark:bg-gray-800">
                            <iframe
                                src={selectedResume}
                                title="Resume Preview"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedInterviews;

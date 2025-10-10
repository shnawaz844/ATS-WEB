import React, { useCallback, useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJob';
import Select from "react-select";
import { toast } from 'react-toastify';
import {
    Search, Plus, Edit, Trash2,
    Briefcase, MapPin, Clock, RefreshCw, Filter,
    Calendar1,
    IndianRupee,
    Share2
} from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import BackButtonMobile from '../../components/Mob-back-btn';

export const AllJobs = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [jobType, setJobType] = useState("");
    const [locationType, setLocationType] = useState("");
    const [scheduleType, setScheduleType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(6);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [jobStatuses, setJobStatuses] = useState([]);
    const [loadingStatuses, setLoadingStatuses] = useState(false);
    const [statusError, setStatusError] = useState(null);

    const [allJobsList, setAllJobsList] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
    const companyUserName = localStorage.getItem("companyUserName");

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    };

    useEffect(() => {
        const fetchJobStatuses = async () => {
            setLoadingStatuses(true);
            setStatusError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/job-statuses/all-job-statuses`, {
                    headers: {
                        'company_id': companyId
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch job statuses');
                }

                const data = await response.json();
                console.log('Job Statuses API Response:', data);

                if (data.jobStatuses && Array.isArray(data.jobStatuses)) {
                    setJobStatuses(data.jobStatuses);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                console.error('Error fetching job statuses:', error);
                setStatusError(error.message);
                setJobStatuses([]);
            } finally {
                setLoadingStatuses(false);
            }
        };

        fetchJobStatuses();
    }, [companyId]);

    const statusMap = jobStatuses.reduce((map, status) => {
        map[status._id] = status.jobStatus;  // Use _id as key, jobStatus as value
        return map;
    }, {});

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Dropdown options
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

    // Build filter object for API call
    const filterParams = {};
    if (debouncedSearch) filterParams.title = debouncedSearch;
    if (jobType) filterParams.type = jobType.value;
    if (locationType) filterParams.locationType = locationType.value;
    if (scheduleType) filterParams.scheduleType = scheduleType.value;

    // Fetch jobs with filters
    const { data: allJobs = [], isLoading, refetch } = useJobs(filterParams, currentPage, jobsPerPage, companyId);
    const navigate = useNavigate();

    // Reset to first page and clear jobs list when filters change
    useEffect(() => {
        setCurrentPage(1);
        setAllJobsList([]);
        setHasMore(true);
        setIsLoadingMore(false);
    }, [debouncedSearch, jobType, locationType, scheduleType]);

    // Update jobs list when new data arrives
    useEffect(() => {
        if (allJobs?.jobs && Array.isArray(allJobs.jobs)) {
            if (currentPage === 1) {
                // First page or filter change - replace the list
                setAllJobsList(allJobs.jobs);
                setHasMore(allJobs.jobs.length < (allJobs.totalCount || 0));
            } else {
                // Subsequent pages - append to existing list
                setAllJobsList(prevJobs => {
                    // Simple concatenation - let React handle duplicates with keys
                    const newJobs = allJobs.jobs || [];
                    return [...prevJobs, ...newJobs];
                });

                // Calculate if there are more jobs
                const totalLoadedAfterUpdate = allJobsList.length + allJobs.jobs.length;
                setHasMore(totalLoadedAfterUpdate < (allJobs.totalCount || 0));
            }
        } else if (currentPage === 1) {
            // No jobs found on first page
            setAllJobsList([]);
            setHasMore(false);
        }

        // Reset loading state
        setIsLoadingMore(false);
    }, [allJobs, currentPage]);

    // Add this function inside your AllJobs component
    const handleShareJob = (e, job) => {
        e.stopPropagation();

        const jobUrl = `${window.location.origin}/${companyUserName}/current-job/${job._id}`;
        const shareText = `Check out this job opening: ${job.title} at ${companyUserName}`;

        if (navigator.share) {
            // Web Share API (mobile devices)
            navigator.share({
                title: job.title,
                text: shareText,
                url: jobUrl,
            }).catch(err => {
                console.log('Error sharing:', err);
                toast.error('Failed to share job');
            });
        } else {
            // Fallback for desktop browsers
            const shareWindow = window.open('', '_blank', 'width=600,height=400');
            shareWindow.document.write(``);
        }
    };

    // Load more jobs for infinite scroll
    const fetchMoreJobs = useCallback(() => {
        if (!isLoading && hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            setCurrentPage(prevPage => prevPage + 1);
        }
    }, [isLoading, hasMore, isLoadingMore, currentPage]);

    // Calculate pagination
    const totalPages = allJobs?.totalPages || 1;

    // Reset filters handler
    const handleResetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setJobType("");
        setLocationType("");
        setScheduleType("");
        setCurrentPage(1);
        setAllJobsList([]);
        setHasMore(true);
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

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e2e8f0',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#cbd5e1'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : null,
            color: state.isSelected ? 'white' : '#1e293b',
        }),
        // Add these properties to fix the z-index issue
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            position: 'absolute',
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        })
    };

    // Handle job deletion
    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job?")) {
            return;
        }

        try {
            setIsDeleting(true);

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/jobs/delete-job/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                toast.error('Failed to delete job');
                return false;
            }

            // Remove the deleted job from the current list
            setAllJobsList(prevJobs => prevJobs.filter(job => job._id !== jobId));

            // Show success message
            toast.success('Job deleted successfully');

        } catch (error) {
            console.error('Error deleting job:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Loader component for infinite scroll
    const InfiniteScrollLoader = () => (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading more jobs...</span>
        </div>
    );

    // End message component
    const EndMessage = () => (
        <div className="text-center py-8">
            <p className="text-gray-500 text-lg font-medium">
                🎉 You've reached the end! No more jobs to load.
            </p>
        </div>
    );

    return (
        <div className="px-8 py-4 w-full min-h-screen"
            style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
        >
            <BackButtonMobile />
            <div className="max-w-screen-2xl">
                <div>
                    {/* Header Section */}
                    <div className='mb-6 h-auto min-h-[80px] md:min-h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3 sm:gap-4">
                            {/* Title Section - always on top on mobile, aligned left on desktop */ }
                            <div className="w-full md:w-auto flex-shrink-0">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center font-DM Sans">
                                    <Briefcase className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-gray-200" />
                                    Job Board
                                </h2>
                            </div>

                            {/* Search and Buttons Section - column on mobile, row on desktop */ }
                            <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
                                {/* Search Bar - full width on mobile, smaller on desktop */ }
                                <div className="relative rounded-full w-full md:w-[25vw] lg:w-[20vw]">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search job titles, skills..."
                                        value={ search }
                                        onChange={ ( e ) => setSearch( e.target.value ) }
                                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 shadow-sm transition-all duration-200 h-[40px] sm:h-[44px] md:h-[48px] focus:outline-none focus:ring-0 rounded-xl text-sm sm:text-base"
                                    />
                                </div>

                                {/* Buttons - row on all screens */ }
                                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                                    <button
                                        className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm text-sm sm:text-base whitespace-nowrap"
                                        onClick={ () => setIsFilterOpen( !isFilterOpen ) }
                                    >
                                        { isFilterOpen ? "Hide Filters" : "Show Filters" }
                                    </button>

                                    <Link
                                        to={ `/${ companyUserName }/post-job` }
                                        className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm text-sm sm:text-base whitespace-nowrap"
                                    >
                                        <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                                        Post New Job
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Toggle Button (Mobile) */}
                    {/* <div className="md:hidden px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                            <span className="font-medium text-gray-700">Filters</span>
                            <Filter className="h-5 w-5 text-gray-500" />
                        </button>
                    </div> */}

                    {/* Filters Section */}
                    <div className={`transition-all duration-300 ${isFilterOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-screen md:opacity-100'}`}>
                        <div className={isFilterOpen ? 'block' : 'hidden'}>
                            <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-300 to-gray-100 p-6 rounded-2xl shadow-lg border-0">
                                <div className="flex justify-center">
                                    <div className="flex flex-wrap justify-center gap-4 items-end max-w-5xl w-full">

                                        {/* Job Type Dropdown */}
                                        <div className="flex-1 min-w-48">
                                            <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                                <Briefcase className="mr-2 h-4 w-4 text-emerald-500" />
                                                <span>Job Type</span>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                                <Select
                                                    options={jobTypeOptions}
                                                    value={jobType}
                                                    onChange={setJobType}
                                                    placeholder="Any type"
                                                    isClearable
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        ...customSelectStyles,
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            border: 'none',
                                                            borderRadius: '16px',
                                                            background: 'transparent',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                                            '&:hover': {
                                                                border: 'none'
                                                            }
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#94a3b8'
                                                        }),
                                                        // Add menu styles here too
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        }),
                                                        menuPortal: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        })
                                                    }}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Location Type Dropdown */}
                                        <div className="flex-1 min-w-48">
                                            <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                                <MapPin className="mr-2 h-4 w-4 text-teal-500" />
                                                <span>Location</span>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                                <Select
                                                    options={locationTypeOptions}
                                                    value={locationType}
                                                    onChange={setLocationType}
                                                    placeholder="Any location"
                                                    isClearable
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        ...customSelectStyles,
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            border: 'none',
                                                            borderRadius: '16px',
                                                            background: 'transparent',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                                            '&:hover': {
                                                                border: 'none'
                                                            }
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#94a3b8'
                                                        }),

                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        }),
                                                        menuPortal: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        })
                                                    }}
                                                    className="text-sm"
                                                />

                                            </div>
                                        </div>

                                        {/* Schedule Type Dropdown */}
                                        <div className="flex-1 min-w-48">
                                            <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                                <Clock className="mr-2 h-4 w-4 text-purple-500" />
                                                <span>Schedule</span>
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                                <Select
                                                    options={scheduleTypeOptions}
                                                    value={scheduleType}
                                                    onChange={setScheduleType}
                                                    placeholder="Any schedule"
                                                    isClearable
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        ...customSelectStyles,
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            border: 'none',
                                                            borderRadius: '16px',
                                                            background: 'transparent',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                                            '&:hover': {
                                                                border: 'none'
                                                            }
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#94a3b8'
                                                        }),

                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        }),
                                                        menuPortal: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        })
                                                    }}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Reset Button */}
                                        <div className="flex-shrink-0 min-w-32">
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="group flex items-center justify-center w-full px-1 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                Reset
                                                <RefreshCw className="h-4 ml-2 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="px-6 py-3 border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            {allJobsList.length > 0 ? (
                                <>Showing <span className="font-medium">{allJobsList.length}</span> of <span className="font-medium">{allJobs.totalCount || 0}</span> jobs</>
                            ) : (
                                'No jobs found'
                            )}
                        </span>
                    </div>

                    {/* Jobs Card Section */}
                    <div className="overflow-x-auto rounded-t-xl">
                        {isLoading && currentPage === 1 && (
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        )}

                        {allJobsList.length > 0 ? (
                            <InfiniteScroll
                                dataLength={allJobsList.length}
                                next={fetchMoreJobs}
                                hasMore={hasMore}
                                loader={<InfiniteScrollLoader />}
                                endMessage={<EndMessage />}
                                scrollThreshold={0.8}
                                style={{ overflow: 'visible' }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                    {allJobsList.map((job) => (
                                        <div
                                            key={job._id}
                                            className="bg-white hover:bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-400 group relative"
                                            onClick={() => navigate(`/${companyUserName}/job-detail/${job._id}`)}
                                        >
                                            {/* Enhanced Status badge positioned at top right */}
                                            <div className="flex row-auto right-3 z-10 p-3 justify-end">
                                                {/* Copy Job Code Button */ }
                                                <button
                                                    onClick={ ( e ) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText( job.titleCode || "N/A" );
                                                        toast.success( 'Job code copied to clipboard!' );
                                                    } }
                                                    className="flex items-center text-amber-600 group-hover:text-amber-300 font-medium transition-colors duration-200 text-sm hover:bg-amber-50 group-hover:hover:bg-amber-900/20 px-2 py-1 rounded-md"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Copy Code
                                                </button>
                                                <span className={`inline-flex items-center px-3  rounded-full text-xs font-semibold shadow-sm border transition-all duration-200 ${job.status === 'Active'
                                                    ? 'bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100 group-hover:text-green-800' :
                                                    job.status === 'Closed'
                                                        ? 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:text-red-800' :
                                                        'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-100 group-hover:text-purple-800'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${job.status === 'Active' ? 'bg-green-500' :
                                                        job.status === 'Closed' ? 'bg-red-500' : 'bg-purple-500'
                                                        }`}></div>
                                                    {statusMap[job.status]}
                                                </span>
                                              
                                                <button
                                                    onClick={(e) => handleShareJob(e, job)}
                                                    className="flex items-center text-purple-600 group-hover:text-purple-300 font-medium transition-colors duration-200 text-sm hover:bg-purple-50 group-hover:hover:bg-purple-900/20 px-2 py-1 rounded-md"
                                                >
                                                    <Share2 className="h-4 w-4 mr-1" />
                                                    Share
                                                </button>
                                            </div>

                                            <div className="p-6 pt-2"> {/* Added extra top padding to accommodate badge */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 pr-4"> {/* Added right padding to prevent text overlap with badge */}
                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-4 font-DM leading-tight">
                                                            {capitalizeFirstLetter(job.title)}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                {job.type || "Full-Time"}
                                                            </span>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                {job.locationType || "On-Site"}
                                                            </span>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                                {job.scheduleType || "Full day"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center text-gray-700 group-hover:text-gray-200">
                                                        <IndianRupee className="h-4 w-4 mr-3 flex-shrink-0" />
                                                        <span className="text-sm font-medium">
                                                            Compensation: {formatIndianRupee(job.compensation)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center text-gray-700 group-hover:text-gray-200">
                                                        <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                                                        <span className="text-sm">
                                                            {job.city}, {job.state}, {job.country}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center text-gray-700 group-hover:text-gray-200">
                                                        <Calendar1 className="h-4 w-4 mr-3 flex-shrink-0" />
                                                        <span className="text-sm">
                                                            Posted: {new Date(job.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 group-hover:text-gray-200">
                                                        <Calendar1 className="h-4 w-4 mr-3 flex-shrink-0" />
                                                        <span className="text-sm">
                                                            Job Code:{ " " }
                                                            <span className="font-semibold bg-yellow-200 text-gray-800 px-1 rounded">
                                                                { job.titleCode || "N/A" }
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-gray-200 group-hover:border-gray-500 flex justify-between gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/${companyUserName}/post-job`, { state: { job } });
                                                        }}
                                                        className="flex items-center text-blue-600 group-hover:text-blue-300 font-medium transition-colors duration-200 text-sm hover:bg-blue-50 group-hover:hover:bg-blue-900/20 px-2 py-1 rounded-md"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        View & Edit
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteJob(job._id);
                                                        }}
                                                        disabled={isDeleting}
                                                        className="flex items-center text-red-600 group-hover:text-red-300 font-medium transition-colors duration-200 text-sm hover:bg-red-50 group-hover:hover:bg-red-900/20 px-2 py-1 rounded-md disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </InfiniteScroll>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="bg-gray-100 p-6 rounded-full mb-6">
                                    <Briefcase className="h-16 w-16 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-500 max-w-md mb-8 text-base">
                                    Try adjusting your search filters or post a new job to get started.
                                </p>
                                <Link
                                    to={`/${companyUserName}/post-job`}
                                    className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Post New Job
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AllJobs;
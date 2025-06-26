import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStatuses } from '../../hooks/useApplicationStatuses';
import Select from "react-select";
import {
    Search, Briefcase, MapPin, Clock, RefreshCw, Eye, Filter, Loader2
} from 'lucide-react';

const CandidateApplication = () => {
    const [formInputs, setFormInputs] = useState({
        title: '',
        city: '',
        type: '',
        scheduleType: '',
        hireType: '',
        locationType: '',
        company_id: "",
    });

    const companyId = JSON.parse(localStorage.getItem("user")).company_id;
    const [debouncedFilters, setDebouncedFilters] = useState(formInputs);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(10);
    const [allJobs, setAllJobs] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const companyUserName = localStorage.getItem("companyUserName");

    // Refs for infinite scroll
    const observerRef = useRef();

    const employmentTypes = [
        { value: "Full-Time", label: "Full-Time" },
        { value: "Part-Time", label: "Part-Time" },
        { value: "Contract", label: "Contract" },
    ];

    const scheduleTypes = [
        { value: "Flexible", label: "Flexible" },
        { value: "Morning Shift", label: "Morning Shift" },
        { value: "Day Shift", label: "Day Shift" },
        { value: "Night Shift", label: "Night Shift" },
    ];

    const hireTypes = [
        { value: "New", label: "New" },
        { value: "Replacement", label: "Replacement" },
    ];

    const locationTypes = [
        { value: "Remote", label: "Remote" },
        { value: "On-Site", label: "On-Site" },
        { value: "Hybrid", label: "Hybrid" },
    ];

    const navigate = useNavigate();

    // Fetch jobs with active filters
    const { data: jobData, isLoading, isError } = useApplicationStatuses(
        debouncedFilters, currentPage, jobsPerPage, companyId
    );
    // Handle input changes for filters
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFormInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Debounce filter application and reset jobs when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(formInputs);
            setCurrentPage(1);
            // setAllJobs( [] );
            setHasNextPage(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [formInputs]);

    // Update jobs when new data arrives
    useEffect(() => {
        if (jobData?.data) {
            if (currentPage === 1) {
                // First page or filter change - replace all jobs
                setAllJobs(jobData.data);
            } else {
                // Subsequent pages - append to existing jobs
                setAllJobs(prev => {
                    const existingIds = new Set(prev.map(job => job.jobID));
                    const newJobs = jobData.data.filter(job => !existingIds.has(job.jobID));
                    return [...prev, ...newJobs];
                });
            }


            setHasNextPage(currentPage < (jobData.totalPages || 1));
            setIsLoadingMore(false);
        }
    }, [jobData, currentPage, jobsPerPage]);

    // Infinite scroll callback
    const lastJobElementRefCallback = useCallback(node => {
        if (isLoading || isLoadingMore) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
                setIsLoadingMore(true);
                setCurrentPage(prevPage => prevPage + 1);
            }
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        if (node) observerRef.current.observe(node);
    }, [isLoading, isLoadingMore, hasNextPage]);

    // Reset filters
    const handleResetFilters = () => {
        setFormInputs({
            title: '',
            city: '',
            type: '',
            scheduleType: '',
            hireType: '',
            locationType: '',
        });
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
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Get job status badge color
    const getStatusBadge = (applicationCount) => {
        if (applicationCount === 0) {
            return "bg-yellow-100 text-yellow-800";
        } else if (applicationCount < 5) {
            return "bg-blue-100 text-blue-800";
        } else {
            return "bg-green-100 text-green-800";
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="px-8 py-4 w-full min-h-screen"
            style={{ background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' }}
        >
            <div className="max-w-screen-2xl">
                <div>
                    {/* Header Section */}
                    <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-4 lg:gap-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center font-DM Sansong">
                                    <Briefcase className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    Candidate Applications
                                </h2>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
                                {/* Search Bar */}
                                <div className="relative rounded-full flex-1 sm:flex-none">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formInputs.title}
                                        onChange={handleFilterChange}
                                        placeholder="Search job titles..."
                                        className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[5vh] sm:h-[6.3vh] text-sm sm:text-base"
                                    />
                                </div>
                                <button
                                    className="inline-flex border items-center justify-center px-3 sm:px-4 py-1.5 bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm text-sm sm:text-base whitespace-nowrap"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    {isFilterOpen ? "Hide Filters" : "Show Filters"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Toggle Button (Mobile) */}
                    <div className="md:hidden px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                            <span className="font-medium text-gray-700">Filters</span>
                            <Filter className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className={`transition-all duration-300 ${isFilterOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-screen md:opacity-100'}`}>
                        <div className={isFilterOpen ? 'block' : 'hidden'}>
                            <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-300 to-gray-100 p-6 rounded-2xl shadow-lg border-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                                    {/* Location Search */}
                                    <div className="lg:col-span-3">
                                        <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                                            <span>Location</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formInputs.city}
                                            onChange={handleFilterChange}
                                            placeholder="Any location"
                                            className="w-full px-4 py-3.5 border-0 bg-white/80 backdrop-blur-sm shadow-md rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:bg-white transition-all duration-300 h-[6.3vh] placeholder-slate-400 text-slate-700"
                                        />
                                    </div>

                                    {/* Employment Type Dropdown */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                            <Briefcase className="mr-2 h-4 w-4 text-emerald-500" />
                                            <span>Job Type</span>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                            <Select
                                                options={employmentTypes}
                                                value={employmentTypes.find(opt => opt.value === formInputs.type)}
                                                onChange={(selectedOption) => setFormInputs({ ...formInputs, type: selectedOption?.value || '' })}
                                                placeholder="Any type"
                                                isClearable
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
                                                    })
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Schedule Type Dropdown */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                            <Clock className="mr-2 h-4 w-4 text-purple-500" />
                                            <span>Schedule</span>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                            <Select
                                                options={scheduleTypes}
                                                value={scheduleTypes.find(opt => opt.value === formInputs.scheduleType)}
                                                onChange={(selectedOption) => setFormInputs({ ...formInputs, scheduleType: selectedOption?.value || '' })}
                                                placeholder="Any schedule"
                                                isClearable
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
                                                    })
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Hire Type Dropdown */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                            <Briefcase className="mr-2 h-4 w-4 text-orange-500" />
                                            <span>Hire Type</span>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                            <Select
                                                options={hireTypes}
                                                value={hireTypes.find(opt => opt.value === formInputs.hireType)}
                                                onChange={(selectedOption) => setFormInputs({ ...formInputs, hireType: selectedOption?.value || '' })}
                                                placeholder="Any hire type"
                                                isClearable
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
                                                    })
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Type Dropdown */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2 text-slate-600 text-sm font-medium">
                                            <MapPin className="mr-2 h-4 w-4 text-teal-500" />
                                            <span>Location Type</span>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
                                            <Select
                                                options={locationTypes}
                                                value={locationTypes.find(opt => opt.value === formInputs.locationType)}
                                                onChange={(selectedOption) => setFormInputs({ ...formInputs, locationType: selectedOption?.value || '' })}
                                                placeholder="Any location type"
                                                isClearable
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
                                                    })
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="group flex items-center justify-center w-full px-1 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                        >
                                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="px-6 py-3 border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            {allJobs?.length > 0 ? (
                                <>Showing <span className="font-medium">{allJobs?.length}</span> of <span className="font-medium">{jobData?.totalJobs || 0}</span> jobs</>
                            ) : (
                                'No jobs found'
                            )}
                        </span>
                        {allJobs?.length > 10 && (
                            <button
                                onClick={scrollToTop}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                            >
                                Back to top ↑
                            </button>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto rounded-t-xl">
                        {isLoading && currentPage === 1 &&
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        }
                        {isError &&
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                                    <div className="text-red-500 text-5xl mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                                    <p className="text-gray-600 mb-6">An error occurred while fetching job data. Please try again later.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                    >
                                        <RefreshCw className="inline-block mr-2 w-4 h-4" />
                                        Retry
                                    </button>
                                </div>
                            </div>
                        }
                        {allJobs?.length > 0 ? (
                            <div className="space-y-0">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gray-700 text-left">
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Job Title</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Schedule</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Applications</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {allJobs.map((job, index) => (
                                            <tr
                                                key={job.jobID}
                                                className="group hover:bg-gray-700 transition-colors duration-150"
                                                ref={index === allJobs.length - 1 ? lastJobElementRefCallback : null}
                                            >
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="text-sm font-medium group-hover:text-white">{capitalizeFirstLetter(job.title)}</div>
                                                    <div className="text-xs text-gray-500 mt-1 group-hover:text-white">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                            {job.hireType || "New"}
                                                        </span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {job.locationType || "On-Site"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                    <div className="flex items-start">
                                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm text-gray-900 group-hover:text-white">{job.city || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                    <div className="text-sm font-medium text-gray-900 group-hover:text-white">{job.type || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                    <div className="text-sm font-medium text-gray-900 group-hover:text-white">{job.scheduleType || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.applicationCount)}`}>
                                                        {job.applicationCount}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm group-hover:text-white">
                                                    <button
                                                        onClick={() => navigate(`/${companyUserName}/job-detail/${job.jobID}`)}
                                                        className="flex items-center text-blue-600 group-hover:text-white font-medium transition-colors duration-200"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Loading More Indicator */}
                                {isLoadingMore && (
                                    <div className="flex justify-center items-center py-8 bg-gray-50">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm font-medium">Loading more jobs...</span>
                                        </div>
                                    </div>
                                )}

                                {/* End of Results Indicator */}
                                {!hasNextPage && allJobs.length > 0 && (
                                    <div className="flex justify-center items-center py-8 bg-transparent border-t border-gray-200">
                                        <div className="text-center">
                                            <div className="text-gray-500 text-lg font-medium">  🎉 You've reached the end! No more jobs to load.</div>
                                            <button
                                                onClick={scrollToTop}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                            >
                                                Back to top ↑
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <div className="bg-gray-100 p-5 rounded-full mb-4">
                                        <Briefcase className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <div className="text-center animate-fade-in transition-all duration-500">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight leading-snug">
                                            No Applications Found
                                        </h3>
                                        <p className="text-md text-gray-600 max-w-md mx-auto leading-relaxed">
                                            It looks like there are no matching applications at the moment.
                                            <br className="hidden sm:block" />
                                            <span className="text-blue-500 font-medium">Try adjusting your filters</span> or come back later.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateApplication;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationTypes } from '../../hooks/useApplicationTypes';
import Select from "react-select";
import {
    Search, Filter, Briefcase, MapPin, Clock, RefreshCw, ChevronLeft,
    ChevronRight, Plus, Calendar, Users, DollarSign, Building,
    ChevronDown, Tag, X, Eye
} from 'lucide-react';

const CandidateApplication = () => {
    const [formInputs, setFormInputs] = useState({
        title: '',
        city: '',
        employmentType: '',
        scheduleType: '',
        hireType: '',
        locationType: '',
        company_id: "",
    });

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;

    const [debouncedFilters, setDebouncedFilters] = useState(formInputs);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(6); // Number of jobs per page
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const types = [
        { value: '', label: 'Select Employment Type' },
        { value: 'Full-Time', label: 'Full-Time' },
        { value: 'Part-Time', label: 'Part-Time' },
        { value: 'Contract', label: 'Contract' }
    ];
    const scheduleTypes = [
        { value: '', label: 'Select Schedule Type' },
        { value: 'Flexible', label: 'Flexible' },
        { value: 'Morning Shift', label: 'Morning Shift' },
        { value: 'Day Shift', label: 'Day Shift' },
        { value: 'Night Shift', label: 'Night Shift' }
    ];
    const hireTypes = [
        { value: '', label: 'Select Hire Type' },
        { value: 'New', label: 'New' },
        { value: 'Replacement', label: 'Replacement' },
    ];
    const locationTypes = [
        { value: '', label: 'Select Job Location Type' },
        { value: 'Remote', label: 'Remote' },
        { value: 'On-Site', label: 'On-site' },
        { value: 'Hybrid', label: 'Hybrid' },
    ];

    const navigate = useNavigate();

    // Fetch jobs with active filters
    const { data: jobData, isLoading, isError } = useApplicationTypes(
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

    // Count active filters
    useEffect(() => {
        const count = Object.values(formInputs).filter(value => value !== '').length;
        setActiveFiltersCount(count);
    }, [formInputs]);

    // Debounce filter application
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(formInputs);
        }, 500); // Debounce delay
        return () => clearTimeout(timer);
    }, [formInputs]);

    // Reset filters
    const handleResetFilters = () => {
        setFormInputs({
            title: '',
            city: '',
            employmentType: '',
            scheduleType: '',
            hireType: '',
            locationType: '',
        });
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Render active filter chips
    const renderFilterChips = () => {
        const activeFilters = [];

        if (formInputs.title) activeFilters.push({ key: 'title', value: formInputs.title });
        if (formInputs.city) activeFilters.push({ key: 'city', value: formInputs.city });
        if (formInputs.employmentType) activeFilters.push({ key: 'employmentType', value: formInputs.employmentType });
        if (formInputs.scheduleType) activeFilters.push({ key: 'scheduleType', value: formInputs.scheduleType });
        if (formInputs.hireType) activeFilters.push({ key: 'hireType', value: formInputs.hireType });
        if (formInputs.locationType) activeFilters.push({ key: 'locationType', value: formInputs.locationType });

        return activeFilters.map(filter => (
            <div key={filter.key} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                {filter.value}
                <button
                    onClick={() => {
                        setFormInputs(prev => ({ ...prev, [filter.key]: '' }));
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        ));
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

    const totalPages = jobData?.totalPages || 0;
    const allJobs = jobData?.data || [];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
                        <Briefcase className="mr-2 w-6 h-6 text-blue-600" />
                        Candidate Applications
                    </h1>
                    <div className="flex items-center space-x-2">
                        <button
                            className="md:hidden flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar - Mobile Only */}
                <div className="mb-6 md:hidden">
                    <div className="relative">
                        <input
                            type="text"
                            name="title"
                            value={formInputs.title}
                            onChange={handleFilterChange}
                            placeholder="Search job titles..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                {/* Active Filters - Show on mobile when there are active filters */}
                {activeFiltersCount > 0 && (
                    <div className="mb-4 flex flex-wrap">
                        {renderFilterChips()}
                        {activeFiltersCount > 1 && (
                            <button
                                onClick={handleResetFilters}
                                className="text-sm text-gray-600 hover:text-gray-800 underline flex items-center"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-1/6 bg-white shadow-lg rounded-lg p-4 mb-6 md:mb-0 transition-all duration-300 ease-in-out`}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Filters</h4>
                            <button
                                className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
                                onClick={() => setShowFilters(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={formInputs.title}
                                        onChange={handleFilterChange}
                                        placeholder="Job Title"
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        value={formInputs.city}
                                        onChange={handleFilterChange}
                                        placeholder="Location"
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                                <Select
                                    options={types}
                                    value={formInputs.employmentType ? { label: formInputs.employmentType, value: formInputs.employmentType } : null}
                                    onChange={(selectedOption) => setFormInputs({ ...formInputs, employmentType: selectedOption?.value || '' })}
                                    className="text-sm"
                                    placeholder="Select Employment Type"
                                    isClearable
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#2563eb',
                                        },
                                    })}
                                />
                            </div>

                            <div>
                                <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                                <Select
                                    options={scheduleTypes}
                                    value={formInputs.scheduleType ? { label: formInputs.scheduleType, value: formInputs.scheduleType } : null}
                                    onChange={(selectedOption) => setFormInputs({ ...formInputs, scheduleType: selectedOption?.value || '' })}
                                    className="text-sm"
                                    placeholder="Select Schedule Type"
                                    isClearable
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#2563eb',
                                        },
                                    })}
                                />
                            </div>

                            <div>
                                <label htmlFor="hireType" className="block text-sm font-medium text-gray-700 mb-1">Hire Type</label>
                                <Select
                                    options={hireTypes}
                                    value={formInputs.hireType ? { label: formInputs.hireType, value: formInputs.hireType } : null}
                                    onChange={(selectedOption) => setFormInputs({ ...formInputs, hireType: selectedOption?.value || '' })}
                                    className="text-sm"
                                    placeholder="Select Hire Type"
                                    isClearable
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#2563eb',
                                        },
                                    })}
                                />
                            </div>

                            <div>
                                <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                                <Select
                                    options={locationTypes}
                                    value={formInputs.locationType ? { label: formInputs.locationType, value: formInputs.locationType } : null}
                                    onChange={(selectedOption) => setFormInputs({ ...formInputs, locationType: selectedOption?.value || '' })}
                                    className="text-sm"
                                    placeholder="Select Location Type"
                                    isClearable
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#2563eb',
                                        },
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-10/12">
                        <div className="bg-white rounded-lg shadow-lg p-4">

                            {/* Jobs Count */}
                            <div className="mb-4 text-sm text-gray-600">
                                {allJobs?.length > 0 ? (
                                    <p>Showing {allJobs.length} of {jobData.totalJobs || 0} jobs</p>
                                ) : (
                                    <p>No jobs found matching your criteria</p>
                                )}
                            </div>

                            {/* Jobs List */}
                            <div className="space-y-4">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Job Title</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Schedule</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Hire Type</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Compensation</th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Applications</th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {isLoading &&
                                                <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                                        <p className="mt-4 text-gray-600">Loading jobs...</p>
                                                    </div>
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
                                            {allJobs?.length > 0 && (
                                                allJobs.map((job) => (
                                                    <tr key={job.jobID} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{job.title || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-700">
                                                            <div className="flex items-center">
                                                                <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                                                                {job.city || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {job.type || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-700">
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 text-gray-500 mr-1" />
                                                                {job.scheduleType || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-700">{job.hireType || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-700">
                                                            <div className="flex items-center">
                                                                <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                                                                {job.compensation || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.applicationCount)}`}>
                                                                {job.applicationCount}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => navigate(`/job-detail/${job.jobID}`)}
                                                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none animate-custom-shake shadow-lg hover:shadow-xl"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) }
                                            {allJobs?.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                        <div className="flex flex-col items-center">
                                                            <Briefcase className="w-12 h-12 text-gray-300 mb-2" />
                                                            <p className="text-lg font-medium">No jobs found</p>
                                                            <p className="text-sm">Try adjusting your filters or post a new job</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {allJobs?.length > 0 ? (
                                        allJobs.map((job) => (
                                            <div key={job.jobID} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{job.title || 'N/A'}</h3>
                                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.applicationCount)}`}>
                                                            {job.applicationCount} Apps
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center text-gray-600 text-sm">
                                                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                                            {job.city || 'N/A'}
                                                        </div>

                                                        <div className="flex items-center text-gray-600 text-sm">
                                                            <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                                                            {job.type || 'N/A'} · {job.locationType || 'N/A'}
                                                        </div>

                                                        <div className="flex items-center text-gray-600 text-sm">
                                                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                                            {job.scheduleType || 'N/A'}
                                                        </div>

                                                        <div className="flex items-center text-gray-600 text-sm">
                                                            <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                                                            {job.compensation || 'N/A'}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/job-detail/${job.jobID}`)}
                                                        className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                                            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your filters or post a new job</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 mt-6">
                                    <div className="mb-4 sm:mb-0 text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Previous
                                        </button>

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateApplication;
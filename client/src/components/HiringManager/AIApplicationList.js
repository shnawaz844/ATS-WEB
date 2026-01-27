import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStatuses } from '../../hooks/useApplicationStatuses';
import Select from "react-select";
import {
    Search, Briefcase, MapPin, Clock, RefreshCw, ChevronLeft,
    ChevronRight, Eye, Filter
} from 'lucide-react';
import BackButtonMobile from '../Mob-back-btn';

import { useTheme } from '../../context/ThemeContext';

const AIApplicationList = () => {
    const { theme } = useTheme();
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
    const [jobsPerPage] = useState(9);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const companyUserName = localStorage.getItem("companyUserName");
    const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(localStorage.getItem(`ai_features_${companyUserName}`) === 'true');
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'ai'

    // Fetch company settings to sync AI features
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/companies/companies/${companyUserName}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.aiFeaturesEnabled !== undefined) {
                        setAiFeaturesEnabled(data.aiFeaturesEnabled);
                        localStorage.setItem(`ai_features_${companyUserName}`, data.aiFeaturesEnabled);
                    }
                }
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };

        if (companyUserName) {
            fetchCompanyDetails();
        }
    }, [companyUserName]);

    // Mocked AI applications moved to AIApplicationList.js

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
            borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
            backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
            color: theme === 'dark' ? 'white' : 'black',
            boxShadow: 'none',
            '&:hover': {
                borderColor: theme === 'dark' ? '#4b5563' : '#cbd5e1'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#3b82f6'
                : state.isFocused
                    ? (theme === 'dark' ? '#374151' : '#eff6ff')
                    : (theme === 'dark' ? '#1f2937' : 'white'),
            color: state.isSelected ? 'white' : (theme === 'dark' ? 'white' : '#1e293b'),
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'dark' ? 'white' : 'black',
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'dark' ? 'white' : 'black',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
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

    const totalPages = jobData?.totalPages || 1;
    const allJobs = jobData?.data || [];

    return (
        <div className={`px-8 py-4 w-full min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'
            }`}>
            <BackButtonMobile />
            <div className="max-w-screen-2xl">
                <div>
                    {/* Manage Applications View */}
                    {activeTab === 'manage' && (
                        <div>
                            {/* Filters Section */}
                            <div className={`transition-all duration-300 ${isFilterOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-screen md:opacity-100'}`}>
                                <div className={isFilterOpen ? 'block' : 'hidden'}>
                                    <div className={`max-w-7xl mx-auto p-6 rounded-2xl shadow-lg border-0 ${theme === 'dark' ? 'bg-white/10 border border-gray-800' : 'bg-gradient-to-br from-gray-300 to-gray-100'
                                        }`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                                            {/* Location Search */}
                                            <div className="lg:col-span-3">
                                                <div className={`flex items-center mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                                                    <span>Location</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formInputs.city}
                                                    onChange={handleFilterChange}
                                                    placeholder="Any location"
                                                    className={`w-full px-4 py-3.5 border-0 backdrop-blur-sm shadow-md rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-300/50 transition-all duration-300 h-[6.3vh] ${theme === 'dark'
                                                        ? 'bg-gray-800/80 text-white placeholder-gray-500 focus:bg-gray-800'
                                                        : 'bg-white/80 text-slate-700 placeholder-slate-400 focus:bg-white'
                                                        }`}
                                                />
                                            </div>

                                            {/* Employment Type Dropdown */}
                                            <div className="lg:col-span-2">
                                                <div className={`flex items-center mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <Briefcase className="mr-2 h-4 w-4 text-emerald-500" />
                                                    <span>Job Type</span>
                                                </div>
                                                <div className={`backdrop-blur-sm rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
                                                <div className={`flex items-center mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <Clock className="mr-2 h-4 w-4 text-purple-500" />
                                                    <span>Schedule</span>
                                                </div>
                                                <div className={`backdrop-blur-sm rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
                                                <div className={`flex items-center mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <Briefcase className="mr-2 h-4 w-4 text-orange-500" />
                                                    <span>Hire Type</span>
                                                </div>
                                                <div className={`backdrop-blur-sm rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
                                                <div className={`flex items-center mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <MapPin className="mr-2 h-4 w-4 text-teal-500" />
                                                    <span>Location Type</span>
                                                </div>
                                                <div className={`backdrop-blur-sm rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {allJobs?.length > 0 ? (
                                        <>Showing <span className="font-medium">{allJobs?.length}</span> of <span className="font-medium">{jobData.totalJobs || 0}</span> jobs</>
                                    ) : (
                                        'No jobs found'
                                    )}
                                </span>
                            </div>

                            {/* Table Section */}
                            <div className="overflow-x-auto rounded-t-xl">
                                {isLoading &&
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
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className={`${theme === 'dark' ? 'bg-[#313131]' : 'bg-gray-200'} text-left`}>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Job Title</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Schedule</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Applications</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                            {allJobs.map((job) => (
                                                <tr key={job.jobID} className={`group transition-colors duration-150 ${theme === 'dark' ? 'hover:bg-gray-800 bg-[#1a1a1a]' : 'hover:bg-gray-700 bg-gray-100'
                                                    }`}>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'group-hover:text-white'}`}>{capitalizeFirstLetter(job.title)}</div>
                                                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500 group-hover:text-white'}`}>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                                {job.hireType || "New"}
                                                            </span>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                {job.locationType || "On-Site"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-5 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'group-hover:text-white'}`}>
                                                        <div className="flex items-start">
                                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                                                            <div>
                                                                <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>{job.city || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-5 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'group-hover:text-white'}`}>
                                                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>{job.type || 'N/A'}</div>
                                                    </td>
                                                    <td className={`px-6 py-5 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'group-hover:text-white'}`}>
                                                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>{job.scheduleType || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.applicationCount)}`}>
                                                            {job.applicationCount}
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-5 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-white' : 'group-hover:text-white'}`}>
                                                        <button
                                                            onClick={() => navigate(`/${companyUserName}/job-detail/${job.jobID}`)}
                                                            className={`flex items-center font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 group-hover:text-white'
                                                                }`}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                        <div className={`p-5 rounded-full mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                            <Briefcase className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <div className="text-center animate-fade-in transition-all duration-500">
                                            <h3 className={`text-2xl font-bold mb-3 tracking-tight leading-snug ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                No Applications Found
                                            </h3>
                                            <p className={`text-md max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                It looks like there are no matching applications at the moment.
                                                <br className="hidden sm:block" />
                                                <span className="text-blue-500 font-medium">Try adjusting your filters</span> or come back later.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 0 && allJobs?.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${currentPage === 1
                                                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                                                : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                                                }`}
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Previous
                                        </button>

                                        <div className="hidden sm:flex items-center space-x-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`px-3.5 py-2 text-sm rounded-md ${currentPage === i + 1
                                                        ? 'bg-gray-700 text-white cursor-not-allowed rounded-xl'
                                                        : 'bg-gray-300 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <span className="sm:hidden text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${currentPage === totalPages
                                                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                                                : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
                                                }`}
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Generated Applications View */}

                    {activeTab === 'ai' && (aiFeaturesEnabled || localStorage.getItem('ai_features_debug') === 'true') && (
                        <div className="p-8 text-center text-gray-500">
                            AI Specific View - Content can be added here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIApplicationList;

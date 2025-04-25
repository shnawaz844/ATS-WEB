import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useJobs } from '../../hooks/useJob';
import Select from "react-select";
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    Briefcase, MapPin, Clock, RefreshCw, Filter
} from 'lucide-react';

export const AllJobs = () => {
    // State for search and filters
    // const companyUserName = useParams();
    const [ search, setSearch ] = useState( "" );
    const [ debouncedSearch, setDebouncedSearch ] = useState( "" );
    const [ jobType, setJobType ] = useState( "" );
    const [ locationType, setLocationType ] = useState( "" );
    const [ scheduleType, setScheduleType ] = useState( "" );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ jobsPerPage ] = useState( 9 );
    const [ isFilterOpen, setIsFilterOpen ] = useState( true );

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const companyUserName = localStorage.getItem("companyUserName");
    
    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    // Debounce search input
    useEffect( () => {
        const handler = setTimeout( () => {
            setDebouncedSearch( search );
        }, 500 );
        return () => clearTimeout( handler );
    }, [ search ] );

    useEffect( () => {
        window.scrollTo( 0, 0 );
    }, [] );

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
    if ( debouncedSearch ) filterParams.title = debouncedSearch;
    if ( jobType ) filterParams.type = jobType.value;
    if ( locationType ) filterParams.locationType = locationType.value;
    if ( scheduleType ) filterParams.scheduleType = scheduleType.value;

    // Fetch jobs with filters
    const { data: allJobs = [], isLoading } = useJobs( filterParams, currentPage, jobsPerPage, companyId );
    const navigate = useNavigate();

    // Calculate pagination
    const totalPages = allJobs?.totalPages || 1;

    // Reset filters handler
    const handleResetFilters = () => {
        setSearch( "" );
        setDebouncedSearch( "" );
        setJobType( "" );
        setLocationType( "" );
        setScheduleType( "" );
        setCurrentPage( 1 );
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: ( provided ) => ( {
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e2e8f0',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#cbd5e1'
            }
        } ),
        option: ( provided, state ) => ( {
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : null,
            color: state.isSelected ? 'white' : '#1e293b',
        } ),
    };

    return (
        <div className="px-8 py-10 w-full"
            style={ { background: 'linear-gradient(135deg, #ffffff, #808080)' } }>
            <div className="max-w-screen-2xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header Section */ }
                    <div className="bg-white px-6 py-6 border-b border-gray-400">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <Briefcase className="mr-2 h-6 w-6 text-blue-600" />
                                Job Board
                            </h2>
                            <Link
                                to={`/${ companyUserName }/post-job`}
                                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Post New Job
                            </Link>
                        </div>
                    </div>

                    {/* Filter Toggle Button (Mobile) */ }
                    <div className="md:hidden px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <button
                            onClick={ () => setIsFilterOpen( !isFilterOpen ) }
                            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                            <span className="font-medium text-gray-700">Filters</span>
                            <Filter className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Filters Section */ }
                    <div className={ `transition-all duration-300 ${ isFilterOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-screen md:opacity-100' }` }>
                        <div className="p-6 bg-white border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                                {/* Search Bar */ }
                                <div className="lg:col-span-5">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search job titles, skills, or keywords..."
                                            value={ search }
                                            onChange={ ( e ) => setSearch( e.target.value ) }
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Job Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <Briefcase className="mr-1.5 h-4 w-4" />
                                        <span>Job Type</span>
                                    </div>
                                    <Select
                                        options={ jobTypeOptions }
                                        value={ jobType }
                                        onChange={ setJobType }
                                        placeholder="Any type"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                {/* Location Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <MapPin className="mr-1.5 h-4 w-4" />
                                        <span>Location</span>
                                    </div>
                                    <Select
                                        options={ locationTypeOptions }
                                        value={ locationType }
                                        onChange={ setLocationType }
                                        placeholder="Any location"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                {/* Schedule Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <Clock className="mr-1.5 h-4 w-4" />
                                        <span>Schedule</span>
                                    </div>
                                    <Select
                                        options={ scheduleTypeOptions }
                                        value={ scheduleType }
                                        onChange={ setScheduleType }
                                        placeholder="Any schedule"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-1 ">
                                    <button
                                        type="button"
                                        onClick={ handleResetFilters }
                                        className="flex items-center px-4 py-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */ }
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            { allJobs?.jobs?.length > 0 ? (
                                <>Showing <span className="font-medium">{ allJobs.jobs.length }</span> of <span className="font-medium">{ allJobs.totalJobs || 0 }</span> jobs</>
                            ) : (
                                'No jobs found'
                            ) }
                        </span>
                    </div>

                    {/* Table Section */ }
                    <div className="overflow-x-auto">
                        { isLoading &&
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        }
                        { allJobs?.jobs?.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Salary</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    { allJobs?.jobs?.map( ( job ) => (
                                        <tr key={ job._id } className="hover:bg-blue-50 transition-colors duration-150">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{ capitalizeFirstLetter(job.title) }</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                        { job.type || "Full-Time" }
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        { job.locationType || "On-Site" }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">₹{ job.compensation }</div>
                                                <div className="text-xs text-gray-500 mt-1">{ job.scheduleType || "Full day" }</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">{ (job.city) }, { job.state }</div>
                                                        <div className="text-xs text-gray-500 mt-1">{ job.country }</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={ () => navigate( `/${companyUserName}/post-job`, { state: { job } } ) }
                                                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) ) }
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="bg-gray-100 p-5 rounded-full mb-4">
                                    <Briefcase className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
                                <p className="text-gray-500 max-w-md mb-6">
                                    Try adjusting your search filters or post a new job to get started.
                                </p>
                                <Link
                                    to={ `/${ companyUserName }/post-job` }
                                    // to="/post-job"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Post New Job
                                </Link>
                            </div>
                        ) }
                    </div>

                    {/* Pagination */ }
                    { totalPages > 0 && allJobs?.jobs?.length > 0 && (
                        <div className="px-6 py-4 bg-white border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={ () => setCurrentPage( ( p ) => Math.max( 1, p - 1 ) ) }
                                    disabled={ currentPage === 1 }
                                    className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }` }
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </button>

                                <div className="hidden sm:flex items-center space-x-1">
                                    { [ ...Array( totalPages ) ].map( ( _, i ) => (
                                        <button
                                            key={ i }
                                            onClick={ () => setCurrentPage( i + 1 ) }
                                            className={ `px-3.5 py-2 text-sm rounded-md ${ currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }` }
                                        >
                                            { i + 1 }
                                        </button>
                                    ) ) }
                                </div>

                                <span className="sm:hidden text-sm text-gray-600">
                                    Page { currentPage } of { totalPages }
                                </span>

                                <button
                                    onClick={ () => setCurrentPage( ( p ) => Math.min( totalPages, p + 1 ) ) }
                                    disabled={ currentPage === totalPages }
                                    className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }` }
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default AllJobs;
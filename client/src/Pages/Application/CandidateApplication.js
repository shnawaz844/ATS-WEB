import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationTypes } from '../../hooks/useApplicationTypes';
import Select from "react-select";
import {
    Search, Briefcase, MapPin, Clock, RefreshCw, ChevronLeft,
    ChevronRight, Eye, Filter
} from 'lucide-react';

const CandidateApplication = () => {
    const [ formInputs, setFormInputs ] = useState( {
        title: '',
        city: '',
        type: '',
        scheduleType: '',
        hireType: '',
        locationType: '',
        company_id: "",
    } );

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const [ debouncedFilters, setDebouncedFilters ] = useState( formInputs );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ jobsPerPage ] = useState( 9 );
    const [ isFilterOpen, setIsFilterOpen ] = useState( false );
    const companyUserName = localStorage.getItem( "companyUserName" );

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
    const { data: jobData, isLoading, isError } = useApplicationTypes(
        debouncedFilters, currentPage, jobsPerPage, companyId
    );

    // Handle input changes for filters
    const handleFilterChange = ( e ) => {
        const { name, value } = e.target;
        setFormInputs( ( prev ) => ( {
            ...prev,
            [ name ]: value,
        } ) );
    };

    // Debounce filter application
    useEffect( () => {
        const timer = setTimeout( () => {
            setDebouncedFilters( formInputs );
        }, 500 ); // Debounce delay
        return () => clearTimeout( timer );
    }, [ formInputs ] );

    // Reset filters
    const handleResetFilters = () => {
        setFormInputs( {
            title: '',
            city: '',
            type: '',
            scheduleType: '',
            hireType: '',
            locationType: '',
        } );
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

    const capitalizeFirstLetter = ( str ) => {
        if ( !str ) return '';
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
    };

    // Get job status badge color
    const getStatusBadge = ( applicationCount ) => {
        if ( applicationCount === 0 ) {
            return "bg-yellow-100 text-yellow-800";
        } else if ( applicationCount < 5 ) {
            return "bg-blue-100 text-blue-800";
        } else {
            return "bg-green-100 text-green-800";
        }
    };

    const totalPages = jobData?.totalPages || 1;
    const allJobs = jobData?.data || [];

    return (
        <div className="px-8 py-4 w-full min-h-screen"
            style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <div className="max-w-screen-2xl">
                <div>
                    {/* Header Section */ }
                    <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center">
                                    <Briefcase className="mr-2 h-6 w-6 text-white" />
                                    Candidate Applications
                                </h2>
                            </div>

                            <div>
                                <button
                                    className="inline-flex border items-center px-4 py-1.5 bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm"
                                    onClick={ () => setIsFilterOpen( !isFilterOpen ) } // Toggle filter visibility
                                >
                                    { isFilterOpen ? "Hide Filters" : "Show Filters" }
                                </button>
                            </div>
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
                        <div className={ isFilterOpen ? 'block' : 'hidden' }>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                                {/* Search Bar */ }
                                <div className="lg:col-span-2">
                                    <div className="relative rounded-full">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="title"
                                            value={ formInputs.title }
                                            onChange={ handleFilterChange }
                                            placeholder="Search job titles..."
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[6.3vh]"
                                        />
                                    </div>
                                </div>

                                {/* Location Search */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <MapPin className="mr-1.5 h-4 w-4" />
                                        <span>Location</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="city"
                                        value={ formInputs.city }
                                        onChange={ handleFilterChange }
                                        placeholder="Any location"
                                        className="w-full px-4 py-3 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[6.3vh]"
                                    />
                                </div>

                                {/* Employment Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <Briefcase className="mr-1.5 h-4 w-4" />
                                        <span>Job Type</span>
                                    </div>
                                    <Select
                                        options={ employmentTypes }
                                        value={ employmentTypes.find( opt => opt.value === formInputs.type ) }
                                        onChange={ ( selectedOption ) => setFormInputs( { ...formInputs, type: selectedOption?.value || '' } ) }
                                        placeholder="Any type"
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
                                        options={ scheduleTypes }
                                        value={ scheduleTypes.find( opt => opt.value === formInputs.scheduleType ) }
                                        onChange={ ( selectedOption ) => setFormInputs( { ...formInputs, scheduleType: selectedOption?.value || '' } ) }
                                        placeholder="Any schedule"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                {/* Hire Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <Briefcase className="mr-1.5 h-4 w-4" />
                                        <span>Hire Type</span>
                                    </div>
                                    <Select
                                        options={ hireTypes }
                                        value={ hireTypes.find( opt => opt.value === formInputs.hireType ) }
                                        onChange={ ( selectedOption ) => setFormInputs( { ...formInputs, hireType: selectedOption?.value || '' } ) }
                                        placeholder="Any hire type"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                {/* Location Type Dropdown */ }
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-1.5 text-gray-500 text-sm">
                                        <MapPin className="mr-1.5 h-4 w-4" />
                                        <span>Location Type</span>
                                    </div>
                                    <Select
                                        options={ locationTypes }
                                        value={ locationTypes.find( opt => opt.value === formInputs.locationType ) }
                                        onChange={ ( selectedOption ) => setFormInputs( { ...formInputs, locationType: selectedOption?.value || '' } ) }
                                        placeholder="Any location type"
                                        isClearable
                                        styles={ customSelectStyles }
                                        className="text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-1">
                                    <button
                                        type="button"
                                        onClick={ handleResetFilters }
                                        className="flex items-center px-4 py-3 bg-gray-700 text-gray-100 rounded-xl hover:bg-gray-400 transition-colors duration-200"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */ }
                    <div className="px-6 py-3 border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            { allJobs?.length > 0 ? (
                                <>Showing <span className="font-medium">{ allJobs.length }</span> of <span className="font-medium">{ jobData.totalJobs || 0 }</span> jobs</>
                            ) : (
                                'No jobs found'
                            ) }
                        </span>
                    </div>

                    {/* Table Section */ }
                    <div className="overflow-x-auto rounded-t-xl">
                        { isLoading &&
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            </div>
                        }
                        { isError &&
                            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                                    <div className="text-red-500 text-5xl mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                                    <p className="text-gray-600 mb-6">An error occurred while fetching job data. Please try again later.</p>
                                    <button
                                        onClick={ () => window.location.reload() }
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                    >
                                        <RefreshCw className="inline-block mr-2 w-4 h-4" />
                                        Retry
                                    </button>
                                </div>
                            </div>
                        }
                        { allJobs?.length > 0 ? (
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
                                    { allJobs.map( ( job ) => (
                                        <tr key={ job.jobID } className="group hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-medium group-hover:text-white">{ capitalizeFirstLetter( job.title ) }</div>
                                                <div className="text-xs text-gray-500 mt-1 group-hover:text-white">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                        { job.hireType || "New" }
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        { job.locationType || "On-Site" }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 group-hover:text-white">{ job.city || 'N/A' }</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-white">{ job.type || 'N/A' }</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap group-hover:text-white">
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-white">{ job.scheduleType || 'N/A' }</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <div className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ getStatusBadge( job.applicationCount ) }` }>
                                                    { job.applicationCount }
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm group-hover:text-white">
                                                <button
                                                    onClick={ () => navigate( `/${ companyUserName }/job-detail/${ job.jobID }` ) }
                                                    className="flex items-center text-blue-600 group-hover:text-white font-medium transition-colors duration-200"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </button>
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
                        ) }
                    </div>

                    {/* Pagination */ }
                    { totalPages > 0 && allJobs?.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={ () => setCurrentPage( ( p ) => Math.max( 1, p - 1 ) ) }
                                    disabled={ currentPage === 1 }
                                    className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ currentPage === 1
                                        ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                                        : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
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
                                                ? 'bg-gray-700 text-white cursor-not-allowed rounded-xl'
                                                : 'bg-gray-300 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
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
                                        ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                                        : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
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

export default CandidateApplication;
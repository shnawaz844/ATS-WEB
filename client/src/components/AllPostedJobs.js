import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import JobDescriptionModal from "./JobDescriptionModal";

// Dropdown Options
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



const AllPostedJobs = () => {
  const companyUserName = localStorage.getItem( "companyUserName" );
  const [ companyDetails, setCompanyDetails ] = useState( null );
  const [ selectedJob, setSelectedJob ] = useState( null );
  const [ page, setPage ] = useState( 1 );
  const [ limit, setLimit ] = useState( 12 );
  const [ search, setSearch ] = useState( "" );
  const [ debouncedSearch, setDebouncedSearch ] = useState( "" );
  const [ jobType, setJobType ] = useState( "" );
  const [ locationType, setLocationType ] = useState( "" );
  const [ scheduleType, setScheduleType ] = useState( "" );
  const companyId = companyDetails?._id;

  console.log( "companyId", companyId )
  // Debounce search input
  useEffect( () => {
    const handler = setTimeout( () => {
      setDebouncedSearch( search );
    }, 500 );
    return () => clearTimeout( handler );
  }, [ search ] );

  // Fetch company details
  useEffect( () => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get( `http://localhost:8080/companies/companies/${ companyUserName }` );
        setCompanyDetails( response.data );
      } catch ( error ) {
        console.error( "Error fetching company details", error );
      }
    };
    fetchCompanyDetails();
  }, [ companyUserName ] );

  const fetchJobs = async ( { queryKey } ) => {
    const [ _, page, limit, debouncedSearch, jobType, locationType, scheduleType ] = queryKey;
    const params = { page, limit, search: debouncedSearch };

    if ( jobType ) params.type = jobType.value;
    if ( locationType ) params.locationType = locationType.value;
    if ( scheduleType ) params.scheduleType = scheduleType.value;

    const response = await axios.get( "http://localhost:8080/jobs/all-jobs", {
      params, headers: {
        company_id: companyId
      }
    } );
    return response.data;
  };

  const { data, isError } = useQuery( {
    queryKey: [ "jobs", page, limit, debouncedSearch, jobType, locationType, scheduleType, companyId ],
    queryFn: fetchJobs,
    keepPreviousData: true,
  } );

  if ( isError ) return <div>Error fetching jobs</div>;

  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="text-center text-2xl md:text-3xl font-bold text-primary mb-8">
        Explore Our Opportunities
      </h1>
      <p className="text-center text-primary mb-8">
        Find your perfect role from our wide range of positions across different departments and locations.
      </p>

      {/* Filters */ }
      <div className="mb-6 flex flex-wrap justify-center items-center gap-4 w-full max-w-6xl mx-auto">
        {/* Search Bar */ }
        <input
          type="text"
          placeholder="Search jobs..."
          value={ search }
          onChange={ ( e ) => setSearch( e.target.value ) }
          className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        {/* Job Type Dropdown */ }
        <Select
          options={ jobTypeOptions }
          value={ jobType }
          onChange={ setJobType }
          className="w-full sm:w-48"
          placeholder="Job Type"
          isClearable
        />

        {/* Location Type Dropdown */ }
        <Select
          options={ locationTypeOptions }
          value={ locationType }
          onChange={ setLocationType }
          className="w-full sm:w-48"
          placeholder="Location Type"
          isClearable
        />

        {/* Schedule Type Dropdown */ }
        <Select
          options={ scheduleTypeOptions }
          value={ scheduleType }
          onChange={ setScheduleType }
          className="w-full sm:w-48"
          placeholder="Schedule Type"
          isClearable
        />
      </div>

      {/* Jobs List */ }
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        { data?.jobs.map( ( job ) => (
          <Card key={ job._id } job={ job } onViewDetails={ () => setSelectedJob( job ) } companyUserName={ companyUserName } />
        ) ) }
      </div>

      {/* Pagination Controls */ }
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={ () => setPage( ( old ) => Math.max( old - 1, 1 ) ) }
          disabled={ page === 1 }
          className="w-24 px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed text-center"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page { page } of { data?.totalPages }
        </span>
        <button
          onClick={ () => setPage( ( old ) => old + 1 ) }
          disabled={ page >= data?.totalPages }
          className="w-24 px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed text-center"
        >
          Next
        </button>
      </div>

      {/* Job Description Modal */ }
      { selectedJob && (
        <JobDescriptionModal job={ selectedJob } isOpen={ !!selectedJob } onClose={ () => setSelectedJob( null ) } />
      ) }
    </div>
  );
};

const Card = ( { job, onViewDetails, companyUserName } ) => {
  const capitalizeFirstLetter = ( string ) => {
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-800 capitalize">{ job.title || "Software Engineer" }</h2>
        <p className="text-[1rem] text-gray-600 pt-2">{ job.type } | { job.scheduleType }</p>
        <p className="text-sm text-gray-700 pt-2">{ job.city }, { job.state } | { job.locationType }</p>
        <p className="text-sm text-gray-600 pt-2">₹{ job.compensation }/Annum</p>

        <div className="text-sm text-purple-800 mb-4 min-h-16 line-clamp-3 pt-2 mt-2">
          <div dangerouslySetInnerHTML={ { __html: capitalizeFirstLetter(job.description) } } />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">{ job.experienceRequired } Years Experience.</div>
          <div className="flex space-x-2">
            <button onClick={ onViewDetails } className="bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition-colors text-sm">
              View Details
            </button>
            <Link to={ `/${ companyUserName }/current-job/${ job._id }` }>
              <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPostedJobs;
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import JobDescriptionModal from "./JobDescriptionModal";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [ isFilterOpen, setIsFilterOpen ] = useState( false );

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
        const response = await axios.get( `${ process.env.REACT_APP_BASE_URL }/companies/companies/${ companyUserName }` );
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

    const response = await axios.get( `${ process.env.REACT_APP_BASE_URL }/jobs/all-jobs`, {
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
    <div className="px-8 py-4 w-full min-h-screen"
      style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
    >
      <div className="max-w-screen-2xl">
        <div>
          {/* Header Section */ }
          <div className="mb-6 h-[25vh] relative flex items-center rounded-xl p-4 bg-gray-700">
            {/* Main content centered */ }
            <div className="flex justify-center items-center w-full">
              <div className="text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-6">
                  Explore Our Opportunities
                </h1>
                <p className="text-white mb-8">
                  Find your perfect role from our wide range of positions across different departments and locations.
                </p>
              </div>
            </div>

            {/* Filter button positioned absolutely in the top right */ }
            <div className="absolute top-[6rem] right-4">
              <button
                className="inline-flex border items-center px-4 py-2.5 bg-gray-300 text-black rounded-xl font-medium hover:bg-gray-700 hover:text-white hover:border-gray-200 transition-colors duration-200 shadow-sm"
                onClick={ () => setIsFilterOpen( !isFilterOpen ) }
              >
                { isFilterOpen ? "Hide Filters" : "Show Filters" }
              </button>
            </div>
          </div>

          {/* Filters */ }
          <div className={ `flex items-center justify-evenly transition-all duration-300 ${ isFilterOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-screen md:opacity-100 backdrop-blur-full' }` }>
            <div className={ isFilterOpen ? 'block' : 'hidden' }>
              <div className="mb-6 flex flex-wrap justify-center items-center gap-4 w-full max-w-6xl mx-auto">
                {/* Search Bar */ }
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={ search }
                  onChange={ ( e ) => setSearch( e.target.value ) }
                  className="w-full sm:w-64 p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 h-[6.3vh]"
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
            </div>
          </div>


          {/* Jobs List or No Jobs Found Message */ }
          { data?.jobs && data.jobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              { data.jobs.map( ( job ) => (
                <Card key={ job._id } job={ job } onViewDetails={ () => setSelectedJob( job ) } companyUserName={ companyUserName } />
              ) ) }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 p-5 rounded-full mb-4">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
              <p className="text-gray-500 max-w-md mb-6">
                  Opportunities are on the way. Stay tuned!
              </p>
            </div>
          ) }


          {/* Pagination Controls */ }
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
            <button
              onClick={ () => setPage( ( old ) => Math.max( old - 1, 1 ) ) }
              disabled={ page === 1 }
              className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ page === 1
                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                : 'bg-gray-700 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                }` }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              <span className="px-3 py-1 bg-gray-300 text-black rounded-full font-medium">{ page }</span>
              <span className="text-sm text-gray-500">of { data?.totalPages }</span>
            </div>

            <button
              onClick={ () => setPage( ( old ) => Math.min( data?.totalPages, old + 1 ) ) }
              disabled={ page === data?.totalPages }
              className={ `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ page === data?.totalPages
                ? 'bg-gray-400 text-white cursor-not-allowed rounded-xl'
                : 'bg-gray-700 text-white hover:bg-gray-400 rounded-xl'
                }` }
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {/* Job Description Modal */ }
          { selectedJob && (
            <JobDescriptionModal job={ selectedJob } isOpen={ !!selectedJob } onClose={ () => setSelectedJob( null ) } />
          ) }
        </div>
      </div>
    </div>

  );
};

const Card = ( { job, onViewDetails, companyUserName } ) => {

  const capitalizeFirstLetter = ( string ) => {
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
  };

  // Function to format number in Indian Rupee format (e.g., 1,00,000)
  const formatIndianRupee = ( num ) => {
    if ( !num ) return "0";

    // Convert to string and remove any non-digit characters
    const numStr = num.toString().replace( /[^\d]/g, "" );

    // Handle the case if it's just 0
    if ( parseInt( numStr ) === 0 ) return "0";

    let lastThree = numStr.substring( numStr.length - 3 );
    let otherNumbers = numStr.substring( 0, numStr.length - 3 );

    if ( otherNumbers !== '' ) {
      // Add commas after every two digits in the other numbers part
      lastThree = ',' + lastThree;
    }

    // Format remaining digits with commas after every 2 digits
    const formattedOtherNumbers = otherNumbers.replace( /\B(?=(\d{2})+(?!\d))/g, "," );

    return formattedOtherNumbers + lastThree;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-800 capitalize">{ job.title || "Software Engineer" }</h2>
        <p className="text-[1rem] text-gray-600 pt-2">{ job.type } | { job.scheduleType }</p>
        <p className="text-sm text-gray-700 pt-2">{ job.city }, { job.state } | { job.locationType }</p>
        <p className="text-sm text-gray-600 pt-2">₹{ formatIndianRupee( job.compensation ) }/Annum</p>


        <div className="text-sm text-purple-800 mb-4 min-h-16 line-clamp-3 pt-2 mt-2">
          <div dangerouslySetInnerHTML={ { __html: capitalizeFirstLetter( job.description ) } } />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">{ job.experienceRequired } Years Experience.</div>
          <div className="flex space-x-2">
            <button onClick={ onViewDetails } className="bg-gray-300 text-black px-3 py-2 rounded-xl hover:bg-gray-400 hover:text-black transition-colors text-sm">
              View Details
            </button>
            <Link to={ `/${ companyUserName }/current-job/${ job._id }` }>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-400 hover:text-black transition-colors">
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
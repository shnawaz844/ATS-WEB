import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Briefcase, Clock, Filter, FileText, X, Check, AlertTriangle, ChevronDown, Download } from 'lucide-react';
import useFeedbacks from '../../hooks/useFeedbacks';
import useScheduledInterview from '../../hooks/useAssignedInterview';

const AllInterviews = () => {
  const [ activeTab, setActiveTab ] = useState( 'interviews' );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ isDetailModalOpen, setIsDetailModalOpen ] = useState( false );
  const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
  const [ filterStatus, setFilterStatus ] = useState( 'all' );
  const [ detailedInterview, setDetailedInterview ] = useState( null );
  const [ pdfUrl, setPdfUrl ] = useState( null );
  const [ isPdfModalOpen, setIsPdfModalOpen ] = useState( false );
  const [ pdfPreviewUrl, setPdfPreviewUrl ] = useState( '' );
  const [ isFeedbackExpanded, setIsFeedbackExpanded ] = useState( false );
  const [ isStatus, setIsStatus ] = useState( false );
  const [ debouncedSearch, setDebouncedSearch ] = useState( '' );
  const [ debouncedStatus, setDebouncedStatus ] = useState( '' );

  const [ feedbackForm, setFeedbackForm ] = useState( {
    feedbackTitle: '',
    feedback: '',
    attachment: null,
    status: '',
    starRating: ''
  } );

  const [ statuses, setStatuses ] = useState( [] );
  const [ page, setPage ] = useState( 1 );
  const limit = 10; // Adjust limit as needed

  // Fetch statuses from API
  useEffect( () => {
    fetch( `${ process.env.REACT_APP_BASE_URL }/application-types/all-application-types` )
      .then( response => response.json() )
      .then( data => setStatuses( data.applicationTypes ) )
      .catch( error => console.error( "Error fetching statuses:", error ) );
  }, [] );


  // Implement search debounce
  useEffect( () => {
    // Set a timer to update the debouncedSearch after 500ms of no typing
    const timer = setTimeout( () => {
      setDebouncedSearch( searchTerm );
      setDebouncedStatus( filterStatus )
      // Reset to page 1 when search term changes
      setPage( 1 );
    }, 500 );

    // Clear the timer if searchTerm changes before 500ms
    return () => clearTimeout( timer );
  }, [ searchTerm, filterStatus ] );

  // Fetch feedbacks
  const { feedbacks, total: totalFeedbacks, error: feedbackError, isLoading: feedbackLoading } = useFeedbacks( page, limit );

  // Fetch scheduled interviews
  const { assignedInterviews, error: interviewError, isLoading: interviewLoading, refetchAssignedInterviews } = useScheduledInterview( page, limit, debouncedSearch, debouncedStatus );

  const totalPages = assignedInterviews?.totalPages || 1;
  const interviewList = assignedInterviews?.interviews || [];

  // console.log( "assignedInterviews", assignedInterviews );

  const viewPDF = ( resumeUrl ) => {
    setPdfUrl( resumeUrl );
    setIsPdfModalOpen( true );
  };

  const handleSaveStatus = () => {
    // Example: send status to backend or handle locally
    if ( !feedbackForm.status ) {
      alert( "Please select a status before saving." );
      return;
    }

    // Example: You can use fetch or axios to send to backend
    // console.log( "Saving candidate status:", feedbackForm.status );

    // Optional: Close modal or show confirmation
    setIsFeedbackModalOpen( false );
  };


  // Handle Pagination
  const handleNextPage = () => {
    if ( page < totalPages ) {
      setPage( prevPage => prevPage + 1 );
    }
  };

  const handlePreviousPage = () => {
    if ( page > 1 ) {
      setPage( prevPage => prevPage - 1 );
    }
  };


  const handleFeedbackClick = async ( selectedInterview ) => {
    setDetailedInterview( selectedInterview );

    try {
      // Find feedback for the selected interview
      let feedbackData = feedbacks.filter( f => f?.interviewId?._id === selectedInterview._id );

      if ( !feedbackData.length ) {
        throw new Error( "No feedback found for this interview" );
      }

      feedbackData = feedbackData[ 0 ];
      setFeedbackForm( {
        _id: feedbackData._id,
        feedbackTitle: feedbackData.feedbackTitle || "",
        feedback: feedbackData.feedback || "",
        starRating: feedbackData.starRating || 0, // if rating exists in your data
        // attachment: feedbackData.attachment || null,
      } );
    } catch ( error ) {
      console.error( "Error fetching feedback:", error );

      // Reset form if no feedback exists
      setFeedbackForm( {
        feedbackTitle: "",
        feedback: "",
        starRating: "",
        // attachment: null,
      } );
    }

    setIsFeedbackModalOpen( true );
  };

  const formatDate = ( dateString ) => {
    if ( !dateString ) return "No date";
    return new Date( dateString ).toLocaleDateString( "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    } );
  };


  // Format time to display only HH:MM AM/PM
  const formatTime = ( timeString ) => {
    if ( !timeString ) return "N/A";

    let dateObj;

    // If timeString is a full ISO date-time string
    if ( timeString.includes( "T" ) ) {
      dateObj = new Date( timeString );
    }
    // If timeString is only a time (e.g., "15:30:00"), add a dummy date
    else {
      dateObj = new Date( `1970-01-01T${ timeString }` );
    }

    // Check if date is valid
    if ( isNaN( dateObj.getTime() ) ) {
      console.error( "Invalid time format:", timeString );
      return "Invalid Time";
    }

    return dateObj.toLocaleTimeString( "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    } );
  };


  const filteredInterviews = interviewList

  const handleStatusChange = async ( feedbackId, newStatus ) => {
    try {
      const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/applicationscheduledlist/update-interview/${ feedbackId }`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( { status: newStatus } ),
      } );

      if ( !response.ok ) throw new Error( "Failed to update status" );

      // ✅ Update local state so the UI re-renders
      refetchAssignedInterviews()

      console.log( "Status updated successfully" );

      // Optionally: refresh data or update state here
    } catch ( error ) {
      console.error( "Error updating status:", error );
      alert( "Failed to update status" );
    }
  };

  const getStatusColor = ( status ) => {
    switch ( status ) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Process': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = ( rating ) => {
    return Array( 5 ).fill( 0 ).map( ( _, i ) => (
      <span key={ i } className={ i < rating ? "text-yellow-500" : "text-gray-300" }>★</span>
    ) );
  };

  const capitalizeFirstLetter = ( string ) => {
    if ( !string ) return '';
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
  };

  const handleSearchChange = ( e ) => {
    setSearchTerm( e.target.value );
  };

  const handleSearchSubmit = ( e ) => {
    e.preventDefault();
    // The debounce effect will handle the actual search
  };


  return (
    <div className="px-8 py-4 w-full min-h-screen"
      style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
    >
      <div className="max-w-screen-2xl">

        <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
          <div className="flex justify-between items-center w-full">
            <div>

              <h2 className="text-3xl font-bold text-white flex items-center">
                <Briefcase className="mr-2 h-6 w-6 text-white" />
                Interview Management
              </h2>
            </div>
            {/* Search and Filter */ }
            <div className='flex items-center gap-4'>
              <div className="flex flex-col md:flex-row md:justify-between gap-4 w-[40vw]">
                <div className="lg:col-span-2 w-[30vw]">
                  <label className="block text-white text-xs font-bold mb-2">
                    Search:
                  </label>
                  <form onSubmit={ handleSearchSubmit } autoComplete="off">
                    <div className="relative rounded-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        value={ searchTerm }
                        onChange={ handleSearchChange }
                        placeholder="Search by candidate name, job title, interviewer..."
                        className="w-full pl-10 pr-4 py-1.5 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[6.3vh]"
                      />
                      { searchTerm && (
                        <button
                          type="button"
                          onClick={ () => setSearchTerm( '' ) }
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      ) }
                    </div>
                  </form>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <label className="block text-white text-xs font-bold mb-2">
                      Filter by Status:
                    </label>
                    <select
                      className="appearance-none bg-gray-200 rounded-xl py-1.5 pl-4 pr-10 focus:outline-none focus:ring-none"
                      value={ filterStatus }
                      onChange={ ( e ) => setFilterStatus( e.target.value ) }
                    >
                      <option value="all">All Status</option>
                      { statuses.map( ( status ) => (
                        <option key={ status } value={ status.applicationStatus }>
                          { status.applicationStatus.charAt( 0 ).toUpperCase() + status.applicationStatus.slice( 1 ) }
                        </option>
                      ) ) }
                    </select>
                    <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={ 16 } className="text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Tabs */ }
        <div className=" rounded-xl shadow-sm">
          <div className="flex border-b rounded-t-xl">
            <button
              onClick={ () => setActiveTab( 'interviews' ) }
              className={ `px-6 py-4 font-medium text-sm focus:outline-none ${ activeTab === 'interviews'
                ? 'border-b-2 border-indigo-500 text-black text-xl'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2'
                }` }
            >
              Interviews
            </button>
          </div>
        </div>

        {/* Content */ }
        <div className=" rounded-t-xl shadow-sm p-6">
          { activeTab === 'interviews' && (
            <div className="overflow-x-auto rounded-t-xl">
              { filteredInterviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-2">
                    <AlertTriangle size={ 48 } className="mx-auto mb-2" />
                    <p>No interviews found matching your criteria.</p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className='bg-gray-700'>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Job & Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Interviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  { feedbackLoading || interviewLoading ? (
                    <tbody>
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading data...</td>
                      </tr>
                    </tbody>
                  ) : feedbackError ? (
                    <tbody>
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-red-500">Error loading feedbacks: { feedbackError.message }</td>
                      </tr>
                    </tbody>
                  ) : interviewError ? (
                    <tbody>
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-red-500">Error loading interviews: { interviewError.message }</td>
                      </tr>
                    </tbody>
                  ) : assignedInterviews?.interviews?.length > 0 ? (
                    assignedInterviews.interviews.map( ( feedback ) => (
                      <tbody key={ feedback._id }>
                        <tr className="group hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User size={ 20 } className="text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-white">
                                  { capitalizeFirstLetter( feedback?.applicationID?.candidateID?.userName ) || "N/A" }
                                </div>
                                <div className="text-sm text-gray-700 group-hover:text-white">
                                  { capitalizeFirstLetter( feedback.applicationID?.jobID?.title ) || "N/A" }
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  { feedback.skills?.map( ( skill, index ) => (
                                    <span key={ index } className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                      { skill }
                                    </span>
                                  ) ) || <span className="text-xs text-gray-500 group-hover:text-white">No skills listed</span> }
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 group-hover:text-white">{ capitalizeFirstLetter( feedback?.interviewerID?.userName ) || "N/A" }</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 group-hover:text-white">
                              { feedback.date ? formatDate( feedback.date ) : "No date" }
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-white">
                              { feedback.scheduledTime ? formatTime( feedback.scheduledTime ) : "N/A" }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={ feedback.status || "" }
                              onChange={ ( e ) => handleStatusChange( feedback._id, e.target.value ) }
                              className={ `px-2 py-1 text-xs font-semibold rounded-full border focus:outline-none ${ getStatusColor( feedback.status ) }` }
                            >
                              <option value="">Select status</option>
                              { statuses.map( ( status ) => (
                                <option key={ status } value={ status.applicationStatus }>
                                  { status.applicationStatus.charAt( 0 ).toUpperCase() + status.applicationStatus.slice( 1 ) }
                                </option>
                              ) ) }
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={ () => {
                                setDetailedInterview( feedback );
                                setIsDetailModalOpen( true );
                              } }
                              className="text-indigo-600 hover:text-indigo-900 group-hover:text-white mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={ () => {
                                setDetailedInterview( feedback );
                                handleFeedbackClick( feedback );
                              } }
                              className="text-indigo-600 group-hover:text-white hover:text-indigo-900"
                            >
                              Feedback
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    ) )
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No interviews found.
                        </td>
                      </tr>
                    </tbody>
                  ) }
                </table>

              ) }
            </div>
          ) }
        </div>

        {/* interview Detail Modal */ }
        { isDetailModalOpen && detailedInterview && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-white">Interview Details</h2>
                </div>
                <button
                  onClick={ () => setIsDetailModalOpen( false ) }
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={ 20 } />
                </button>
              </div>

              {/* Candidate */ }

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Candidate</h3>
                    <p className="text-lg font-semibold text-gray-800">{ capitalizeFirstLetter( detailedInterview.applicationID?.candidateID?.userName ) }</p>
                  </div>

                  {/* Position */ }

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Position</h3>
                    <p className="text-lg font-semibold text-gray-800">{ detailedInterview.applicationID?.jobID?.title }</p>
                  </div>

                  {/* Interviewer */ }

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Interviewer</h3>
                    <p className="text-lg font-semibold text-gray-800">{ capitalizeFirstLetter( detailedInterview?.interviewerID?.userName ) }</p>
                  </div>

                  {/* Status */ }

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                    <div className="mt-1">
                      <span className={ `px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${ getStatusColor( detailedInterview.status ) }` }>
                        { detailedInterview.status }
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */ }

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date & Time</h3>
                    <p className="text-lg font-semibold text-gray-800">{ formatDate( detailedInterview.date ) }</p>
                  </div>

                  {/* Duration */ }

                  <div className="bg-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Duration</h3>
                    <p className="text-lg font-semibold text-gray-800">{ detailedInterview.duration }</p>
                  </div>
                </div>

                {/* Skills Section */ }

                <div className="bg-gray-200 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    { detailedInterview.skills?.map( ( skill, index ) => (
                      <span key={ index } className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800">
                        { skill }
                      </span>
                    ) ) }
                  </div>
                </div>

                {/* Close Button */ }

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={ () => setIsDetailModalOpen( false ) } // Closes the modal
                    className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-300 text-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>

                  {/* View Resume Button */ }
                  <button
                    onClick={ () => {
                      setPdfPreviewUrl( detailedInterview?.applicationID?.resume );
                      setIsPdfModalOpen( true ); // Opens the PDF modal
                    } }
                    className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition-colors font-medium flex items-center gap-2"
                  >
                    View Resume
                  </button>
                </div>


              </div>
            </div>
          </div>
        ) }

        { isPdfModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-5 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resume Preview</h2>
                <button
                  onClick={ () => setIsPdfModalOpen( false ) }
                  className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <iframe
                src={ pdfPreviewUrl }
                className="w-full h-[600px] border"
                title="Resume PDF"
              ></iframe>
            </div>
          </div>
        ) }

        {/* Feedback Modal */ }
        { isFeedbackModalOpen && detailedInterview && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-white">Interview Feedback</h2>
                  <p className="text-sm text-white mt-1">Review and submit your evaluation</p>
                </div>
                <button
                  onClick={ () => setIsFeedbackModalOpen( false ) }
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={ 20 } />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">

                {/* Candidate Info */ }
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-medium">{ detailedInterview.candidateName }</h3>
                    <p className="text-sm text-gray-500">{ detailedInterview.jobTitle }</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Title</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-100"
                      value={ feedbackForm.feedbackTitle }
                      placeholder="e.g., Strong Technical Skills"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                    <div className="relative">
                      <textarea
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none bg-gray-300"
                        value={ capitalizeFirstLetter( feedbackForm.feedback ) }
                        readOnly
                        rows={ isFeedbackExpanded ? 6 : 2 }
                        style={ { overflow: 'hidden' } }
                      ></textarea>
                      { feedbackForm.feedback && feedbackForm.feedback.split( '\n' ).length > 2 && (
                        <button
                          type="button"
                          className="absolute right-3 bottom-2 text-indigo-600 text-xs font-medium bg-white px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          onClick={ () => setIsFeedbackExpanded( !isFeedbackExpanded ) }
                        >
                          { isFeedbackExpanded ? 'Show less' : 'Show more' }
                        </button>
                      ) }
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center space-x-1">
                      { getRatingStars( feedbackForm.starRating ) }
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                    { feedbackForm.attachment ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">{ feedbackForm.attachment }</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={ () => setFeedbackForm( { ...feedbackForm, attachment: null } ) }
                        >
                          <X size={ 16 } />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No attachment uploaded</div>
                    ) }
                  </div> */}

                  <div className="flex justify-end pt-4 space-x-3">
                    <button
                      type="button"
                      onClick={ () => setIsFeedbackModalOpen( false ) }
                      className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-200"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black"
                      onClick={ handleSaveStatus }
                    >
                      Save Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) }

      </div>
      {/* {totalPages > 1 && ( */ }
      <div className="flex justify-center mt-5 mb-5 space-x-4">
        <button
          onClick={ handlePreviousPage }
          disabled={ page === 1 }
          className={ `px-4 py-2 rounded-xl bg-gray-400 text-white ${ page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400" }` }
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page { page } of { totalPages }
        </span>
        <button
          onClick={ handleNextPage }
          // disabled={page >= totalPages}
          className={ `px-4 py-2 rounded-xl bg-gray-400 text-white ${ page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400" }` }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllInterviews;
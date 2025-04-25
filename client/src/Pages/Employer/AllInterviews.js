import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Briefcase, Clock, Filter, FileText, X, Check, AlertTriangle, ChevronDown, Download } from 'lucide-react';
import useFeedbacks from '../../hooks/useFeedbacks';
import useScheduledInterview from '../../hooks/useAssignedInterview';

const AllInterviews = () => {
  const [ activeTab, setActiveTab ] = useState( 'interviews' );
  const [ isDetailModalOpen, setIsDetailModalOpen ] = useState( false );
  const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterStatus, setFilterStatus ] = useState( 'all' );
  const [ detailedInterview, setDetailedInterview ] = useState( null );
  const [ pdfUrl, setPdfUrl ] = useState( null );
  const [ isPdfModalOpen, setIsPdfModalOpen ] = useState( false );
  const [ pdfPreviewUrl, setPdfPreviewUrl ] = useState( '' );
  const [ isFeedbackExpanded, setIsFeedbackExpanded ] = useState( false );
  const [ isStatus, setIsStatus ] = useState( false );

  const [ feedbackForm, setFeedbackForm ] = useState( {
    feedbackTitle: '',
    feedback: '',
    attachment: null,
    status: ''
  } );
  const [ page, setPage ] = useState( 1 );
  const limit = 9; // Adjust limit as needed

  // Fetch feedbacks
  const { feedbacks, total: totalFeedbacks, error: feedbackError, isLoading: feedbackLoading } = useFeedbacks( page, limit );
  console.log( "feedbacks", feedbacks )

  const [ localFeedbacks, setLocalFeedbacks ] = useState( [] );


  useEffect( () => {
    setLocalFeedbacks( feedbacks ); // when original props/data changes
  }, [ feedbacks ] );


  // Fetch scheduled interviews
  const { assignedInterviews, error: interviewError, isLoading: interviewLoading, refetchAssignedInterviews } = useScheduledInterview( page, limit );

  const totalPages = assignedInterviews.totalPages;

  const interviewList = assignedInterviews?.interviews || [];

  if ( feedbackLoading || interviewLoading ) return <p>Loading data...</p>;
  if ( feedbackError ) return <p>Error loading feedbacks: { feedbackError.message }</p>;
  if ( interviewError ) return <p>Error loading interviews: { interviewError.message }</p>;

  console.log( "assignedInterviews", assignedInterviews );

  const fetchFeedbackDetails = async ( interviewId ) => {
    try {
      if ( !interviewId ) {
        console.error( "Interview ID is required." );
        return;
      }

      console.log( "Fetching feedback for interviewId:", interviewId );

      // Simulate API call with our sample data
      const foundFeedback = feedbacks.find( f => f._id === interviewId );

      if ( !foundFeedback ) {
        throw new Error( "No feedback found" );
      }

      setFeedbackForm( {
        feedbackTitle: foundFeedback.feedbackTitle || "",
        feedback: foundFeedback.feedback || "",
        attachment: foundFeedback.attachment || null,
      } );

    } catch ( error ) {
      console.error( "Error fetching feedback:", error );
    }
  };

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
    console.log( "Saving candidate status:", feedbackForm.status );

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
      const feedbackData = feedbacks.find(
        ( f ) => f.interviewId._id === selectedInterview._id
      );

      if ( !feedbackData ) {
        throw new Error( "No feedback found for this interview" );
      }

      setFeedbackForm( {
        _id: feedbackData._id,
        feedbackTitle: feedbackData.feedbackTitle || "",
        feedback: feedbackData.feedback || "",
        rating: feedbackData.rating || 0, // if rating exists in your data
        attachment: feedbackData.attachment || null,
      } );
    } catch ( error ) {
      console.error( "Error fetching feedback:", error );

      // Reset form if no feedback exists
      setFeedbackForm( {
        feedbackTitle: "",
        feedback: "",
        rating: 0,
        attachment: null,
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


  const filteredInterviews = interviewList.filter( interview => {
    const matchesSearch =
      interview?.applicationID?.candidateID?.userName?.toLowerCase().includes( searchTerm.toLowerCase() ) ||
      interview?.jobTitle?.toLowerCase().includes( searchTerm.toLowerCase() ) ||
      interview?.interviewerName?.toLowerCase().includes( searchTerm.toLowerCase() );

    const matchesFilter = filterStatus === 'all' || interview.status === filterStatus;

    return matchesSearch && matchesFilter;
  } );


  const filteredFeedbacks = ( feedbacks || [] ).filter( feedback =>
    ( feedback?.candidateName || "" ).toLowerCase().includes( searchTerm.toLowerCase() ) ||
    ( feedback?.jobTitle || "" ).toLowerCase().includes( searchTerm.toLowerCase() ) ||
    ( feedback?.feedbackTitle || "" ).toLowerCase().includes( searchTerm.toLowerCase() )
  );

  const handleStatusChange = async ( feedbackId, newStatus ) => {
    try {
      const response = await fetch( `http://localhost:8080/applicationscheduledlist/update-interview/${ feedbackId }`, {
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
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Interview Management</h1>
        </div>

        {/* Search and Filter */ }
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={ 18 } className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, job title or interviewer..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={ searchTerm }
                onChange={ ( e ) => setSearchTerm( e.target.value ) }
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={ filterStatus }
                  onChange={ ( e ) => setFilterStatus( e.target.value ) }
                >
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Process">In Process</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={ 16 } className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */ }
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex border-b">
            <button
              onClick={ () => setActiveTab( 'interviews' ) }
              className={ `px-6 py-4 font-medium text-sm focus:outline-none ${ activeTab === 'interviews'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2'
                }` }
            >
              Interviews
            </button>
          </div>
        </div>

        {/* Content */ }
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          { activeTab === 'interviews' && (
            <div className="overflow-x-auto">
              { filteredInterviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-2">
                    <AlertTriangle size={ 48 } className="mx-auto mb-2" />
                    <p>No interviews found matching your criteria.</p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job & Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  { assignedInterviews?.interviews?.length > 0 ? (
                    assignedInterviews.interviews.map( ( feedback ) => (
                      <tr key={ feedback._id } className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User size={ 20 } className="text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                { capitalizeFirstLetter( feedback?.applicationID?.candidateID?.userName ) || "N/A" }
                              </div>
                              <div className="text-sm text-gray-500">{ capitalizeFirstLetter( feedback.applicationID?.jobID?.title ) || "N/A" }</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                { feedback.skills?.map( ( skill, index ) => (
                                  <span key={ index } className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"> { skill }
                                  </span>
                                ) ) || <span className="text-xs text-gray-500">No skills listed</span> }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ capitalizeFirstLetter( feedback?.interviewerID?.userName ) || "N/A" }</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { feedback.date ? formatDate( feedback.date ) : "No date" }
                          </div>
                          <div className="text-xs text-gray-500">
                            { feedback.scheduledTime ? formatTime( feedback.scheduledTime ) : "N/A" }
                          </div>
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ feedback.status || "" } // <- This is the key part!
                            onChange={ ( e ) => handleStatusChange( feedback._id, e.target.value ) }
                            className={ `px-2 py-1 text-xs font-semibold rounded-full border focus:outline-none ${ getStatusColor( feedback.status ) }` }
                          >
                            <option value="" >Select status</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hold">Hold</option>
                          </select>
                        </td>



                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={ () => {
                              setDetailedInterview( feedback );
                              setIsDetailModalOpen( true );
                            } }
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={ () => {
                              setDetailedInterview( feedback );
                              handleFeedbackClick( feedback );
                            } }
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Feedback
                          </button>
                        </td>
                      </tr>
                    ) )
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No interviews found.
                      </td>
                    </tr>
                  ) }

                </table>
              ) }
            </div>
          ) }
        </div>

        {/* interview Detail Modal */ }
        { isDetailModalOpen && detailedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">Interview Details</h2>
                <button
                  onClick={ () => setIsDetailModalOpen( false ) }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={ 20 } />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Candidate</h3>
                    <p className="text-lg font-medium">{ detailedInterview.applicationID?.candidateID?.userName }</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Position</h3>
                    <p className="text-lg font-medium">{ detailedInterview.applicationID?.jobID?.title }</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Interviewer</h3>
                    <p className="text-lg font-medium">{ detailedInterview?.interviewerID?.userName }</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <span className={ `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ getStatusColor( detailedInterview.status ) }` }>
                      { detailedInterview.status }
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                    <p className="text-lg font-medium">{ formatDate( detailedInterview.date ) }</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                    <p className="text-lg font-medium">{ detailedInterview.duration }</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    { detailedInterview.skills?.map( ( skill, index ) => (
                      <span key={ index } className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800">
                        { skill }
                      </span>
                    ) ) }
                  </div>
                </div>

                <div className="flex justify-end mt-8 gap-3">
                  {/* Close Button */ }
                  <button
                    onClick={ () => setIsDetailModalOpen( false ) } // Closes the modal
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  {/* View Resume Button */ }
                  <button
                    onClick={ () => {
                      setPdfPreviewUrl( detailedInterview?.applicationID?.resume );
                      setIsPdfModalOpen( true ); // Opens the PDF modal
                    } }
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">Interview Feedback</h2>
                <button
                  onClick={ () => setIsFeedbackModalOpen( false ) }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={ 20 } />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-medium">{ detailedInterview.candidateName }</h3>
                    <p className="text-sm text-gray-500">{ detailedInterview.jobTitle }</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Title</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg p-2 text-gray-700"
                      value={ feedbackForm.feedbackTitle }
                      placeholder="e.g., Strong Technical Skills"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Feedback</label>
                    <div className="relative">
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-gray-100"
                        value={ feedbackForm.feedback }
                        readOnly
                        rows={ isFeedbackExpanded ? 6 : 2 }
                        style={ { overflow: 'hidden' } }
                      ></textarea>
                      { feedbackForm.feedback && feedbackForm.feedback.split( '\n' ).length > 2 && (
                        <button
                          type="button"
                          className="text-indigo-600 text-sm mt-1"
                          onClick={ () => setIsFeedbackExpanded( !isFeedbackExpanded ) }
                        >
                          { isFeedbackExpanded ? 'View Less' : 'View More' }
                        </button>
                      ) }
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center space-x-1">
                      { Array( 5 ).fill( 0 ).map( ( _, i ) => (
                        <span
                          key={ i }
                          className={ `text-2xl ${ i < ( feedbackForm.rating || 0 ) ? 'text-yellow-500' : 'text-gray-300' }` }
                        >
                          ★
                        </span>
                      ) ) }
                    </div>
                  </div>

                  <div>
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
                  </div>

                  <div className="flex justify-end pt-4 space-x-3">
                    <button
                      type="button"
                      onClick={ () => setIsFeedbackModalOpen( false ) }
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
          className={ `px-4 py-2 rounded-md text-white ${ page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" }` }
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page { page } of { totalPages }
        </span>
        <button
          onClick={ handleNextPage }
          // disabled={page >= totalPages}
          className={ `px-4 py-2 rounded-md text-white ${ page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" }` }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllInterviews;
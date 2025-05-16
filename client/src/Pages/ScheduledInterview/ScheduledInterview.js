import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useScheduledInterview from '../../hooks/useScheduledInterview';
import { Briefcase } from 'lucide-react';

export const ScheduledInterview = () => {
    const [ page, setPage ] = useState( 1 );
    const limit = 10; // Number of interviews per page
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const storedUser = localStorage.getItem( "user" );
    const interviewer = storedUser ? JSON.parse( storedUser ) : null;
    const interviewerEmail = interviewer?.email || "";
    const [ statuses, setStatuses ] = useState( [] );
    const [ file, setFile ] = useState( null );
    const [ preview, setPreview ] = useState( null );

    // ✅ Correctly using the custom hook inside the component
    const {
        ScheduledInterviews,
        error,
        isLoading,
        refetchScheduledInterviews
    } = useScheduledInterview( page, limit, interviewerEmail, companyId );
    console.log( "ScheduledInterviews", ScheduledInterviews )
    const [ editingId, setEditingId ] = useState( null );
    const [ interviewers, setInterviewers ] = useState( [] );
    const [ detailedInterview, setDetailedInterview ] = useState( null );
    // const[selectedInterview,setSelectedInterview] =useState({});

    const [ editForm, setEditForm ] = useState( {
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewerID: "",
        reasonRescheduled: "",
        company_id: "",
        starRating: "",
        attachment: ""
    } );

    const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
    const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
    const [ feedbackForm, setFeedbackForm ] = useState( {
        feedbackTitle: "",
        feedback: "",
        attachment: "",
        starRating: "",
    } );

    const modalRef = useRef();
    const statusOptions = [ "scheduled", "completed", "cancelled", "rescheduled" ];
    const interviewTypes = [ "online", "walkin" ];
    const feedbackTitles = [
        "Poor",
        "Below Average",
        "Average",
        "Above Average",
        "Good",
        "Very Good",
        "Excellent",
        "Above Expectation"
    ];

    // Fetch statuses from the API
    useEffect( () => {
        fetch( `${ process.env.REACT_APP_BASE_URL }/application-types/all-application-types` )
            .then( response => response.json() )
            .then( data => setStatuses( data.applicationTypes ) )
            .catch( error => console.error( "Error fetching statuses:", error ) );
    }, [] );

    // Handle click outside modal to close it
    useEffect( () => {
        const handleClickOutside = ( event ) => {
            if ( modalRef.current && !modalRef.current.contains( event.target ) ) {
                setIsEditModalOpen( false );
                setIsFeedbackModalOpen( false );
            }
        };

        document.addEventListener( "mousedown", handleClickOutside );
        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [] );

    // Fetch interviewers
    useEffect( () => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/users/interviewers`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "company_id": companyId // Adding company_id to the request headers
                    }
                } );
                if ( !response.ok ) {
                    throw new Error( `HTTP error! Status: ${ response.status }` );
                }
                const data = await response.json();
                setInterviewers( data );
            } catch ( error ) {
                console.error( 'Error fetching interviewers:', error.message );
            }
        };

        fetchInterviewers();
    }, [ companyId ] );

    const handleEdit = ( interview ) => {
        setDetailedInterview( interview );
        setEditForm( {
            date: interview.date || "",
            time: interview.scheduledTime || "",
            interviewType: interview.interviewerType || "",
            meetingLink: interview.meetingLink || "",
            status: interview.status || "scheduled",
            interviewerID: interview.interviewerID || "",
            reasonRescheduled: interview.reasonRescheduled || "",
        } );
        setIsEditModalOpen( true );
    };

    // Validate form before update
    const validateForm = () => {
        if ( !editForm.date ) {
            toast.error( 'Please select interview date' );
            return false;
        }
        if ( !editForm.time ) {
            toast.error( 'Please select interview time' );
            return false;
        }
        if ( !editForm.interviewType ) {
            toast.error( 'Please select interview type' );
            return false;
        }
        if ( editForm.interviewType === 'online' && !editForm.meetingLink ) {
            toast.error( 'Please provide meeting link for online interview' );
            return false;
        }
        if ( editForm.status === 'rescheduled' && !editForm.reasonRescheduled ) {
            toast.error( 'Please provide a reason for rescheduling interview' );
            return false;
        }
        return true;
    };

    // Handle updating interview details
    const handleUpdate = async () => {
        if ( !detailedInterview?._id ) {
            toast.error( "Interview details not found" );
            return;
        }
        console.log( "detailedInterview", detailedInterview )


        if ( !validateForm() ) {
            return; // Stop if validation fails
        }

        const loadingToast = toast.loading( "Updating interview details..." );

        try {
            const response = await fetch(
                `${ process.env.REACT_APP_BASE_URL }/applicationscheduledlist/update-interview/${ detailedInterview._id }`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "company_id": companyId,  // Add company_id here
                    },
                    body: JSON.stringify( {
                        date: editForm.date,
                        scheduledTime: editForm.time,
                        interviewerType: editForm.interviewType,
                        meetingLink: editForm.meetingLink,
                        status: editForm.status,
                        interviewerID: editForm.interviewerID,
                        reasonRescheduled: editForm.reasonRescheduled,
                        starRating: feedbackForm.starRating,
                        attachment: feedbackForm.attachment,
                    } ),
                }
            );

            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.message || "Failed to update interview" );
            }

            await refetchScheduledInterviews(); // Refresh list after update
            toast.dismiss( loadingToast );
            toast.success( "Interview updated successfully!" );
            setIsEditModalOpen( false );
        } catch ( error ) {
            console.error( "Error updating interview:", error );
            toast.dismiss( loadingToast );
            toast.error( error.message || "Error updating interview. Please try again." );
        }
    };

    const handleFeedbackClick = async ( selectedInterview ) => {
        setDetailedInterview( selectedInterview );
        console.log( "selectedInterview", selectedInterview )

        try {
            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/get-feedback/${ selectedInterview._id }` );
            if ( !response.ok ) {
                throw new Error( "Failed to fetch feedback" );
            }

            const feedbackData = await response.json();
            console.log( "Fetched Feedback Data:", feedbackData );

            setFeedbackForm( {
                _id: feedbackData?._id || selectedInterview?._id || "",
                feedbackTitle: feedbackData?.feedbackTitle || selectedInterview?.feedbackTitle || "",
                feedback: feedbackForm?.feedback || selectedInterview?.feedback || "",
                attachment: feedbackForm?.attachment || selectedInterview?.attachment || null,
                starRating: feedbackForm?.starRating || selectedInterview?.starRating || "",
            } );

        } catch ( error ) {
            console.error( "Error fetching feedback:", error );
            // toast.error( "Error fetching feedback details" );

            // If fetching feedback fails, set the initial data from the interview
            setFeedbackForm( {
                feedbackTitle: selectedInterview?.feedbackTitle || "",
                feedback: selectedInterview?.feedback || "",
                attachment: selectedInterview?.attachment || "",

            } );
        }

        setIsFeedbackModalOpen( true );
    };



    const getStatusColor = ( status ) => {
        const colors = {
            scheduled: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            rescheduled: "bg-yellow-100 text-yellow-800"
        };
        return colors[ status?.toLowerCase() ] || "bg-gray-100 text-gray-800";
    };

    const handleFeedbackSubmit = async () => {
        if ( !detailedInterview?._id ) {
            toast.error( "Interview details not found" );
            return;
        }

        const loadingToast = toast.loading( "Submitting feedback..." );

        try {
            const isUpdate = feedbackForm?._id;
            const url = isUpdate
                ? `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/update-feedback/${ feedbackForm._id }`
                : `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/create-feedback`;

            const formData = {
                feedbackTitle: feedbackForm.feedbackTitle,
                feedback: feedbackForm.feedback,
                starRating: feedbackForm.starRating,
                attachment: feedbackForm.attachment || null, // Include this safely
                interviewId: detailedInterview._id,
                applicationID: detailedInterview.applicationID._id,
            };

            const response = await fetch( url, {
                method: isUpdate ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_id": companyId,
                },
                body: JSON.stringify( formData ),
            } );

            const responseData = await response.json();
            console.log( "API Response:", responseData );

            if ( !response.ok ) {
                throw new Error( responseData.message || "Failed to submit feedback" );
            }

            await refetchScheduledInterviews();
            toast.dismiss( loadingToast );
            toast.success( `Feedback ${ isUpdate ? "updated" : "submitted" } successfully!` );
            setIsFeedbackModalOpen( false );
        } catch ( error ) {
            console.error( "Error submitting feedback:", error );
            toast.dismiss( loadingToast );
            toast.error( error.message || "Error submitting feedback. Please try again." );
        }
    };

    // Handle file selection
    const handleFileUpload = ( e ) => {
        const file = e.target.files[ 0 ];
        setFeedbackForm( ( prev ) => ( { ...prev, attachment: file } ) );
    };

    // Fetch feedback details (if needed)
    const fetchFeedbackDetails = async ( interviewId ) => {
        try {
            if ( !interviewId ) {
                toast.error( "Interview ID is required." );
                return;
            }

            console.log( "Fetching feedback for interviewId:", interviewId );

            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/get-feedback/${ interviewId }` );

            if ( !response.ok ) {
                const errorData = await response.json().catch( () => null );
                throw new Error( errorData?.message || "No feedback found" );
            }

            const data = await response.json();
            console.log( "Fetched feedback:", data );

            // Populate the feedback form if data exists
            setFeedbackForm( {
                feedbackTitle: data.feedbackTitle || "",
                feedback: data.feedback || "",
                attachment: data.attachment || "",
                starRating: data.starRating || "",

            } );

        } catch ( error ) {
            console.error( "Error fetching feedback:", error );
            // toast.error(error.message || "Failed to fetch feedback details.");
        }
    };

    // Format date for better display
    const formatDate = ( dateString ) => {
        if ( !dateString ) return "Not scheduled";
        try {
            const date = new Date( dateString );
            return date.toLocaleDateString( 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            } );
        } catch ( e ) {
            return dateString; // Fallback to the original string if parsing fails
        }
    };

    // Handle Pagination
    const handleNextPage = () => {
        if ( page < ( ScheduledInterviews?.totalPages || 1 ) ) {
            setPage( prevPage => prevPage + 1 );
        }
    };

    const handlePreviousPage = () => {
        if ( page > 1 ) {
            setPage( prevPage => prevPage - 1 );
        }
    };

    const capitalizeFirstLetter = ( string ) => {
        if ( !string ) return "N/A";
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    return (
        <div className="px-8 py-10 w-full min-h-screen"
            style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center">
                            <Briefcase className="mr-2 h-6 w-6 text-gray-100" />
                            Scheduled Interviews
                        </h1>
                    </div>
                </div>
            </div>

            { isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{ error.message || "Failed to load interviews" }</span>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-t-xl shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Feedback</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            { ScheduledInterviews?.interviews?.map( ( interview ) => (
                                <tr key={ interview._id } className="group hover:bg-gray-700 ">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-white">{ capitalizeFirstLetter( interview?.applicationID?.jobID?.title ) || "N/A" }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-white">{ capitalizeFirstLetter( interview?.applicationID?.candidateID?.userName ) || "N/A" }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-white">{ formatDate( interview.date ) }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-white">{ interview.scheduledTime }</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={ `px-2 py-1 rounded-full text-xs font-medium ${ getStatusColor( interview.status ) }` }>
                                            { interview.status?.charAt( 0 ).toUpperCase() + interview.status?.slice( 1 ) || "Scheduled" }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={ () => handleFeedbackClick( interview ) }
                                            className="text-blue-600 hover:text-blue-900 group-hover:text-white"
                                        >
                                            { interview.feedbackTitle || "Add Feedback" }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={ () => handleEdit( interview ) }
                                            className="text-blue-600 hover:text-blue-900 group-hover:text-white"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            ) }

            {/* Pagination */ }
            { ScheduledInterviews?.totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-4">
                    <button
                        onClick={ handlePreviousPage }
                        disabled={ page === 1 }
                        className={ `px-4 py-2 rounded-md text-white ${ page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" }` }
                    >
                        Previous
                    </button>
                    <span className="text-gray-700 font-medium">
                        Page { page } of { ScheduledInterviews?.totalPages }
                    </span>
                    <button
                        onClick={ handleNextPage }
                        disabled={ page >= ScheduledInterviews?.totalPages }
                        className={ `px-4 py-2 rounded-md text-white ${ page >= ScheduledInterviews?.totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" }` }
                    >
                        Next
                    </button>
                </div>
            ) }

            {/* Edit Modal */ }
            { isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
                    <div ref={ modalRef } className="bg-white rounded-xl max-w-4xl w-full max-h-[97vh] overflow-hidden shadow-2xl transform transition-all duration-300 border border-gray-200">
                        {/* Header */ }
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-xl">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h2 className="text-xl text-white font-bold">Edit Interview Details</h2>
                            </div>
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="text-white hover:bg-gray-600 rounded-full p-2 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
                            {/* Application Details Card */ }
                            <div className="bg-gray-300 p-5 rounded-xl mb-6 border border-gray-200 shadow-sm">
                                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Application Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Job Title</p>
                                        <p className="font-medium text-gray-800 mt-1">{ capitalizeFirstLetter( detailedInterview?.applicationID?.jobID?.title ) || "N/A" }</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Applicant</p>
                                        <p className="font-medium text-gray-800 mt-1">{ capitalizeFirstLetter( detailedInterview?.applicationID?.candidateID?.userName ) || "N/A" }</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Email</p>
                                        <p className="font-medium text-gray-800 mt-1">{ detailedInterview?.applicationID?.candidateID?.email || "N/A" }</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Current Status</p>
                                        <p className={ `font-medium ${ getStatusColor( detailedInterview?.status ) } inline-block px-2 py-1 rounded-full text-xs mt-1` }>
                                            { capitalizeFirstLetter( detailedInterview?.status ) || "Scheduled" }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Form */ }
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={ editForm.date }
                                                onChange={ ( e ) => setEditForm( { ...editForm, date: e.target.value } ) }
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min={ new Date().toISOString().split( 'T' )[ 0 ] }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="time"
                                                value={ editForm.time }
                                                onChange={ ( e ) => setEditForm( { ...editForm, time: e.target.value } ) }
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                                    <div className="relative">
                                        <select
                                            value={ editForm.interviewType }
                                            onChange={ ( e ) => setEditForm( { ...editForm, interviewType: e.target.value } ) }
                                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="">Select Interview Type</option>
                                            { interviewTypes.map( type => (
                                                <option key={ type } value={ type }>
                                                    { type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }
                                                </option>
                                            ) ) }
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                { editForm.interviewType === 'online' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            <input
                                                type="url"
                                                value={ editForm.meetingLink }
                                                onChange={ ( e ) => setEditForm( { ...editForm, meetingLink: e.target.value } ) }
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                ) }

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <div className="relative">
                                        <select
                                            value={ editForm.status }
                                            onChange={ ( e ) => setEditForm( { ...editForm, status: e.target.value } ) }
                                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            { statuses.map( status => (
                                                <option key={ status.applicationStatus } value={ status.applicationStatus }>
                                                    { status.applicationStatus.charAt( 0 ).toUpperCase() + status.applicationStatus.slice( 1 ) }
                                                </option>
                                            ) ) }
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                { editForm.status === 'rescheduled' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Why Interview Rescheduled?</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={ editForm.reasonRescheduled }
                                                onChange={ ( e ) => setEditForm( { ...editForm, reasonRescheduled: e.target.value } ) }
                                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Why Interview Rescheduled?"
                                            />
                                        </div>
                                    </div>
                                ) }
                            </div>
                        </div>

                        {/* Footer with Actions */ }
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="px-4 py-2 bg-gray-400 border border-gray-300 rounded-xl text-black font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={ handleUpdate }
                                className="px-5 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-400 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) }

            {/* Feedback Modal */ }
            { isFeedbackModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[97vh] overflow-hidden shadow-2xl transform transition-all duration-300 border border-gray-200">
                        {/* Header */ }
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-xl">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h2 className="text-xl text-white font-bold">Interview Feedback</h2>
                            </div>
                            <button
                                onClick={ () => setIsFeedbackModalOpen( false ) }
                                className="text-white hover:bg-gray-600 rounded-full p-2 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
                            {/* Candidate Details Card */ }
                            <div className="bg-gray-300 p-5 rounded-xl mb-6 border border-gray-200 shadow-sm">
                                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Candidate Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Job Title</p>
                                        <p className="font-medium text-gray-800 mt-1">{ capitalizeFirstLetter( detailedInterview?.applicationID?.jobID?.title ) || "N/A" }</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Applicant</p>
                                        <p className="font-medium text-gray-800 mt-1">{ capitalizeFirstLetter( detailedInterview?.applicationID?.candidateID?.userName ) || "N/A" }</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase font-medium">Interview Date</p>
                                        <p className="font-medium text-gray-800 mt-1">{ formatDate( detailedInterview?.date ) }</p>
                                    </div>

                                </div>
                            </div>

                            {/* Feedback Form */ }
                            <div className="space-y-6">
                                <div className='flex justify-between'>
                                    <div className='w-[48%]'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Rating</label>
                                        <div className="relative">
                                            <select
                                                value={ feedbackForm.feedbackTitle }
                                                onChange={ ( e ) => setFeedbackForm( { ...feedbackForm, feedbackTitle: e.target.value } ) }
                                                className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                            >
                                                <option value="">Select a rating</option>
                                                { feedbackTitles.map( title => (
                                                    <option key={ title } value={ title }>
                                                        { title }
                                                    </option>
                                                ) ) }
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='w-[48%]'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                                        <select
                                            value={ feedbackForm.starRating || "" }
                                            onChange={ ( e ) => setFeedbackForm( { ...feedbackForm, starRating: Number( e.target.value ) } ) }
                                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select rating (1 to 5)</option>
                                            { [ 1, 2, 3, 4, 5 ].map( ( star ) => (
                                                <option key={ star } value={ star }>
                                                    { `${ star } Star${ star > 1 ? "s" : "" }` }
                                                </option>
                                            ) ) }
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Feedback</label>
                                    <textarea
                                        value={ feedbackForm.feedback }
                                        onChange={ ( e ) => setFeedbackForm( { ...feedbackForm, feedback: e.target.value } ) }
                                        rows="5"
                                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Provide specific examples and constructive feedback about the candidate's performance..."
                                    />
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                                    <div className="mt-1 flex flex-col space-y-4">
                                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                            <div className="space-y-1 text-center">
                                                { !preview && (
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                ) }

                                                { preview && (
                                                    <div className="relative">
                                                        <img
                                                            src={ preview }
                                                            alt="Preview"
                                                            className="mx-auto h-32 w-auto object-contain rounded-md"
                                                        />
                                                        <button
                                                            onClick={ () => { setFile( null ); setPreview( null ); } }
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) }

                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                        <span>{ file ? "Replace file" : "Upload a file" }</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={ "" }
                                                            accept="image/*, application/pdf, .doc, .docx"
                                                        />
                                                    </label>
                                                    { !file && <p className="pl-1">or drag and drop</p> }
                                                </div>

                                                { file && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Selected: { file.name } ({ ( file.size / 1024 ).toFixed( 1 ) } KB)
                                                    </p>
                                                ) }
                                                { !file && <p className="text-xs text-gray-500">PDF, DOC, DOCX, Images up to 10MB</p> }
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        {/* Footer with Actions */ }
                        <div className="px-6 py-4 bg-gray-50 border-t rounded-xl border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={ () => setIsFeedbackModalOpen( false ) }
                                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={ handleFeedbackSubmit }
                                className="px-5 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-400 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                { feedbackForm._id ? "Update Feedback" : "Submit Feedback" }
                            </button>
                        </div>
                    </div>
                </div>
            ) }
            <ToastContainer position="top-right" autoClose={ 3000 } hideProgressBar={ false } newestOnTop closeOnClick rtl={ false } pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default ScheduledInterview;


import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { Brush } from 'lucide-react';
import useScheduledInterview from '../../hooks/useScheduledInterview';
import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { Brush } from 'lucide-react';
import useScheduledInterview from '../../hooks/useScheduledInterview';

export const ScheduledInterview = () => {
    const [ page, setPage ] = useState( 1 );
    const limit = 10; // Number of interviews per page
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    console.log( "companyId>>>>>>", companyId )
    // Retrieve interviewer's email from localStorage
    const storedUser = localStorage.getItem( "user" );
    const interviewer = storedUser ? JSON.parse( storedUser ) : null;
    const interviewerEmail = interviewer?.email || "";
    console.log( "Logged-in Interviewer's Email:", interviewerEmail );

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

    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    const [ editForm, setEditForm ] = useState( {
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewerID: "",
        reasonRescheduled: "",
        company_id: ""
    } );

    const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
    const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
    const [ feedbackForm, setFeedbackForm ] = useState( {
        feedbackTitle: "",
        feedback: "",
        attachment: null
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
                const response = await fetch( "http://localhost:8080/users/interviewers", {
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
            // feedbackTitle: interview.feedbackTitle || "",
            // feedback: interview.feedback || "",
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
                `http://localhost:8080/applicationscheduledlist/update-interview/${ detailedInterview._id }`,
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
            const response = await fetch( `http://localhost:8080/interviewerfeedback/get-feedback/${ selectedInterview._id }` );
            if ( !response.ok ) {
                throw new Error( "Failed to fetch feedback" );
            }

            const feedbackData = await response.json();
            console.log( "Fetched Feedback Data:", feedbackData );

            setFeedbackForm( {
                _id: feedbackData?._id || selectedInterview?._id || "",
                feedbackTitle: feedbackData?.feedbackTitle || selectedInterview?.feedbackTitle || "",
                feedback: feedbackData?.feedback || selectedInterview?.feedback || "",
                attachment: feedbackData?.attachment || selectedInterview?.attachment || null
            } );

        } catch ( error ) {
            console.error( "Error fetching feedback:", error );
            toast.error( "Error fetching feedback details" );

            // If fetching feedback fails, set the initial data from the interview
            setFeedbackForm( {
                feedbackTitle: selectedInterview?.feedbackTitle || "",
                feedback: selectedInterview?.feedback || "",
                attachment: selectedInterview?.attachment || null
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
                ? `http://localhost:8080/interviewerfeedback/update-feedback/${ feedbackForm._id }`
                : `http://localhost:8080/interviewerfeedback/create-feedback`;

            // const formData = new FormData();
            // formData.append("feedbackTitle", feedbackForm.feedbackTitle);
            // formData.append("feedback", feedbackForm.feedback);
            // formData.append("interviewId", detailedInterview._id);

            // if (detailedInterview?.applicationID?._id) {
            //     formData.append("applicationId", detailedInterview.applicationID._id);
            // }

            // if (feedbackForm.attachment) {
            //     formData.append("attachment", feedbackForm.attachment);
            // }

            const response = await fetch( url, {
                method: isUpdate ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_id": companyId,
                },
                body: JSON.stringify( {
                    feedbackTitle: feedbackForm.feedbackTitle,
                    feedback: feedbackForm.feedback,
                    interviewId: detailedInterview._id,
                    applicationID: detailedInterview.applicationID._id,

                } ),
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

            const response = await fetch( `http://localhost:8080/interviewerfeedback/get-feedback/${ interviewId }` );

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
                attachment: data.attachment || null,
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

    return (
        <div className="max-w-screen-xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Scheduled Interviews</h1>

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
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            { ScheduledInterviews?.interviews?.map( ( interview ) => (
                                <tr key={ interview._id } className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ interview?.applicationID?.jobID?.title || "N/A" }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ interview?.applicationID?.candidateID?.userName || "N/A" }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ formatDate( interview.date ) }</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ interview.scheduledTime }</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={ `px-2 py-1 rounded-full text-xs font-medium ${ getStatusColor( interview.status ) }` }>
                                            { interview.status?.charAt( 0 ).toUpperCase() + interview.status?.slice( 1 ) || "Scheduled" }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={ () => handleFeedbackClick( interview ) }
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            { interview.feedbackTitle || "Add Feedback" }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={ () => handleEdit( interview ) }
                                            className="text-blue-600 hover:text-blue-900"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={ modalRef } className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Edit Interview Details</h2>
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Application Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Job Title:</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.jobID?.title || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Applicant:</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.candidateID?.userName || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email:</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.candidateID?.email || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Current Status:</p>
                                    <p className={ `font-medium ${ getStatusColor( detailedInterview?.status ) } inline-block px-2 py-1 rounded-full text-xs` }>
                                        { detailedInterview?.status || "Scheduled" }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        value={ editForm.date }
                                        onChange={ ( e ) => setEditForm( { ...editForm, date: e.target.value } ) }
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        min={ new Date().toISOString().split( 'T' )[ 0 ] }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time</label>
                                    <input
                                        type="time"
                                        value={ editForm.time }
                                        onChange={ ( e ) => setEditForm( { ...editForm, time: e.target.value } ) }
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Interview Type</label>
                                <select
                                    value={ editForm.interviewType }
                                    onChange={ ( e ) => setEditForm( { ...editForm, interviewType: e.target.value } ) }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Interview Type</option>
                                    { interviewTypes.map( type => (
                                        <option key={ type } value={ type }>
                                            { type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }
                                        </option>
                                    ) ) }
                                </select>
                            </div>

                            { editForm.interviewType === 'online' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={ editForm.meetingLink }
                                        onChange={ ( e ) => setEditForm( { ...editForm, meetingLink: e.target.value } ) }
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            ) }

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={ editForm.status }
                                    onChange={ ( e ) => setEditForm( { ...editForm, status: e.target.value } ) }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    { statusOptions.map( status => (
                                        <option key={ status } value={ status }>
                                            { status.charAt( 0 ).toUpperCase() + status.slice( 1 ) }
                                        </option>
                                    ) ) }
                                </select>
                            </div>

                            { editForm.status === 'rescheduled' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Why Interview Rescheduled?</label>
                                    <input
                                        type="url"
                                        value={ editForm.reasonRescheduled }
                                        onChange={ ( e ) => setEditForm( { ...editForm, reasonRescheduled: e.target.value } ) }
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Why Interview Rescheduled?"
                                    />
                                </div>
                            ) }
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={ handleUpdate }
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) }

            {/* Feedback Modal */ }
            { isFeedbackModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={ modalRef } className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Interview Feedback</h2>
                            <button
                                onClick={ () => setIsFeedbackModalOpen( false ) }
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Candidate Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Job Title:</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.jobID?.title || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Applicant:</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.candidateID?.userName || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Interview Date:</p>
                                    <p className="font-medium">{ formatDate( detailedInterview?.date ) }</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Feedback Title</label>
                                <select
                                    value={ feedbackForm.feedbackTitle }
                                    onChange={ ( e ) => setFeedbackForm( { ...feedbackForm, feedbackTitle: e.target.value } ) }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a rating</option>
                                    { feedbackTitles.map( title => (
                                        <option key={ title } value={ title }>
                                            { title }
                                        </option>
                                    ) ) }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Detailed Feedback</label>
                                <textarea
                                    value={ feedbackForm.feedback }
                                    onChange={ ( e ) => setFeedbackForm( { ...feedbackForm, feedback: e.target.value } ) }
                                    rows="4"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter detailed feedback..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attachment</label>
                                <input
                                    type="file"
                                    onChange={ handleFileUpload }
                                    className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={ () => setIsFeedbackModalOpen( false ) }
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={ handleFeedbackSubmit }
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
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


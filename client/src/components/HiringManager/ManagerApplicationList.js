import React, { useEffect, useState, useRef } from 'react';
import useDebounce from '../../hooks/useDebounce.js';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useManagerApplications from '../../hooks/useManagerApplications';
import { Briefcase, Search, User } from 'lucide-react';

const ApplicationList = () => {
    const navigate = useNavigate();
    const [ selectedJobField, setSelectedJobField ] = useState( "All" );
    const [ search, setSearch ] = useState( "" );
    const [ detailedApplication, setDetailedApplication ] = useState( null );
    const [ interviewers, setInterviewers ] = useState( [] );
    const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
    const [ editForm, setEditForm ] = useState( {
        applicationID: "",
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        interviewerId: "",
        company_id: "",
    } );

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const companyUserName = localStorage.getItem( "companyUserName" );

    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    const [ editingId, setEditingId ] = useState( null );
    const [ page, setPage ] = useState( 1 );
    const limit = 9; // Increased from 2 to 5 for better UX
    const modalRef = useRef();
    const interviewTypes = [ "online", "walkin" ];
    const storedUser = localStorage.getItem( "user" );
    const debouncedSearch = useDebounce( search, 1000 );

    const hiringManager = JSON.parse( storedUser ); // Parse the stored email
    const hiringManagerEmail = hiringManager.email;

    // Fetch applications with pagination and search
    const {
        data: applicationsData,
        isLoading,
        isError,
        refetch
    } = useManagerApplications( hiringManagerEmail, page, limit, debouncedSearch, companyId );

    const applications = applicationsData?.applications || [];
    const totalPages = applicationsData?.totalPages || 1;

    // Handle click outside modal to close it
    useEffect( () => {
        const handleClickOutside = ( event ) => {
            if ( modalRef.current && !modalRef.current.contains( event.target ) ) {
                setIsEditModalOpen( false );
            }
        };

        document.addEventListener( "mousedown", handleClickOutside );
        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [] );

    // Fetch interviewers
    useEffect( () => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch( `${ process.env.BASE_URL }/users/interviewers`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'company_id': companyId  // Add company_id to headers
                    }
                } );
                if ( !response.ok ) {
                    throw new Error( `HTTP error! Status: ${ response.status }` );
                }
                const data = await response.json();
                console.log( "Fetched interviewers>>>>:", data );
                setInterviewers( data );
            } catch ( error ) {
                console.error( "Error fetching interviewers:", error.message );
            }
        };

        fetchInterviewers();
    }, [] );

    // Create a unique list of job fields from applications
    const jobFields = [ "All", ...new Set( applications
        .map( app => app.jobDetails?.title || "Unknown" )
        .filter( title => title !== "Unknown" ) ) ];

    // Filter applications based on job field and search term
    const filteredApplications = applications.filter( app => {
        const jobTitleMatch = selectedJobField === "All" || app.jobDetails?.title === selectedJobField;
        const searchMatch = app.applicationStatus.toLowerCase().includes( debouncedSearch.toLowerCase() ) ||
            app.jobDetails?.title.toLowerCase().includes( debouncedSearch.toLowerCase() ) ||
            app.candidateDetails?.userName.toLowerCase().includes( debouncedSearch.toLowerCase() );

        return jobTitleMatch && searchMatch;
    } );


    // Validate form before submission
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
        if ( !editForm.interviewerId ) {
            toast.error( 'Please select an interviewer' );
            return false;
        }
        return true;
    };

    // Handle clicking on an application card
    const handleApplicationClick = ( application ) => {
        setDetailedApplication( application );
        setEditForm( {
            applicationID: application._id,
            date: application.interview?.date || "",
            time: application.interview?.time || "",
            interviewType: application.interview?.interviewType || "",
            meetingLink: application.interview?.meetingLink || "",
            interviewerId: application.interview?.interviewerId || "",
            company_id: application.company_id || "",
        } );
        setEditingId( application._id );
        setIsEditModalOpen( true );
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

    // Handle assigning interviewer and scheduling interview
    const assignInterviewer = async () => {
        if ( !editingId ) {
            toast.error( "No application selected" );
            return;
        }

        if ( !validateForm() ) {
            return; // Stop if validation fails
        }

        const loadingToast = toast.loading( 'Scheduling interview...' );

        const payload = {
            applicationID: editingId,
            interviewerID: editForm.interviewerId,
            date: editForm.date,
            scheduledTime: editForm.time,
            interviewerType: editForm.interviewType,
            meetingLink: editForm.interviewType === "online" ? editForm.meetingLink : "",
            status: "Scheduled",
            company_id: companyId,

        };

        try {
            const response = await fetch( `${ process.env.BASE_URL }/applicationscheduledlist/interviewer-app`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_id": companyId,
                },
                body: JSON.stringify( payload ),
            } );

            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.message || "Failed to assign interviewer" );
            }

            toast.dismiss( loadingToast );
            toast.success( 'Interview scheduled successfully! 🎉 Redirecting to Assigned interviews to ' );
            setTimeout( () => {
                navigate( `/${ companyUserName }/assigned-interviews` )
            }, 2000 )

            // Close modal and refetch applications
            setIsEditModalOpen( false );
            refetch();

        } catch ( error ) {
            console.error( "Error assigning interviewer:", error );
            toast.dismiss( loadingToast );
            toast.error( error.message || "Failed to schedule interview" );
        }
    };

    // Format date for display
    const formatDate = ( dateString ) => {
        if ( !dateString ) return "Not scheduled";
        const date = new Date( dateString );
        return date.toLocaleDateString();
    };

    // Get status color based on application status
    const getStatusColor = ( status ) => {
        switch ( status?.toLowerCase() ) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
                                Manage Applications
                            </h2>
                        </div>
                        {/* Search and Filter Controls */ }
                        <div className='flex items-center gap-4'>
                            <div className="w-[30vw]">
                                <label className="block text-white text-xs font-bold mb-2">
                                    Search by Status:
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter status (e.g., pending, approved)"
                                        value={ search }
                                        onChange={ ( e ) => setSearch( e.target.value ) }
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-none duration-200 h-[6.3vh]"
                                    />
                                </div>
                            </div>
                            <div className="md:w-1/3">
                                <label className="block text-white text-xs font-bold mb-2">
                                    Filter by Job:
                                </label>
                                <select
                                    className="appearance-none bg-gray-200 rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-none "
                                    value={ selectedJobField }
                                    onChange={ ( e ) => setSelectedJobField( e.target.value ) }
                                >
                                    { jobFields.map( ( field, index ) => (
                                        <option key={ index } value={ field }
                                        >{ field }</option>
                                    ) ) }
                                </select>
                            </div>
                        </div>
                    </div>

                </div>


                {/* Applications Grid */ }
                {
                    isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) :
                        isError ? (
                            <div className="fixed inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 z-50">
                                <div className="flex flex-col items-center justify-center p-8 bg-red-100 text-red-700 rounded-xl shadow-lg w-full max-w-4xl mx-auto text-center">
                                    <strong className="font-bold text-2xl mb-4">Error!</strong>
                                    <span className="block sm:inline text-lg">Failed to load applications. Please try again later.</span>
                                    <div className="mt-6">
                                        <button
                                            onClick={ () => {
                                                window.location.reload(); // Reloads the entire page
                                            } }
                                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none transition duration-300"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="bg-white p-8 shadow rounded-md text-center">
                                <p className="text-gray-500 text-lg">No applications found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                { filteredApplications.map( app => (
                                    <div
                                        key={ app._id }
                                        className="bg-white p-6 rounded-xl border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-50 group"
                                        onClick={ () => handleApplicationClick( app ) }
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                                                    { capitalizeFirstLetter( app.jobDetails?.title ) || "Untitled Position" }
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-3 flex items-center">
                                                    <User className="mr-2 text-gray-500 w-5 h-5" />
                                                    { capitalizeFirstLetter( app.candidateDetails?.userName || "N/A" ) }
                                                </p>
                                            </div>
                                            <span className={ `px-3 py-1 rounded-full text-xs font-semibold ${ getStatusColor( app.applicationStatus ) }` }>
                                                { capitalizeFirstLetter( app.applicationStatus ) || "Unknown" }
                                            </span>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-5 h-5 mr-2 text-gray-500 flex items-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                { app.candidateDetails?.email || "N/A" }
                                            </div>

                                            { app.interview && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-start">
                                                        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Interview Scheduled</p>
                                                            <p className="text-sm text-gray-600">
                                                                { formatDate( app.interview.date ) } • { app.interview.time }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) }
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button className="text-gray-700 group-hover:text-red-600 text-sm font-medium flex items-center">
                                                View Details
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        ) }

                {/* Pagination Controls */ }
                { !isLoading && !isError && totalPages > 1 && (
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            disabled={ page === 1 }
                            onClick={ () => setPage( prev => Math.max( prev - 1, 1 ) ) }
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="flex items-center text-lg font-semibold">
                            Page { page } of { totalPages }
                        </span>
                        <button
                            disabled={ page === totalPages }
                            onClick={ () => setPage( prev => Math.min( prev + 1, totalPages ) ) }
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Next
                        </button>
                    </div>
                ) }
            </div>

            {/* Interview Scheduling Modal */ }
            { isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 max-h-[100vh] z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-xl max-w-4xl w-full
                     overflow-hidden shadow-2xl transform transition-all duration-300">
                        {/* <div ref={ modalRef } className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl"> */ }
                        <div className="flex justify-between items-center p-5 border-b bg-gray-700 border border-white rounded-t-xl">
                            <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="text-white hover:text-black rounded-xl hover:bg-gray-300 focus:outline-none"
                                aria-label="Close"
                            >
                                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Application Details */ }
                        <div className="overflow-y-auto px-10 py-6 space-y-6" style={ { maxHeight: "calc(90vh - 120px)" } }>
                            <div className="bg-gray-200 p-4 rounded-xl mb-6">
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Application Details</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Job Title:</p>
                                        <p className="font-medium">{ capitalizeFirstLetter( detailedApplication?.jobDetails?.title ) || "N/A" }</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Applicant:</p>
                                        <p className="font-medium">{ capitalizeFirstLetter( detailedApplication?.candidateDetails?.userName ) || "N/A" }</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Email:</p>
                                        <p className="font-medium">{ detailedApplication?.candidateDetails?.email || "N/A" }</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status:</p>
                                        <p className="font-medium">{ capitalizeFirstLetter( detailedApplication?.applicationStatus ) || "N/A" }</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Company ID:</p>
                                        <p className="font-medium">{ detailedApplication?.company_id || "N/A" }</p>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Scheduling Form */ }
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                                        <input
                                            type="date"
                                            value={ editForm.date }
                                            onChange={ ( e ) => setEditForm( { ...editForm, date: e.target.value } ) }
                                            className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                            min={ new Date().toISOString().split( 'T' )[ 0 ] }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time</label>
                                        <input
                                            type="time"
                                            value={ editForm.time }
                                            onChange={ ( e ) => setEditForm( { ...editForm, time: e.target.value } ) }
                                            className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                                    <select
                                        value={ editForm.interviewType }
                                        onChange={ ( e ) => setEditForm( { ...editForm, interviewType: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                        <input
                                            type="url"
                                            value={ editForm.meetingLink }
                                            onChange={ ( e ) => setEditForm( { ...editForm, meetingLink: e.target.value } ) }
                                            className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://meet.google.com/..."
                                            required
                                        />
                                    </div>
                                ) }

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={ editForm.interviewerId }
                                        onChange={ ( e ) => setEditForm( { ...editForm, interviewerId: e.target.value } ) }
                                        required
                                    >
                                        <option value="">Select Interviewer</option>
                                        { interviewers.map( ( interviewer ) => (
                                            <option key={ interviewer._id } value={ interviewer._id }>
                                                { interviewer.userName }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={ () => setIsEditModalOpen( false ) }
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={ assignInterviewer }
                                    className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-300 hover:text-black transition"
                                >
                                    Schedule Interview
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            ) }
            <ToastContainer position="top-right" autoClose={ 3000 } hideProgressBar={ false } newestOnTop closeOnClick rtl={ false } pauseOnFocusLoss draggable pauseOnHover />

        </div>
    );
};

export default ApplicationList;
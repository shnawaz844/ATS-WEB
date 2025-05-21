import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAssignedInterview from "../../hooks/useAssignedInterview";
import { Briefcase, Search } from "lucide-react";

const AssignedInterviews = () => {
    const navigate = useNavigate();
    const [ page, setPage ] = useState( 1 );
    const itemsPerPage = 1; // Number of interviews per page
    const limit = 9; // Set the number of items per page
    const [ search, setSearch ] = useState( "" );
    // Fetch company_id from localStorage
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const {
        assignedInterviews,
        error,
        isLoading,
        refetchAssignedInterviews
    } = useAssignedInterview( page, limit, search );

    const [ filterStatus, setFilterStatus ] = useState( "all" );
    const [ interviewers, setInterviewers ] = useState( [] );
    const [ detailedInterview, setDetailedInterview ] = useState( null );
    const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
    const [ editForm, setEditForm ] = useState( {
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        status: "",
        interviewerID: "",
        company_id: "",
    } );
    console.log( "detailedInterview>>>>>>>", detailedInterview );

    // New state to store the fetched statuses
    const [ statuses, setStatuses ] = useState( [] );

    // Fetch statuses from API
    useEffect( () => {
        fetch( `${ process.env.REACT_APP_BASE_URL }/application-types/all-application-types` )
            .then( ( response ) => response.json() )
            .then( ( data ) => setStatuses( data.applicationTypes ) )
            .catch( ( error ) => console.error( "Error fetching statuses:", error ) );
    }, [] );

    // Filter interviews based on search and status filter
    const filteredInterviews = assignedInterviews?.interviews
    const totalPages = assignedInterviews?.totalPages;

    const modalRef = useRef();
    const interviewTypes = [ "online", "walkin" ];
    // const interviewStatuses = [ "scheduled", "completed", "cancelled", "rescheduled" ];

    const capitalizeFirstLetter = ( string ) => {
        if ( string ) {
            return string?.charAt( 0 ).toUpperCase() + string.slice( 1 );
        }
        return;
    };

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
        return true;
    };

    // Fetch interviewers
    useEffect( () => {
        const fetchInterviewers = async () => {
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/users/interviewers`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "company_id": companyId,
                    },
                } );
                if ( !response.ok ) {
                    throw new Error( `HTTP error! Status: ${ response.status }` );
                }
                const data = await response.json();
                setInterviewers( data );
            } catch ( error ) {
                console.error( "Error fetching interviewers:", error.message );
                // setInterviewers( data );
            }
        };

        fetchInterviewers();
    }, [ companyId ] );

    console.log( "interviewers", interviewers )

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

    // Handle updating interview details
    const handleUpdateInterview = async () => {
        if ( !detailedInterview?._id ) {
            toast.error( "Interview details not found" );
            return;
        }

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
                    },
                    body: JSON.stringify( {
                        date: editForm.date,
                        scheduledTime: editForm.time,
                        interviewerType: editForm.interviewType,
                        meetingLink: editForm.meetingLink,
                        status: editForm.status || detailedInterview.status,
                        interviewerID: editForm.interviewerID,
                    } ),
                }
            );

            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.message || "Failed to update interview" );
            }

            await refetchAssignedInterviews(); // Refresh list after update
            toast.dismiss( loadingToast );
            toast.success( "Interview updated successfully!" );
            setIsEditModalOpen( false );
        } catch ( error ) {
            console.error( "Error updating interview:", error );
            toast.dismiss( loadingToast );
            toast.error( error.message || "Error updating interview. Please try again." );
        }
    };

    // Handle clicking on an interview card
    const handleInterviewClick = ( interview ) => {
        console.log( "interviewww", interview )

        setDetailedInterview( interview );
        console.log( "interview", interview )
        setEditForm( {
            date: interview.date || "",
            time: interview.scheduledTime || "",
            interviewType: interview.interviewerType || "",
            meetingLink: interview.meetingLink || "",
            status: interview.status || "scheduled",
            interviewerID: interview.interviewerID || "",
        } );
        setIsEditModalOpen( true );
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

    // Get status color for visual indication
    const getStatusColor = ( status ) => {
        switch ( status?.toLowerCase() ) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'rescheduled':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Check if interview date is today
    const isToday = ( dateString ) => {
        const today = new Date();
        today.setHours( 0, 0, 0, 0 );

        const interviewDate = new Date( dateString );
        interviewDate.setHours( 0, 0, 0, 0 );

        return today.getTime() === interviewDate.getTime();
    };

    console.log( "interviewers", interviewers )
    console.log( "assignedInterviews:", assignedInterviews );
    console.log( "editform", editForm )

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
                                Assigned Interviews
                            </h2>
                        </div>
                        {/* Search and Filter */ }
                        <div className='flex items-center gap-4'>
                            <div className="w-[30vw]">
                                <label className="block text-white text-xs font-bold mb-2">
                                    Search:
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by job, candidate or interview type"
                                        value={ search }
                                        onChange={ ( e ) => setSearch( e.target.value ) }
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 shadow-sm rounded-xl focus:outline-none duration-200 h-[6.3vh]"
                                    />
                                </div>
                            </div>
                            <div className="md:w-1/3">
                                <label className="block text-white text-xs font-bold mb-2">
                                    Filter by Status:
                                </label>
                                <select
                                    value={ filterStatus }
                                    onChange={ ( e ) => setFilterStatus( e.target.value ) }
                                    className="appearance-none bg-gray-200 rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-none"
                                >
                                    <option value="all">All Statuses</option>
                                    { statuses.map( status => (
                                        <option key={ status } value={ status.applicationStatus }>
                                            { status.applicationStatus.charAt( 0 ).toUpperCase() + status.applicationStatus.slice( 1 ) }
                                        </option>
                                    ) ) }
                                </select>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Today's Interviews Section */ }
                { filteredInterviews?.some( interview => isToday( interview.date ) ) && (
                    <div className="mb-8 relative">
                        {/* Background decorative elements */ }
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 blur-xl"></div>

                        {/* Header section with title and controls */ }
                        <div className="relative z-10 flex flex-col sm:flex-row justify-start items-start sm:items-center mb-6 gap-4">
                            <div className="shadow-sm px-5 py-3 rounded-2xl">
                                <h2 className="text-2xl font-bold  bg-clip-text text-black">
                                    Today's Interviews
                                </h2>
                                <p className="text-white text-sm">
                                    { new Date().toLocaleDateString( 'en-US', { weekday: 'long', month: 'long', day: 'numeric' } ) }
                                </p>
                            </div>
                        </div>

                        {/* Cards container */ }
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            { filteredInterviews
                                .filter( interview => isToday( interview.date ) )
                                .map( ( interview ) => {
                                    // Determine status colors
                                    const statusColors = {
                                        "Completed": "bg-emerald-500 text-emerald-800 bg-emerald-50",
                                        "Cancelled": "bg-red-500 text-red-800 bg-red-50",
                                        "In Progress": "bg-amber-500 text-amber-800 bg-amber-50",
                                        "Scheduled": "bg-blue-500 text-blue-800 bg-blue-50"
                                    };

                                    const status = interview.status || "Scheduled";
                                    const [ bgColor, textColor, bgLight ] = statusColors[ status ].split( " " );

                                    // Get candidate initial
                                    const initial = interview.applicationID?.candidateID?.userName?.[ 0 ] || "?";

                                    return (
                                        <div
                                            key={ interview._id }
                                            onClick={ () => handleInterviewClick( interview ) }
                                            className="group bg-[#b8e1e1] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
                                        >
                                            <div className="p-4">
                                                {/* Header with job title and status */ }
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                                        { capitalizeFirstLetter( interview?.applicationID?.jobID?.title ) || "N/A" }
                                                    </h3>
                                                    <span className={ `px-2.5 py-1 rounded-full text-xs font-medium ${ textColor } ${ bgLight }` }>
                                                        { capitalizeFirstLetter( status ) }
                                                    </span>
                                                </div>

                                                {/* Main content */ }
                                                <div className="space-y-3">
                                                    {/* Candidate info */ }
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={ `w-8 h-8 rounded-full flex items-center justify-center ${ bgLight }` }>
                                                            <span className={ `${ textColor } text-sm font-medium` }>
                                                                { capitalizeFirstLetter( initial ) }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                { capitalizeFirstLetter( interview.applicationID?.candidateID?.userName ) || "N/A" }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                { interview.interviewerType || "N/A" } Interview
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Time info */ }
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        <span className="text-gray-700">Today at { interview.scheduledTime }</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */ }
                                            <div className="flex justify-end items-center px-4 py-3 bg-gray-300 mt-2">
                                                <button className="text-sm text-black font-medium flex items-center gap-1">
                                                    Details
                                                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                </button>
                                                {/* 
                                                <div className="flex gap-1.5">
                                                    <button className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                                        </svg>
                                                    </button>
                                                </div> */}
                                            </div>

                                            {/* Status indicator line */ }
                                            <div className={ "h-1 w-full bg-white" }></div>
                                        </div>
                                    );
                                } ) }
                        </div>

                        {/* Empty state */ }
                        { filteredInterviews.filter( interview => isToday( interview.date ) ).length === 0 && (
                            <div className="bg-white rounded-2xl shadow p-8 text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Your schedule is clear today</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">No interviews are scheduled for today. Would you like to set up a new interview?</p>
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg transition-all duration-200 font-medium inline-flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Schedule New Interview
                                </button>
                            </div>
                        ) }
                    </div>
                ) }

                {/* All Other Interviews */ }
                <h2 className="text-xl font-semibold text-gray-800 mb-4">All Assigned Interviews</h2>
                { isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{ error.message || "Failed to load interviews" }</span>
                    </div>
                ) : filteredInterviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="bg-gray-100 p-5 rounded-full mb-4">
                            <Briefcase className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="text-center animate-fade-in transition-all duration-500">
                            <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight leading-snug">
                                No Interviews Found
                            </h3>
                            <p className="text-md text-gray-600 max-w-md mx-auto leading-relaxed">
                                We’re currently in the process of assigning interviewers.
                                <br className="hidden sm:block" />
                                <span className="text-blue-500 font-medium">Please wait</span> while your interview schedule is being prepared.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        { filteredInterviews
                            .filter( interview => !isToday( interview.date ) )
                            .map( ( interview ) => (
                                <div
                                    key={ interview._id }
                                    className="bg-white p-6 rounded-xl border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-50 group"
                                    onClick={ () => handleInterviewClick( interview ) }
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1a237e] transition-colors">
                                                { capitalizeFirstLetter( interview?.applicationID?.jobID?.title ) || "N/A" }
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                { capitalizeFirstLetter( interview.applicationID?.candidateID?.userName ) || "N/A" }
                                            </p>
                                        </div>
                                        <span className={ `px-3 py-1 rounded-full text-xs font-semibold ${ getStatusColor( interview.status ) }` }>
                                            { interview.status || "Scheduled" }
                                        </span>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            { capitalizeFirstLetter( interview.interviewerType ) || "N/A" }
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            { formatDate( interview.date ) }
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            { interview.scheduledTime }
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button className="text-[#1a237e] group-hover:text-red-600 text-sm font-medium flex items-center">
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
            </div>

            {/* Interview Details Modal */ }
            { isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                    {/* <div
                        ref={ modalRef }
                        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
                    > */}
                    <div
                        ref={ modalRef }
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300"
                    >
                        {/* Modal Header */ }
                        <div className="sticky top-0 bg-gray-700 z-10 border rounded-t-xl border-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Update Interview Details</h2>
                            <button
                                onClick={ () => setIsEditModalOpen( false ) }
                                className="text-white hover:text-black focus:outline-none p-1 rounded-full hover:bg-gray-300"
                                aria-label="Close"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Interview Details - Visual Enhancement Only */ }
                        <div className="bg-gray-300 p-5 rounded-xl m-6 mt-4 mb-6 border border-gray-200">
                            <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Application Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Keep all existing logic, just enhance visuals */ }
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500">JOB TITLE</p>
                                    <p className="font-medium">{ capitalizeFirstLetter( detailedInterview?.applicationID?.jobID?.title ) || "N/A" }</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500">APPLICANT</p>
                                    <p className="font-medium">{ capitalizeFirstLetter( detailedInterview?.applicationID?.candidateID?.userName ) || "N/A" }</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500">Candidtae Id</p>
                                    <p className="font-medium">{ detailedInterview?.applicationID?.candidateID?._id || "N/A" }</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500">STATUS</p>
                                    <span className={ `font-medium ${ getStatusColor( detailedInterview?.status ) } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs` }>
                                        { capitalizeFirstLetter( detailedInterview?.status ) || "Scheduled" }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Update Form - Visual Enhancement Only */ }
                        <div className="px-6 pb-6 space-y-5">
                            {/* Date/Time Picker - No Logic Changes */ }
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Date</label>
                                    <input
                                        type="date"
                                        value={ editForm.date }
                                        onChange={ ( e ) => setEditForm( { ...editForm, date: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min={ new Date().toISOString().split( 'T' )[ 0 ] }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Time</label>
                                    <input
                                        type="time"
                                        value={ editForm.time }
                                        onChange={ ( e ) => setEditForm( { ...editForm, time: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* All other form fields - No Logic Changes */ }
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Type</label>
                                <select
                                    value={ editForm.interviewType }
                                    onChange={ ( e ) => setEditForm( { ...editForm, interviewType: e.target.value } ) }
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Interview Type</option>
                                    { interviewTypes.map( ( type ) => (
                                        <option key={ type } value={ type }>{ type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }</option>
                                    ) ) }
                                </select>
                            </div>

                            { editForm.interviewType === 'online' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={ editForm.meetingLink }
                                        onChange={ ( e ) => setEditForm( { ...editForm, meetingLink: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            ) }

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Update Status</label>
                                <select
                                    value={ editForm.status }
                                    onChange={ ( e ) => setEditForm( { ...editForm, status: e.target.value } ) }
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    { statuses.map( ( status ) => (
                                        <option key={ status.applicationStatus } value={ status.applicationStatus }>{ status.applicationStatus.charAt( 0 ).toUpperCase() + status.applicationStatus.slice( 1 ) }</option>
                                    ) ) }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    { editForm.interviewerID
                                        ? `Assigned Interviewer: ${ interviewers.find( i => i._id === editForm.interviewerID._id )?.userName || "Not Found" }`
                                        : "Assign Interviewer" }
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={ editForm.interviewerID._id || "" }
                                    onChange={ ( e ) => setEditForm( { ...editForm, interviewerID: e.target.value } ) }
                                    required
                                >
                                    <option value="">Select Interviewer</option>
                                    { interviewers.map( ( interviewer ) => (
                                        <option key={ interviewer._id } value={ interviewer._id }>{ interviewer.userName }</option>
                                    ) ) }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Add any additional notes about this interview..."
                                ></textarea>
                            </div>

                            {/* Buttons - No Logic Changes */ }
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={ () => setIsEditModalOpen( false ) }
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={ handleUpdateInterview }
                                    className="px-4 py-2.5 bg-gray-700 rounded-xl text-white hover:text-black font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Update Interview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }
            {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> */ }
            {/* {totalPages > 1 && ( */ }
            { filteredInterviews && filteredInterviews.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={ handlePreviousPage }
                            disabled={ page === 1 }
                            className={ `px-4 py-2 rounded-xl text-white ${ page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400 hover:text-black" }` }
                        >
                            Previous
                        </button>
                        <div className="hidden sm:flex items-center space-x-1">
                            { [ ...Array( totalPages ) ].map( ( _, i ) => (
                                <button
                                    key={ i }
                                    onClick={ () => setPage( i + 1 ) }
                                    className={ `px-3.5 py-2 text-sm rounded-md ${ page === i + 1
                                        ? 'bg-gray-700 text-white cursor-not-allowed rounded-xl'
                                        : 'bg-gray-300 border border-gray-300 text-white hover:bg-gray-400 rounded-xl'
                                        }` }
                                >
                                    { i + 1 }
                                </button>
                            ) ) }
                        </div>

                        <span className="sm:hidden text-sm text-gray-600">
                            Page { page } of { totalPages }
                        </span>
                        <button
                            onClick={ handleNextPage }
                            disabled={ page >= totalPages }
                            className={ `px-4 py-2 rounded-xl text-white ${ page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-400 hover:text-black" }` }
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) }

        </div>
    );
};

export default AssignedInterviews;
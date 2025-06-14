import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Briefcase, Calendar, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import axios from 'axios';
import useScheduledInterview from '../hooks/useScheduledInterview';

const ScheduleInterviewModal = ( { isOpen, onClose, application } ) => {
    const navigate = useNavigate();
    const [ detailedApplication, setDetailedApplication ] = useState( null );
    const [ interviewers, setInterviewers ] = useState( [] );
    const [ interviewRounds, setInterviewRounds ] = useState( [] );
    const [ editForm, setEditForm ] = useState( {
        applicationID: "",
        date: "",
        time: "",
        interviewType: "",
        meetingLink: "",
        interviewerId: "",
        company_id: "",
        roundName: "",
        applicationStatusId: "",
        status: ""
    } );

    // Parameters for fetching assigned interviews
    const [ page ] = useState( 1 );
    const [ limit ] = useState( 10 );
    const [ search ] = useState( '' );
    const [ filterStatus ] = useState( 'all' );
    const [ candidateID ] = useState( application?.candidateDetails?.candidateID );
    const [ jobID ] = useState( application?.jobDetails?.id );
    const [ showAssignedInterviews, setShowAssignedInterviews ] = useState( false );

    // Use the custom hook to fetch assigned interviews
    const {
        assignedInterviews,
        error: assignedInterviewsError,
    } = useScheduledInterview( { page, limit, search, candidateID, jobID, filterStatus } );

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const companyUserName = localStorage.getItem( "companyUserName" );
    const [ companyDetails, setCompanyDetails ] = useState( null );

    const capitalizeFirstLetter = ( string ) => {
        return string?.charAt( 0 ).toUpperCase() + string?.slice( 1 );
    };

    const toggleAssignedInterviews = () => {
        setShowAssignedInterviews( !showAssignedInterviews );
    };

    const modalRef = useRef();
    const interviewTypes = [ "online", "walkin" ];
    const [ statusMap, setStatusMap ] = useState( {} );
    const [ roundsMap, setRoundsMap ] = useState( {} );

    // Log assigned interviews data when it changes
    useEffect( () => {
        if ( assignedInterviews && Object.keys( assignedInterviews ).length > 0 ) {
            console.log( "Assigned Interviews Data:", assignedInterviews );
        }
    }, [ assignedInterviews ] );

    // Handle assigned interviews error
    useEffect( () => {
        if ( assignedInterviewsError ) {
            console.error( "Error fetching assigned interviews:", assignedInterviewsError );
            toast.error( "Failed to fetch assigned interviews data" );
        }
    }, [ assignedInterviewsError ] );

    // Fetch company details based on companyUserName
    useEffect( () => {
        const stored = localStorage.getItem( "companyUserName" );
        const company = companyUserName || stored;
        if ( !company ) return;

        axios
            .get( `${ process.env.REACT_APP_BASE_URL }/companies/companies/${ company }` )
            .then( ( res ) => {
                setCompanyDetails( res.data );
                localStorage.setItem( "companyUserName", company );
            } )
            .catch( ( err ) => {
                console.error( "Error fetching company details:", err );
            } );
    }, [ companyUserName ] );


    // Set application data when modal opens
    useEffect( () => {
        if ( isOpen && application ) {
            setDetailedApplication( application );
            setEditForm( {
                applicationID: application._id,
                date: application.interview?.date || "",
                time: application.interview?.time || "",
                interviewType: application.interview?.interviewType || "",
                meetingLink: application.interview?.meetingLink || "",
                interviewerId: application.interview?.interviewerId || "",
                company_id: application.company_id || companyId,
                roundName: application.interview?.roundName || "",
                applicationStatusId: application.applicationStatusId || "",
                status: application.applicationStatusId || ""
            } );
        }
        console.log( "application>>>>", application )
    }, [ isOpen, application, companyId ] );

    // Fetch all application statuses once
    useEffect( () => {
        if ( isOpen ) {
            axios.get(
                `${ process.env.REACT_APP_BASE_URL }/application-statuses/all-application-statuses`,
                { headers: { company_id: companyId } }
            )
                .then( res => {
                    const map = {};
                    res.data.applicationStatuses.forEach( s => {
                        map[ s._id ] = s.applicationStatus;
                    } );
                    setStatusMap( map );
                } )
                .catch( err => console.error( "Failed to load statuses", err ) );
        }
    }, [ companyId, isOpen ] );

    // Handle click outside modal to close it
    useEffect( () => {
        const handleClickOutside = ( event ) => {
            if ( modalRef.current && !modalRef.current.contains( event.target ) ) {
                onClose();
            }
        };

        if ( isOpen ) {
            document.addEventListener( "mousedown", handleClickOutside );
        }

        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [ isOpen, onClose ] );

    // Fetch interviewers
    useEffect( () => {
        if ( isOpen ) {
            const fetchInterviewers = async () => {
                try {
                    const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/users/interviewers`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'company_id': companyId
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
        }
    }, [ isOpen, companyId ] );

    // Fetch Interview Rounds
    useEffect( () => {
        if ( isOpen ) {
            const fetchInterviewRounds = async () => {
                try {
                    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
                    const res = await axios.get(
                        `${ process.env.REACT_APP_BASE_URL }/interviews/all-interviews?page=1&limit=100&search=`,
                        {
                            headers: { company_id: companyId },
                        }
                    );
                    const rounds = res.data.interviews;
                    const map = {};
                    rounds.forEach( round => {
                        map[ round._id ] = round.roundName;
                    } );
                    setRoundsMap( map );
                    setInterviewRounds( rounds );
                } catch ( error ) {
                    console.error( "Failed to fetch interview rounds", error );
                }
            };

            fetchInterviewRounds();
        }
    }, [ isOpen ] );


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

    const updateApplicationStatus = async ( applicationID, applicationStatusId, companyId ) => {
        try {
            if ( !applicationID ) {
                throw new Error( "Application ID is required" );
            }
            if ( !applicationStatusId ) {
                throw new Error( "Application Status ID is required" );
            }

            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/application/update-candidate-application/${ applicationID }`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...( companyId && { 'company_id': companyId } ),
                },
                body: JSON.stringify( {
                    applicationStatusId: applicationStatusId
                } )
            } );

            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.message || `HTTP error! status: ${ response.status }` );
            }

            const data = await response.json();
            console.log( 'Application status updated successfully:', data );
            return data;

        } catch ( error ) {
            console.error( 'Error updating application status:', error );
            throw error;
        }
    };

    // Handle assigning interviewer and scheduling interview
    const assignInterviewer = async () => {
        if ( !editForm.applicationID ) {
            toast.error( "No application selected" );
            return;
        }

        if ( !validateForm() ) {
            return;
        }

        const loadingToast = toast.loading( 'Scheduling interview...' );

        const payload = {
            applicationID: editForm.applicationID,
            interviewerID: editForm.interviewerId,
            date: editForm.date,
            scheduledTime: editForm.time,
            interviewerType: editForm.interviewType,
            meetingLink: editForm.interviewType === "online" ? editForm.meetingLink : "",
            roundID: editForm.roundName,
            status: editForm.status,
            company_id: companyId,
        };

        try {
            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/applicationscheduledlist/interviewer-app`, {
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

            console.log( "response123", response );
            await updateApplicationStatus( editForm.applicationID, editForm.status );
            toast.dismiss( loadingToast );
            toast.success( 'Interview scheduled successfully! 🎉 Redirecting to Assigned interviews' );

            setTimeout( () => {
                navigate( `/${ companyUserName }/assigned-interviews` );
            }, 2000 );

            onClose();

        } catch ( error ) {
            console.error( "Error assigning interviewer:", error );
            toast.dismiss( loadingToast );
            toast.error( error.message || "Failed to schedule interview" );
        }
    };

    // Don't render if modal is not open
    if ( !isOpen || !detailedApplication ) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 max-h-[100vh] z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl transform transition-all duration-300">
                <div ref={ modalRef }>
                    <div className="flex justify-between items-center p-5 border-b bg-gray-700 border border-white rounded-t-xl">
                        <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
                        <button
                            onClick={ onClose }
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
                                    <p className="text-gray-600">Application Status:</p>
                                    <p className="font-medium">{ capitalizeFirstLetter( statusMap[ detailedApplication?.applicationStatusId ] ) || "N/A" }</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Company Name:</p>
                                    <p className="font-medium">
                                        { companyDetails?.companyName ||
                                            companyDetails?.name ||
                                            detailedApplication?.company_id ||
                                            "N/A" }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Button for All Scheduled Interviews */ }
                        <div className="p-4">
                            <button
                                onClick={ toggleAssignedInterviews }
                                className="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200  rounded-xl transition-colors duration-200 border border-gray-300"
                            >
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        All Assigned Interviews
                                        { assignedInterviews?.interviews?.length > 0 && (
                                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                { assignedInterviews?.interviews?.length }
                                            </span>
                                        ) }
                                    </h2>
                                </div>
                                { showAssignedInterviews ? (
                                    <ChevronUp className="h-5 w-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-600" />
                                ) }
                            </button>

                            {/* Assigned Interviews Section - Only shown when toggle is active */ }
                            { showAssignedInterviews && (
                                <div className="mt-4 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
                                    <table className="w-full rounded-xl">
                                        <thead className="bg-gray-700 text-white border border-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Application Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Date of interview</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Scheduled Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Interview Round</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Interviewer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            { assignedInterviews?.interviews?.map( ( interview ) => (
                                                <tr
                                                    key={ interview._id }
                                                    className="group hover:bg-gray-700 transition-colors duration-200"
                                                >
                                                    {/* Status */ }
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                                                            { ( statusMap[ interview?.title || interview?.status || "Interview" ] ) || "N/A" }
                                                        </span>
                                                    </td>
                                                    {/* Date */ }
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            { interview.date ? ( () => {
                                                                const date = new Date( interview.date );
                                                                const day = date.getDate().toString().padStart( 2, '0' );
                                                                const month = ( date.getMonth() + 1 ).toString().padStart( 2, '0' );
                                                                const year = date.getFullYear();
                                                                return `${ day }/${ month }/${ year }`;
                                                            } )() : "TBD" }
                                                        </span>
                                                    </td>
                                                    {/* Time */ }
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            { interview?.scheduledTime || "N/A" }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            { roundsMap[ interview?.roundID ] || "N/A" }

                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600 group-hover:text-white">
                                                            { capitalizeFirstLetter( interview?.interviewerID?.userName ) || "N/A" }

                                                        </span>
                                                    </td>
                                                </tr>
                                            ) ) }
                                        </tbody>
                                    </table>

                                    {/* Empty state */ }
                                    { ( !assignedInterviews?.interviews || assignedInterviews.interviews?.length === 0 ) && (
                                        <div className="p-8 text-center text-gray-500">
                                            <p className="text-sm">No interviews assigned</p>
                                        </div>
                                    ) }
                                </div>
                            ) }
                        </div>

                        {/* Interview Scheduling Form */ }
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={ editForm.status || detailedApplication?.applicationStatusId }
                                        onChange={ e => setEditForm( { ...editForm, status: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        { Object.entries( statusMap )?.map( ( [ id, name ] ) => (
                                            <option key={ id } value={ id }>
                                                { capitalizeFirstLetter( name ) }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Interview Round
                                    </label>
                                    <select
                                        value={ editForm.roundName }
                                        onChange={ e => setEditForm( { ...editForm, roundName: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Interview Round</option>
                                        { interviewRounds?.map( round => (
                                            <option key={ round._id } value={ round._id }>
                                                { round.roundName }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>
                            </div>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                                    <select
                                        value={ editForm.interviewType }
                                        onChange={ ( e ) => setEditForm( { ...editForm, interviewType: e.target.value } ) }
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-gray-500"
                                        required
                                    >
                                        <option value="">Select Interview Type</option>
                                        { interviewTypes?.map( type => (
                                            <option key={ type } value={ type }>
                                                { type?.charAt( 0 ).toUpperCase() + type.slice( 1 ) }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={ editForm.interviewerId }
                                        onChange={ ( e ) => setEditForm( { ...editForm, interviewerId: e.target.value } ) }
                                        required
                                    >
                                        <option value="">Select Interviewer</option>
                                        { interviewers?.map( ( interviewer ) => (
                                            <option key={ interviewer._id } value={ interviewer._id }>
                                                { interviewer.userName }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>
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
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={ onClose }
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

            <ToastContainer position="top-right" autoClose={ 3000 } hideProgressBar={ false } newestOnTop closeOnClick rtl={ false } pauseOnFocusLoss draggable pauseOnHover />

        </div>
    );
};

export default ScheduleInterviewModal;
import React, { useEffect, useState } from 'react';

const dummyCandidates = [
    {
        id: 1,
        userName: "John Doe",
        userEmail: "john.doe@example.com",
        status: "Shortlisted",
        experience: "5 years"
    },
    {
        id: 2,
        userName: "Jane Smith",
        userEmail: "jane.smith@example.com",
        status: "Shortlisted",
        experience: "3 years"
    },
    {
        id: 3,
        userName: "Mike Johnson",
        userEmail: "mike.j@example.com",
        status: "Shortlisted",
        experience: "4 years"
    },
    {
        id: 4,
        userName: "Sarah Williams",
        userEmail: "sarah.w@example.com",
        status: "Shortlisted",
        experience: "6 years"
    }
];

export const Applications = () => {
    const tableHeaderCss = "px-6 py-3 text-xs font-bold text-gray-600 uppercase bg-gray-200";
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";

    const [ interviewers, setInterviewers ] = useState( [] );
    const [ assignments, setAssignments ] = useState( {} );
    const [ selectedCandidate, setSelectedCandidate ] = useState( null );
    const [ isModalOpen, setIsModalOpen ] = useState( false );
    const [ scheduleDetails, setScheduleDetails ] = useState( {
        date: "",
        time: "",
        address: ""
    } );
    const [ scheduledInterviews, setScheduledInterviews ] = useState( [] );
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;


    const handleOpenModal = ( candidate ) => {
        setSelectedCandidate( candidate );
        setIsModalOpen( true );
    };


    const handleScheduleSubmit = () => {
        const interviewData = {
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.userName,
            candidateEmail: selectedCandidate.userEmail,
            ...scheduleDetails
        };

        setScheduledInterviews( [ ...scheduledInterviews, interviewData ] );
        setIsModalOpen( false );
        setScheduleDetails( { date: "", time: "", address: "" } );

        console.log( "New Interview Scheduled:", interviewData );
        console.log( "All Scheduled Interviews:", [ ...scheduledInterviews, interviewData ] );
    };
    // Fetch interviewers
    useEffect( () => {
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
                setInterviewers( data );
            } catch ( error ) {
                console.error( "Error fetching interviewers:", error.message );
            }
        };

        fetchInterviewers();
    }, [] );

    const handleAssign = ( candidateId, interviewerId ) => {
        setAssignments( ( prev ) => ( { ...prev, [ candidateId ]: interviewerId } ) );
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="w-full px-4">
                <div className="w-full">
                    <section className="py-1">
                        <div className="w-full px-4 mx-auto mt-24">
                            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                                <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600 text-white">
                                    <div className="flex flex-wrap items-center">
                                        <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-center">
                                            <h3 className="font-bold text-base">Shortlisted Candidates</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="block w-full overflow-x-auto">
                                    <table className="items-center bg-transparent w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className={ tableHeaderCss }>Candidate</th>
                                                <th className={ `${ tableHeaderCss } hidden md:table-cell` }>Email</th>
                                                <th className={ `${ tableHeaderCss } hidden md:table-cell` }>Experience</th>
                                                <th className={ tableHeaderCss }>Status</th>
                                                <th className={ tableHeaderCss }>Assign</th> {/* New Assign Column */ }
                                                <th className={ tableHeaderCss }></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { dummyCandidates.map( ( candidate ) => (
                                                <tr key={ candidate.id } className="hover:bg-gray-50">
                                                    <th className={ `${ tableDataCss } text-left text-gray-700 px-3 md:px-6` }>
                                                        { candidate.userName }
                                                    </th>
                                                    <td className={ `${ tableDataCss } hidden md:table-cell` }>{ candidate.userEmail }</td>
                                                    <td className={ `${ tableDataCss } hidden md:table-cell` }>{ candidate.experience }</td>
                                                    <td className={ `${ tableDataCss } hidden md:table-cell` }>
                                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                            { candidate.status }
                                                        </span>
                                                    </td>
                                                    <td className={ `${ tableDataCss }` }>
                                                        {/* Dropdown for Assigning Interviewer */ }
                                                        <select
                                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={ assignments[ candidate.id ] || "" }
                                                            onChange={ ( e ) => handleAssign( candidate.id, e.target.value ) }
                                                        >
                                                            <option value="">Select Interviewer</option>
                                                            { interviewers.map( ( interviewer ) => (
                                                                <option key={ interviewer.id } value={ interviewer.id }>
                                                                    { interviewer.userName }
                                                                </option>
                                                            ) ) }
                                                        </select>
                                                    </td>
                                                    <td className={ `flex justify-between ${ tableDataCss }` }>
                                                        <button
                                                            onClick={ () => handleOpenModal( candidate ) }
                                                            className="block bg-blue-600 text-white mx-auto text-sm py-2 px-2 md:px-6 rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            Schedule Interview
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) ) }
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal Background */ }
            { isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    {/* Modal Content */ }
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">
                                Schedule Interview for { selectedCandidate?.userName }
                            </h2>
                            <button
                                onClick={ () => setIsModalOpen( false ) }
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={ scheduleDetails.date }
                                onChange={ ( e ) => setScheduleDetails( { ...scheduleDetails, date: e.target.value } ) }
                            />

                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Time</label>
                            <input
                                type="time"
                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={ scheduleDetails.time }
                                onChange={ ( e ) => setScheduleDetails( { ...scheduleDetails, time: e.target.value } ) }
                            />

                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                value={ scheduleDetails.address }
                                onChange={ ( e ) => setScheduleDetails( { ...scheduleDetails, address: e.target.value } ) }
                            ></textarea>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                onClick={ () => setIsModalOpen( false ) }
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                onClick={ handleScheduleSubmit }
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
};

function RenderTableRows( { candidate, onSchedule } ) {
    const tableDataCss = "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    const capitalizeFirstLetter = ( string ) => {
        return string?.charAt( 0 ).toUpperCase() + string?.slice( 1 );
    };

    return (
        <tr className="hover:bg-gray-50">
            <th className={ `${ tableDataCss } text-left text-gray-700 px-3 md:px-6` }>
                { capitalizeFirstLetter( candidate.userName ) }
            </th>
            <td className={ `${ tableDataCss } hidden md:table-cell` }>{ candidate.userEmail }</td>
            <td className={ `${ tableDataCss } hidden md:table-cell` }>{ candidate.experience }</td>
            <td className={ `${ tableDataCss } hidden md:table-cell` }>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    { capitalizeFirstLetter( candidate.status ) }
                </span>
            </td>
            <td className={ `flex justify-between ${ tableDataCss }` }>
                <button
                    onClick={ onSchedule }
                    className="block bg-blue-600 text-white mx-auto text-sm py-2 px-2 md:px-6 rounded hover:bg-blue-700 transition-colors"
                >
                    Schedule Interview
                </button>
            </td>
        </tr>
    );
}

export default Applications;
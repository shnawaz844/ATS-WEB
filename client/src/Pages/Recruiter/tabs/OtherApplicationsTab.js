import React, { useState, useEffect } from 'react';

const OtherApplicationsTab = ({ candidateId }) => {
    const [applications, setApplications] = useState([]);

    const capitalizeFirstLetter = ( string ) => {
        return string ? string.charAt( 0 ).toUpperCase() + string.slice( 1 ) : '';
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

    useEffect(() => {
        fetch( `${ process.env.REACT_APP_BASE_URL }/application/candidate/${candidateId}`)
            .then((res) => res.json())
            .then((data) => setApplications(data.applications || []));
    }, [candidateId]);

    console.log("applications", applications);

    return (
        <div className="border p-4 rounded-xl bg-gray-400">
            <h2 className="text-xl text-deepBlack font-bold mb-2 ml-4 underline">Other Applications</h2>
            {applications.length > 0 ? applications.map((app) => (
                <div key={app._id} className="mb-4 p-4 border-b">
                    <h3 className="text-lg font-semibold underline text-white">{ capitalizeFirstLetter(app.jobID?.title) || 'N/A'}</h3>
                    <p><strong>Location:</strong> {app.jobID?.locationType || 'N/A'}</p>
                    <p><strong>Schedule:</strong> {app.jobID?.scheduleType || 'N/A'}</p>
                    <p><strong>Shift:</strong> {app.jobID?.shiftStart} - {app.jobID?.shiftEnd}</p>
                    <p><strong>Compensation:</strong> { formatIndianRupee(app.jobID?.compensation) || 'N/A'}</p>
                    <p><strong>Status:</strong> { capitalizeFirstLetter(app.applicationStatus) || 'N/A'}</p>
                    <a href={app.resume} target="_blank" rel="noopener noreferrer" className="text-white underline">View Resume</a>
                </div>
            )) : <p>No other applications found.</p>}
        </div>
    );
};

export default OtherApplicationsTab;

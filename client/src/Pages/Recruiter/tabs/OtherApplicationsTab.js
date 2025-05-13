import React, { useState, useEffect } from 'react';

const OtherApplicationsTab = ({ candidateId }) => {
    const [applications, setApplications] = useState([]);

    const capitalizeFirstLetter = ( string ) => {
        return string ? string.charAt( 0 ).toUpperCase() + string.slice( 1 ) : '';
    };

    useEffect(() => {
        fetch(`http://localhost:8080/application/candidate/${candidateId}`)
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
                    <p><strong>Compensation:</strong> {app.jobID?.compensation || 'N/A'}</p>
                    <p><strong>Status:</strong> { capitalizeFirstLetter(app.applicationStatus) || 'N/A'}</p>
                    <a href={app.resume} target="_blank" rel="noopener noreferrer" className="text-white underline">View Resume</a>
                </div>
            )) : <p>No other applications found.</p>}
        </div>
    );
};

export default OtherApplicationsTab;

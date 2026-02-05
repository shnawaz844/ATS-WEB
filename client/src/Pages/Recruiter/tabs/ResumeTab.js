import React from 'react';

const ResumeTab = ({ applicationData }) => (
    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Resume</h2>
        {applicationData.resume ? (
            <>
                <object data={applicationData.resume} type="application/pdf" width="100%" height="500">
                    <p>
                        Your browser does not support PDFs.
                        <a href={applicationData.resume} className="text-blue-600 hover:underline ml-1">Download PDF</a>.
                    </p>
                </object>
            </>
        ) : (
            <p className="text-gray-600 dark:text-gray-400">No resume available.</p>
        )}
    </div>
);

export default ResumeTab;

import React from 'react';

const DetailsTab = ({ applicationData }) => {
    // Define color classes based on status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Scheduled':
            case 'Accepted':
                return { bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300', icon: '✓' };
            case 'screening':
                return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300', icon: '⟳' };
            case 'Pending':
                return { bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300', icon: '⌛' };
            case 'In Review':
                return { bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300', icon: '👁' };
            case 'Rejected':
            case 'Not Selected':
                return { bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300', icon: '✕' };
            case 'Hired':
                return { bgColor: 'bg-green-200', textColor: 'text-green-800', borderColor: 'border-green-300', icon: '!' };
            default:
                return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300', icon: '' };
        }
    };

    const { bgColor, textColor, borderColor, icon } = getStatusInfo(applicationData.applicationStatus);

    return (
        <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Applicant Details</h2>
                <div className={`px-3 py-1 rounded-full ${bgColor} ${textColor} font-medium flex items-center space-x-1 border ${borderColor}`}>
                    <span>{icon}</span>
                    <span>{applicationData.applicationStatus || 'N/A'}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Contact info section */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="w-32 font-medium text-gray-700 dark:text-gray-300">Contact</div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <a href={`tel:+91${applicationData.contactInfo}`} className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                            +91 {applicationData.contactInfo || 'N/A'}
                        </a>
                    </div>
                </div>

                {/* Experience info section */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="w-32 font-medium text-gray-700 dark:text-gray-300">Experience</div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">{applicationData.experience || 'N/A'}</span>
                    </div>
                </div>

                {/* Add more details here as needed */}
                {applicationData.education && (
                    <div className="flex flex-col sm:flex-row sm:items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="w-32 font-medium text-gray-700 dark:text-gray-300">Education</div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">{applicationData.education}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsTab;
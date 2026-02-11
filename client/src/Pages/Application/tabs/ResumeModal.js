import React, { useState, useEffect } from 'react';

const ResumeModal = ({ isOpen, onClose, resumeData }) => {
    
    const [atsScore, setAtsScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { resume } = resumeData || { resume: '' };

    // Fetch ATS score when modal opens and resume data is available
    useEffect(() => {
        if (isOpen && resume) {
            fetchAtsScore(resume);
        }
    }, [isOpen, resume]);

    const fetchAtsScore = async (resumeUrl) => {
        setLoading(true);
        setError(null);
        
        try {
            // Replace with your actual API endpoint
            const response = await fetch('https://your-ats-api-endpoint.com/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    resumeUrl,
                    // Add any other parameters your API requires
                    jobId: resumeData.jobId, // If applicable
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch ATS score');
            }
            
            const data = await response.json();
            setAtsScore(data.score);
        } catch (err) {
            console.error('Error fetching ATS score:', err);
            setError('Unable to load ATS score');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:align-middle">
                    <div className="bg-gray-500 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Resume</h3>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-sm font-medium">ATS Score:</span>
                                        {loading ? (
                                            <span className="text-sm italic text-gray-500">Loading...</span>
                                        ) : error ? (
                                            <span className="text-sm text-red-500">{error}</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {atsScore !== null ? `${atsScore}/100` : 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 h-screen max-h-[calc(100vh-200px)] border border-gray-300 rounded overflow-hidden">
                                    {resume ? (
                                        <iframe
                                            src={resume}
                                            className="w-full h-full"
                                            title="Resume preview"
                                            frameBorder="0"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gray-50">
                                            <p className="text-gray-500">No resume available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <a
                            href={resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex w-full justify-center rounded-xl border border-transparent bg-gray-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            download
                        >
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeModal;

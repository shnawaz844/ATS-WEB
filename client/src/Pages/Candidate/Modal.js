import React, { useState } from 'react'

const Modal = ({ getStatusColor, isOpen, onClose, app }) => {
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'resume'
    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-md ${activeTab === 'details'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Application Details
                        </button>
                        {app.resume && (
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'resume'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Resume
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                    {activeTab === 'details' ? (
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Job Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Title</p>
                                        <p>{ capitalizeFirstLetter(app?.jobID?.title)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p>{app?.jobID?.city}, {app?.jobID?.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p>{app?.jobID?.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Schedule</p>
                                        <p>{app?.jobID?.scheduleType}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Application Status</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.applicationStatus)}`}>
                                    { capitalizeFirstLetter(app.applicationStatus)}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Your Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Contact</p>
                                        <p>{app.contactInfo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Experience</p>
                                        <p>{ capitalizeFirstLetter(app.experience)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Application Questions</h3>
                                {JSON.parse(app.questions[0]).map((question, index) => (
                                    <div key={index} className="mb-3">
                                        <p className="text-sm font-medium">{ capitalizeFirstLetter(question)}</p>
                                        <p className="text-gray-600">{JSON.parse(app.answers[0])[index]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[calc(90vh-80px)]">
                            <object
                                data={app.resume}
                                // title="Resume PDF"
                                className="w-full h-full"
                                width="800"
                                height="500"
                            >
                            </object>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal
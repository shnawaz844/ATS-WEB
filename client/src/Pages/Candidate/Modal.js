import React, { useState } from 'react'

const Modal = ( { getStatusColor, isOpen, onClose, app } ) => {
    const [ isScrolled, setIsScrolled ] = useState( false );
    const [ activeTab, setActiveTab ] = useState( 'details' ); // 'details' or 'resume'
    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    if ( !isOpen ) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300">
                {/* Header section with improved styling */ }
                <div className="flex justify-between items-center p-5 border-b bg-gray-700 border border-white rounded-t-xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={ () => setActiveTab( 'details' ) }
                            className={ `px-4 py-2 rounded-xl font-medium bg-gray-300 transition-all duration-200 ${ activeTab === 'details'
                                ? 'bg-gray-300 text-black shadow-md'
                                : 'hover:bg-gray-100 text-black'
                                }` }
                        >
                            Application Details
                        </button>
                        { app.resume && (
                            <button
                                onClick={ () => setActiveTab( 'resume' ) }
                                className={ `px-4 py-2 bg-gray-300 rounded-xl font-medium transition-all duration-200 ${ activeTab === 'resume'
                                    ? 'bg-gray-300 text-black shadow-md'
                                    : 'text-black hover:bg-gray-100'
                                    }` }
                            >
                                Resume
                            </button>
                        ) }
                    </div>
                    <button
                        onClick={ onClose }
                        className="text-gray-500 hover:text-gray-700 bg-transparent rounded-full p-2 hover:bg-gray-500 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                    { activeTab === 'details' ? (
                        <div className="p-8 space-y-8">
                            {/* Job Information Section */ }
                            <div className="bg-gray-200 rounded-xl p-6 border border-blue-100">
                                <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Job Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                                        <p className="font-semibold text-gray-800">{ capitalizeFirstLetter( app?.jobID?.title ) }</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                                        <p className="font-semibold text-gray-800">{ app?.jobID?.city }, { app?.jobID?.state }</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                                        <p className="font-semibold text-gray-800">{ app?.jobID?.type }</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Schedule</p>
                                        <p className="font-semibold text-gray-800">{ app?.jobID?.scheduleType }</p>
                                    </div>
                                </div>
                            </div>

                            {/* Application Status */ }
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Application Status
                                </h3>
                                <span className={ `px-4 py-2 rounded-full text-sm font-medium ${ getStatusColor( app.applicationStatus ) }` }>
                                    { capitalizeFirstLetter( app.applicationStatus ) }
                                </span>
                            </div>

                            {/* Your Information */ }
                            <div className="bg-blue-100 rounded-xl p-6 border border-indigo-100">
                                <h3 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Your Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Contact</p>
                                        <p className="font-semibold text-gray-800">{ app.contactInfo }</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Experience</p>
                                        <p className="font-semibold text-gray-800">{ capitalizeFirstLetter( app.experience ) }</p>
                                    </div>
                                </div>
                            </div>

                            {/* Application Questions */ }
                            <div className="bg-green-100 rounded-xl p-6 border border-green-100">
                                <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Application Questions
                                </h3>
                                <div className="space-y-4">
                                    { JSON.parse( app.questions[ 0 ] ).map( ( question, index ) => (
                                        <div key={ index } className="bg-white rounded-xl p-4 shadow-sm">
                                            <p className="text-sm font-medium text-green-600 mb-2">{ capitalizeFirstLetter( question ) }</p>
                                            <p className="text-gray-700">{ JSON.parse( app.answers[ 0 ] )[ index ] }</p>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[calc(90vh-80px)]">
                            <object
                                data={ app.resume }
                                className="w-full h-full"
                                width="800"
                                height="500"
                            >
                            </object>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default Modal
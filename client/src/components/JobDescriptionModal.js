import { Briefcase, Building, Calendar, CircleX, Clock, IndianRupee, MapPinHouse, MapPinned, Navigation } from 'lucide-react';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const JobDescriptionModal = ( { job, isOpen, onClose } ) => {
    const companyUserName = localStorage.getItem( "companyUserName" );
    const capitalizeFirstLetter = ( string ) => {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    // Function to format number in Indian Rupee format (e.g., 1,00,000)
    const formatIndianRupee = ( num ) => {
        if ( !num ) return "0";

        const formatSingle = ( n ) => {
            const clean = n.replace( /[^\d]/g, "" );
            if ( !clean || clean === "0" ) return "0";
            return clean.replace( /\B(?=(\d{2})+(?=\d{3}))/g, "," ).replace( /(\d{3})$/, ",$1" );
        };

        const str = num.toString();

        // Check for range pattern
        if ( str.includes( "-" ) || str.toLowerCase().includes( "to" ) ) {
            const numbers = str.split( /[-–—]|\s+to\s+/i );
            if ( numbers.length === 2 ) {
                return `${ formatSingle( numbers[ 0 ].trim() ) } - ${ formatSingle( numbers[ 1 ].trim() ) }`;
            }
        }

        return formatSingle( str );
    };

    if ( !isOpen ) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-indigo-100/50 transform transition-all duration-300 ease-in-out hover:shadow-3xl">
                {/* Close Button */ }
                <button
                    onClick={ onClose }
                    className="absolute top-5 right-5 z-10 text-gray-500 hover:text-indigo-600 transition-all duration-300 group"
                >
                    <CircleX className="w-8 h-8 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
                </button>

                {/* Job Title Section */ }
                <div className="bg-gray-700 flex items-center justify-center text-white p-6 rounded-t-2xl">
                    <h2 className="text-3xl font-bold tracking-tight">
                        { capitalizeFirstLetter( job.title ) }
                    </h2>
                </div>

                {/* Compensation Section */ }
                <div className="p-6 bg-gray-100 border-b border-indigo-100">
                    <div className="flex items-center space-x-4">
                        <IndianRupee className="w-6 h-6 text-indigo-600" />
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Annual Compensation</p>
                            <p className="text-2xl font-bold text-indigo-800">{ formatIndianRupee(job.compensation) }/Annum</p>
                        </div>
                    </div>
                </div>

                {/* Job Details Grid */ }
                <div className="grid grid-cols-3 gap-6 p-6 bg-white">
                    { [
                        { icon: Briefcase, label: 'Job Type', value: job.type },
                        { icon: Calendar, label: 'Schedule', value: job.scheduleType },
                        { icon: Clock, label: 'Shift Hours', value: `${ job.shiftStart } - ${ job.shiftEnd }` },
                        { icon: Building, label: 'Hire Type', value: job.hireType },
                        { icon: MapPinHouse, label: 'Location Type', value: job.locationType },
                        { icon: Building, label: 'Schedule Type', value: job.scheduleType },
                        { icon: MapPinned, label: 'Country', value: job.country },
                        { icon: MapPinned, label: 'State', value: job.state },
                        { icon: Navigation, label: 'City', value: job.city }
                    ].map( ( { icon: Icon, label, value }, index ) => (
                        <div key={ index } className="flex items-start space-x-3 bg-gray-200 p-3 rounded-xl hover:bg-indigo-100/50 transition-colors">
                            <Icon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{ label }</p>
                                <p className="text-sm font-medium text-gray-800">{ value }</p>
                            </div>
                        </div>
                    ) ) }
                </div>

                {/* Job Description */ }
                <div className="rounded-xl p-2">
                    <div className="prose max-w-none bg-gray-200 p-4 rounded-xl">
                        <ReactQuill
                            value={ job.description }
                            readOnly={ true }
                            theme="bubble"
                            className="job-description"
                        />
                    </div>
                </div>

                {/* Footer */ }
                <div className="bg-gray-100 p-6 rounded-b-2xl flex justify-between items-center">
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="font-medium text-black text-lg">{ job.experienceRequired } Years</span>
                        <span>Experience Required</span>
                    </div>
                    <a
                        href={ `/${companyUserName}/current-job/${ job._id }` }
                        className="px-8 py-3 bg-gray-700 text-white rounded-xl 
                        hover:bg-gray-400 hover:text-black 
                        transition-all duration-300 
                        shadow-md hover:shadow-lg 
                        transform hover:-translate-y-1"
                    >
                        Apply Now
                    </a>
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionModal;
import { Briefcase, Building, Calendar, CircleX, Clock, IndianRupee, MapPinHouse, MapPinned, Navigation } from 'lucide-react';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../context/ThemeContext';

const JobDescriptionModal = ({ job, isOpen, onClose, isApplied }) => {
    const { theme } = useTheme();
    const companyUserName = localStorage.getItem("companyUserName");
    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    };

    // Function to format number in Indian Rupee format (e.g., 1,00,000)
    const formatIndianRupee = (num) => {
        if (!num) return "0";

        const formatSingle = (n) => {
            const clean = n.replace(/[^\d]/g, "");
            if (!clean || clean === "0") return "0";
            return clean.replace(/\B(?=(\d{2})+(?=\d{3}))/g, ",").replace(/(\d{3})$/, ",$1");
        };

        const str = num.toString();

        // Check for range pattern
        if (str.includes("-") || str.toLowerCase().includes("to")) {
            const numbers = str.split(/[-–—]|\s+to\s+/i);
            if (numbers.length === 2) {
                return `${formatSingle(numbers[0].trim())} - ${formatSingle(numbers[1].trim())}`;
            }
        }

        return formatSingle(str);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-4 ">
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out hover:shadow-3xl mx-4 sm:mx-0 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-indigo-100/50'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 text-gray-500 hover:text-indigo-600 transition-all duration-300 group"
                >
                    <CircleX className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
                </button>

                {/* Job Title Section */}
                <div className={`${theme === 'dark' ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-700'} flex items-center justify-center text-white p-4 sm:p-6 rounded-t-2xl`}>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-center">
                        {capitalizeFirstLetter(job.title)}
                    </h2>
                </div>

                {/* Compensation Section */}
                <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-indigo-100'}`}>
                    <div className="flex items-center space-x-4">
                        <IndianRupee className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Annual Compensation</p>
                            <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>{formatIndianRupee(job.compensation)}/Annum</p>
                        </div>
                    </div>
                </div>

                {/* Job Details Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    {[
                        { icon: Briefcase, label: 'Job Type', value: job.type },
                        { icon: Calendar, label: 'Schedule', value: job.scheduleType },
                        { icon: Clock, label: 'Shift Hours', value: `${job.shiftStart} - ${job.shiftEnd}` },
                        { icon: Building, label: 'Hire Type', value: job.hireType },
                        { icon: MapPinHouse, label: 'Location Type', value: job.locationType },
                        { icon: Building, label: 'Schedule Type', value: job.scheduleType },
                        { icon: MapPinned, label: 'Country', value: job.country },
                        { icon: MapPinned, label: 'State', value: job.state },
                        { icon: Navigation, label: 'City', value: job.city }
                    ].filter(item => {
                        // If job is remote, don't show state and city
                        if (job.locationType?.toLowerCase() === 'remote' && (item.label === 'State' || item.label === 'City')) {
                            return false;
                        }
                        return true;
                    }).map(({ icon: Icon, label, value }, index) => (
                        <div key={index} className={`flex items-start space-x-3 p-2 sm:p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-indigo-100/50'}`}>
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Job Description */}
                <div className="rounded-xl p-2">
                    <div className={`prose max-w-none p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200'}`}>
                        <ReactQuill
                            value={job.description}
                            readOnly={true}
                            theme="bubble"
                            className="job-description text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={`${theme === 'dark' ? 'bg-gray-900 border-t border-gray-700' : 'bg-gray-100'} p-4 sm:p-6 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4`}>
                    <div className={`text-sm flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className={`font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{job.experienceRequired} Years</span>
                        <span>Experience Required</span>
                    </div>
                    {isApplied ? (
                        <button
                            disabled
                            className="px-6 py-2 sm:px-8 sm:py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed shadow-md w-full sm:w-auto text-center"
                        >
                            Applied
                        </button>
                    ) : (
                        <a
                            href={`/${companyUserName}/current-job/${job._id}`}
                            className="px-6 py-2 sm:px-8 sm:py-3 bg-gray-700 text-white rounded-xl 
                                hover:bg-gray-400 hover:text-black 
                                transition-all duration-300 
                                shadow-md hover:shadow-lg 
                                transform hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                            Apply Now
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionModal;
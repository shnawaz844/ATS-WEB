import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';

import { Link } from 'react-router-dom';
import { getStatusColor } from './utils';
import ScheduleInterviewModal from '../../../components/ScheduleInterviewModal';

const ApplicationsTable = ({
    filteredApps,
    statuses,
    onStatusChange,
    onViewResume,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    currentPage,
    totalApplications,
    totalPages,
}) => {
    const { theme } = useTheme();
    const [searchInput, setSearchInput] = useState(search);

    // Modal state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role;
    const subUserRole = localStorage.getItem("sub_role") || "";

    console.log("subUserRole", subUserRole, user)

    // const subrole = ''; //local storage - 'hiring_manager'/'recruiter_manager'
    // const subrole = JSON.parse( localStorage.setItem( "user" ) || "{}" );
    const isHiringManager = userRole === 'hiring_manager';
    const isRecruiterManager = userRole === 'recruiter_manager';
    const isAdmin = userRole === 'admin';
    const isInternalRole = ['admin', 'recruiter_manager', 'hiring_manager', 'recruiter'].includes(userRole) || ['hiring_manager', 'recruiter_manager'].includes(subUserRole);

    const [apps, setApps] = useState(filteredApps);

    useEffect(() => setApps(filteredApps), [filteredApps]);

    const handleSelect = (id, newStatus) => {
        setApps(curr =>
            curr.map(a => a._id === id ? { ...a, applicationStatusId: newStatus } : a)
        );
        onStatusChange(id, newStatus);
    };

    // Handle schedule interview button click
    const handleScheduleInterview = (app) => {
        // Transform the application data to match what ScheduleInterviewModal expects
        const transformedApp = {
            _id: app._id,
            applicationStatusId: app.applicationStatusId,
            company_id: app.company_id || user.company_id,
            jobDetails: {
                id: app.jobID._id,
                title: app.jobID?.title || app.jobTitle || 'N/A',
                city: app.jobID?.city,
                state: app.jobID?.state,
                locationType: app.jobID?.locationType
            },
            candidateDetails: {
                userName: app.candidateID?.userName || 'N/A',
                email: app.candidateID?.email || 'N/A',
                candidateID: app.candidateID?._id || 'N/A'

            },
            interview: app.interview || {}
        };

        setSelectedApplication(transformedApp);
        setIsScheduleModalOpen(true);
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const companyUserName = localStorage.getItem("companyUserName");

    const debouncedSetSearch = useCallback(
        debounce((value) => {
            setSearch(value);
            setPage(1);
        }, 500),
        [setSearch, setPage]
    );

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSetSearch(value);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="space-y-4 ">
            {/* Search and Limit Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="search"
                        className={`block w-full p-2 pl-10 text-sm border rounded-xl bg-white transition-colors duration-300 ${theme === 'dark'
                            ? 'bg-white/10 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        placeholder="Search by name..."
                        value={searchInput}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Applications Table */}
            <div className={`overflow-x-auto rounded-xl border shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={theme === 'dark' ? 'bg-[#313131]' : 'bg-gray-200'}>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                Candidate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                Contact
                            </th>
                            {isInternalRole && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                    Resume
                                </th>
                            )}
                            {isInternalRole && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-white text-gray-900 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                            {/* { ( ( !subUserRole || subUserRole === 'recruiter_manager' ) && !isHiringManager ) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={ () => onViewResume( app ) }
                                        className="text-blue-600 hover:text-blue-800 hover:underline group-hover:text-white"
                                    >
                                        View Resume
                                    </button>
                                </td>
                            ) } */}
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 divide-gray-700' : 'bg-gray-100'
                        }`}>
                        {filteredApps?.length > 0 ? (
                            filteredApps.map((app) => {
                                // Prepare candidateID & jobID for the link
                                const candidateId = app.candidateID?._id;
                                const jobId = app.jobID?._id || app.jobID;
                                const statusColor = getStatusColor(app.applicationStatusId);

                                return (
                                    <tr key={app._id} className={`group transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-700'
                                        }`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-lg font-medium text-gray-600">
                                                            {(app.candidateID?.userName?.[0] || 'N').toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        to={`/${companyUserName}/candidate-details/${candidateId}/${jobId}`}
                                                        className="text-sm font-medium text-purple-600 hover:underline group-hover:text-white "
                                                    >
                                                        {capitalizeFirstLetter(app.candidateID?.userName) || 'N/A'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-800 group-hover:text-white dark:text-gray-200 max-w-[140px] break-words">
                                            {app.emailInfo}
                                        </td>


                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-white'}`}>
                                            <select
                                                className={`min-w-32 w-auto px-4 py-2 rounded-xl border shadow-sm focus:border-[#9333ea] focus:ring-2 focus:ring-purple-300 text-sm ${theme === 'dark'
                                                    ? 'bg-[#9333ea] text-white border-purple-800 hover:bg-[#7e22ce]'
                                                    : 'bg-[#9333ea] text-white border-purple-600 hover:bg-[#a855f7]'
                                                    }`}
                                                value={app.applicationStatusId}
                                                onChange={e => handleSelect(app._id, e.target.value)}
                                            >
                                                {statuses?.map(status => (
                                                    <option
                                                        key={status._id}
                                                        value={status._id}
                                                        className="bg-gray-800 text-white"
                                                    >
                                                        {status.applicationStatus}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 group-hover:text-white dark:text-gray-200">
                                            {app.contactInfo ? `+91 ${app.contactInfo}` : 'N/A'}
                                        </td>
                                        {isInternalRole && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => onViewResume(app)}
                                                    className="text-[#9333ea] hover:text-purple-800 hover:underline group-hover:text-white font-medium"
                                                >
                                                    View Resume
                                                </button>
                                            </td>
                                        )}
                                        {isInternalRole && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleScheduleInterview(app)}
                                                    className="px-3 py-1.5 rounded-xl bg-[#9333ea] hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all duration-200"
                                                >
                                                    Schedule Interview
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    No applications found matching your search criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredApps?.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * limit, totalApplications)}</span> of <span className="font-medium">{totalApplications}</span> applications
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &laquo;
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lsaquo;
                    </button>

                    {/* Page numbers */}
                    {[...Array(totalPages).keys()]?.map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`px-3 py-1 border rounded text-sm ${pageNumber === currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : theme === 'dark'
                                            ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                            return <span key={pageNumber} className="px-1">...</span>;
                        }
                        return null;
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &rsaquo;
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &raquo;
                    </button>
                </div>
            </div>

            {/* Schedule Interview Modal */}
            {isScheduleModalOpen && selectedApplication && (
                <ScheduleInterviewModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => {
                        setIsScheduleModalOpen(false);
                        setSelectedApplication(null);
                    }}
                    application={selectedApplication}
                />
            )}

        </div>
    );
};

export default ApplicationsTable;

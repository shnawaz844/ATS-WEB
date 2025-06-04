import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStatusColor, getColorStyles } from './utils';

const ApplicationsTable = ( {
    filteredApps,
    statuses,
    onStatusChange,
    onViewResume,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    currentPage,
    totalApplications,
    totalPages
} ) => {
    console.log( "filteredApps00000", filteredApps );
    // State for the search input value (before debouncing)
    const [ searchInput, setSearchInput ] = useState( search );

    // build a map from status _id to its applicationStatusId (i.e. its “name”)
    const statusNameMap = useMemo( () => {
        return ( statuses || [] ).reduce( ( map, status ) => {
            map[ status._id ] = status.applicationStatus;
            console.log( "map", map )
            return map;
        }, {} );
    }, [ statuses ] );

    // local copy
    const [ apps, setApps ] = useState( filteredApps );
    useEffect( () => setApps( filteredApps ), [ filteredApps ] );

    const handleSelect = ( id, newStatus ) => {
        setApps( curr =>
            curr.map( a => a._id === id ? { ...a, applicationStatusId: newStatus } : a )
        );
        onStatusChange( id, newStatus );
    };

    // Debounce function
    const debounce = ( func, delay ) => {
        let timeoutId;
        return ( ...args ) => {
            if ( timeoutId ) {
                clearTimeout( timeoutId );
            }
            timeoutId = setTimeout( () => {
                func( ...args );
            }, delay );
        };
    };

    const capitalizeFirstLetter = ( str ) => {
        if ( !str ) return '';
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
    };

    const companyUserName = localStorage.getItem( "companyUserName" );
    //   const [statuses, setStatuses] = useState([]);

    // Create a debounced version of setSearch
    const debouncedSetSearch = useCallback(
        debounce( ( value ) => {
            setSearch( value );
            setPage( 1 ); // Reset to first page on new search
        }, 500 ), // 500ms delay
        [ setSearch, setPage ]
    );

    // Set initial search input value
    useEffect( () => {
        setSearchInput( search );
    }, [ search ] );

    // Handle search input change
    const handleSearchChange = ( e ) => {
        const value = e.target.value;
        setSearchInput( value ); // Update the input field immediately
        debouncedSetSearch( value ); // Debounce the actual search operation
    };

    // Handle page change
    const handlePageChange = ( newPage ) => {
        if ( newPage >= 1 && newPage <= totalPages ) {
            setPage( newPage );
        }
    };

    // Handle items per page change
    const handleLimitChange = ( e ) => {
        setLimit( Number( e.target.value ) );
        setPage( 1 ); // Reset to first page when changing limit
    };

    console.log( "statuses>>>", statuses );

    return (
        <div className="space-y-4">
            {/* Search and Limit Controls */ }
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="search"
                        className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-xl bg-white"
                        placeholder="Search by name..."
                        value={ searchInput }
                        onChange={ handleSearchChange }
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="limit" className="text-sm text-gray-600">Show:</label>
                    <select
                        id="limit"
                        className="border border-gray-300 text-gray-900 text-sm rounded-xl p-2"
                        value={ limit }
                        onChange={ handleLimitChange }
                    >
                        <option value={ 5 }>5</option>
                        <option value={ 10 }>10</option>
                        <option value={ 25 }>25</option>
                        <option value={ 50 }>50</option>
                    </select>
                </div>
            </div>

            {/* Applications Table */ }
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Candidate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Resume
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-300 divide-y divide-gray-200">
                        { filteredApps?.length > 0 ? (
                            filteredApps.map( ( app ) => {
                                // Prepare candidateID & jobID for the link
                                const candidateId = app.candidateID?._id;
                                const jobId = app.jobID?._id || app.jobID;
                                const statusColor = getStatusColor( app.applicationStatusId );

                                return (
                                    <tr key={ app._id } className="group hover:bg-gray-700 ">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-lg font-medium text-gray-600">
                                                            { ( app.candidateID?.userName?.[ 0 ] || 'N' ).toUpperCase() }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        to={ `/${ companyUserName }/candidate-details/${ candidateId }/${ jobId }` }
                                                        className="text-sm font-medium text-blue-600 hover:underline group-hover:text-white"
                                                    >
                                                        { capitalizeFirstLetter( app.candidateID?.userName ) || 'N/A' }
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                style={ {
                                                    backgroundColor: getColorStyles( statusColor, 100 ),
                                                    color: getColorStyles( statusColor, 800 )
                                                } }
                                            >
                                                { capitalizeFirstLetter(
                                                    statusNameMap[ app.applicationStatusId ]
                                                )
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-white">
                                            { app.contactInfo ? `+91 ${ app.contactInfo }` : 'N/A' }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={ () => onViewResume( app ) }
                                                className="text-blue-600 hover:text-blue-800 hover:underline group-hover:text-white"
                                            >
                                                View Resume
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                className="block w-full rounded-xl bg-gray-700 text-white border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={ app.applicationStatusId }
                                                onChange={ e => handleSelect( app._id, e.target.value ) }
                                            >
                                                { statuses?.map( status => (
                                                    <option key={ status._id } value={ status._id }
                                                        className="bg-gray-800 text-white hover:bg-gray-600"
                                                    >
                                                        { status.applicationStatus }
                                                    </option>
                                                ) ) }
                                            </select>
                                        </td>
                                    </tr>
                                );
                            } )
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No applications found matching your search criteria
                                </td>
                            </tr>
                        ) }
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */ }
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{ filteredApps?.length > 0 ? ( currentPage - 1 ) * limit + 1 : 0 }</span> to <span className="font-medium">{ Math.min( currentPage * limit, totalApplications ) }</span> of <span className="font-medium">{ totalApplications }</span> applications
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={ () => handlePageChange( 1 ) }
                        disabled={ currentPage === 1 }
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &laquo;
                    </button>
                    <button
                        onClick={ () => handlePageChange( currentPage - 1 ) }
                        disabled={ currentPage === 1 }
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lsaquo;
                    </button>

                    {/* Page numbers */ }
                    { [ ...Array( totalPages ).keys() ]?.map( ( _, index ) => {
                        const pageNumber = index + 1;
                        // Show current page, and 1 page before and after if available
                        if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            ( pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1 )
                        ) {
                            return (
                                <button
                                    key={ pageNumber }
                                    onClick={ () => handlePageChange( pageNumber ) }
                                    className={ `px-3 py-1 border rounded text-sm ${ pageNumber === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }` }
                                >
                                    { pageNumber }
                                </button>
                            );
                        } else if ( pageNumber === currentPage - 2 || pageNumber === currentPage + 2 ) {
                            return <span key={ pageNumber } className="px-1">...</span>;
                        }
                        return null;
                    } ) }

                    <button
                        onClick={ () => handlePageChange( currentPage + 1 ) }
                        disabled={ currentPage === totalPages }
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &rsaquo;
                    </button>
                    <button
                        onClick={ () => handlePageChange( totalPages ) }
                        disabled={ currentPage === totalPages }
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &raquo;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationsTable;
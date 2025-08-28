import React, { useEffect, useState } from 'react';
import StatusSidebar from './StatusSidebar';
import ApplicationsTable from './ApplicationsTable';
import ConfirmationDialog from './ConfirmationDialog';
import ResumeModal from './ResumeModal';
import { SlidersHorizontal } from 'lucide-react';

const ApplicationsListTab = ( {
    job,
    onStatusChange,
    applications,
    page,
    limit,
    search,
    monthFilter,
    yearFilter,
    setPage,
    setLimit,
    setSearch,
    setMonthFilter,
    setYearFilter,
    currentPage,
    totalApplications,
    totalPages,
    getMonthOptions,
    getYearOptions,
    clearFilters
} ) => {
    const [ allApps, setAllApps ] = useState( applications );
    const [ statusFilter, setStatusFilter ] = useState( '' );
    const [ statuses, setStatuses ] = useState( [] );
    const [ isMobile, setIsMobile ] = useState( window.innerWidth <= 768 );
    const [ showFilters, setShowFilters ] = useState( false ); // ✅ toggle state

    useEffect( () => {
        const handleResize = () => {
            setIsMobile( window.innerWidth <= 768 );
        };

        window.addEventListener( 'resize', handleResize );
        return () => window.removeEventListener( 'resize', handleResize );
    }, [] );

    useEffect( () => {
        setAllApps( applications );
    }, [ applications ] );

    // ✅ Filter Section UI
    const FilterSection = () => (
        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
            {/* Header */ }
            <div className="flex items-center justify-between mb-5 border-b pb-2">
                <h3 className="text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Filter Applications
                </h3>

                <button
                    onClick={ clearFilters }
                    className="text-xs font-medium px-3 py-1 rounded-full 
               bg-red-50 text-red-600 border border-red-200
               hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                >
                    Clear
                </button>
            </div>


            {/* Filters */ }
            <div className="grid grid-cols-2 gap-5">
                {/* Month */ }
                <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Month
                    </label>
                    <select
                        value={ monthFilter }
                        onChange={ ( e ) => setMonthFilter( e.target.value ) }
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                        { getMonthOptions().map( ( option ) => (
                            <option key={ option.value } value={ option.value }>
                                { option.label }
                            </option>
                        ) ) }
                    </select>
                </div>

                {/* Year */ }
                <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Year
                    </label>
                    <select
                        value={ yearFilter }
                        onChange={ ( e ) => setYearFilter( e.target.value ) }
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                        { getYearOptions().map( ( year ) => (
                            <option key={ year } value={ year }>
                                { year }
                            </option>
                        ) ) }
                    </select>
                </div>
            </div>
        </div>
    );

    // Status change functions
    const [ confirmDialog, setConfirmDialog ] = useState( {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        applicationId: null,
        newStatus: ''
    } );

    const [ resumeModal, setResumeModal ] = useState( {
        isOpen: false,
        resumeData: null
    } );

    const handleStatusUpdate = async ( applicationId, newStatus ) => {
        try {
            const app = allApps.find( a => a._id === applicationId );
            if ( app && app.applicationStatusId === newStatus ) return;

            setConfirmDialog( {
                isOpen: true,
                title: 'Update Application Status',
                message: `Are you sure you want to change the status from "${ app?.applicationStatus }" to "${ newStatus }"?`,
                applicationId: applicationId,
                newStatus: newStatus,
                onConfirm: () => confirmStatusChange( applicationId, newStatus )
            } );
        } catch ( err ) {
            console.error( err );
            alert( "Failed to update status" );
        }
    };

    const confirmStatusChange = async ( appId, newStatus ) => {
        try {
            await updateApplicationStatus( appId, newStatus );
            onStatusChange();
            setConfirmDialog( dialog => ( { ...dialog, isOpen: false } ) );
        } catch ( err ) {
            console.error( err );
            alert( "Failed to update status" );
        }
    };

    useEffect( () => {
        const fetchApplicationStatuses = async () => {
            try {
                const storedUser = JSON.parse( localStorage.getItem( 'user' ) );
                if ( !storedUser?.company_id ) return;

                const res = await fetch(
                    `${ process.env.REACT_APP_BASE_URL }/application-statuses/all-application-statuses`,
                    {
                        headers: {
                            'company_id': storedUser.company_id,
                        },
                    }
                );
                if ( !res.ok ) throw new Error( 'Failed to fetch application statuses' );

                const { applicationStatuses } = await res.json();
                applicationStatuses.sort( ( a, b ) =>
                    Number( a.applicationStep ) - Number( b.applicationStep )
                );

                setStatuses( applicationStatuses );
            } catch ( err ) {
                console.error( 'Error fetching statuses:', err );
            }
        };

        fetchApplicationStatuses();
    }, [] );

    const updateApplicationStatus = async ( applicationId, newStatus ) => {
        try {
            const response = await fetch(
                `${ process.env.REACT_APP_BASE_URL }/application/update-candidate-application/${ applicationId }`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify( { applicationStatusId: newStatus } ),
                }
            );

            if ( !response.ok ) {
                throw new Error( 'Failed to update application status' );
            }

            onStatusChange();
            return await response.json();
        } catch ( error ) {
            console.error( 'Error updating application status:', error );
            throw error;
        }
    };

    const getStatusCount = ( status ) => {
        return allApps?.filter( app => app.applicationStatusId === status ).length;
    };

    const handleStatusChangeRequest = ( appId, newStatus ) => {
        const app = allApps.find( a => a._id === appId );
        if ( app && app.applicationStatusId === newStatus ) return;

        setConfirmDialog( {
            isOpen: true,
            title: 'Update Application Status',
            message: `Are you sure you want to change the status from "${ app?.applicationStatus }" to "${ newStatus }"?`,
            applicationId: appId,
            newStatus: newStatus,
            onConfirm: () => confirmStatusChange( appId, newStatus )
        } );
    };

    const handleViewResume = async ( application ) => {
        try {
            setResumeModal( {
                isOpen: true,
                resumeData: application,
            } );
        } catch ( error ) {
            console.error( "Error fetching resume:", error );
            alert( "Failed to load resume. Please try again." );
        }
    };

    const filteredApps = allApps
        ?.filter( app => statusFilter ? app.applicationStatusId === statusFilter : true )
        ?.filter( app =>
            search
                ? app.candidateID?.userName?.toLowerCase().includes( search.toLowerCase() ) ||
                app.contactInfo?.toLowerCase().includes( search.toLowerCase() )
                : true
        );

    return (
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Mobile Layout */ }
            { isMobile && (
                <>
                    <div className="flex-1 space-y-6 w-80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Applications List</h2>
                            {/* ✅ Toggle Button */ }
                            <button
                                onClick={ () => setShowFilters( !showFilters ) }
                                className="text-sm px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                            >
                                { showFilters ? "Hide Filters" : "Show Filters" }
                            </button>
                        </div>

                        {/* ✅ Conditional Rendering */ }
                        { showFilters && <FilterSection /> }

                        <ApplicationsTable
                            job={ job }
                            filteredApps={ filteredApps }
                            statuses={ statuses }
                            onStatusChange={ handleStatusChangeRequest }
                            onViewResume={ handleViewResume }
                            page={ page }
                            limit={ limit }
                            search={ search }
                            setPage={ setPage }
                            setLimit={ setLimit }
                            setSearch={ setSearch }
                            currentPage={ currentPage }
                            totalApplications={ totalApplications }
                            totalPages={ totalPages }
                        />
                    </div>

                    <StatusSidebar
                        statuses={ statuses }
                        statusFilter={ statusFilter }
                        setStatusFilter={ setStatusFilter }
                        allApps={ allApps }
                        getStatusCount={ getStatusCount }
                    />
                </>
            ) }

            {/* Desktop Layout */ }
            { !isMobile && (
                <>
                    <StatusSidebar
                        statuses={ statuses }
                        statusFilter={ statusFilter }
                        setStatusFilter={ setStatusFilter }
                        allApps={ allApps }
                        getStatusCount={ getStatusCount }
                    />

                    <div className="flex-1 space-y-6 w-[70vw]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Applications List</h2>

                            {/* ✅ Stylish Toggle Button */ }
                            <button
                                onClick={ () => setShowFilters( !showFilters ) }
                                className={ `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
               bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md
               hover:from-blue-600 hover:to-indigo-600 transition-all duration-300`}
                            >
                                <SlidersHorizontal size={ 16 } />
                                { showFilters ? "Hide Filters" : "Filter By Month" }
                            </button>
                        </div>

                        {/* ✅ Conditional Rendering */ }
                        { showFilters && <FilterSection /> }

                        <ApplicationsTable
                            job={ job }
                            filteredApps={ filteredApps }
                            statuses={ statuses }
                            onStatusChange={ handleStatusChangeRequest }
                            onViewResume={ handleViewResume }
                            page={ page }
                            limit={ limit }
                            search={ search }
                            setPage={ setPage }
                            setLimit={ setLimit }
                            setSearch={ setSearch }
                            currentPage={ currentPage }
                            totalApplications={ totalApplications }
                            totalPages={ totalPages }
                            setMonthFilter={ setMonthFilter }
                            setYearFilter={ setYearFilter }
                            monthFilter={ monthFilter }
                            yearFilter={ yearFilter }
                        />
                    </div>
                </>
            ) }

            <ConfirmationDialog
                isOpen={ confirmDialog.isOpen }
                title={ confirmDialog.title }
                message={ confirmDialog.message }
                onConfirm={ () => confirmStatusChange( confirmDialog.applicationId, confirmDialog.newStatus ) }
                onClose={ () => setConfirmDialog( { ...confirmDialog, isOpen: false } ) }
            />

            <ResumeModal
                isOpen={ resumeModal.isOpen }
                resumeData={ resumeModal.resumeData }
                onClose={ () => setResumeModal( { ...resumeModal, isOpen: false } ) }
            />
        </div>
    );
};

export default ApplicationsListTab;

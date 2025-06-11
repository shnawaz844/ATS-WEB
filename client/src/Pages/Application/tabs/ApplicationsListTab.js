import React, { useEffect, useState } from 'react';

import StatusSidebar from './StatusSidebar';
import ApplicationsTable from './ApplicationsTable';
import ConfirmationDialog from './ConfirmationDialog';
import ResumeModal from './ResumeModal';

const ApplicationsListTab = ( { onStatusChange, applications, page, limit, search, setPage, setLimit, setSearch, currentPage, totalApplications, totalPages } ) => {
    const [ allApps, setAllApps ] = useState( applications );
    const [ statusFilter, setStatusFilter ] = useState( '' );
    const [ statuses, setStatuses ] = useState( [] );

    // Update local state when parent applications change
    useEffect( () => {
        setAllApps( applications );
    }, [ applications ] );

    // Add this function to handle status updates from both table and modal
    const handleStatusUpdate = async ( applicationId, newStatus ) => {
        try {
            // Find the current app
            const app = allApps.find( a => a._id === applicationId );

            // If no change in status, do nothing
            if ( app && app.applicationStatusId === newStatus ) return;

            // Open confirmation dialog
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

    // Update the confirmStatusChange to call the parent's onStatusChange
    const confirmStatusChange = async ( appId, newStatus ) => {
        try {
            await updateApplicationStatus( appId, newStatus );
            // Notify parent component to refresh data
            onStatusChange();
            setConfirmDialog( dialog => ( { ...dialog, isOpen: false } ) );
        } catch ( err ) {
            console.error( err );
            alert( "Failed to update status" );
        }
    };

    // State for confirmation dialog
    const [ confirmDialog, setConfirmDialog ] = useState( {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        applicationId: null,
        newStatus: ''
    } );

    // State for resume modal
    const [ resumeModal, setResumeModal ] = useState( {
        isOpen: false,
        resumeData: null
    } );

    // Fetch statuses from API
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

                // optional: sort by applicationStep so buttons render in step order
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
            const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/application/update-candidate-application/${ applicationId }`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( { applicationStatusId: newStatus } ),
            } );
            console.log( 'Raw response001:', response );
            if ( !response.ok ) {
                throw new Error( 'Failed to update application status' );
            }
            console.log( 'component update done, calling parent' );
            onStatusChange()
            return await response.json();
        } catch ( error ) {
            console.error( 'Error updating application status:', error );
            throw error;
        }
    };

    const getStatusCount = ( status ) => {
        return allApps.filter( app => app.applicationStatusId === status ).length;
    };

    const handleStatusChangeRequest = ( appId, newStatus ) => {
        // Find the current app
        const app = allApps.find( a => a._id === appId );

        // If no change in status, do nothing
        if ( app && app.applicationStatusId === newStatus ) return;

        // Open confirmation dialog
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
            // Open resume modal
            setResumeModal( {
                isOpen: true,
                resumeData: application,
            } );
        } catch ( error ) {
            console.error( "Error fetching resume:", error );
            alert( "Failed to load resume. Please try again." );
        }
    };

    console.log( "allApps123", allApps )

    const filteredApps = allApps
        .filter( app => statusFilter ? app.applicationStatusId === statusFilter : true )
        .filter( app =>
            search
                ? app.candidateID?.userName?.toLowerCase().includes( search.toLowerCase() ) ||
                app.contactInfo?.toLowerCase().includes( search.toLowerCase() )
                : true
        );

    console.log( "filteredApps", filteredApps )

    return (
        <div className="flex gap-6">
            {/* Sidebar */ }
            <StatusSidebar
                statuses={ statuses }
                statusFilter={ statusFilter }
                setStatusFilter={ setStatusFilter }
                allApps={ allApps }
                getStatusCount={ getStatusCount }
            />

            {/* Main Content */ }
            <div className="flex-1 space-y-6">
                {/* Search Bar */ }
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Applications List</h2>
                </div>

                {/* Applications Table */ }
                <ApplicationsTable
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

            {/* Confirmation Dialog */ }
            <ConfirmationDialog
                isOpen={ confirmDialog.isOpen }
                title={ confirmDialog.title }
                message={ confirmDialog.message }
                onConfirm={ () => confirmStatusChange( confirmDialog.applicationId, confirmDialog.newStatus ) }
                onClose={ () => setConfirmDialog( { ...confirmDialog, isOpen: false } ) }
            />

            {/* Resume Modal */ }
            <ResumeModal
                isOpen={ resumeModal.isOpen }
                resumeData={ resumeModal.resumeData }
                onClose={ () => setResumeModal( { ...applications, isOpen: false } ) }
            />
        </div>
    );
};

export default ApplicationsListTab;
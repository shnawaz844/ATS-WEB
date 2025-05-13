import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch interview status options from the backend
 * @returns {Object} - { statusOptions, isLoading, error }
 */
const useInterviewStatuses = () => {
    const [ statusOptions, setStatusOptions ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState( null );

    useEffect( () => {
        const fetchStatusOptions = async () => {
            try {
                setIsLoading( true );
                const response = await fetch( 'http://localhost:8080/api/interview-statuses' );

                if ( !response.ok ) {
                    throw new Error( `Failed to fetch status options: ${ response.statusText }` );
                }

                const data = await response.json();
                setStatusOptions( data.statuses );
                setError( null );
            } catch ( error ) {
                console.error( 'Error fetching interview statuses:', error );
                setError( error.message );
                // Fallback to default options if API fails
                setStatusOptions( [
                    'Completed',
                    'In Progress',
                    'Scheduled',
                    'Selected',
                    'Rejected',
                    'Hold'
                ] );
            } finally {
                setIsLoading( false );
            }
        };

        fetchStatusOptions();
    }, [] );

    return { statusOptions, isLoading, error };
};

export default useInterviewStatuses;
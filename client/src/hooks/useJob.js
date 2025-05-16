import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
// import axios from 'axios';

// Fetch all jobs with filters
const fetchJobs = async ( { filters, page, limit, headers } ) => {
    const queryParams = new URLSearchParams( { ...filters, page, limit } ).toString();

    const response = await fetch( `${ process.env.BASE_URL }/jobs/all-jobs?${ queryParams }`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...headers,  // This will include the company_id header
        },
    } );
    if ( !response.ok ) {
        throw new Error( "Error fetching jobs" );
    }
    return response.json();
};

// Post a new job
const postJob = async ( jobData ) => {
    const response = await fetch( `${ process.env.BASE_URL }/jobs/post-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( jobData ),
    } );
    if ( !response.ok ) {
        throw new Error( "Error posting job" );
    }
    return response.json();
};

// Update an existing job
const updateJob = async ( jobData ) => {
    const response = await fetch( `${ process.env.BASE_URL }/jobs/update-job/${ jobData._id }`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( jobData ),
    } );
    if ( !response.ok ) {
        throw new Error( "Error updating job" );
    }
    return response.json();
};

export const useJobs = ( filters, page = 1, limit = 6) => {
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    return useQuery( {
        queryKey: [ 'jobs', filters, page ],
        queryFn: () => fetchJobs( {
            filters,
            page,
            limit,
            headers: {
                'company_id': companyId,  // Ensure company_id is sent here
            }
        } ),
        keepPreviousData: true,
    } );
};



export const usePostJob = () => {
    const queryClient = useQueryClient();
    return useMutation( {
        mutationFn: postJob,
        onSuccess: () => {
            queryClient.invalidateQueries( [ 'jobs' ] ); // Invalidate the jobs cache
        },
    } );
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation( {
        mutationFn: updateJob,
        onSuccess: () => {
            queryClient.invalidateQueries( [ 'jobs' ] ); // Invalidate the jobs cache
        },
    } );
};

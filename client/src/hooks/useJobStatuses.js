import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 1. FETCH ALL Jobs statuses
 */
const fetchJobStatuses = async ( { filters, page, limit } ) => {
    const queryParams = new URLSearchParams( filters ).toString();
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const res = await fetch(
        `${ process.env.REACT_APP_BASE_URL }/job-statuses/all-job-statuses?${ queryParams }`,
        {
            headers: {
                'company_id': companyId // Sending company_id in headers
            }
        }
    );
    if ( !res.ok ) {
        throw new Error( "Error fetching job statuses" );
    }
    return res.json();
};

export const useJobStatuses = ( filters, page, limit ) => {
    return useQuery( {
        queryKey: [ "jobStatuses", filters, page ],
        queryFn: () => fetchJobStatuses( { filters, page, limit } ),
        keepPreviousData: true,
    } );
};

/**
 * 2. ADD APPLICATION
 */
const addJob = async ( formData ) => {
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    await axios.post(
        `${ process.env.REACT_APP_BASE_URL }/job-statuses/add-job-status`,
        formData, {
        headers: {
            'company_id': companyId // Send company_id in headers
        }
    }
    );
};

export const useAddJob = () => {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: addJob,
        onSuccess: () => {
            queryClient.invalidateQueries( [ "applications" ] );
        },
    } );
};

/**
 * 3. UPDATE jobs statuses
 */
const updateJobStatus = async ( { jobStatusId, formData } ) => {
    await axios.put(
        `${ process.env.REACT_APP_BASE_URL }/job-statuses/update-job-status/${ jobStatusId }`,
        formData
    );
};

export const useUpdateJobStatus = () => {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: updateJobStatus,
        onSuccess: () => {
            queryClient.invalidateQueries( [ "jobStatuses" ] );
        },
    } );
};

import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchScheduledInterviews = async ( { queryKey } ) => {
    console.log( "queryKeyyy", queryKey )
    const [ key, { page, limit, searchTerm, candidateID, filterStatus, filterRound, jobID, interviewerID } ] = queryKey;

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    let apiUrl = ""
    if ( candidateID ) {
        apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&searchTerm=${ searchTerm || '' }&candidateID=${ candidateID }&filterStatus=${ filterStatus || '' }&filterRound=${ filterRound || '' }&jobID=${ jobID || '' }`;
    } else if ( interviewerID ) {
        apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&searchTerm=${ searchTerm || '' }&interviewerID=${ interviewerID }&filterStatus=${ filterStatus || '' }&filterRound=${ filterRound || '' }&jobID=${ jobID || '' }`;
    } else if ( interviewerID === 'admin' ) {
        apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&searchTerm=${ searchTerm || '' }&filterStatus=${ filterStatus || '' }&filterRound=${ filterRound || '' }&jobID=${ jobID || '' }`;
    }
    console.log( "Fetching scheduled interviews for candidateID:", candidateID );
    console.log( "company_id:", companyId );
    console.log( "job_id:", jobID );

    const response = await axios.get(
        `${ process.env.REACT_APP_BASE_URL }${ apiUrl }`,
        {
            headers: {
                "company_id": companyId,
            },
        }
    );

    console.log( "Scheduled Interviews Response:", response.data );
    return response.data;
};

const useScheduledInterview = ( { page, limit, searchTerm, candidateID, jobID, filterStatus, filterRound, interviewerID } ) => {
    const queryClient = useQueryClient();
    console.log( " api call" )
    // Fetch Scheduled Interviews with pagination and candidate filtering
    const { data, error, isLoading } = useQuery( {
        queryKey: [ "ScheduledInterviews", { page, limit, searchTerm, candidateID, jobID, filterStatus, filterRound, interviewerID } ],
        queryFn: fetchScheduledInterviews,
        keepPreviousData: true,
        enabled: !!candidateID || !!interviewerID || interviewerID === 'admin', // Only fetch when candidateID or interviewerID is available
    } );

    // Extract the interviews data from response
    const assignedInterviews = data?.data || data || {};
    const interviews = assignedInterviews?.interviews || [];

    // Mutation for refetching after updates
    const refetchScheduledInterviews = () => {
        console.log( "Refetching Scheduled Interviews..." );
        queryClient.invalidateQueries( {
            queryKey: [ "ScheduledInterviews", { page, limit, searchTerm, candidateID, jobID, filterStatus, filterRound, interviewerID } ]
        } );
    };

    return {
        assignedInterviews,
        interviews,
        error,
        isLoading,
        refetchScheduledInterviews
    };
};

export default useScheduledInterview;
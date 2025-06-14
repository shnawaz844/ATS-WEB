import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchScheduledInterviews = async ( { queryKey } ) => {
    console.log( "queryKeyyy", queryKey )
    const [ key, { page, limit, search, candidateID, filterStatus, jobID, interviewerID } ] = queryKey;

    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    let apiUrl = ""
    if ( candidateID ) {
        apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&search=${ search || '' }&candidateID=${ candidateID }&filterStatus=${ filterStatus || '' }&jobID=${ jobID || '' }`;
    } else if ( interviewerID ) {
        apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&search=${ search || '' }&interviewerID=${ interviewerID }&filterStatus=${ filterStatus || '' }&jobID=${ jobID || '' }`;
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

const useScheduledInterview = ( { page, limit, search, candidateID, jobID, filterStatus, interviewerID } ) => {
    const queryClient = useQueryClient();
    console.log( " api call" )
    // Fetch Scheduled Interviews with pagination and candidate filtering
    const { data, error, isLoading } = useQuery( {
        queryKey: [ "ScheduledInterviews", { page, limit, search, candidateID, filterStatus, jobID, interviewerID } ],
        queryFn: fetchScheduledInterviews,
        keepPreviousData: true,
        enabled: !!candidateID || !!interviewerID, // Only fetch when candidateID or interviewerID is available
    } );

    // Extract the interviews data from response
    const assignedInterviews = data?.data || data || {};
    const interviews = assignedInterviews?.interviews || [];

    // Mutation for refetching after updates
    const refetchScheduledInterviews = () => {
        console.log( "Refetching Scheduled Interviews..." );
        queryClient.invalidateQueries( {
            queryKey: [ "ScheduledInterviews", { page, limit, search, candidateID, filterStatus, interviewerID } ]
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
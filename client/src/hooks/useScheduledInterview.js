import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchScheduledInterviews = async ({ queryKey }) => {
    const [, page, limit, interviewerEmail] = queryKey;
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    // console.log("Fetching data with params:", { page, limit, interviewerEmail });
    console.log( "company_id", companyId )

    const response = await axios.get(`${ process.env.BASE_URL }/applicationscheduledlist/scheduled-interviewer-app`, {
        params: { page, limit, interviewerEmail },
        headers: {
            "company_id": companyId,  // Pass company_id in headers
        },
    });

    console.log( "Response Data:", response.data, );
    return response.data;
};

const useScheduledInterview = ( page, limit, interviewerEmail ) => {
    const queryClient = useQueryClient();

    // Fetch Scheduled Interviews with pagination
    const { data, error, isLoading } = useQuery({
        queryKey: ["ScheduledInterviews", page, limit, interviewerEmail],
        queryFn: fetchScheduledInterviews,
        keepPreviousData: true, // Prevents flickering when paginating
    });

    // Ensure data is properly extracted
    const ScheduledInterviews = data?.data || data || [];
    // Mutation for refetching after updates
    const refetchScheduledInterviews = () => {
        console.log("Refetching Scheduled Interviews...");
        queryClient.invalidateQueries( { queryKey: [ "ScheduledInterviews", page, limit, interviewerEmail ] });
    };

    return { ScheduledInterviews, error, isLoading, refetchScheduledInterviews};
};

export default useScheduledInterview;

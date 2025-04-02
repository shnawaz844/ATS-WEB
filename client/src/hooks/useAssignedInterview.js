import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchAssignedInterviews = async ({ queryKey }) => {
    const [, page, limit] = queryKey;
    console.log("Fetching data with params:", { page, limit });

    const response = await axios.get("http://localhost:8080/applicationscheduledlist/scheduled-interviewer-app", {
        params: { page, limit },
    });

    console.log("Response Data:", response.data);
    return response.data;
};


const useScheduledInterview = (page, limit) => {
    const queryClient = useQueryClient();

    // Fetch assigned interviews with pagination
    const { data: assignedInterviews = [], error, isLoading } = useQuery({
        queryKey: ["assignedInterviews", page, limit], // Include page & limit in the queryKey
        queryFn: fetchAssignedInterviews,
        keepPreviousData: true, // Helps with smooth pagination
    });

    // Mutation for refetching after updates
    const refetchAssignedInterviews = () => {
        queryClient.invalidateQueries(["assignedInterviews"]);
    };

    return { assignedInterviews, error, isLoading, refetchAssignedInterviews };
};

export default useScheduledInterview;

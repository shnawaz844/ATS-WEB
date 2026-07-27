import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchAssignedInterviews = async ({ queryKey }) => {
    const [, page, limit] = queryKey;
    console.log("Fetching data with params:", { page, limit });

    const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/get-feedbacks?page=${page}&limit=${limit}`);


    if (!response.ok) {
        throw new Error("Failed to fetch assigned interviews");
    }

    const data = await response.json();
    console.log("Response Data:", data); // Check if 'feedbacks' exist in the API response

    return data; // Ensure 'feedbacks' is returned if available
};


const useAllInterviews = (page, limit) => {
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

export default useAllInterviews;


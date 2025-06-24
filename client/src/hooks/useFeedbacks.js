import { useQuery } from "@tanstack/react-query";

const fetchFeedbacks = async ( { queryKey } ) => {
    const [ , page, limit ] = queryKey;

    const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/get-feedbacks?page=${ page }&limit=${ limit }` );

    if ( !response.ok ) {
        throw new Error( "Failed to fetch feedbacks" );
    }

    const data = await response.json();
    return data;
};

const useFeedbacks = ( page, limit ) => {
    const { data = {}, error, isLoading } = useQuery( {
        queryKey: [ "feedbacks", page, limit ], // Query key includes pagination params
        queryFn: fetchFeedbacks,
        keepPreviousData: true, // Helps with smooth pagination
    } );

    return { feedbacks: data.feedbacks || [], total: data.total || 0, error, isLoading };
};

export default useFeedbacks;

import { useQuery } from "@tanstack/react-query";

// useFeedbacks.js
const fetchFeedbacks = async ( { queryKey } ) => {
    const [ , page, limit, ratingFilter ] = queryKey;

    let url = `${ process.env.REACT_APP_BASE_URL }/interviewerfeedback/get-feedbacks?page=${ page }&limit=${ limit }`;

    // Add rating filter if provided
    if ( ratingFilter && ratingFilter !== 'all' ) {
        url += `&rating=${ ratingFilter }`;
    }

    const response = await fetch( url );

    if ( !response.ok ) {
        throw new Error( "Failed to fetch feedbacks" );
    }

    const data = await response.json();
    return data;
};

const useFeedbacks = ( page, limit, ratingFilter = 'all' ) => {
    const { data = {}, error, isLoading } = useQuery( {
        queryKey: [ "feedbacks", page, limit, ratingFilter ],
        queryFn: fetchFeedbacks,
        keepPreviousData: true,
    } );

    return { feedbacks: data.feedbacks || [], total: data.total || 0, error, isLoading };
};

export default useFeedbacks;

import { useQuery } from '@tanstack/react-query';

const fetchApplicationStatuses = async ( { filters, page, limit } ) => {
    const queryParams = new URLSearchParams( { ...filters, page, limit } ).toString();
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    const res = await fetch( `http://localhost:8080/application/grouped-by-job?${ queryParams }`, {
        method: 'GET', // Specify the HTTP method (GET in this case)
        headers: {
            'company_id': companyId, // Add company_id header
        }
    } );
    if ( !res.ok ) {
        throw new Error( 'Error fetching applications' );
    }
    const json = await res.json();
    console.log( 'Fetched Data:', json ); // Debugging the API response
    return json;
};


export const useApplicationStatuses = ( filters, page = 1, limit = 6 ) => {
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
    return useQuery( {
        queryKey: [ 'applicationTypes', filters, page ],
        queryFn: () => fetchApplicationStatuses( {
            filters,
            page,
            limit,
            headers: {
                'company_id': companyId,  // Adding company_id to the headers
            }
        } ),
        keepPreviousData: true, // Ensures previous data is displayed while new data is loading
    } );
};


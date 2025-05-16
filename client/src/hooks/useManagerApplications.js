import { useQuery } from "@tanstack/react-query";

const useManagerApplications = ( hiringManagerEmail, page = 1, limit = 10, search = "" ) => {
    return useQuery( {
        queryKey: [ "applications", hiringManagerEmail, page, limit, search ],
        queryFn: async () => {
            try {
                const queryParams = new URLSearchParams( { page, limit, search } ).toString();
                const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
                const response = await fetch(
                    `${ process.env.REACT_APP_BASE_URL }/application/get-application-hm/${ hiringManagerEmail }?${ queryParams }`,
                    {
                        headers: {
                            'company_id': companyId, // Ensure company_id is sent here
                        },
                    }
                );

                if ( !response.ok ) {
                    throw new Error( "Error fetching applications" );
                }

                const data = await response.json();
                console.log( "data>>>>", data );

                // Add company_id to candidateDetails in applications
                data.applications.forEach( application => {
                    if ( application.candidateDetails ) {
                        application.candidateDetails.company_id = companyId; // Add the company_id to candidateDetails
                    }
                } );

                // Return the modified data with the company_id in candidateDetails
                return { ...data, company_id: companyId };
            } catch ( err ) {
                console.error( "Error fetching applications:", err.message );
                throw err; // Let React Query handle the error
            }
        },
        keepPreviousData: true, // Prevents flickering on pagination
    } );
};

export default useManagerApplications;

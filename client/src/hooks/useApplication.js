import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 1. FETCH ALL APPLICATIONS
 */
const fetchApplicationTypes = async ( { filters, page, limit } ) => {
  const queryParams = new URLSearchParams( filters ).toString();
  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
  const res = await fetch(
    `${ process.env.REACT_APP_BASE_URL }/application-types/all-application-types?${ queryParams }`,
    {
      headers: {
        'company_id': companyId // Sending company_id in headers
      }
    }
  );
  if ( !res.ok ) {
    throw new Error( "Error fetching applications" );
  }
  return res.json();
};

export const useApplicationTypes = ( filters, page, limit ) => {
  return useQuery( {
    queryKey: [ "applicationTypes", filters, page ],
    queryFn: () => fetchApplicationTypes( { filters, page, limit } ),
    keepPreviousData: true,
  } );
};

/**
 * 2. ADD APPLICATION
 */
const addApplication = async ( formData ) => {
  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
  await axios.post(
    `${ process.env.REACT_APP_BASE_URL }/application-types/add-application-type`,
    formData,{
    headers: {
    'company_id': companyId // Send company_id in headers
  }
}
  );
};

export const useAddApplication = () => {
  const queryClient = useQueryClient();

  return useMutation( {
    mutationFn: addApplication,
    onSuccess: () => {
      queryClient.invalidateQueries( [ "applications" ] );
    },
  } );
};

/**
 * 3. UPDATE APPLICATION
 */
const updateApplicationType = async ( { applicationTypeId, formData } ) => {
  await axios.put(
    `${ process.env.REACT_APP_BASE_URL }/application-types/update-application-type/${ applicationTypeId }`,
    formData
  );
};

export const useUpdateApplicationType = () => {
  const queryClient = useQueryClient();

  return useMutation( {
    mutationFn: updateApplicationType,
    onSuccess: () => {
      queryClient.invalidateQueries( [ "applicationTypes" ] );
    },
  } );
};

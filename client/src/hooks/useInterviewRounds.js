import axios from 'axios';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

/**
 * 1. FETCH All Interview Details
 */
const fetchInterviewDetails = async ({ queryKey }) => {
  // v5 still supplies an object to 'queryFn'. 
  // Inside that object, you can destructure `queryKey` if needed.
  const [_key, { page, limit, search }] = queryKey;
  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;

  const res = await axios.get(
    `${ process.env.REACT_APP_BASE_URL }/interviews/all-interviews?page=${page}&limit=${limit}&search=${search}`,
     {
      headers: {
        'Company_id': companyId // Sending company_id in headers
      }
    }
  );
  return res.data; // e.g. { interviews, totalCount, totalPages }
};

export const useInterviews = ({ page, limit = 5, search = '' }) => {
  return useQuery({
    queryKey: ['interviews', { page, limit, search }],
    queryFn: fetchInterviewDetails,
    keepPreviousData: true,
    // Optionally configure staleTime, cacheTime, refetchOnWindowFocus, etc.
  });
};

/**
 * 2. ADD Interview
 */
const addInterview = async (formData) => {
  await axios.post(`${ process.env.REACT_APP_BASE_URL }/interviews/add-interview`, formData);
};

export const useAddInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInterview,
    onSuccess: () => {
      // Force refetch so your user list stays fresh
      queryClient.invalidateQueries(['interviews']);
    },
  });
};

/**
 * 3. UPDATE Interview
 */
const updateInterview = async ({ interviewId, formData }) => {
  await axios.put(
    `${ process.env.REACT_APP_BASE_URL }/interviews/update-interview/${interviewId}`,
    formData
  );
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
    },
  });
};

// src/hooks/useUsers.js

import axios from 'axios';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

/**
 * 1. FETCH ALL USERS
 */
const fetchUsers = async ({ queryKey }) => {
  const [_key, { page, limit, search, role }] = queryKey;
  let url = `${ process.env.REACT_APP_BASE_URL }/users/all-users?page=${page}&limit=${limit}&search=${search}`;

  if (role) {
    url += `&role=${role}`;
  }
  // Retrieve company_id from localStorage
  const companyId = JSON.parse(localStorage.getItem("user")).company_id;
  console.log("companyId",companyId);

  const res = await axios.get(url, {
    headers: {
      'company_id': companyId  // Sending company_id in headers
    }
  });

  return res.data;
};

export const useUsers = ({ page, limit = 5, search = '', role }) => {
  return useQuery({
    queryKey: ['users', { page, limit, search, role }],
    queryFn: fetchUsers,
    keepPreviousData: true,
    // Optionally configure staleTime, cacheTime, refetchOnWindowFocus, etc.
  });
};

/**
 * 2. ADD USER
 */
const addUser = async (formData) => {
  await axios.post(`${ process.env.REACT_APP_BASE_URL }/auth/register`, formData);
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      // Force refetch so your user list stays fresh
      queryClient.invalidateQueries(['users']);
    },
  });
};

/**
 * 3. UPDATE USER
 */
const updateUser = async ({ userId, formData }) => {
  await axios.put(
    `${ process.env.REACT_APP_BASE_URL }/users/update-user/${userId}`,
    formData
  );
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

// { * 4. DELETE USER}
const deleteUser = async ( userId ) => {
  await axios.delete(
    `${ process.env.REACT_APP_BASE_URL }/users/delete-user/${ userId }`,
    {
      headers: {
        'company_id': JSON.parse( localStorage.getItem( "user" ) ).company_id
      }
    }
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation( {
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate the users query to refresh the list
      queryClient.invalidateQueries( [ 'users' ] );
    },
    onError: ( error ) => {
      console.error( 'Error deleting user:', error );
    }
  } );
};

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 1. FETCH ALL APPLICATIONS
 */
const fetchApplicationStatuses = async ({ filters, page, limit }) => {
  const queryParams = new URLSearchParams(filters).toString();
  // Try to get companyId from filters first, fallback to localStorage
  const companyId = filters?.company_id || JSON.parse(localStorage.getItem("user") || "{}").company_id;
  const res = await fetch(
    `${process.env.REACT_APP_BASE_URL}/application-statuses/all-application-statuses?${queryParams}`,
    {
      headers: {
        'Company_id': companyId // Sending company_id in headers
      }
    }
  );
  if (!res.ok) {
    throw new Error("Error fetching applications");
  }
  return res.json();
};

export const useApplicationStatuses = (filters, page, limit) => {
  return useQuery({
    queryKey: ["applicationStatuses", filters, page],
    queryFn: () => fetchApplicationStatuses({ filters, page, limit }),
    keepPreviousData: true,
  });
};

/**
 * 2. ADD APPLICATION
 */
const addApplication = async (formData) => {
  // formData is a plain object here
  const companyId = formData.company_id || JSON.parse(localStorage.getItem("user") || "{}").company_id;
  await axios.post(
    `${process.env.REACT_APP_BASE_URL}/application-statuses/add-application-status`,
    formData, {
    headers: {
      'Company_id': companyId // Send company_id in headers
    }
  }
  );
};

export const useAddApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addApplication,
    onSuccess: () => {
      queryClient.invalidateQueries(["applicationStatuses"]);
    },
  });
};

/**
 * 3. UPDATE APPLICATION
 */
const updateApplicationStatus = async ({ applicationStatusId, formData }) => {
  await axios.put(
    `${process.env.REACT_APP_BASE_URL}/application-statuses/update-application-status/${applicationStatusId}`,
    formData
  );
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["applicationStatuses"]);
    },
  });
};


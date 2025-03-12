import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useManagerApplications = (hiringManagerEmail, page = 1, limit = 2, search = "") => {
    return useQuery({
        queryKey: ["applications", hiringManagerEmail, page, limit, search],
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/application/get-application-hm/${hiringManagerEmail}`,
                    { params: { page, limit, search } }
                );
                return response.data;
            } catch (err) {
                console.error("Error fetching applications:", err?.response?.data?.msg || err.message);
                throw err; // Let React Query handle the error
            }
        },
        
        keepPreviousData: true, // Prevents flickering on pagination
    });
};

export default useManagerApplications;

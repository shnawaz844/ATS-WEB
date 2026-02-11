import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchDashboardStats = async () => {
    const token = localStorage.getItem('usertoken');
    const user = JSON.parse(localStorage.getItem('user'));
    const companyId = user?.company_id;

    if (!token || !companyId) {
        throw new Error('No authentication details found');
    }

    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/hiringmanager/dashboard-stats`, {
        headers: {
            'Authorization': token,
            'Company_id': companyId
        }
    });
    return data;
};

export const useHiringManagerDashboardStats = () => {
    return useQuery({
        queryKey: ['hiringManagerDashboardStats'],
        queryFn: fetchDashboardStats,
    });
};


import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const InterviewerDashboard = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [allInterviews, setAllInterviews] = useState([]); // For stats
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roundFilter, setRoundFilter] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [chartView, setChartView] = useState('daily'); // 'daily', 'monthly'

    const companyUserName = localStorage.getItem('companyUserName');

    // Fetch paginated data for the list
    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true);
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const interviewerID = user?._id || user?.id;
                const companyId = localStorage.getItem('companyId') || '';

                if (!interviewerID) {
                    throw new Error("Interviewer ID not found. Please log in again.");
                }

                const queryParams = new URLSearchParams({
                    page,
                    limit,
                    searchTerm,
                    interviewerID,
                    jobID: ''
                });

                if (statusFilter) queryParams.append('filterStatus', statusFilter);
                // if (roundFilter) queryParams.append('filterRound', roundFilter);

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/scheduled-interviewer-app?${queryParams.toString()}`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.interviews) {
                    setInterviews(data.interviews);
                    setTotalPages(data.totalPages || 1);
                } else if (Array.isArray(data)) {
                    setInterviews(data);
                } else {
                    setInterviews([]);
                }

            } catch (err) {
                console.error("Error fetching interviews:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [page, limit, searchTerm, statusFilter, roundFilter]);

    // Fetch all data for stats
    useEffect(() => {
        const fetchAllInterviews = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const interviewerID = user?._id || user?.id;
                const companyId = localStorage.getItem('companyId') || '';

                if (!interviewerID) return;

                const queryParams = new URLSearchParams({
                    page: 1,
                    limit: 1000,
                    interviewerID,
                    jobID: ''
                });

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/scheduled-interviewer-app?${queryParams.toString()}`,
                    {
                        headers: {
                            'company_id': companyId
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.interviews) {
                        setAllInterviews(data.interviews);
                    }
                }
            } catch (err) {
                console.error("Error fetching stats data:", err);
            }
        };

        fetchAllInterviews();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    // Calculate Stats
    const stats = useMemo(() => {
        const total = allInterviews.length;
        const now = new Date();
        const scheduled = allInterviews.filter(i => {
            if (!i.status || i.status.toLowerCase() !== 'scheduled') return false;
            const interviewDate = new Date(i.date || i.interviewDate);
            if (isNaN(interviewDate.getTime())) return false;

            // Check if date is in future
            if (interviewDate > now) return true;

            // Check if date is same day and time is in future
            if (interviewDate.toDateString() === now.toDateString()) {
                if (i.scheduledTime) {
                    const [time, period] = i.scheduledTime.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    const interviewTime = new Date(interviewDate);
                    interviewTime.setHours(hours, minutes, 0, 0);
                    return interviewTime > now;
                }
                return true; // Default to upcoming if no time
            }
            return false;
        }).length;
        const completed = allInterviews.filter(i => i.status === 'Completed').length;
        const cancelled = allInterviews.filter(i => i.status === 'Cancelled').length;
        return { total, scheduled, completed, cancelled };
    }, [allInterviews]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        const dateMap = {};
        const roundMap = {};

        allInterviews.forEach(interview => {
            // Date Grouping
            const dateObj = new Date(interview.date || interview.interviewDate);
            if (!isNaN(dateObj)) {
                let key = '';
                if (chartView === 'daily') {
                    key = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
                } else {
                    key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                }
                dateMap[key] = (dateMap[key] || 0) + 1;
            }

            // Round Grouping
            const roundName = interview?.roundID?.roundName || 'Unknown';
            roundMap[roundName] = (roundMap[roundName] || 0) + 1;
        });

        // Sort dates
        const sortedDates = Object.keys(dateMap).sort();

        return {
            bar: {
                labels: sortedDates,
                datasets: [{
                    label: 'Interviews',
                    data: sortedDates.map(date => dateMap[date]),
                    backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
                    borderRadius: 4,
                }]
            },
            doughnut: {
                labels: Object.keys(roundMap),
                datasets: [{
                    data: Object.values(roundMap),
                    backgroundColor: [
                        '#3B82F6', // Blue
                        '#10B981', // Green
                        '#EF4444', // Red
                        '#F59E0B', // Yellow
                        '#8B5CF6', // Purple
                        '#EC4899', // Pink
                    ],
                    borderWidth: 0,
                }]
            }
        };
    }, [allInterviews, chartView, theme]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
            },
            y: {
                grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280', stepSize: 1 }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: theme === 'dark' ? '#9CA3AF' : '#6B7280'
                }
            }
        }
    };

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Interviewer Dashboard</h1>
                    <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overview of your interview schedule and performance.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Scheduled', value: stats.total, color: 'bg-blue-500', icon: Calendar },
                        { label: 'Upcoming', value: stats.scheduled, color: 'bg-purple-500', icon: Clock },
                        { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: MapPin },
                        { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500', icon: Filter },
                    ].map((stat, idx) => (
                        <div key={idx} className={`p-6 rounded-xl border flex items-center justify-between transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
                            <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Bar Chart */}
                    <div className={`lg:col-span-2 p-6 rounded-xl border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Interview Trends</h2>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setChartView('daily')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartView === 'daily' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setChartView('monthly')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartView === 'monthly' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>
                        <div className="h-64">
                            <Bar data={chartData.bar} options={chartOptions} />
                        </div>
                    </div>

                    {/* Doughnut Chart */}
                    <div className={`p-6 rounded-xl border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
                        <h2 className="text-lg font-semibold mb-6">Rounds Distribution</h2>
                        <div className="h-80 flex justify-center relative">
                            <Doughnut data={chartData.doughnut} options={doughnutOptions} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-3xl font-bold block">{stats.total}</span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewerDashboard;

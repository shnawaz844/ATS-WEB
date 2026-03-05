
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, User, Briefcase, ExternalLink, AlertCircle } from 'lucide-react';
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
import axios from 'axios';

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
    const [allInterviews, setAllInterviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [chartView, setChartView] = useState('daily');
    const companyUserName = localStorage.getItem("companyUserName");
    const [companyDetails, setCompanyDetails] = useState(null);

    const companyId = localStorage.getItem('companyId') || '';
    const user = JSON.parse(localStorage.getItem('user'));
    const interviewerID = user?._id || user?.id;

    useEffect(() => {
        const fetchData = async () => {
            if (!interviewerID) {
                setError("Interviewer ID not found. Please log in again.");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch Stats
                const statsResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/interviewer-stats?interviewerID=${interviewerID}`,
                    { headers: { 'company_id': companyId } }
                );
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch Recent/Upcoming Interviews (paginated or limited)
                const queryParams = new URLSearchParams({
                    page: 1,
                    limit: 5,
                    interviewerID,
                    jobID: ''
                });

                const interviewsResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/scheduled-interviewer-app?${queryParams.toString()}`,
                    { headers: { 'company_id': companyId } }
                );

                if (interviewsResponse.ok) {
                    const data = await interviewsResponse.json();
                    setInterviews(data.interviews || []);
                }

                // Fetch all for charts
                const allInterviewsResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/applicationscheduledlist/scheduled-interviewer-app?page=1&limit=1000&interviewerID=${interviewerID}`,
                    { headers: { 'company_id': companyId } }
                );
                if (allInterviewsResponse.ok) {
                    const allData = await allInterviewsResponse.json();
                    setAllInterviews(allData.interviews || []);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [interviewerID, companyId]);

    // Fetch company details based on companyUserName
    useEffect(() => {
        const stored = localStorage.getItem("companyUserName");
        const company = companyUserName || stored;
        if (!company) return;

        axios
            .get(`${process.env.REACT_APP_BASE_URL}/companies/companies/${company}`)
            .then((res) => {
                setCompanyDetails(res.data);
                localStorage.setItem("companyUserName", company);
            })
            .catch((err) => {
                console.error("Error fetching company details:", err);
            });
    }, [companyUserName]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        const dateMap = {};
        const roundMap = {};

        allInterviews.forEach(interview => {
            const dateObj = new Date(interview.date || interview.interviewDate);
            if (!isNaN(dateObj)) {
                let key = '';
                if (chartView === 'daily') {
                    key = dateObj.toLocaleDateString('en-CA');
                } else {
                    key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                }
                dateMap[key] = (dateMap[key] || 0) + 1;
            }

            const roundName = interview?.roundID?.roundName || 'General';
            roundMap[roundName] = (roundMap[roundName] || 0) + 1;
        });

        const sortedDates = Object.keys(dateMap).sort();

        return {
            bar: {
                labels: sortedDates.slice(-7), // Last 7 periods
                datasets: [{
                    label: 'Interviews',
                    data: sortedDates.slice(-7).map(date => dateMap[date]),
                    backgroundColor: theme === 'dark' ? '#3B82F6' : '#2563EB',
                    borderRadius: 8,
                    barThickness: 20,
                }]
            },
            doughnut: {
                labels: Object.keys(roundMap),
                datasets: [{
                    data: Object.values(roundMap),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            }
        };
    }, [allInterviews, chartView, theme]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#1f2937',
                bodyColor: theme === 'dark' ? '#9ca3af' : '#4b5563',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280', font: { size: 11 } }
            },
            y: {
                grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280', stepSize: 1, font: { size: 11 } }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#1f2937',
                bodyColor: theme === 'dark' ? '#9ca3af' : '#4b5563',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        }
    };

    if (loading && !interviews.length) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Interviewer Dashboard
                        </h1>
                        <p className={`mt-2 text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage your schedules, evaluate candidates, and track your performance.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/${companyUserName}/scheduled-interview`)}
                        className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        View All Interviews
                        <ChevronRight className="ml-2 w-4 h-4" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Assigned', value: stats.total, color: 'from-blue-500 to-blue-600', icon: Briefcase, shadow: 'shadow-blue-500/20' },
                        { label: 'Upcoming', value: stats.scheduled, color: 'from-amber-500 to-orange-600', icon: Clock, shadow: 'shadow-orange-500/20' },
                        { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-teal-600', icon: Calendar, shadow: 'shadow-emerald-500/20' },
                        { label: 'Success Rate', value: `${stats.total ? Math.round((stats.completed / (stats.total - stats.cancelled || 1)) * 100) : 0}%`, color: 'from-indigo-500 to-purple-600', icon: User, shadow: 'shadow-purple-500/20' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`relative overflow-hidden p-6 rounded-2xl border transition-all hover:-translate-y-1 ${theme === 'dark' ? 'bg-[#121212]/50 border-gray-800 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'} ${stat.shadow}`}>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-full`}></div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Charts Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bar Chart */}
                        <div className={`p-6 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-[#121212]/50 border-gray-800 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold flex items-center">
                                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                                    Interview Activity
                                </h2>
                                <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
                                    {['daily', 'monthly'].map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setChartView(view)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chartView === view ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                                        >
                                            {view.charAt(0).toUpperCase() + view.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <Bar data={chartData.bar} options={chartOptions} />
                            </div>
                        </div>

                        {/* Recent Interviews Table */}
                        <div className={`overflow-hidden rounded-3xl border ${theme === 'dark' ? 'bg-[#121212]/50 border-gray-800 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center">
                                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                                    Recent & Upcoming
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-800/30 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                                            <th className="px-6 py-4">Candidate</th>
                                            <th className="px-6 py-4">Job Role</th>
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {interviews.length > 0 ? (
                                            interviews.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                                                {item.applicationID?.candidateID?.userName?.charAt(0) || 'C'}
                                                            </div>
                                                            <span className="font-semibold">{item.applicationID?.candidateID?.userName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.applicationID?.jobID?.title || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{item.date || item.interviewDate}</span>
                                                            <span className="text-xs text-gray-400">{item.scheduledTime}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${String(item.status?.applicationStatus || item.status || "").toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            String(item.status?.applicationStatus || item.status || "").toLowerCase() === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}>
                                                            {item.status?.applicationStatus || item.status || 'Scheduled'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => navigate(`/interviewer/interview/${item._id}`)}
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-500"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                    No interviews found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Rounds Distribution */}
                        <div className={`p-6 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-[#121212]/50 border-gray-800 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <h2 className="text-xl font-bold mb-8 flex items-center">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>
                                Round Types
                            </h2>
                            <div className="h-[280px] flex justify-center relative">
                                <Doughnut data={chartData.doughnut} options={doughnutOptions} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-10">
                                    <div className="text-center">
                                        <span className="text-4xl font-black block">{stats.total}</span>
                                        <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Tip / Quote */}
                        <div className={`p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-600/20`}>
                            <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
                            <h3 className="text-lg font-bold mb-2">Interviewer Tip</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed italic">
                                "The goal of an interview is not to find a reason to say 'no', but to find the unique strengths the candidate can bring to the team."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewerDashboard;

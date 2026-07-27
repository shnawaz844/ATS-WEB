import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useHiringManagerDashboardStats } from '../../hooks/useHiringManager';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

// Icon Components
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// Stats Component
const Stats = ({ stats }) => {
    const { theme } = useTheme();

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className={`rounded-xl shadow-md border p-6 transition-all duration-300 ${theme === 'dark'
                    ? 'bg-white/5 border-gray-600 text-gray-100'
                    : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'
                    }`}>
                    <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                        <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Charts Component
const DashboardCharts = ({ statusCounts, monthlyApplications }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Donut Chart Data (Status Distribution)
    const donutLabels = Object.keys(statusCounts || {});
    const donutValues = Object.values(statusCounts || {});
    const totalApplications = donutValues.reduce((a, b) => a + b, 0);

    const donutColors = [
        'rgba(147, 51, 234, 0.8)', // Purple
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(16, 185, 129, 0.8)', // Green
        'rgba(245, 158, 11, 0.8)', // Yellow
        'rgba(239, 68, 68, 0.8)',  // Red
        'rgba(107, 114, 128, 0.8)', // Gray
    ];

    const donutData = {
        labels: donutLabels,
        datasets: [
            {
                data: donutValues,
                backgroundColor: donutColors,
                borderColor: isDark ? 'rgba(0,0,0,0.2)' : '#ffffff',
                borderWidth: 2,
                cutout: '70%', // Make doughnut thinner
            },
        ],
    };

    // Bar Chart Data
    const barLabels = monthlyApplications?.map(item => item.month) || [];
    const barValues = monthlyApplications?.map(item => item.count) || [];

    const barData = {
        labels: barLabels,
        datasets: [
            {
                label: 'Applications',
                data: barValues,
                backgroundColor: 'rgba(147, 51, 234, 0.8)',
                borderRadius: 4,
                hoverBackgroundColor: 'rgba(147, 51, 234, 1)',
            },
        ],
    };

    const donutOptions = {
        plugins: {
            legend: {
                display: false, // Hide default legend
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? '#fff' : '#111',
                bodyColor: isDark ? '#fff' : '#111',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                borderWidth: 1,
            }
        },
        maintainAspectRatio: false,
    };

    const barOptions = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? '#fff' : '#111',
                bodyColor: isDark ? '#fff' : '#111',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#4b5563',
                    stepSize: 1
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#4b5563',
                }
            }
        },
        maintainAspectRatio: false,
    };

    if (!statusCounts && !monthlyApplications) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart with Custom Legend */}
            <div className={`p-6 rounded-xl shadow-md border transition-all duration-300 ${isDark
                ? 'bg-white/5 border-gray-600'
                : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Application Status</h3>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Chart Circle */}
                    <div className="relative w-48 h-48">
                        <Doughnut data={donutData} options={donutOptions} />
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {totalApplications}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Total
                            </span>
                        </div>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex-1 w-full sm:w-auto">
                        <div className="grid grid-cols-1 gap-3">
                            {donutLabels.map((label, index) => (
                                <div key={label} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: donutColors[index % donutColors.length] }}
                                        />
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {donutValues[index]}
                                        </span>
                                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            ({((donutValues[index] / totalApplications) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar Chart */}
            <div className={`p-6 rounded-xl shadow-md border transition-all duration-300 ${isDark
                ? 'bg-white/5 border-gray-600'
                : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Applications Trend
                    </h3>
                    <select className={`text-xs rounded-lg px-2 py-1 border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
                        <option>Last 6 Months</option>
                    </select>
                </div>
                <div className="h-64 cursor-crosshair">
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );
};

// Recent Applications Component (Cards)
const RecentApplications = ({ applications }) => {
    const { theme } = useTheme();

    if (!applications || applications.length === 0) {
        return (
            <div className={`p-6 text-center rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-gray-600 text-gray-400' : 'bg-white/80 border-purple-200 text-gray-500'}`}>
                No recent applications found.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                    <div key={app.id} className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/30'
                        : 'bg-white border-purple-50 hover:border-purple-200'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-2">
                                <h3 className={`font-bold text-lg truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`} title={app.applicantName}>
                                    {app.applicantName}
                                </h3>
                                <p className={`text-sm mt-1 truncate ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} title={app.jobTitle}>
                                    {app.jobTitle}
                                </p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${app.status === 'Offered' ? (theme === 'dark' ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-200') :
                                app.status === 'Interview' ? (theme === 'dark' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200') :
                                    app.status === 'Shortlisted' ? (theme === 'dark' ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200') :
                                        (theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200')
                                }`}>
                                {app.status}
                            </span>
                        </div>

                        <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium ${theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                            <span>Applied</span>
                            <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Summary Cards Component
const SummaryCards = ({ statusCounts }) => {
    const { theme } = useTheme();

    if (!statusCounts) return null;

    const getStatusStyle = (status) => {
        const isDark = theme === 'dark';
        if (status.includes('Offered') || status.includes('Hired')) return isDark ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
        if (status.includes('Interview')) return isDark ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
        if (status.includes('Shortlist')) return isDark ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
        if (status.includes('Screening')) return isDark ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className={`rounded-xl shadow-md border p-6 transition-all duration-300 ${theme === 'dark'
                    ? 'bg-white/5 border-gray-600'
                    : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'}`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{status}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(status)}`}>
                            {count}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Main Dashboard Component
export default function HiringDashboard() {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: dashboardData, isLoading, error } = useHiringManagerDashboardStats();

    const filteredRecentApps = dashboardData?.recentApplications?.filter(app =>
        (app.applicantName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={`min-h-screen p-6 flex items-center justify-center ${theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen p-6 flex items-center justify-center ${theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-500">Error loading dashboard</h2>
                    <p className="mt-2 text-gray-500">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${theme === "dark"
            ? "bg-black"
            : ""}`}>

            <div className="max-w-7xl mx-auto space-y-8 ">
                {/* Header Section */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between  rounded-xl p-4 transition-colors duration-300 ${theme === 'dark' ? ' border border-gray-600 hover:shadow-xl hover:border-purple-500/50' : 'backdrop-blur-xl bg-gray-200 shadow-md'
                    }`}>
                    <div>
                        <h1 className={`text-3xl font-bold transition-colors duration-300 ${theme === "dark" ? "text-[#9333ea]" : "text-[#9333ea]"}`}>
                            HR Dashboard
                        </h1>
                        <p className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-800"}`}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Search and Actions */}
                    {/* <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                className={`rounded-full block w-full sm:w-64 pl-10 pr-3 py-2.5 border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${theme === 'dark'
                                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white/50 border-white/50 text-gray-900 placeholder-gray-500 shadow-sm'
                                    }`}
                                placeholder="Search recent applications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className={`p-2.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white/50 hover:bg-white/80 text-gray-600 shadow-sm'}`}>
                                <CalendarIcon />
                            </button>
                            <button className={`p-2.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white/50 hover:bg-white/80 text-gray-600 shadow-sm'}`}>
                                <BellIcon />
                            </button>
                            <button className={`p-2.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white/50 hover:bg-white/80 text-gray-600 shadow-sm'}`}>
                                <SettingsIcon />
                            </button>
                        </div>
                    </div> */}
                </div>

                {/* Stats Section */}
                <Stats stats={dashboardData?.stats} />

                {/* Dashboard Charts */}
                <DashboardCharts
                    statusCounts={dashboardData?.statusCounts}
                    monthlyApplications={dashboardData?.monthlyApplications}
                />

                {/* Summary Cards */}
                <SummaryCards statusCounts={dashboardData?.statusCounts} />

                {/* Recent Applications */}
                <RecentApplications applications={filteredRecentApps} />
            </div>
        </div>
    );
}

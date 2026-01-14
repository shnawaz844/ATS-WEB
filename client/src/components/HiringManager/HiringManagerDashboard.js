import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

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

// Application Data
const initialApplications = [
    { id: 1, jobTitle: "Senior React Developer", jobField: "Development", applicantName: "John Smith", email: "john.smith@email.com", status: "Interview", experience: "5 years", appliedDate: "2025-01-15", skills: ["React", "Node.js", "TypeScript"], stage: "Technical Round" },
    { id: 2, jobTitle: "UX Designer", jobField: "Design", applicantName: "Emily Brown", email: "emily.b@email.com", status: "Screening", experience: "3 years", appliedDate: "2025-01-18", skills: ["Figma", "UI/UX", "Wireframing"], stage: "Initial Screening" },
    { id: 3, jobTitle: "Product Manager", jobField: "Management", applicantName: "Michael Chen", email: "m.chen@email.com", status: "Shortlisted", experience: "7 years", appliedDate: "2025-01-20", skills: ["Agile", "Product Strategy", "Team Leadership"], stage: "HR Round" },
    { id: 4, jobTitle: "DevOps Engineer", jobField: "Operations", applicantName: "Sarah Wilson", email: "sarah.w@email.com", status: "Rejected", experience: "4 years", appliedDate: "2025-01-10", skills: ["AWS", "Docker", "Jenkins"], stage: "Technical Round" },
    { id: 5, jobTitle: "Senior React Developer", jobField: "Development", applicantName: "David Lee", email: "david.lee@email.com", status: "Offered", experience: "6 years", appliedDate: "2025-01-12", skills: ["React", "Redux", "JavaScript"], stage: "Final Round" }
];

// Stats Component
const Stats = () => {
    const { theme } = useTheme();
    const totalApplications = initialApplications.length;
    const activeApplications = initialApplications.filter(app =>
        ["Interview", "Screening", "Shortlisted"].includes(app.status)).length;
    const offerRate = (initialApplications.filter(app => app.status === "Offered").length / totalApplications * 100).toFixed(1);
    const avgExperience = (initialApplications.reduce((acc, app) =>
        acc + parseInt(app.experience), 0) / totalApplications).toFixed(1);

    const stats = [
        { title: 'Total Applications', value: totalApplications, change: '+12.5%', trend: 'up' },
        { title: 'Active Applications', value: activeApplications, change: '+2.4%', trend: 'up' },
        { title: 'Offer Rate', value: `${offerRate}%`, change: '+3.2%', trend: 'up' },
        { title: 'Avg. Experience', value: `${avgExperience} years`, change: '+1.5%', trend: 'up' },
    ];

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

// Recent Applications Table
const RecentApplications = ({ applications }) => {
    const { theme } = useTheme();
    return (
        <div className={`rounded-xl shadow-md border overflow-hidden transition-all duration-300 ${theme === 'dark'
            ? 'bg-transparent border-gray-600'
            : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-purple-600/30">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h2>
            </div>
            <div className={`overflow-x-auto ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={theme === 'dark' ? 'bg-[#313131]' : 'bg-gray-200'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Applicant</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Position</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Stage</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Applied Date</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {applications.map((app) => (
                            <tr key={app.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-900/10 bg-white/10' : 'hover:bg-purple-50/30'}`}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{app.applicantName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{app.jobTitle}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${app.status === 'Offered' ? theme === 'dark' ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200' :
                                        app.status === 'Interview' ? theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200' :
                                            app.status === 'Shortlisted' ? theme === 'dark' ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200' :
                                                app.status === 'Screening' ? theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    theme === 'dark' ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{app.stage}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{app.appliedDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Summary Cards Component
const SummaryCards = ({ applications }) => {
    const { theme } = useTheme();
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const getStatusStyle = (status) => {
        const isDark = theme === 'dark';
        switch (status) {
            case 'Offered': return isDark ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Interview': return isDark ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Shortlisted': return isDark ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
            case 'Screening': return isDark ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return isDark ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
        }
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
                    <div className="flex items-center gap-4">
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
                                placeholder="Search applications..."
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
                    </div>
                </div>

                {/* Stats Section */}
                <Stats />

                {/* Summary Cards */}
                <SummaryCards applications={initialApplications} />

                {/* Recent Applications */}
                <RecentApplications applications={initialApplications} />
            </div>
        </div>
    );
}
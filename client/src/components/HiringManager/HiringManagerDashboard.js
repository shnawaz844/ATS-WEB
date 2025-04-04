import React, { useState } from 'react';

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
    { id: 1, jobTitle: "Senior React Developer", jobField: "Development", applicantName: "John Smith", email: "john.smith@email.com", status: "Interview", experience: "5 years", appliedDate: "2025-01-15", skills: [ "React", "Node.js", "TypeScript" ], stage: "Technical Round" },
    { id: 2, jobTitle: "UX Designer", jobField: "Design", applicantName: "Emily Brown", email: "emily.b@email.com", status: "Screening", experience: "3 years", appliedDate: "2025-01-18", skills: [ "Figma", "UI/UX", "Wireframing" ], stage: "Initial Screening" },
    { id: 3, jobTitle: "Product Manager", jobField: "Management", applicantName: "Michael Chen", email: "m.chen@email.com", status: "Shortlisted", experience: "7 years", appliedDate: "2025-01-20", skills: [ "Agile", "Product Strategy", "Team Leadership" ], stage: "HR Round" },
    { id: 4, jobTitle: "DevOps Engineer", jobField: "Operations", applicantName: "Sarah Wilson", email: "sarah.w@email.com", status: "Rejected", experience: "4 years", appliedDate: "2025-01-10", skills: [ "AWS", "Docker", "Jenkins" ], stage: "Technical Round" },
    { id: 5, jobTitle: "Senior React Developer", jobField: "Development", applicantName: "David Lee", email: "david.lee@email.com", status: "Offered", experience: "6 years", appliedDate: "2025-01-12", skills: [ "React", "Redux", "JavaScript" ], stage: "Final Round" }
];

// Stats Component
const Stats = () => {
    const totalApplications = initialApplications.length;
    const activeApplications = initialApplications.filter( app =>
        [ "Interview", "Screening", "Shortlisted" ].includes( app.status ) ).length;
    const offerRate = ( initialApplications.filter( app => app.status === "Offered" ).length / totalApplications * 100 ).toFixed( 1 );
    const avgExperience = ( initialApplications.reduce( ( acc, app ) =>
        acc + parseInt( app.experience ), 0 ) / totalApplications ).toFixed( 1 );

    const stats = [
        { title: 'Total Applications', value: totalApplications, change: '+12.5%', trend: 'up' },
        { title: 'Active Applications', value: activeApplications, change: '+2.4%', trend: 'up' },
        { title: 'Offer Rate', value: `${ offerRate }%`, change: '+3.2%', trend: 'up' },
        { title: 'Avg. Experience', value: `${ avgExperience } years`, change: '+1.5%', trend: 'up' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            { stats.map( ( stat, index ) => (
                <div key={ index } className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-500">{ stat.title }</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-2xl font-semibold text-gray-900">{ stat.value }</p>
                        <span className={ `text-sm ${ stat.trend === 'up' ? 'text-green-600' : 'text-red-600' }` }>
                            { stat.change }
                        </span>
                    </div>
                </div>
            ) ) }
        </div>
    );
};

// Recent Applications Table
const RecentApplications = ( { applications } ) => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        { applications.map( ( app ) => (
                            <tr key={ app.id }>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ app.applicantName }</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ app.jobTitle }</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={ `px-2 py-1 text-xs font-semibold rounded-full
                                        ${ app.status === 'Offered' ? 'bg-purple-100 text-purple-800' :
                                            app.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                                                app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800' }` }>
                                        { app.status }
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ app.stage }</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ app.appliedDate }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Summary Cards Component
const SummaryCards = ( { applications } ) => {
    const statusCounts = applications.reduce( ( acc, app ) => {
        acc[ app.status ] = ( acc[ app.status ] || 0 ) + 1;
        return acc;
    }, {} );

    const statusColors = {
        'Offered': 'bg-purple-100 text-purple-800',
        'Interview': 'bg-blue-100 text-blue-800',
        'Shortlisted': 'bg-green-100 text-green-800',
        'Screening': 'bg-yellow-100 text-yellow-800',
        'Rejected': 'bg-red-100 text-red-800'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { Object.entries( statusCounts ).map( ( [ status, count ] ) => (
                <div key={ status } className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{ status }</h3>
                        <span className={ `px-2 py-1 text-xs font-semibold rounded-full ${ statusColors[ status ] }` }>
                            { count }
                        </span>
                    </div>
                </div>
            ) ) }
        </div>
    );
};

// Main Dashboard Component
export default function HiringDashboard() {
    const [ searchQuery, setSearchQuery ] = useState( '' );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */ }
            <nav className="bg-white border-b border-gray-200 w-full z-30 top-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                        </div>

                        {/* Search Bar */ }
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search applications..."
                                    value={ searchQuery }
                                    onChange={ ( e ) => setSearchQuery( e.target.value ) }
                                />
                            </div>

                            {/* Icons */ }
                            <div className="ml-4 flex items-center space-x-4">
                                <button className="p-2 text-gray-400 hover:text-gray-500">
                                    <CalendarIcon />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-500">
                                    <BellIcon />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-500">
                                    <SettingsIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */ }
            <main className="pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Date Display */ }
                    <div className="my-6">
                        <div className="text-sm text-gray-500">
                            { new Date().toLocaleDateString( 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            } ) }
                        </div>
                    </div>

                    {/* Stats Section */ }
                    <div className="mb-8">
                        <Stats />
                    </div>

                    {/* Summary Cards */ }
                    <div className="mb-8">
                        <SummaryCards applications={ initialApplications } />
                    </div>

                    {/* Recent Applications */ }
                    <div className="mt-8">
                        <RecentApplications applications={ initialApplications } />
                    </div>
                </div>
            </main>
        </div>
    );
}
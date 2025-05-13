import React from 'react';

const OverviewTab = ({ job, applications }) => {
    const stages = [
        {
            name: 'Initial Review',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'blue'
        },
        {
            name: 'Screening',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            color: 'purple'
        },
        {
            name: 'Interview',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'indigo'
        },
        {
            name: 'Offer',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'green'
        },
        {
            name: 'Hired',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
            color: 'emerald'
        },
        {
            name: 'Withdrawn',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
            color: 'yellow'
        },
        {
            name: 'Rejected',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'red'
        }
    ];

    // Count applications by status
    const statusCounts = stages.reduce((acc, stage) => {
        acc[stage.name] = 0;
        return acc;
    }, {});

    applications?.forEach((app) => {
        const { applicationStatus } = app;
        if (statusCounts[applicationStatus] !== undefined) {
            statusCounts[applicationStatus] += 1;
        }
    });

    const totalApplications = applications?.length || 0;

    const getColorClasses = (color) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-700 ring-blue-700/10',
            purple: 'bg-purple-50 text-purple-700 ring-purple-700/10',
            indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
            green: 'bg-green-50 text-green-700 ring-green-700/10',
            emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10',
            yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-700/10',
            red: 'bg-red-50 text-red-700 ring-red-700/10'
        };
        return colorMap[color];
    };

    return (
        <div className="space-y-8">
            {/* Summary Section */}
            <div className="bg-slate-300 rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Application Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-blue-600 font-medium">Total Applications</p>
                                <p className="text-2xl font-bold text-blue-800">{totalApplications}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-green-600 font-medium">Hired</p>
                                <p className="text-2xl font-bold text-green-800">{statusCounts['Hired']}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-purple-600 font-medium">In Progress</p>
                                <p className="text-2xl font-bold text-purple-800">
                                    {statusCounts['Initial Review'] + statusCounts['Screening'] + statusCounts['Interview']}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stages Grid */}
            <div className="bg-slate-300 rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-6">Application Stages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stages.map((stage) => (
                        <div
                            key={stage.name}
                            className={`relative rounded-xl ring-1 ${getColorClasses(stage.color)} p-4`}
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-xl bg-slate-300 ${stage.color}-100`}>
                                    {stage.icon}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium">{stage.name}</p>
                                    <p className="text-2xl font-bold">{statusCounts[stage.name]}</p>
                                </div>
                            </div>
                            {totalApplications > 0 && (
                                <div className="mt-4 h-1 bg-gray-200 rounded">
                                    <div
                                        className={`h-1 rounded bg-${stage.color}-600`}
                                        style={{
                                            width: `${(statusCounts[stage.name] / totalApplications) * 100}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
import React from 'react';
import { getStatusColor, getColorStyles } from './utils';
import { useTheme } from '../../../context/ThemeContext';

const StatusSidebar = ({ statuses, statusFilter, setStatusFilter, allApps, getStatusCount, statusCounts, totalApplications }) => {
    const { theme } = useTheme();
    return (
        <div className="flex-shrink-0 self-start">
            <div className={`p-4 rounded-xl border sm:w-64 w-80 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-white/10 gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Application Status</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${statusFilter === ''
                            ? (theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700')
                            : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <span>All Applications</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {totalApplications || allApps?.length}
                            </span>
                        </div>
                    </button>
                    {statuses?.map(status => {
                        const colorName = status.color || getStatusColor(status.applicationStatus);
                        const isSelected = statusFilter === status._id;
                        const count = statusCounts ? (statusCounts[status._id] || 0) : getStatusCount(status._id);

                        return (
                            <button
                                key={status._id}
                                onClick={() => setStatusFilter(status._id)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                                style={isSelected ? {
                                    backgroundColor: theme === 'dark' ? getColorStyles(colorName, 800) : getColorStyles(colorName, 50),
                                    color: theme === 'dark' ? getColorStyles(colorName, 100) : getColorStyles(colorName, 700)
                                } : {
                                    color: theme === 'dark' ? '#d1d5db' : '#374151'
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <span
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: getColorStyles(colorName, 500) }}
                                        ></span>
                                        <span>{status.applicationStatus}</span>
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs"
                                        style={{
                                            backgroundColor: theme === 'dark' ? getColorStyles(colorName, 800) : getColorStyles(colorName, 100),
                                            color: theme === 'dark' ? getColorStyles(colorName, 100) : getColorStyles(colorName, 700)
                                        }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusSidebar;

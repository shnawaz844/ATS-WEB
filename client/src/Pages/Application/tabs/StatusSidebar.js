import React from 'react';
import { getStatusColor, getColorStyles } from './utils';

const StatusSidebar = ({ statuses, statusFilter, setStatusFilter, allApps, getStatusCount }) => {
    return (
        <div className="flex-shrink-0 self-start">
            <div className="bg-gray-300 p-4 rounded-xl border border-gray-200 sm:w-64 w-80 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Application Status</h3>
                <div className="space-y-2">
                    <button
                        onClick={ () => setStatusFilter( '' ) }
                        className={ `w-full text-left px-3 py-2 rounded-md text-sm ${ statusFilter === '' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50' }` }
                    >
                        <div className="flex justify-between items-center">
                            <span>All Applications</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                { allApps?.length }
                            </span>
                        </div>
                    </button>
                    { statuses?.map( status => {
                        const colorName = status.color || getStatusColor( status.applicationStatus );
                        const isSelected = statusFilter === status._id;

                        return (
                            <button
                                key={ status._id }
                                onClick={ () => setStatusFilter( status._id ) }
                                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                                style={ isSelected ? {
                                    backgroundColor: getColorStyles( colorName, 50 ),
                                    color: getColorStyles( colorName, 700 )
                                } : {} }
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <span
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={ { backgroundColor: getColorStyles( colorName, 500 ) } }
                                        ></span>
                                        <span>{ status.applicationStatus }</span>
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs"
                                        style={ {
                                            backgroundColor: getColorStyles( colorName, 100 ),
                                            color: getColorStyles( colorName, 700 )
                                        } }
                                    >
                                        { getStatusCount( status._id ) }
                                    </span>
                                </div>
                            </button>
                        );
                    } ) }
                </div>
            </div>
        </div>
    );
};

export default StatusSidebar;
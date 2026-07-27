import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import CandidateInfo from './tabs/CandidateInfo';
import ApplicationTabs from './tabs/ApplicationTabs';
import { ChevronLeft } from 'lucide-react'

const CandidateDetailsPage = () => {
    const { candidateId, jobId } = useParams();
    const [activeTab, setActiveTab] = useState('resume');
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/application/candidate-details/${candidateId}/${jobId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch application data');
                }
                const data = await response.json();
                setApplicationData(data.applications || {});
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchApplicationDetails();
    }, [candidateId, jobId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader className="w-10 h-10 animate-spin text-blue-500" />
                <p className="mt-2 text-gray-600">Loading application details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (

        <div className="px-8 py-10 w-full min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
            <button
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400 transition-colors mb-5"
                onClick={() => window.history.back()}
            >
                <ChevronLeft size={18} />
                <span className="ml-1">Back</span>
            </button>
            <h1 className="text-3xl font-bold mb-4">Candidate Details</h1>
            <CandidateInfo applicationData={applicationData} />
            <ApplicationTabs activeTab={activeTab} setActiveTab={setActiveTab} applicationData={applicationData} />
        </div>
    );
};

export default CandidateDetailsPage;


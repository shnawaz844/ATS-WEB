import React from 'react';
import ResumeTab from './ResumeTab';
import DetailsTab from './DetailsTab';
import QATab from './QATab';
import OtherApplicationsTab from './OtherApplicationsTab';

const ApplicationTabs = ({ activeTab, setActiveTab, applicationData }) => {
    const tabs = [
        { id: 'resume', label: 'CV / Resume' },
        { id: 'details', label: 'Applicant Details' },
        // { id: 'qa', label: 'Q&A' },
        // { id: 'other', label: 'Other Applications' }
    ];
    console.log("applicationData>>>>>", applicationData);
    return (
        <>
            <div className="flex space-x-6 border-b pb-2 mb-6 border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-6 text-lg font-semibold transition-all duration-300 rounded-lg 
                            ${activeTab === tab.id
                                ? 'border-b-4 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 hover:border-b-4 hover:border-blue-300 dark:hover:border-blue-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                {activeTab === 'resume' && <ResumeTab applicationData={applicationData} />}
                {activeTab === 'details' && <DetailsTab applicationData={applicationData} />}
                {activeTab === 'qa' && <QATab applicationData={applicationData} />}
                {activeTab === 'other' && <OtherApplicationsTab candidateId={applicationData?.candidateID?._id} />}
            </div>
        </>
    );
};

export default ApplicationTabs;


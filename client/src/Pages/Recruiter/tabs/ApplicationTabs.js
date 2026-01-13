import React from 'react';
import ResumeTab from './ResumeTab';
import DetailsTab from './DetailsTab';
import QATab from './QATab';
import OtherApplicationsTab from './OtherApplicationsTab';

const ApplicationTabs = ({ activeTab, setActiveTab, applicationData }) => {
    const tabs = [
        { id: 'resume', label: 'CV / Resume' },
        { id: 'details', label: 'Applicant Details' },
        { id: 'qa', label: 'Q&A' },
        { id: 'other', label: 'Other Applications' }
    ];
    console.log("applicationData>>>>>", applicationData);
    return (
        <>
            <div className="flex space-x-6 border-b-2 pb-2 mb-6 border-gray-300">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-6 text-lg font-semibold transition-all duration-300 rounded-lg 
                            ${activeTab === tab.id
                                ? 'border-b-4 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-blue-500 hover:border-b-4 hover:border-blue-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6 rounded-lg shadow-lg">
                {activeTab === 'resume' && <ResumeTab applicationData={applicationData} />}
                {activeTab === 'details' && <DetailsTab applicationData={applicationData} />}
                {activeTab === 'qa' && <QATab applicationData={applicationData} />}
                {activeTab === 'other' && <OtherApplicationsTab candidateId={applicationData?.candidateID?._id} />}
            </div>
        </>
    );
};

export default ApplicationTabs;

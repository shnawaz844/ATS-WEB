import React, { useState, useEffect, useCallback } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';
import OverviewTab from './tabs/OverviewTab';
import ApplicationsListTab from './tabs/ApplicationsListTab';
import JobDetailsTab from './tabs/JobDetailsTab';
import { ChevronLeft } from 'lucide-react'

const ApplicationJobDetail = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const companyUserName = localStorage.getItem( "companyUserName" );
    const [page, setPage] = useState('1');
    const [limit, setLimit] = useState('5');
    const [search, setSearch] = useState('')
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('applications');
    const navigate = useNavigate();
    // NEW: state for job-statuses
    const [ jobStatuses, setJobStatuses ] = useState( [] );
     const [ statusMap, setStatusMap ] = useState( {} );
     const [ loadingStatuses, setLoadingStatuses ] = useState( false );
    const [ toggleCount, setToggleCount ] = useState( 0 );

    const onStatusChange = useCallback( () => {
        setToggleCount( count => count + 1 );
    }, [] );


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const jobRes = await fetch( `${ process.env.REACT_APP_BASE_URL }/jobs/current-job/${id}`);
                if (!jobRes.ok) throw new Error('Error fetching job data');
                const jobData = await jobRes.json();

                const appsRes = await fetch( `${ process.env.REACT_APP_BASE_URL }/application/job/${id}?page=${page}&limit=${limit}&search=${search}`);
                if (!appsRes.ok) throw new Error('Error fetching applications');
                const appsData = await appsRes.json();

                setJob(jobData);
                setApplications(appsData);
            } catch (err) {
                console.error(err);
                setError('Failed to load job data or applications.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, page, limit, search,toggleCount]);

    // NEW: fetch job-statuses on mount
    useEffect( () => {
       const fetchJobStatuses = async () => {
         setLoadingStatuses( true );
         try {
           const storedUser = JSON.parse( localStorage.getItem( 'user' ) );
           const companyId = storedUser?.company_id;
           if ( !companyId ) return;
   
           const response = await fetch(
             `${ process.env.REACT_APP_BASE_URL }/job-statuses/all-job-statuses`,
             { headers: { company_id: companyId } }
           );
           const data = await response.json();
           if ( data.jobStatuses && Array.isArray( data.jobStatuses ) ) {
             setJobStatuses( data.jobStatuses );
             const mapping = {};
             data.jobStatuses.forEach( entry => {
               mapping[ entry._id ] = entry.jobStatus;
             } );
             setStatusMap( mapping );
           }
         } catch ( error ) {
           console.error( 'Error fetching job statuses:', error );
         } finally {
           setLoadingStatuses( false );
         }
       };
   
       fetchJobStatuses();
     }, [] );

    const capitalizeFirstLetter = ( str ) => {
        if ( !str ) return '';
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
    };


    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">No job found.</p>
            </div>
        );
    }

    const { title, status: statusId } = job;
    const displayStatus = statusMap[ statusId ] || statusId;
    const candidateCount = applications.applications.length;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="px-8 py-10 w-full min-h-screen"
            style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <button
                className="flex items-center text-gray-700 hover:text-gray-500 transition-colors ml-10"
                onClick={() => window.history.back()}
            >
                <ChevronLeft size={18} />
                <span className="ml-1">Back</span>
            </button>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-gray-700 rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">

                        {/* Left Side: Title + Tags */ }
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                { capitalizeFirstLetter( title ) || 'Untitled Job' }
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <span className={ `bg-gray-400 inline-flex items-center px-3 py-1 rounded-full text-sm text-white font-medium ${ getStatusColor( displayStatus ) }` }>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    { capitalizeFirstLetter( displayStatus ) || 'N/A' }
                                </span>
                                <span className="inline-flex bg-gray-400 items-center px-3 py-1 rounded-full text-white text-sm font-medium">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    { candidateCount } Candidates
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Button */ }
                        <div>
                            <button
                                onClick={ () => navigate( `/${ companyUserName }/current-job/${ id }` ) }
                                className="bg-gray-400 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                            >
                                Create Application
                            </button>
                        </div>

                    </div>
                </div>


                {/* Tabs Navigation */}
                <div className="bg-transparent rounded-xl shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                {
                                    id: 'overview', name: 'Overview', icon: (
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'applications', name: 'Applications', icon: (
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'details', name: 'Job Details', icon: (
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )
                                }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm text-gray-700
                                        ${activeTab === tab.id
                                            ? 'border-white text-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    <span className="ml-2">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        { activeTab === 'overview' && <OverviewTab job={job} applications={applications.applications} />}
                        {activeTab === 'applications' &&
                            <ApplicationsListTab
                            job={ job }
                            onStatusChange={ onStatusChange }
                                applications={applications.applications}
                                page={page}
                                limit={limit}
                                search={search}
                                setPage={setPage}
                                setLimit={setLimit}
                                setSearch={setSearch}
                                currentPage={applications.currentPage}
                                totalApplications={applications.totalApplications}
                                totalPages={applications.totalPages}
                            />}
                        {activeTab === 'details' && <JobDetailsTab job={job} setJob={setJob} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationJobDetail;
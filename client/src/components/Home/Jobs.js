// src/components/Hero/Jobs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, Award, Building } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const Jobs = () => {
    const { companyUserName } = useParams();

    // 1) State for company details & ID
    const [ companyDetails, setCompanyDetails ] = useState( null );
    const companyId = companyDetails?._id;

    // 2) State for jobs
    const [ jobs, setJobs ] = useState( [] );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );

    // 3) Fetch company details (to get the _id)
    useEffect( () => {
        // prefer URL param, fallback to localStorage
        const stored = localStorage.getItem( "companyUserName" );
        const company = companyUserName || stored;
        if ( !company ) return;

        axios
            .get( `http://localhost:8080/companies/companies/${ company }` )
            .then( ( res ) => {
                setCompanyDetails( res.data );
                // also store in localStorage so you never lose it
                localStorage.setItem( "companyUserName", company );
            } )
            .catch( ( err ) => {
                console.error( "Error fetching company details:", err );
            } );
    }, [ companyUserName ] );

    // 4) Fetch jobs once we know companyId
    useEffect( () => {
        if ( !companyId ) return;           // wait for companyId
        setLoading( true );
        setError( null );

        axios
            .get( "http://localhost:8080/jobs/all-jobs", {
                headers: { company_id: companyId }
            } )
            .then( ( res ) => {
                // normalize array
                const data = res.data;
                let list = [];
                if ( Array.isArray( data ) ) list = data;
                else if ( Array.isArray( data.jobs ) ) list = data.jobs;
                else if ( Array.isArray( data.data ) ) list = data.data;
                else console.warn( "Unexpected jobs payload:", data );
                setJobs( list );
            } )
            .catch( ( err ) => {
                console.error( "Failed to fetch jobs:", err );
                setError( err.message );
            } )
            .finally( () => {
                setLoading( false );
            } );
    }, [ companyId ] );

    // 5) Loading / error / empty states
    if ( loading ) {
        return <div className="text-center py-8 text-white">Loading jobs…</div>;
    }
    if ( error ) {
        return (
            <div className="text-center py-8 text-red-400">
                Error loading jobs: { error }
            </div>
        );
    }
    if ( jobs.length === 0 ) {
        return (
            <div className="text-center py-8 text-slate-300">No jobs found.</div>
        );
    }

    // 6) Render the cards
    return (
        <div className="py-24 bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Featured Jobs
                    </h2>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Discover top opportunities from companies using our platform
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    { jobs.map( ( job ) => (
                        <Card key={ job._id || job.id } job={ job } />
                    ) ) }
                </div>

                <div className="text-center mt-12">
                    <Link
                        to={
                            companyUserName
                                ? `/${ companyUserName }/all-posted-jobs`
                                : "/all-posted-jobs"
                        }
                    >
                        <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                            View All Jobs
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Card component for displaying each job
const Card = ( { job } ) => {
    return (
        <div className="bg-transparent rounded-xl shadow-lg overflow-hidden border border-gray-500 hover:shadow-xl transition-all group">
            <div className="p-5">
                <h2 className="text-lg font-bold text-white capitalize">
                    { job.title || "Software Engineer" }
                </h2>
                <p className="text-sm text-white">
                    { job.type } | { job.scheduleType }
                </p>
                <p className="text-sm text-white">
                    { job.city }, { job.state } | { job.locationType }
                </p>
                <p className="text-sm text-white">₹{ job.compensation }/Annum</p>

                <div className="text-sm text-white mb-4 line-clamp-3">
                    <div dangerouslySetInnerHTML={ { __html: job.description } } />
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">{ job.experienceRequired } Years Experience.</div>
                    <div className="flex space-x-2">
                        <button className="bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition-colors text-sm">
                            View Details
                        </button>
                        <Link to={ `/current-job/${ job._id || job.id }` }>
                            <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors">
                                Apply Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Jobs;

// src/components/Hero/Jobs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, Award, Building } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const Jobs = () => {
    // grab the param or fall back to whatever’s in localStorage
    const { companyUserName } = useParams();
    const storedSlug = localStorage.getItem( "companyUserName" );
    const slug = companyUserName || storedSlug;

    // 1) track company‐fetch state
    const [ companyDetails, setCompanyDetails ] = useState( null );
    const [ companyLoading, setCompanyLoading ] = useState( true );
    const [ companyError, setCompanyError ] = useState( false );

    // once we have the company’s _id, we can fetch jobs
    const companyId = companyDetails?._id;

    // 2) track jobs‐fetch state
    const [ jobs, setJobs ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( null );

    // ————————————————————————————
    // STEP A: validate slug & load companyDetails
    // ————————————————————————————
    useEffect( () => {
        // no slug at all? bail out, mark as “error”
        if ( !slug ) {
            setCompanyLoading( false );
            setCompanyError( true );
            return;
        }

        setCompanyLoading( true );
        setCompanyError( false );

        axios
            .get( `${ process.env.BASE_URL }/companies/companies/${ slug }` )
            .then( res => {
                setCompanyDetails( res.data );
                localStorage.setItem( "companyUserName", slug );
                setCompanyLoading( false );
            } )
            .catch( err => {
                console.error( "Invalid company slug:", err );
                setCompanyLoading( false );
                setCompanyError( true );
            } );
    }, [ slug ] );

    // ————————————————————————————
    // STEP B: once we know companyId, fetch jobs
    // ————————————————————————————
    useEffect( () => {
        if ( !companyId ) return;

        setLoading( true );
        setError( null );

        axios
            .get( `${ process.env.BASE_URL }/jobs/all-jobs`, {
                headers: { company_id: companyId }
            } )
            .then( res => {
                // normalize your payload however you like
                const payload = res.data.jobs || res.data.data || res.data;
                setJobs( Array.isArray( payload ) ? payload : [] );
            } )
            .catch( err => {
                console.error( "Failed to fetch jobs:", err );
                setError( err.message || "Unknown error" );
            } )
            .finally( () => setLoading( false ) );
    }, [ companyId ] );

    // ————————————————————————————
    // CONDITIONAL RENDERING
    // ————————————————————————————
    // 1) if slug‑check is still in flight, render nothing
    if ( companyLoading ) return null;

    // 2) if slug was invalid, hide the entire section
    if ( companyError ) return null;

    // 3) otherwise, you can show your normal loading / error / empty states for jobs
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
            <div className="text-center py-8 text-slate-300">
                No jobs found.
            </div>
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
    const companyUserName = localStorage.getItem( "companyUserName" );
    console.log( "companyUserName>>>>>>>", companyUserName )
    return (
        <div className="bg-transparent rounded-xl shadow-lg overflow-hidden border border-gray-500 hover:shadow-xl transition-all group">
            <div className="p-5">
                <h2 className="text-lg font-bold text-white capitalize">
                    { job.title || "" }
                </h2>
                <p className="text-sm text-white pt-2">
                    { job.type } | { job.scheduleType }
                </p>
                <p className="text-sm text-white pt-2">
                    { job.city }, { job.state } | { job.locationType }
                </p>
                <p className="text-sm text-white pt-2">₹{ job.compensation }/Annum</p>

                <div className="text-sm text-white mb-4 line-clamp-3 pt-2">
                    <div dangerouslySetInnerHTML={ { __html: job.description } } />
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">{ job.experienceRequired } Years Experience.</div>
                    <div className="flex space-x-2">
                        <Link to={ `/${ companyUserName }/login` }>
                            <button className="bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition-colors text-sm">
                                View Details
                            </button>
                        </Link>

                        <Link to={ `/${ companyUserName }/login` }>
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

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { ApplicationForm } from "../ApplicationForm/ApplicationForm";
import "react-quill/dist/quill.snow.css";
import { useApplicationTypes } from "../../hooks/useApplication";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Award,
  Building,
  Share2,
  Bookmark,
  ChevronLeft
} from "lucide-react";

export const JobDetails = () => {
  const { id } = useParams();
  const [ job, setJob ] = useState( null );
  const [ loginData, setLoginData ] = useState( null );
  const [ isBookmarked, setIsBookmarked ] = useState( false );

  // 1. Fetch the logged-in user (if any)
  useEffect( () => {
    const token = localStorage.getItem( "user" );
    if ( token ) {
      const user = JSON.parse( token );
      setLoginData( user );
    }
  }, [] );

  // 2. Fetch the job details
  useEffect( () => {
    fetch( `http://localhost:8080/jobs/current-job/${ id }` )
      .then( ( res ) => res.json() )
      .then( ( data ) => setJob( data ) )
      .catch( ( err ) => console.error( "Error fetching job data:", err ) );
  }, [ id ] );

  // 3. We also fetch the application types (and can pass them to the form)
  const {
    data: applicationTypesData,
    isLoading,
    isError,
    error,
  } = useApplicationTypes( {} );

  console.log( "this is types", applicationTypesData );

  const toggleBookmark = () => {
    setIsBookmarked( !isBookmarked );
    // Here you would add logic to save bookmark to user's profile
  };

  if ( !job ) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mb-4"></div>
          <div className="h-4 w-48 bg-blue-100 rounded mb-3"></div>
          <div className="h-3 w-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      <div className="mb-6">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          onClick={ () => window.history.back() }
        >
          <ChevronLeft size={ 18 } />
          <span className="ml-1">Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* -- Left: Job Details Section -- */ }
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium mb-2">
                    <Briefcase size={ 16 } />
                    <span>{ job.department || "Full-time" }</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    { job.title }
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm mb-4">
                    <div className="flex items-center">
                      <Building size={ 16 } className="mr-1" />
                      <span>{ job.companyName || "Company Name" }</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={ 16 } className="mr-1" />
                      <span>
                        { job.city }, { job.state }, { job.country }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={ 16 } className="mr-1" />
                      <span>{ job.locationType }</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={ toggleBookmark }
                    className={ `p-2 rounded-full ${ isBookmarked ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      } transition-colors` }
                    title="Bookmark"
                  >
                    <Bookmark size={ 20 } fill={ isBookmarked ? "currentColor" : "none" } />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Share"
                  >
                    <Share2 size={ 20 } />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-blue-50 p-6 rounded-lg">
              <div className="flex items-start">
                <DollarSign size={ 20 } className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Compensation</p>
                  <p className="font-semibold text-gray-800">₹{ job.compensation }</p>
                </div>
              </div>
              <div className="flex items-start">
                <Award size={ 20 } className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-gray-800">{ job.experienceRequired } years</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar size={ 20 } className="text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Schedule</p>
                  <p className="font-semibold text-gray-800">{ job.scheduleType }</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <ReactQuill
                  value={ job.description }
                  readOnly
                  theme="bubble"
                  className="text-gray-700"
                />
              </div>
            </div>

            { job.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Requirements
                </h2>
                <div className="prose max-w-none">
                  <ReactQuill
                    value={ job.requirements }
                    readOnly
                    theme="bubble"
                    className="text-gray-700"
                  />
                </div>
              </div>
            ) }

            { job.benefits && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Benefits
                </h2>
                <div className="prose max-w-none">
                  <ReactQuill
                    value={ job.benefits }
                    readOnly
                    theme="bubble"
                    className="text-gray-700"
                  />
                </div>
              </div>
            ) }
          </div>
        </div>

        {/* -- Right: Application Form Section -- */ }
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Apply Now</h2>
              <ApplicationForm
                job={ job }
                loginData={ loginData }
                applicationTypesData={ applicationTypesData }
              />
            </div>

            { job.postedDate && (
              <div className="bg-white p-6 rounded-xl shadow-sm text-sm text-gray-500">
                <p>Posted { new Date( job.postedDate ).toLocaleDateString() }</p>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
};
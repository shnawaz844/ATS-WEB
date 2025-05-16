import { useEffect, useRef, Suspense, lazy, useState } from "react";

import ParticlesComponent from '../../components/Login/Particles';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Lazy load components
const HeroSection = lazy( () => import( "./HeroSection" ) );
const PowerfulFeatures = lazy( () => import( "./PowerfulFeatures" ) );
const Stats = lazy( () => import( "./Stats" ) );
const Jobs = lazy( () => import( "./Jobs" ) );
const Testimonials = lazy( () => import( "./Testimonials" ) );
const Cta = lazy( () => import( "./Cta" ) );

export const Hero = () => {
  const featuresRef = useRef( null )
  const statsRef = useRef( null )
  const testimonialsRef = useRef( null )
  const ctaRef = useRef( null )
  const { companyUserName } = useParams();
  const navigate = useNavigate();
  const [ companyData, setCompanyData ] = useState( null );
  const [ isLoading, setIsLoading ] = useState( false );

  // This effect handles fetching company data whenever companyUserName changes
  useEffect( () => {
    // Reset state when companyUserName changes
    setCompanyData( null );

    if ( !companyUserName || companyUserName === "null" ) {
      const stored = localStorage.getItem( "companyUserName" );
      if ( stored && stored !== "" ) {
        navigate( `/${ stored }`, { replace: true } );
      }
      return;
    }

    // Start loading
    setIsLoading( true );

    // Get stored values for comparison
    const storedCompanyUserName = localStorage.getItem( "companyUserName" );
    const storedCompanyId = localStorage.getItem( "companyId" );
    const user = localStorage.getItem( "user" );


    if ( storedCompanyUserName !== companyUserName ) {
      console.log( 'Company mismatch or invalid company user, redirecting...' );
      if ( user ) {
        return;
      }
    }

    // Fetch company data
    axios
      .get( `http://localhost:8080/companies/companies/${ companyUserName }` )
      .then( res => {
        const companyFromApi = res.data;

        // If stored company ID exists but doesn't match API result, redirect to 404
        if ( storedCompanyId && companyFromApi._id !== storedCompanyId &&
          storedCompanyUserName === companyUserName ) {
          console.error( "Company ID mismatch, invalid access." );
          navigate( "/404" );
          return;
        }

        // Update localStorage with new company info
        localStorage.setItem( "companyUserName", companyUserName );
        localStorage.setItem( "companyId", companyFromApi._id );

        // Update state with company data
        setCompanyData( companyFromApi );
        setIsLoading( false );
      } )
      .catch( err => {
        console.error( "Invalid company slug:", err );
        setIsLoading( false );
        navigate( "/404" );
      } );
  }, [ companyUserName, navigate ] );

  // Intersection Observer effect for animations
  useEffect( () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver( ( entries ) => {
      entries.forEach( ( entry ) => {
        if ( entry.isIntersecting ) {
          entry.target.classList.add( "animate-in" );
        }
      } );
    }, observerOptions );

    // Observe all sections with animations
    const sections = [ featuresRef.current, statsRef.current, testimonialsRef.current, ctaRef.current ];
    sections.forEach( ( section ) => {
      if ( section ) observer.observe( section );
    } );

    return () => {
      sections.forEach( ( section ) => {
        if ( section ) observer.unobserve( section );
      } );
    };
  }, [] );


  return (

    <div className="relative min-h-screen overflow-hidden">
      {/* Particles Background */ }
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <ParticlesComponent />
      </div>

      {/* All Sections */ }
      <Suspense fallback={ <div className="text-center py-8">Loading...</div> }>
        { isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <HeroSection companyData={ companyData } />
            <PowerfulFeatures ref={ featuresRef } companyData={ companyData } />
            <Stats ref={ statsRef } companyData={ companyData } />
            <Jobs companyData={ companyData } />
            <Testimonials ref={ testimonialsRef } companyData={ companyData } />
            <Cta ref={ ctaRef } companyData={ companyData } />
          </>
        ) }
      </Suspense>
    </div >
  )
};

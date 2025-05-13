import { useEffect, useRef, Suspense, lazy } from "react";

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

  useEffect( () => {
    if ( companyUserName && companyUserName !== "null" ) {
      console.log( "this runs", companyUserName !== "null", companyUserName)
      const storedCompanyUserName = localStorage.getItem( "companyUserName" );
      const storedCompanyId = localStorage.getItem( "companyId" );

      axios
        .get( `http://localhost:8080/companies/companies/${ companyUserName }` )
        .then( res => {
          const companyFromApi = res.data;

          // If stored company ID exists but doesn't match API result, redirect to 404
          if ( storedCompanyId && companyFromApi._id !== storedCompanyId ) {
            console.error( "Company ID mismatch, invalid access." );
            navigate( "/404" );
            return;
          }

          // If stored username is not set or different, only then update localStorage
          if ( !storedCompanyUserName || storedCompanyUserName !== companyUserName ) {
            localStorage.setItem( "companyUserName", companyUserName );
            localStorage.setItem( "companyId", companyFromApi._id );
          }

          // Optionally: You can also set state if needed
          // setCompanyDetails(companyFromApi);
          // setCompanyLoading(false);
        } )
        .catch( err => {
          console.error( "Invalid company slug:", err );
          navigate( "/404" );
        } );
    }
  }, [ companyUserName, navigate ] );


  useEffect( () => {
    if ( !companyUserName  ) {
      const stored = localStorage.getItem( "companyUserName" );
      if ( stored && stored !== "" ) {
        navigate( `/${ stored }`, { replace: true } );
      }
    }
  }, [ companyUserName, navigate ] );

  useEffect( () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver( ( entries ) => {
      entries.forEach( ( entry ) => {
        if ( entry.isIntersecting ) {
          entry.target.classList.add( "animate-in" )
        }
      } )
    }, observerOptions )

    // Observe all sections with animations
    const sections = [ featuresRef.current, statsRef.current, testimonialsRef.current, ctaRef.current ]
    sections.forEach( ( section ) => {
      if ( section ) observer.observe( section )
    } )

    return () => {
      sections.forEach( ( section ) => {
        if ( section ) observer.unobserve( section )
      } )
    }
  }, [] )


  return (

    <div className="relative min-h-screen overflow-hidden">
      {/* Particles Background */ }
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <ParticlesComponent />
      </div>

      {/* All Sections */ }
      <Suspense fallback={ <div className="text-center py-8">Loading...</div> }>
        <HeroSection />
        <PowerfulFeatures ref={ featuresRef } />
        <Stats ref={ statsRef } />
        <Jobs />
        <Testimonials ref={ testimonialsRef } />
        <Cta ref={ ctaRef } />
      </Suspense>
    </div >
  )
};

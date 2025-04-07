import { useEffect, useRef, Suspense, lazy } from "react";

import Particles from "../Login/Particles";  // Make sure the Particles component is imported

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

  useEffect( () => {
    // Simple intersection observer for scroll animations
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
        <Particles />
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

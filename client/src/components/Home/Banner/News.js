import { useState, useEffect } from 'react';

export default function NewsCarousel() {
    const [ currentSlide, setCurrentSlide ] = useState( 0 );

    const slides = [
        {
            id: 1,
            title: "Meet the Seventh class of Google for Startups Accelerator",
            content: "Today, we are pleased to announce the 20 Seed to Series A startups looking to leverage the power of Generative AI chosen for the 7th class from 1500+ applications...",
            logo: "/news1.png",
            logoAlt: "Google for Startups Accelerator 2023"
        },
        {
            id: 2,
            title: "This HRTech SaaS Startup is Helping SMEs with Virtual Recruitment",
            content: "Bengaluru-based SaaS startup Expertia AI offers hiring solutions for SMEs, helping them automatically source and identify top 10 candidates from a pool of applicants...",
            logo: "/news1.png",
            logoAlt: "YourStory Logo"
        },
        {
            id: 3,
            title: "Startups That Raised Funding in August 2023",
            content: "With renewed focus from growth to profitability, the startup ecosystem is going...",
            logo: "/news1.png",
            logoAlt: "Funding News Logo"
        },
        {
            id: 4,
            title: "AI Innovation Leaders of 2023",
            content: "These emerging startups are revolutionizing industries with cutting-edge AI solutions that address real-world problems...",
            logo: "/news1.png",
            logoAlt: "Tech Innovation Logo"
        }
    ];

    const goToSlide = ( index ) => {
        setCurrentSlide( index );
    };

    // Auto-advance carousel
    useEffect( () => {
        const interval = setInterval( () => {
            setCurrentSlide( ( prev ) => ( prev === slides.length - 1 ? 0 : prev + 1 ) );
        }, 5000 );

        return () => clearInterval( interval );
    }, [ currentSlide, slides.length ] );

    return (
        <div  className="pb-16 backdrop-blur-sm translate-y-10 transition-all duration-700">
            {/* Header */ }
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-100 relative inline-block">
                    A.T.S in the <span className="text-blue-500 relative">News</span>
                </h1>
            </div>

            {/* Carousel */ }
            <div className="relative">
                <div className="overflow-hidden relative rounded-xl shadow-xl">
                    <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={ { transform: `translateX(-${ currentSlide * 100 }%)` } }
                    >
                        { slides.map( ( slide ) => (
                            <div key={ slide.id } className="min-w-full flex flex-col md:flex-row gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                                    {/* First Column */ }
                                    <div className="bg-white/5 p-6 rounded-xl shadow-md border-t-4 border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                        <div className="h-12 mb-4 flex items-center">
                                            <img src={ slide.logo } alt={ slide.logoAlt } className="h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-gray-950">
                                            { slide.title }
                                        </h3>
                                        <p className="text-white mb-4 leading-relaxed">
                                            { slide.content }
                                        </p>
                                        <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center group">
                                            Read More
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Second Column - Main Featured Content */ }
                                    <div className="bg-white/5 p-6 rounded-xl shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                        <div className="h-12 mb-4 flex items-center">
                                            <img src={ slide.logo } alt={ slide.logoAlt } className="h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-gray-950">
                                            { slide.title }
                                        </h3>
                                        <p className="text-white mb-4 leading-relaxed">
                                            { slide.content }
                                        </p>
                                        <button className="text-purple-600 font-medium hover:text-purple-800 transition-colors flex items-center group">
                                            Read More
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Third Column */ }
                                    <div className="bg-white/5 p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                        <div className="h-12 mb-4 flex items-center">
                                            <img src={ slide.logo } alt={ slide.logoAlt } className="h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-gray-950">
                                            { slide.title }
                                        </h3>
                                        <p className="text-white mb-4 leading-relaxed">
                                            { slide.content }
                                        </p>
                                        <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center group">
                                            Read More
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                </div>

                {/* Enhanced Indicator Dots */ }
                <div className="flex justify-center gap-3 mt-8">
                    { slides.map( ( _, index ) => (
                        <button
                            key={ index }
                            onClick={ () => goToSlide( index ) }
                            className={ `w-12 h-3 rounded-full transition-all duration-300 ${ currentSlide === index
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-16 shadow-md'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }` }
                            aria-label={ `Go to slide ${ index + 1 }` }
                        />
                    ) ) }
                </div>
            </div>
        </div>
    );
}
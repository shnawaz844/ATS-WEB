import React, { useState, useEffect, useRef } from 'react';

function About() {
    const [ activeTab, setActiveTab ] = useState( 0 );
    const [ isHovering, setIsHovering ] = useState( false );
    const timerRef = useRef( null );

    const tabs = [
        { id: 'jobify', label: 'Jobify', icon: '🔍' },
        { id: 'jobify-screening', label: 'Screening', icon: '🤖' },
        { id: 'talent-pool', label: 'Talent Pool', icon: '👥' },
        { id: 'interviews', label: 'Interviews', icon: '💬' },
        { id: 'tracking', label: 'Tracking', icon: '📊' },
    ];

    const carouselContent = [
        {
            title: "About Jobify",
            description: "Find the best job's from multiple channels with our advanced AI algorithms.",
            tags: [ "#Application Tracking System", "#multichannel" ],
            cta: "Try For Free",
            color: "from-blue-500 to-purple-600",
            video: "vedio1.mp4",
        },
        {
            title: "Jobify Screening",
            description: "Let our advanced algorithms find the most relevant job's, saving you time and effort.",
            tags: [ "#biasfree", "#culturefit" ],
            cta: "Try For Free",
            color: "from-purple-500 to-indigo-600",
            video: "vedio1.mp4",
        },
        {
            title: "Talent Pool Management",
            description: "Organize and nurture your talent pool with AI-powered insights and automation.",
            tags: [ "#organization", "#engagement" ],
            cta: "Try For Free",
            color: "from-green-500 to-teal-600",
            video: "vedio2.mp4",
        },
        {
            title: "Streamlined Interviews",
            description: "Schedule and conduct interviews efficiently with our integrated platform.",
            tags: [ "#scheduling", "#feedback" ],
            cta: "Try For Free",
            color: "from-orange-500 to-red-600",
            video: "vedio1.mp4",
        },
        {
            title: "Candidate Tracking",
            description: "Monitor candidate progress and make data-driven decisions with our tracking tools.",
            tags: [ "#pipeline", "#analytics" ],
            cta: "Try For Free",
            color: "from-pink-500 to-rose-600",
            video: "vedio2.mp4",
        },
    ];

    // Auto-scroll effect
    useEffect( () => {
        const startTimer = () => {
            timerRef.current = setInterval( () => {
                if ( !isHovering ) {
                    setActiveTab( prev => ( prev + 1 ) % tabs.length );
                }
            }, 5000 ); // Change slide every 5 seconds
        };

        startTimer();

        return () => {
            if ( timerRef.current ) {
                clearInterval( timerRef.current );
            }
        };
    }, [ isHovering, tabs.length ] );

    // Candidate profile section
    const CandidateCard = () => (
        <div className="card"> {/* Simple card structure for the profile */ } </div>
    );

    const handleTabChange = ( index ) => {
        setActiveTab( index );
    };

    return (
        <div className="w-full py-5 bg-slate-900/50 mt-4">
            {/* Navigation Tabs */ }
            <div className="flex justify-center mb-5 overflow-x-auto">
                <div className="flex space-x-8 h-28 items-center">
                    { tabs.map( ( tab, index ) => (
                        <button
                            key={ tab.id }
                            className="flex flex-col items-center relative group"
                            onClick={ () => handleTabChange( index ) }
                        >
                            <div
                                className={ `w-14 h-14 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 transform ${ activeTab === index
                                    ? `bg-gradient-to-br ${ carouselContent[ index ].color } text-white shadow-lg scale-110`
                                    : 'bg-gray-100 text-white group-hover:bg-gray-200'
                                    }` }
                            >
                                <span className="text-xl">{ tab.icon }</span>
                            </div>
                            <span
                                className={ `text-xs font-medium transition-colors duration-300 ${ activeTab === index ? 'text-amber-500' : 'text-white group-hover:text-white'
                                    }` }
                            >
                                { tab.label }
                            </span>
                        </button>
                    ) ) }
                </div>
            </div>

            {/* Carousel Content */ }
            <div
                className="relative h-[80vh] flex items-center overflow-hidden pl-16"
                onMouseEnter={ () => setIsHovering( true ) }
                onMouseLeave={ () => setIsHovering( false ) }
            >
                {/* Background Gradient */ }
                <div className={ `absolute inset-0 bg-gradient-to-br ${ carouselContent[ activeTab ].color } opacity-5 rounded-3xl` } />

                {/* Content with simple CSS fade */ }
                <div className="transition-all duration-500 ease-in-out opacity-100 flex flex-row justify-between gap-8 items-center">

                    {/* Left Side - Content */ }
                    <div className="space-y-6 mb-4 h-[45vh] w-[34vw]">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-white">
                            { carouselContent[ activeTab ].title }
                        </h2>

                        <div className="flex space-x-3">
                            { carouselContent[ activeTab ].tags.map( ( tag, i ) => (
                                <span key={ i } className={ `text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r ${ carouselContent[ activeTab ].color } bg-opacity-10 text-transparent bg-clip-text` }>
                                    { tag }
                                </span>
                            ) ) }
                        </div>

                        <p className="text-white text-lg leading-relaxed">
                            { carouselContent[ activeTab ].description }
                        </p>

                        <button
                            className={ `bg-gradient-to-r ${ carouselContent[ activeTab ].color } text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1` }
                        >
                            { carouselContent[ activeTab ].cta }
                        </button>
                    </div>

                    {/* Right Side - Visual */ }
                    <div className="flex justify-center w-[51vw] ml-20 max-w-[65vw] min-w-[40vw] h-[60vh]">
                        { activeTab >= 0 && (
                            <div className={ `bg-transparent rounded-2xl shadow-lg w-full h-[60vh] flex items-center justify-center relative overflow-hidden` }>
                                <div className={ `absolute inset-0 bg-gradient-to-br ${ carouselContent[ activeTab ].color } opacity-10` } />
                                {/* <div className="relative z-10 flex flex-col items-center"> */}

                                    {/* Embed Video based on activeTab */ }
                                    <div className=" z-10 h-[60vh] w-[52vw] mb-12">
                                        <video
                                            className="w-full h-full object-cover" // Ensures the video covers the container fully
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                        >
                                            <source src={ carouselContent[ activeTab ]?.video } type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                {/* </div> */}
                            </div>
                        ) }
                    </div>

                </div>
            </div>
        </div>
    );
}

export default About;

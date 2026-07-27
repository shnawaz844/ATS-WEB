import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CompanyNotFound() {
    const companyUserName = localStorage.getItem( "companyUserName" ) || "super";

    // Add animation effect when component mounts
    useEffect( () => {
        const title = document.querySelector( '.error-title' );
        const message = document.querySelector( '.error-message' );
        const button = document.querySelector( '.home-button' );

        // Staggered fade-in animations
        setTimeout( () => {
            title.classList.remove( 'opacity-0', 'translate-y-4' );
        }, 300 );

        setTimeout( () => {
            message.classList.remove( 'opacity-0', 'translate-y-4' );
        }, 600 );

        setTimeout( () => {
            button.classList.remove( 'opacity-0', 'translate-y-4' );
        }, 900 );
    }, [] );

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-black to-white text-white overflow-hidden">
            {/* Left Section (Content) */ }
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12 md:py-0 relative z-10">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="space-y-6">
                        <h1 className="error-title text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 opacity-0 transform translate-y-4 transition-all duration-700 ease-out">
                            Oops!
                        </h1>

                        <div className="error-message opacity-0 transform translate-y-4 transition-all duration-700 ease-out">
                            <p className="text-xl md:text-2xl font-light text-gray-300 mb-2">
                                Company Not Found
                            </p>
                            <p className="text-gray-400">
                                Please check the company name and try again.
                            </p>
                        </div>

                        <div className="pt-6">
                            <Link
                                to={ `/${ companyUserName }` }
                                className="home-button inline-flex items-center px-8 py-3 rounded-full bg-gray-700 text-white font-medium shadow-lg hover:shadow-xl transform transition duration-300 hover:-translate-y-1 opacity-0 translate-y-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */ }
                <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden md:block">
                    <div className="w-64 h-64 rounded-full bg-purple-500 opacity-10 blur-xl"></div>
                </div>
                <div className="absolute bottom-0 left-0 -mb-32 -ml-32 hidden md:block">
                    <div className="w-80 h-80 rounded-full bg-pink-600 opacity-10 blur-xl"></div>
                </div>
            </div>

            {/* Right Section (Illustration) */ }
            <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                {/* You can keep the GIF or use an SVG illustration */ }
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent md:hidden z-10"></div>
                <img
                    src="/404error.gif"
                    alt="Page not found"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay with dot pattern */ }
                <div className="absolute inset-0 bg-gray-900 bg-opacity-30 z-0">
                    <div className="absolute inset-0" style={ {
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    } }></div>
                </div>
            </div>
        </div>
    );
}

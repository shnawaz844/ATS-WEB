// src/components/CompanyNotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function CompanyNotFound() {
    return (
        <div className="relative h-screen w-full overflow-hidden flex  bg-gray-400">
            {/* Left Section (Text and Button) */ }
            <div className="relative z-10 flex flex-col items-center justify-center w-1/2 text-center px-4 pt-10">
                <p className="text-xl md:text-2xl text-gray-200 mb-8">
                    Oooppss!!!<br></br>Company Not Found <br></br>Please input the correct company name.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg text-lg font-semibold transition transform hover:scale-105"
                >
                    Go Home
                </Link>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-70" />

            {/* Right Section (Background GIF) */ }
            <div className="relative w-1/2 ">
                <img
                    src="/404error.gif"
                    alt="Page not found"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
}

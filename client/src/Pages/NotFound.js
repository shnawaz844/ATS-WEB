import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const companyUserName = localStorage.getItem( "companyUserName" ) || "super";
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col justify-center items-center text-center px-4" style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <h1 className="text-9xl font-extrabold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-700">
                Oops! Page Not Found
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
                The page you are looking for does not exist or might have been moved.
            </p>
            <button
                onClick={ () => navigate( `/${companyUserName}` ) }
                className="px-6 py-3 bg-gray-700 hover:bg-gray-500 text-white hover:text-white rounded-xl font-medium transition"
            >
                Go to Home
            </button>
        </div>
    );
};

export default NotFound;

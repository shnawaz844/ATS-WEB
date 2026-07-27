import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
    const { theme } = useTheme();
    const companyUserName = localStorage.getItem("companyUserName") || "super";
    const navigate = useNavigate();

    return (
        <div className={`h-screen flex flex-col justify-center items-center text-center px-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'
            }`}
        >
            <h1 className={`text-9xl font-extrabold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>404</h1>
            <h2 className={`text-3xl md:text-4xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Oops! Page Not Found
            </h2>
            <p className={`max-w-md mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                The page you are looking for does not exist or might have been moved.
            </p>
            <button
                onClick={() => navigate(`/${companyUserName}`)}
                className={`px-6 py-3 rounded-xl font-medium transition ${theme === 'dark'
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-700 hover:bg-gray-500 text-white hover:text-white'
                    }`}
            >
                Go to Home
            </button>
        </div>
    );
};

export default NotFound;


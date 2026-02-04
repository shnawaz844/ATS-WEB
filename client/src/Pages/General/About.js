import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const About = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About Us</h1>
                <div className={`prose lg:prose-xl mx-auto ${theme === 'dark' ? 'prose-invert' : ''}`}>
                    <p className="mb-6 text-lg">
                        Niyukty is revolutionizing the recruitment industry with AI-powered solutions. We connect the right talent with the right opportunities through intelligent matching and automated processes.
                    </p>
                    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                        <p className="mb-4">
                            To simplify and accelerate the hiring process for both employers and candidates, identifying potential through technology and human insight.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

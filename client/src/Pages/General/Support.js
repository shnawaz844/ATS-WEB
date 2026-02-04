import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { LifeBuoy } from 'lucide-react';

const Support = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support</h1>

                <div className={`mt-12 p-12 rounded-2xl flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 flex items-center justify-center mb-6">
                        <LifeBuoy className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Need Help?</h2>
                    <p className="text-lg opacity-70 mb-6">We're here to assist you. Our support portal is currently being upgraded.</p>
                    <a href="mailto:contact@niyukty.com" className="text-blue-500 hover:text-blue-600 underline">Contact Support Team</a>
                </div>
            </div>
        </div>
    );
};

export default Support;

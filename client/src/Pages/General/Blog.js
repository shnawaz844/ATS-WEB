import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Newspaper } from 'lucide-react';

const Blog = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Blog</h1>

                <div className={`mt-12 p-12 rounded-2xl flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-6">
                        <Newspaper className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Thoughts & Insights</h2>
                    <p className="text-lg opacity-70 mb-6">Our latest articles and recruitment trends are coming soon.</p>
                    <button className="px-6 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                        Subscribe for Updates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;


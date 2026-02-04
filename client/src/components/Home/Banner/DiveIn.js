import { useState } from 'react';

export default function ReadytoDiv() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <div className="w-full relative overflow-hidden py-10 ">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
                    }}>
                </div>

                <div className="max-w-3xl mx-auto text-center px-6 relative">
                    <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Ready to begin your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-400">journey</span>?
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
                        Start transforming your recruitment process today. Experience the power of AI-driven hiring.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <button
                            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Get Start
                        </button>

                        <a
                            href="#learn-more"
                            className="px-8 py-3.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Learn More
                        </a>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>No credit card required • 14-day free trial • Cancel anytime</span>
                    </div>
                </div>
            </div>
        </>

    );
}
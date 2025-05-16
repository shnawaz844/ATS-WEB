import { useState } from 'react';

export default function CtaSection() {
    const [ isHovered, setIsHovered ] = useState( false );

    return (
        <div className="w-full bg-slate-900/50 py-20 border-0 rounded-xl shadow-2xl overflow-hidden relative">
            {/* Abstract shapes in background */ }
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-purple-400"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-400"></div>
            </div>

            <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
                <h2 className="text-gray-100 text-4xl md:text-5xl font-bold mb-8">
                    Ready to <span className="text-blue-500">dive in</span> ?
                </h2>

                <p className="text-blue-300 text-lg mb-10 max-w-lg mx-auto">
                    Join thousands of satisfied users and experience the difference today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <button
                        className={ `bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 ${ isHovered ? 'scale-105 shadow-xl' : '' }` }
                        onMouseEnter={ () => setIsHovered( true ) }
                        onMouseLeave={ () => setIsHovered( false ) }
                    >
                        Start Free Trial
                    </button>

                    <a href="#learn-more" className="text-purple-200 hover:text-white transition-colors font-medium">
                        Learn more
                    </a>
                </div>

                <div className="flex items-center justify-center space-x-2 text-purple-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>No credit card required</p>
                    <span role="img" aria-label="peace sign">✌️</span>
                </div>
            </div>
        </div>
    );
}
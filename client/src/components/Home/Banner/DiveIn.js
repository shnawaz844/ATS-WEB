import { useState } from 'react';

export default function ReadytoDiv() {
    const [ isHovered, setIsHovered ] = useState( false );

    return (
        <>
            <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 py-20 border-0 shadow-2xl overflow-hidden relative">
                {/* Abstract shapes in background */ }
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-36 h-36 bg-purple-500 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-10 right-10 w-52 h-52 bg-indigo-500 rounded-full blur-2xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
                    <h2 className="text-gray-100 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                        Ready to <span className="text-white">dive in</span>?
                    </h2>

                    <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Join thousands of satisfied users and experience the difference today.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                        <button
                            className={ `bg-white border border-black  text-black font-semibold py-3 px-8 rounded-full shadow-md ` }
                            onMouseEnter={ () => setIsHovered( true ) }
                            onMouseLeave={ () => setIsHovered( false ) }
                        >
                            Start Free Trial
                        </button>

                        <a
                            href="#learn-more"
                            className="text-gray-200 hover:text-white text-base font-medium 
                            border border-white rounded-full py-3 px-7  transition-colors"
                        >
                            Learn more →
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-purple-300 text-sm md:text-base">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className='text-gray-200'>No credit card required</p>
                        <span role="img" aria-label="peace sign">✌️</span>
                    </div>
                </div>
            </div>
        </>

    );
}
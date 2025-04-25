import { useState, useEffect } from 'react';

export default function WhyAts() {
  const [ showCookieAlert, setShowCookieAlert ] = useState( true );

  // Subtle fade-in animation on page load
  const [ isLoaded, setIsLoaded ] = useState( false );

  useEffect( () => {
    setIsLoaded( true );
  }, [] );

  return (
    <div className={ `h-[90vh] bg-transparent font-sans transition-opacity duration-1000 ${ isLoaded ? 'opacity-100' : 'opacity-0' }` }>
      {/* Hero Section */ }
      <div className="pt-16 pb-5 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why you should <span className="text-blue-500 relative">
                Choose  A.T.S?
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 rounded-full transform translate-y-1"></span>
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Full stack of hiring - 1 platform to manage over 100 partner platforms.
            </p>
          </div>

          {/* Stats */ }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {/* Stat 1 */ }
            <div className="bg-white/5 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-blue-300 mb-4">22 M</div>
              <div className="text-lg text-white">Job Candidates</div>
              <div className="text-sm text-blue-300">(Jan 2025)</div>
            </div>

            {/* Stat 2 */ }
            <div className="bg-white/5 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-blue-300 mb-4">88%</div>
              <div className="text-lg text-white">Accuracy -</div>
              <div className="text-sm text-blue-300">AI Recommendations</div>
            </div>

            {/* Stat 3 */ }
            <div className="bg-white/5 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-blue-300 mb-4">90%</div>
              <div className="text-lg text-white">Time Saved</div>
              <div className="text-sm text-blue-300">As low as 24 hours</div>
            </div>

            {/* Stat 4 */ }
            <div className="bg-white/5 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-blue-300 mb-4">10%</div>
              <div className="text-lg text-white">Effective Costs</div>
              <div className="text-sm text-blue-300">As low as $100</div>
            </div>
          </div>

          {/* CTA */ }
          <div className="mt-16 text-center">
            <button className="px-8 py-3 bg-gray-400 border-2 border-white text-white rounded-full hover:bg-gray-500 hover:text-white transition-all shadow-md hover:shadow-lg text-lg font-medium">
              Request a Free Demo
            </button>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */ }
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{ `
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(40px, -40px);
          }
          66% {
            transform: scale(0.9) translate(-40px, 40px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
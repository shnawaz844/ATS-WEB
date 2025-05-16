import { Box, Image } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate( "/login" ); // Navigate to login page
    };
  return (
      <div className="relative  overflow-hidden">
          <div className="h-[87vh] flex">
              {/* First div with updated design */ }
              <div className="p-6 w-[65vw] flex flex-col justify-center items-center text-white space-y-4">
                  <div className="ml-16">
                      <h1 className="text-4xl font-semibold text-center mb-4">
                          Your  <span className="text-blue-500 relative">Jobify</span> Recruiter for <br /> end-to-end Hiring
                      </h1>
                      <p className="text-center text-lg mb-4">
                          AI-powered screening and assessments: find and interview top candidates from 100+ platforms and hire in 24 hours, all at 10% of the cost.
                      </p>

                      <div className="flex flex-wrap gap-4 justify-center">
                          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white mt-4 px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-400" onClick={ handleClick }>
                              <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Try for Free
                              </span>
                          </button>
                          {/* 
              <button className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-red-400">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Request a Free Demo
                </span>
              </button> */}
                      </div>
                      <div className="flex justify-center mt-4">
                          <button className="bg-[#0288d1] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#026aa7] transition-all duration-300 ease-in-out transform hover:scale-105">
                              Explore the Expertia Difference
                          </button>
                      </div>
                  </div>
              </div>

              <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-lg">
                  <img
                      src="banner2.png"
                      alt="Banner"
                      className="w-full h-[85vh] object-contain absolute inset-0 m-auto"
                  />
              </div>
          </div>
      </div>
  );
};

export default Banner;
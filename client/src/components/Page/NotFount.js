// src/components/Pages/NotFound.js
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      className="flex bg-[#e7e7e7] flex-col items-center justify-center min-h-screen bg-contain bg-center bg-no-repeat text-gray-800 dark:text-gray-200"
      style={{
        backgroundImage: "url('/notfound1.gif')",
        boxShadow:
          "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
      }}
    >
      <img
        src="/tree-1.png"
        alt="Left Tree"
        className="absolute bottom-[-1rem] left-20 w-60 md:w-84 lg:w-80 "
      />
      <img
        src="/tree-2.png"
        alt="Right Tree"
        className="absolute bottom-[-1rem] right-20 w-48 md:w-64 lg:w-70"
      />
      <div className="bg-black mt-[30rem] bg-opacity-50 p-6 rounded-md text-center">
        <h1 className="text-5xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white mb-6">
          Oops! The page you are looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-all"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;


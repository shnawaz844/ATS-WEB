import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [ user, setUser ] = useState( {
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  } );
  const [ message, setMessage ] = useState( "" );

  useEffect( () => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem( "user" );
        const userData = JSON.parse( token );
        setUser( {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password: "",
          confirmPassword: "",
        } );
      } catch ( error ) {
        console.error( "Error fetching user data", error );
      }
    };
    fetchUser();
  }, [] );

  const handleChange = ( e ) => {
    setUser( { ...user, [ e.target.name ]: e.target.value } );
  };

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    if ( user.password !== user.confirmPassword ) {
      setMessage( "Passwords do not match!" );
      return;
    }
    try {
      await axios.put( `${ process.env.REACT_APP_BASE_URL }/user/update-profile`, user );
      setMessage( "Profile updated successfully!" );
    } catch ( error ) {
      setMessage( "Error updating profile" );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-500 via-blue-700 to-black">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30">
          <div className="p-6 md:p-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-center text-white text-2xl md:text-3xl font-bold mb-6 tracking-wider">
              Edit Your Profile
            </h2>

            { message && (
              <div className={ `mb-6 p-3 rounded-lg ${ message.includes( "Error" )
                  ? "bg-red-500/20 border border-red-500/50"
                  : "bg-green-500/20 border border-green-500/50"
                }` }>
                <p className="text-center text-base md:text-lg font-medium text-white">
                  { message }
                </p>
              </div>
            ) }

            <form onSubmit={ handleSubmit } className="space-y-5">
              {/* Name Field */ }
              <div className="relative group">
                <label className="block text-sm font-medium text-indigo-300 mb-1 ml-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={ user.name }
                    onChange={ handleChange }
                    className="block w-full px-4 py-2.5 bg-indigo-900/20 border border-indigo-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-indigo-300/50"
                  />
                </div>
              </div>

              {/* Email Field */ }
              <div className="relative group">
                <label className="block text-sm font-medium text-indigo-300 mb-1 ml-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={ user.email }
                    disabled
                    className="block w-full px-4 py-2.5 bg-indigo-900/10 border border-indigo-500/20 rounded-lg text-indigo-300/70 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Role Field */ }
              <div className="relative group">
                <label className="block text-sm font-medium text-indigo-300 mb-1 ml-1">
                  Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="role"
                    value={ user.role }
                    disabled
                    className="block w-full px-4 py-2.5 bg-indigo-900/10 border border-indigo-500/20 rounded-lg text-indigo-300/70 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-500/20 my-4 pt-4">
                <h3 className="text-indigo-300 text-base md:text-lg font-medium mb-3">Change Password</h3>
              </div>

              {/* Password Field */ }
              <div className="relative group">
                <label className="block text-sm font-medium text-indigo-300 mb-1 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={ user.password }
                    onChange={ handleChange }
                    className="block w-full px-4 py-2.5 bg-indigo-900/20 border border-indigo-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-indigo-300/50"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */ }
              <div className="relative group">
                <label className="block text-sm font-medium text-indigo-300 mb-1 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={ user.confirmPassword }
                    onChange={ handleChange }
                    className="block w-full px-4 py-2.5 bg-indigo-900/20 border border-indigo-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-indigo-300/50"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */ }
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base md:text-lg font-medium rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Update Profile
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
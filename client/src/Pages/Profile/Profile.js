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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-white to-black text-white">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-gray-700 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-600/30 p-8 transition-transform duration-300 hover:scale-[1.01]">
          <div className="flex justify-center mb-3">
            <div className="h-20 w-20 bg-gradient-to-tr from-gray-700 to-white rounded-full flex items-center justify-center shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-center tracking-widest mb-6 text-white drop-shadow-md">
            Edit Your Profile
          </h2>

          { message && (
            <div className={ `mb-6 p-4 rounded-xl shadow-md text-center font-medium transition-all duration-200 ${ message.includes( "Error" )
              ? "bg-red-500/20 border border-red-500/60 text-red-200"
              : "bg-green-500/20 border border-green-500/60 text-green-200"
              }` }>
              { message }
            </div>
          ) }

          <form onSubmit={ handleSubmit } className="space-y-6">
            {/* Name Field */ }
            <div>
              <label className="block text-sm font-semibold text-white mb-1 ml-1">Name</label>
              <input
                type="text"
                name="name"
                value={ user.name }
                onChange={ handleChange }
                className="w-full px-4 py-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-indigo-400/50 transition-all"
              />
            </div>

            {/* Email Field */ }
            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-1 ml-1">Email</label>
              <input
                type="email"
                name="email"
                value={ user.email }
                disabled
                className="w-full px-4 py-3 bg-indigo-800/20 border border-indigo-500/20 rounded-xl text-indigo-300/70 cursor-not-allowed"
              />
            </div>

            {/* Role Field */ }
            <div>
              <label className="block text-sm font-semibold text-white mb-1 ml-1">Role</label>
              <input
                type="text"
                name="role"
                value={ user.role }
                disabled
                className="w-full px-4 py-3 bg-indigo-800/20 border border-indigo-500/20 rounded-xl text-white/70 cursor-not-allowed"
              />
            </div>

            <div className="border-t border-indigo-500/30 pt-5 flex items-center">
              <h3 className="text-white text-lg font-semibold mb-3 text-center">Change Password</h3>
            </div>

            {/* Password Field */ }
            <div>
              <label className="block text-sm font-semibold text-white mb-1 ml-1">New Password</label>
              <input
                type="password"
                name="password"
                value={ user.password }
                onChange={ handleChange }
                className="w-full px-4 py-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-indigo-400/50 transition-all"
              />
            </div>

            {/* Confirm Password Field */ }
            <div>
              <label className="block text-sm font-semibold text-white mb-1 ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={ user.confirmPassword }
                onChange={ handleChange }
                className="w-full px-4 py-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-indigo-400/50 transition-all"
              />
            </div>

            {/* Submit Button */ }
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl shadow-xl text-white text-lg font-semibold transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  );
};

export default Profile;

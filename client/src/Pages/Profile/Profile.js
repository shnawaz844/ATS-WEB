import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";

const Profile = () => {
  const [ user, setUser ] = useState( {
    _id: "",
    userName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  } );
  const [ initialUser, setInitialUser ] = useState( {
    userName: "",
    email: "",
    role: "",
  } );
  const [ message, setMessage ] = useState( "" );
  const [ showPassword, setShowPassword ] = useState( false );
  const [ showConfirmPassword, setShowConfirmPassword ] = useState( false );
  const [ loading, setLoading ] = useState( false );

  useEffect( () => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem( "user" );
        if ( !token ) {
          setMessage( "No user data found. Please login again." );
          return;
        }

        const userData = JSON.parse( token );
        const userState = {
          _id: userData._id,
          userName: userData.userName || userData.name,
          email: userData.email,
          role: userData.role,
          password: "",
          confirmPassword: "",
        };
        setUser( userState );
        setInitialUser( {
          userName: userData.userName || userData.name,
          email: userData.email,
          role: userData.role,
        } );
      } catch ( error ) {
        console.error( "Error fetching user data", error );
        setMessage( "Error loading user data" );
      }
    };
    fetchUser();
  }, [] );

  useEffect( () => {
    let timer;
    if ( message.includes( "successfully" ) ) {
      timer = setTimeout( () => setMessage( "" ), 3000 );
    }
    return () => clearTimeout( timer );
  }, [ message ] );

  const handleChange = ( e ) => {
    setUser( { ...user, [ e.target.name ]: e.target.value } );
  };

  const hasChanges = () => {
    // Check if username changed
    if ( user.userName !== initialUser.userName ) return true;

    // Check if password fields have values (and passwords match)
    if ( user.password && user.password === user.confirmPassword ) return true;

    return false;
  };

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    setLoading( true );
    setMessage( "" );

    if ( !user.userName.trim() ) {
      setMessage( "Name is required!" );
      setLoading( false );
      return;
    }

    if ( user.password && user.password !== user.confirmPassword ) {
      setMessage( "Passwords do not match!" );
      setLoading( false );
      return;
    }

    if ( user.password && user.password.length < 6 ) {
      setMessage( "Password must be at least 6 characters long!" );
      setLoading( false );
      return;
    }

    try {
      const token = localStorage.getItem( "user" );
      const updateData = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      };

      if ( user.password.trim() ) {
        updateData.password = user.password;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...( token && { Authorization: `Bearer ${ token }` } )
        }
      };

      const response = await axios.put(
        `${ process.env.REACT_APP_BASE_URL }/users/update-user/${ user._id }`,
        updateData,
        config
      );

      if ( response.data.success ) {
        setMessage( "Profile updated successfully!" );

        const updatedUserData = {
          ...JSON.parse( localStorage.getItem( "user" ) ),
          userName: user.userName
        };
        localStorage.setItem( "user", JSON.stringify( updatedUserData ) );

        // Update initial user to reflect the new changes
        setInitialUser( {
          userName: user.userName,
          email: user.email,
          role: user.role,
        } );

        setUser( prev => ( { ...prev, password: "", confirmPassword: "" } ) );
      } else {
        setMessage( response.data.message || "Error updating profile" );
      }
    } catch ( error ) {
      console.error( "Update error:", error );
      if ( error.response ) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || "Error updating profile";

        if ( status === 404 ) {
          setMessage( "API endpoint not found. Please check your server configuration." );
        } else if ( status === 401 ) {
          setMessage( "Unauthorized. Please login again." );
        } else if ( status === 400 ) {
          setMessage( errorMessage );
        } else {
          setMessage( `Server error: ${ errorMessage }` );
        }
      } else if ( error.request ) {
        setMessage( "Network error. Please check your connection and server status." );
      } else {
        setMessage( "An unexpected error occurred" );
      }
    } finally {
      setLoading( false );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword( !showPassword );
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword( !showConfirmPassword );
  };

  const isError =
    message &&
    ( message.toLowerCase().includes( "error" ) ||
      message.toLowerCase().includes( "not found" ) ||
      message.toLowerCase().includes( "match" ) ||
      message.toLowerCase().includes( "required" ) ||
      message.toLowerCase().includes( "unauthorized" ) ||
      message.toLowerCase().includes( "network" )
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */ }
        <div className="bg-gradient-to-r from-gray-900 to-white p-3 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <p className="text-blue-100 text-sm mt-1">Update your account information</p>
        </div>

        <div className="p-6">
          {/* Alert Message */ }
          { message && (
            <div
              className={ `mb-4 p-3 rounded-lg flex items-center gap-3 ${ isError
                  ? "bg-red-500/10 border border-red-500/30 text-red-200"
                  : "bg-green-500/10 border border-green-500/30 text-green-200"
                }` }
            >
              { isError ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) }
              <span className="text-sm">{ message }</span>
            </div>
          ) }

          <form onSubmit={ handleSubmit } className="space-y-4">
            {/* Basic Info Grid */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */ }
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Name *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={ user.userName }
                  onChange={ handleChange }
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */ }
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={ user.email }
                  disabled
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Role Field */ }
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Role
              </label>
              <input
                type="text"
                name="role"
                value={ user.role }
                disabled
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Role is managed by administrators</p>
            </div>

            {/* Password Section */ }
            <div className="border-t border-slate-600/50 pt-4 mt-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Lock className="w-5 h-5 text-purple-400" />
                Change Password
                <span className="text-sm font-normal text-slate-400">(Optional)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */ }
                <div>
                  <label className="block text-sm font-medium text-white mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={ showPassword ? "text" : "password" }
                      name="password"
                      value={ user.password }
                      onChange={ handleChange }
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Leave blank to keep current"
                    />
                    <button
                      type="button"
                      onClick={ togglePasswordVisibility }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      { showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" /> }
                    </button>
                  </div>
                  { user.password && user.password.length > 0 && user.password.length < 6 && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Password must be at least 6 characters
                    </p>
                  ) }
                </div>

                {/* Confirm Password */ }
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={ showConfirmPassword ? "text" : "password" }
                      name="confirmPassword"
                      value={ user.confirmPassword }
                      onChange={ handleChange }
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={ toggleConfirmPasswordVisibility }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      { showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" /> }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */ }
            <div className="pt-6">
              <button
                type="submit"
                disabled={ loading || !hasChanges() }
                className={ `w-full bg-gradient-to-r from-gray-900 to-white hover:from-white hover:to-gray-900 ${ ( loading || !hasChanges() ) ? "opacity-50 cursor-not-allowed" : ""
                  } text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2` }
              >
                { loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Update Profile
                  </>
                ) }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
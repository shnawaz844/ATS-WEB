import React, { useEffect, useState } from "react";
import logo from "../../assets/img/logo1.png"
import { Eye, EyeOff, LogIn } from "lucide-react";


export const Login = () => {
  const [ email, setEmail ] = useState( "" );
  const [ password, setPassword ] = useState( "" );
  const [ showPassword, setShowPassword ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ error, setError ] = useState( "" );
  const [ success, setSuccess ] = useState( "" );
  const companyId = localStorage.getItem( "companyId" );
  const companyUserName = localStorage.getItem( "companyUserName" );

  useEffect( () => {
    if ( companyId ) {
    }
  }, [ companyId ] );


  const handleSubmit = async ( e ) => {
    e.preventDefault();
    setIsLoading( true );
    setError( "" );
    setSuccess( "" );

    try {
      const response = await fetch( `${ process.env.BASE_URL }/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company_id": companyId ?? "super",
        },
        body: JSON.stringify( { email, password } ),
      } );

      const result = await response.json();

      if ( result.success ) {
        localStorage.setItem( "usertoken", result.token );
        localStorage.setItem( "user", JSON.stringify( result.user ) );
        localStorage.setItem( "email", result.email );

        setSuccess( "Login successful! Redirecting..." );

        console.log("thisaa ia runnnaaas login",result.user)
        
        if ( result.user.role !== "super" ) {
          setTimeout( () => {
            window.location.href = `/${ companyUserName }`;
          }, 1500 );
        } else {
          setTimeout( () => {
            console.log( "thisaa ia runnnaaas login>>>" )

            window.location.href = `/`;
          }, 1500 );
        }
      } else {
        setError( result.error || "Invalid credentials" );
      }
    } catch ( err ) {
      setError( "Connection error. Please try again." );
      console.error( err );
    } finally {
      setIsLoading( false );
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-white to-black p-4">
      {/* Animated background elements */ }
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md bg-gray-700 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          {/* Logo placeholder */ }
          <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">ATS</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">Access Portal</h1>
          <p className="text-gray-400 text-sm">Secure authentication required</p>
        </div>

        { error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3 animate-fadeIn">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-red-400 text-sm">{ error }</p>
          </div>
        ) }

        { success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-3 animate-fadeIn">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-emerald-400 text-sm">{ success }</p>
          </div>
        ) }

        <form onSubmit={ handleSubmit } className="space-y-6">
          <div className="space-y-5">
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={ email }
                  onChange={ ( e ) => setEmail( e.target.value ) }
                  placeholder="name@example.com"
                  className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={ showPassword ? "text" : "password" }
                  required
                  value={ password }
                  onChange={ ( e ) => setPassword( e.target.value ) }
                  placeholder="Enter your password"
                  className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder:text-gray-500 pr-12"
                />
                <button
                  type="button"
                  onClick={ () => setShowPassword( !showPassword ) }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  { showPassword ? <EyeOff size={ 18 } /> : <Eye size={ 18 } /> }
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm text-white hover:text-blue-300 transition-colors">
              Forgot password ?
            </button>
          </div>

          <button
            type="submit"
            disabled={ isLoading }
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-100 hover:from-gray-400 hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 transform hover:-translate-y-1"
          >
            { isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={ 18 } />
                <span>Sign In</span>
              </>
            ) }
          </button>

          <div className="text-center pt-4">
            <a
              href={ `/${ companyUserName }/signup` }
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Don't have an account? <span className="text-white font-medium">Create one</span>
            </a>
          </div>
        </form>
      </div>

      <div className="mt-8 text-white text-xs text-center">
        © 2025 ATS System • <a href="#" className="hover:text-white">Privacy Policy</a> • <a href="#" className="hover:text-gray-400">Terms of Service</a>
      </div>
    </div>
  );
};

export default Login;
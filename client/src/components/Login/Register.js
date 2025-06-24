import axios from "axios";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const Register = () => {
  const { companyUserName } = useParams();

  // 1) State for company details & ID
  const [ companyDetails, setCompanyDetails ] = useState( null );
  const companyId = companyDetails?._id;
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    address: "",
    gender: "",
    role: "candidate",
    head: false,
  });


  // Fetch company details based on companyUserName
  useEffect( () => {
    const stored = localStorage.getItem( "companyUserName" );
    const company = companyUserName || stored;
    if ( !company ) return;

    axios
      .get( `${ process.env.REACT_APP_BASE_URL }/companies/companies/${ company }` )
      .then( ( res ) => {
        setCompanyDetails( res.data );
        localStorage.setItem( "companyUserName", company );
      } )
      .catch( ( err ) => {
        console.error( "Error fetching company details:", err );
      } );
  }, [ companyUserName ] );

  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = JSON.parse( localStorage.getItem( "user" ) || "{}" );
  const userRole = user.role;
  const isRecruiterManager = userRole === 'recruiter_manager';

  useEffect(() => {
    if (redirect) {
      setTimeout(() => {
        window.location.href = `/${ companyUserName}/login`;
      }, 4000);
    }
  }, [redirect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Construct the payload to include the company_id from companyDetails
    const payload = {
      ...formData,
      company_id: companyId, // include the company_id in the body
    };
    
    try {
      const response = await fetch(`${ process.env.REACT_APP_BASE_URL }/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company_id": companyId  // Add company_id to headers
        },
       body: JSON.stringify(payload),
      } );

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        localStorage.setItem( "company_id", companyId );
        setSuccess("Sign up successful! Redirecting to login...");
        setRedirect(true);
      } else if (response.status === 409) {
        setError("Email already registered. Please use a different email.");
      } else {
        setError("Email already registered. Please use a different email");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-white to-black p-4">
      {/* Animated background elements */ }
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-gray-700 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          {/* Logo placeholder */ }
          <div className="mx-auto mb-2 flex items-center justify-center rounded-full p-1">
            <img
              src="/ATSLOGO.png"
              alt="ATS Logo"
              className="h-20 w-20 object-cover rounded-full" // Makes the image itself rounded
            />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Please fill in your details</p>
        </div>

        { error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-400 text-sm">{ error }</p>
          </div>
        ) }

        { success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <p className="text-emerald-400 text-sm">{ success }</p>
          </div>
        ) }

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
              Full Name
            </label>
            <input
              type="text"
              name="userName"
              value={ formData.userName }
              onChange={ handleChange }
              placeholder="Ex: Abhishek Sharma"
              className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={ formData.email }
              onChange={ handleChange }
              placeholder="Ex: abhisheksharma@gmail.com"
              autoComplete="off" 
              className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={ showPassword ? "text" : "password" }
                name="password"
                value={ formData.password }
                onChange={ handleChange }
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={ formData.address }
              onChange={ handleChange }
              placeholder="Ex: A70, Down-Town Street, Mumbai"
              className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
              Gender
            </label>
            <select
              name="gender"
              value={ formData.gender }
              onChange={ handleChange }
              className="block w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white appearance-none"
              style={ { backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 8l5 5 5-5z\" fill=\"%236b7280\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center" } }
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <button
            onClick={ handleSubmit }
            disabled={ isLoading }
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-100 hover:from-gray-400 hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 transform hover:-translate-y-1"
          >
            { isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={ 18 } />
                <span>Register</span>
              </>
            ) }
          </button>

          <div className="text-center pt-4">
            <a
              href={ `/${ companyUserName }/login` }
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Already registered? <span className="text-white font-medium">Login here!</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-white text-xs text-center">
        © 2025 ATS System • <a href="#" className="hover:text-white">Privacy Policy</a> • <a href="#" className="hover:text-gray-400">Terms of Service</a>
      </div>
    </div>
  );
};

export default Register;
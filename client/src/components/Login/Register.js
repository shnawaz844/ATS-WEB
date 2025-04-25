import axios from "axios";
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
      .get( `http://localhost:8080/companies/companies/${ company }` )
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
      const response = await fetch("http://localhost:8080/auth/register", {
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
        setError("Unable to signup. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      {/* ATS Title */}
      {/* <h1 className="text-6xl font-bold text-white mb-8 tracking-widest">A T S</h1> */}
      
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 mt-2">Please fill in your details</p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="userName"
              required
              value={formData.userName}
              onChange={handleChange}
              placeholder="Ex: Abhishek Sharma"
              className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: abhisheksharma@gmail.com"
              className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: A70, Down-Town Street, Mumbai"
              className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {false && <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              User Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
            >
              <option value="candidate">Candidate</option>
              <option value="recruiter_manager">Recruiter</option>
              <option value="coordinator">Coordinator</option>
              <option value="employer">Employer</option>
            </select>
          </div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>

          <div className="text-center mt-4">
            <a 
              href={`/${companyUserName}/login`}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Already registered? <span className="text-blue-400">Login here!</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
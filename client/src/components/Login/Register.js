import axios from "axios";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const Register = () => {
  const { companyUserName } = useParams();

  // 1) State for company details & ID
  const [companyDetails, setCompanyDetails] = useState(null);
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
  useEffect(() => {
    const stored = localStorage.getItem("companyUserName");
    const company = companyUserName || stored;
    if (!company) return;

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/companies/companies/${company}`)
      .then((res) => {
        setCompanyDetails(res.data);
        localStorage.setItem("companyUserName", company);
      })
      .catch((err) => {
        console.error("Error fetching company details:", err);
      });
  }, [companyUserName]);

  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isRecruiterManager = userRole === 'recruiter_manager';

  useEffect(() => {
    if (redirect) {
      setTimeout(() => {
        window.location.href = `/${companyUserName}/login`;
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
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company_id": companyId  // Add company_id to headers
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        localStorage.setItem("company_id", companyId);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-2 flex items-center justify-center rounded-full p-1">
            <img
              src="/ATSLOGO.png"
              alt="ATS Logo"
              className="h-20 w-20 object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Please fill in your details</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Ex: Abhishek Sharma"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: abhisheksharma@gmail.com"
              autoComplete="off"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: A70, Down-Town Street, Mumbai"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Gender Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 appearance-none"
              style={{
                backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 8l5 5 5-5z\" fill=\"%236b7280\"/></svg>')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center"
              }}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <a
              href={`/${companyUserName}/login`}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm"
            >
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React, { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const companyId = localStorage.getItem("companyId");
  const companyUserName = localStorage.getItem("companyUserName");

  useEffect(() => {
    if (companyId) {
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company_id": companyId ?? "super",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("usertoken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("email", result.email);

        setSuccess("Login successful! Redirecting...");

        console.log("thisaa ia runnnaaas login", result.user);

        if (result.user.role !== "super") {
          setTimeout(() => {
            window.location.href = `/${companyUserName}`;
          }, 1500);
        } else {
          setTimeout(() => {
            console.log("thisaa ia runnnaaas login>>>");
            window.location.href = `/`;
          }, 1500);
        }
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 p-4 ">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-[96vh]">
        {/* Logo */}
        <div className="text-center mb-8 ">
          <div className="mx-auto mb-2 flex items-center justify-center rounded-full p-1">
            <img
              src="/ATSLOGO.png"
              alt="ATS Logo"
              className="h-20 w-20 object-cover rounded-full" // Makes the image itself rounded
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your ATS account</p>
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
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <a
              href={`/${companyUserName}/signup`}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
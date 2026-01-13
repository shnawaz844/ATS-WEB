import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, Shield, User, Sparkles, Save, ChevronLeft } from "lucide-react";
import BackButtonMobile from "../../components/Mob-back-btn";
import { useTheme } from "../../context/ThemeContext";

const Profile = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState({
    _id: "",
    userName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [initialUser, setInitialUser] = useState({
    userName: "",
    email: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("user");
        if (!token) {
          setMessage("No user data found. Please login again.");
          return;
        }

        const userData = JSON.parse(token);
        const userState = {
          _id: userData._id,
          userName: userData.userName || userData.name,
          email: userData.email,
          role: userData.role,
          password: "",
          confirmPassword: "",
        };
        setUser(userState);
        setInitialUser({
          userName: userData.userName || userData.name,
          email: userData.email,
          role: userData.role,
        });
      } catch (error) {
        console.error("Error fetching user data", error);
        setMessage("Error loading user data");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let timer;
    if (message.includes("successfully")) {
      timer = setTimeout(() => setMessage(""), 3000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const hasChanges = () => {
    if (user.userName !== initialUser.userName) return true;
    if (user.password && user.password === user.confirmPassword) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user.userName.trim()) {
      setMessage("Name is required!");
      setLoading(false);
      return;
    }

    if (user.password && user.password !== user.confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (user.password && user.password.length < 6) {
      setMessage("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("user");
      const updateData = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      };

      if (user.password.trim()) {
        updateData.password = user.password;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/users/update-user/${user._id}`,
        updateData,
        config
      );

      if (response.data.success) {
        setMessage("Profile updated successfully!");

        const updatedUserData = {
          ...JSON.parse(localStorage.getItem("user")),
          userName: user.userName
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Update initial user to reflect the new changes
        setInitialUser({
          userName: user.userName,
          email: user.email,
          role: user.role,
        });

        setUser(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        setMessage(response.data.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || "Error updating profile";

        if (status === 404) {
          setMessage("API endpoint not found. Please check your server configuration.");
        } else if (status === 401) {
          setMessage("Unauthorized. Please login again.");
        } else if (status === 400) {
          setMessage(errorMessage);
        } else {
          setMessage(`Server error: ${errorMessage}`);
        }
      } else if (error.request) {
        setMessage("Network error. Please check your connection and server status.");
      } else {
        setMessage("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isError =
    message &&
    (message.toLowerCase().includes("error") ||
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("match") ||
      message.toLowerCase().includes("required") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("network"));

  return (
    <div className={`px-8 py-4 w-full min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme === "dark" ? "bg-black" : "bg-gray-50"
      }`}>
      <BackButtonMobile />
      <div className="w-full max-w-4xl relative">
        {/* Floating decorative elements */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>

        {/* Main card with glassmorphism effect */}
        <div className={`backdrop-blur-2xl border rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300 ${theme === "dark"
          ? "bg-black border-white/20"
          : "bg-white border-gray-200"
          }`}>
          {/* Animated gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${theme === "dark"
            ? "from-white/10 via-transparent to-blue/5"
            : "from-blue-500/5 via-transparent to-purple-500/5"
            }`}></div>

          {/* Header Section */}
          <div className={`relative p-8 text-center backdrop-blur-sm ${theme === "dark"
            ? "bg-white/10"
            : "bg-gray-200"
            }`}>

            {/* Profile Avatar with enhanced effects */}
            <div className="relative z-10 mb-6">
              <div className="w-24 h-24 mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 via-gray-700 to-white rounded-full animate-spin-slow opacity-75"></div>
                <div className={`absolute inset-1 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${theme === "dark" ? "bg-white/20 group-hover:bg-white/30" : "bg-white/60 group-hover:bg-white/80"
                  }`}>
                  <User className={`w-10 h-10 drop-shadow-lg ${theme === "dark" ? "text-white" : "text-gray-700"
                    }`} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className={`text-4xl font-bold mb-2 tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
              <span>Profile Settings</span>
            </h1>
            <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-600"}`}>Customize your personal information</p>
          </div>

          {/* Form Section */}
          <div className="p-8 relative z-10">
            {/* Success/Error Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-sm transform transition-all duration-300 ${isError
                ? "bg-red-500/10 border-red-300/30 text-red-700"
                : "bg-green-500/10 border-green-300/30 text-green-700"
                }`}>
                <div className="flex items-center gap-3">
                  {isError ? (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className={`flex items-center gap-3 text-xl font-semibold pb-2 border-b ${theme === "dark" ? "text-gray-100 border-gray-200/50" : "text-gray-900 border-gray-200"
                  }`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-white rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="group">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}>
                      <User className="w-4 h-4 text-blue-500" />
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="userName"
                        value={user.userName}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-4 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm ${theme === "dark"
                          ? "bg-gray-800/50 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                          }`}
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}>
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={user.email}
                        disabled
                        className={`w-full px-4 py-4 border-2 rounded-xl cursor-not-allowed backdrop-blur-sm ${theme === "dark"
                          ? "bg-gray-800/30 border-gray-700/30 text-gray-400"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className={`text-xs mt-2 flex items-center gap-1 ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}>
                      <Shield className="w-3 h-3" />
                      Email cannot be modified for security reasons
                    </p>
                  </div>
                </div>

                {/* Role Field */}
                <div className="group">
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-700"
                    }`}>
                    <Shield className="w-4 h-4 text-gray-400" />
                    Account Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="role"
                      value={user.role}
                      disabled
                      className={`w-full px-4 py-4 border-2 rounded-xl cursor-not-allowed backdrop-blur-sm ${theme === "dark"
                        ? "bg-gray-800/30 border-gray-700/30 text-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                        }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}>Role is managed by system administrators</p>
                </div>
              </div>

              {/* Security Section */}
              <div className={`space-y-6 pt-6 border-t ${theme === "dark" ? "border-gray-200/50" : "border-gray-200"
                }`}>
                <h3 className={`flex items-center gap-3 text-xl font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Lock className="w-4 h-4 text-black" />
                  </div>
                  Security Settings
                  <span className="text-sm font-normal text-gray-100 bg-gray-500 px-3 py-1 rounded-full">Optional</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* New Password */}
                  <div className="group">
                    <label className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-700"
                      }`}>New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm ${theme === "dark"
                          ? "bg-gray-800/50 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                          }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100/50"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {user.password && user.password.length > 0 && user.password.length < 6 && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-700"
                      }`}>Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={user.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm ${theme === "dark"
                          ? "bg-gray-800/50 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                          }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100/50"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !hasChanges()}
                  className={`group relative w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${loading || !hasChanges()
                    ? "bg-gray-400 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 via-blue-400 to- text-white hover:from-white hover:via-gray-800 hover:to-gray-700 hover:scale-105 hover:shadow-2xl active:scale-95"
                    } overflow-hidden`}
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-white to-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Save Changes</span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Profile;
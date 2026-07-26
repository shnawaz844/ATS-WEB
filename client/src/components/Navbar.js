import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { NavLink, Link, useLocation, useParams } from "react-router-dom";
import {
  UserPen,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  Building,
  LayoutDashboard,
  FileText,
  Briefcase,
  Calendar,
  UserCheck,
  ChevronDown,
  BriefcaseBusiness
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const superNavItems = [
  { label: "Users", path: "/all-users", icon: <Users className="hidden lg:block w-5 h-5" /> },
  { label: "Companies", path: "/all-companies", icon: <Building className="hidden lg:block w-5 h-5" /> }
];

const adminNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-5" /> },
  // {
  //   label: "Hiring Manager",
  //   icon: <FileText className="w-4 h-5" />,
  //   subItems: [
  //     { label: "Application List", path: "/application-list", icon: <FileText className="hidden lg:block w-5 h-5" /> },
  //     { label: "Assigned Interviews", path: "/assigned-interviews", icon: <Calendar className="hidden lg:block w-5 h-5" /> },
  //     { label: "Interviews", path: "/all-interviews", icon: <BriefcaseBusiness className="w-4 h-5" /> },
  //     { label: "Import Application", path: "/import-application", icon: <BriefcaseBusiness className="w-4 h-5" /> }
  //   ]
  // },
  {
    label: "Recruiter Manager",
    icon: <FileText className="w-4 h-5" />,
    subItems: [
      { label: "Jobs", path: "/all-jobs", icon: <Briefcase className="hidden lg:block w-5 h-5" /> },
      { label: "Applications", path: "/all-applications", icon: <FileText className="hidden lg:block w-5 h-5" /> },
      { label: "Interviews", path: "/all-interviews", icon: <BriefcaseBusiness className="w-4 h-5" /> },
    ]
  },
  // {
  //   label: "Interviewer",
  //   icon: <FileText className="w-4 h-5" />,
  //   subItems: [
  //     { label: "Scheduled Interviews", path: "/scheduled-interview", icon: <Calendar className="hidden lg:block w-5 h-5" /> },
  //   ]
  // },
  {
    label: "Configuration",
    icon: <FileText className="w-4 h-5" />,
    subItems: [
      { label: "Users", path: "/all-users", icon: <Users className="w-4 h-5" /> },
      { label: "Application Statuses", path: "/application-statuses", icon: <FileText className="w-4 h-5" /> },
      { label: "Interview Status", path: "/interview-rounds", icon: <Calendar className="w-4 h-5" /> },
      { label: "Job Status", path: "/job-statuses", icon: <Calendar className="w-4 h-5" /> },
    ]
  },
];

const hiringManagerNavItems = [
  { label: "Dashboard", path: "/hiring_manager", icon: <LayoutDashboard className="hidden lg:block w-5 h-5" /> },
  { label: "Application List", path: "/application-list", icon: <FileText className="hidden lg:block w-5 h-5" /> },
  { label: "Assigned Interviews", path: "/assigned-interviews", icon: <Calendar className="hidden lg:block w-5 h-5" /> },
  { label: "Interviews", path: "/all-interviews" },
  // { label: "Import Application", path: "/import-application", icon: <BriefcaseBusiness className="w-4 h-5" /> }
];

const interviewerNavItems = [
  { label: "Dashboard", path: "/interviewer-dashboard", icon: <Home className="hidden lg:block w-5 h-5" /> },
  { label: "Scheduled Interviews", path: "/scheduled-interview", icon: <Calendar className="hidden lg:block w-5 h-5" /> },
  { label: "Import Application", path: "/import-application", icon: <BriefcaseBusiness className="w-4 h-5" /> }
];

const recruiterNavItems = [
  { label: "Dashboard", path: "/recruiter-dashboard", icon: <Home className="hidden lg:block w-5 h-5 " /> },
  { label: "Jobs", path: "/all-jobs", icon: <Briefcase className="hidden lg:block w-5 h-5" /> },
  { label: "Applications", path: "/all-applications", icon: <FileText className="hidden lg:block w-5 h-5" /> },
  { label: "Assigned Interviews", path: "/assigned-interviews", icon: <Calendar className="hidden lg:block w-5 h-5" /> },
  // { label: "Interviews", path: "/all-interviews" },
  // { label: "Import Application", path: "/import-application", icon: <BriefcaseBusiness className="w-4 h-5" /> }
];

const candidateNavItems = [
  { label: "All Jobs", path: "/all-posted-jobs", icon: <Briefcase className="hidden lg:block w-5 h-5" /> },
  { label: "Applied Jobs", path: `/my-jobs`, icon: <UserCheck className="hidden lg:block w-5 h-5" /> },
];

export const Navbar = () => {
  const { theme } = useTheme();
  const { companyUserName: urlCompanyUserName } = useParams();
  const [companyUserName, setCompanyUserName] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const [company, setCompany] = useState([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Update companyUserName when URL changes or from localStorage
  useEffect(() => {
    if (urlCompanyUserName) {
      setCompanyUserName(urlCompanyUserName);
    } else {
      const storedName = localStorage.getItem("companyUserName");
      if (storedName) {
        setCompanyUserName(storedName);
      }
    }
  }, [urlCompanyUserName]);
  // Fetch company data whenever companyUserName changes
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!companyUserName) {
        setCompany([]);
        return;
      }

      setIsLoadingCompany(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/companies/companies/${companyUserName}`
        );

        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        } else {
          setCompany([]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompany([]);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompanies();
  }, [companyUserName]);

  const normalNavItem = [
    { label: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      label: "All Jobs",
      path: `/all-posted-jobs`,
      icon: <Briefcase className="w-5 h-5" />
    }
  ];

  const [navItems, setNavItems] = useState(normalNavItem);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const handlerIsMenuOpen = () => setIsMenuOpen(!isMenuOpen);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      const user = JSON.parse(token);
      setLoginData(user);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setNavItems(loginData?.role === "super" ? superNavItems : []);
    } else {
      // Reapply the default or user role-based navigation items
      if (loginData) {
        switch (loginData.role) {
          case "super":
            setNavItems(superNavItems);
            break;
          case "admin":
            setNavItems(adminNavItems);
            break;
          case "hiring_manager":
            setNavItems(hiringManagerNavItems);
            break;
          case "interviewer":
            setNavItems(interviewerNavItems);
            break;
          case "recruiter_manager":
            setNavItems(recruiterNavItems);
            break;
          case "candidate":
            setNavItems(candidateNavItems);
            break;
          default:
            setNavItems(normalNavItem);
        }
      }
    }
  }, [location, loginData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      const isOutsideNavDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideUserDropdown = userDropdownRef.current && !userDropdownRef.current.contains(event.target);

      if (isOutsideUserDropdown && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const logoutHandler = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/logout`, {
        method: "POST",
      })
      const result = await res.json()
      console.log("result,result")

      if (result.success) {
        localStorage.removeItem("usertoken")
        localStorage.removeItem("user")
        localStorage.removeItem("email")
        localStorage.removeItem("companyId")
        localStorage.removeItem("sub_role");

        setLoginData(null)
        window.location.reload();
      }

      if (loginData.role !== "super") {
        window.location.href = `/${companyUserName}`;
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <div className="w-full sticky top-0 z-50">
      <nav className={`relative z-50 border-b transition-colors duration-300 ${theme === "dark" ? "bg-black border-gray-800" : "bg-white border-gray-200"
        }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* BRAND */}
            <div className="flex items-center">
              <NavLink
                to={companyUserName ? `/${companyUserName}` : "/"}
                className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
              >
                <img
                  src={companyUserName && company?.image ? company.image : "/ATSLOGO.png"}
                  className="rounded-full h-12 md:h-14"
                  alt="ATS Logo"
                />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent ml-2 hidden sm:block">
                  <span className="font-extrabold text-xl md:text-2xl capitalize">
                    {companyUserName ? company?.CompanyUserName?.toLowerCase() : "ATS"}
                  </span>
                </span>
              </NavLink>
            </div>

            {/* MAIN MENU - Desktop */}
            <div className="hidden xl:flex items-center justify-center space-x-8">
              {navItems.map((item) => {
                const userRole = loginData?.role ? loginData?.role : null;

                // Handle items with subItems (dropdown)
                if (item.subItems) {
                  return (
                    <div key={item.label} className="relative group" ref={dropdownRef}>
                      <button
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${item.subItems.some(subItem => location.pathname === (userRole === "super" ? subItem.path : `/${companyUserName}${subItem.path}`))
                          ? (theme === "dark" ? "text-white bg-gray-800" : "text-purple-700 bg-purple-50")
                          : (theme === "dark"
                            ? "text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-700"
                            : "text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-100")
                          }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>

                      <div className={`absolute left-0 mt-2 w-56 origin-top-left rounded-md shadow-lg ring-1 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${theme === "dark" ? "bg-gray-900 ring-gray-800" : "bg-white ring-gray-200"
                        }`}>
                        <div className="py-1">
                          {item.subItems.map((subItem) => {
                            const to = userRole === "super" ? subItem.path : `/${companyUserName}${subItem.path}`;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={to}
                                onClick={() => {
                                  // Set sub_role for Hiring Manager only
                                  if (item.label === "Hiring Manager") {
                                    localStorage.setItem("sub_role", "hiring_manager");
                                  } else if (item.label === "Recruiter Manager") {
                                    localStorage.setItem("sub_role", "recruiter_manager");
                                  } else if (item.label === "Interviewer") {
                                    localStorage.setItem("sub_role", "interviewer");
                                  }
                                  setIsDropdownOpen(false);
                                  setIsMenuOpen(false);
                                }}
                                className={({ isActive }) =>
                                  `flex items-center px-4 py-2 text-sm transition-colors ${isActive
                                    ? (theme === "dark" ? "bg-gray-800 font-medium text-white" : "bg-purple-50 font-medium text-purple-700")
                                    : (theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50")
                                  }`
                                }
                              >
                                {subItem.icon && <span className="mr-3">{subItem.icon}</span>}
                                {subItem.label}
                              </NavLink>
                            );
                          })}

                        </div>
                      </div>
                    </div>
                  );
                }

                // Handle regular items
                const path = item.path;
                const to = path === "/" ? `/${companyUserName}` : userRole === "super" ? path : `/${companyUserName}${path}`;

                return (
                  <NavLink
                    key={path}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? (theme === "dark" ? "text-white bg-gray-800" : "text-purple-700 bg-purple-50")
                        : (theme === "dark"
                          ? "text-gray-300 border border-transparent hover:text-white hover:border-gray-700 hover:bg-gray-800"
                          : "text-gray-600 border border-transparent hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50")
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Theme Toggle - Desktop */}


            {/* User info or Login/Signup - Desktop */}
            <div className="hidden xl:flex items-center">
              <div className="mr-5">
                <ThemeToggle />
              </div>
              {loginData ? (
                <div className="relative flex items-center space-x-4" ref={userDropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${theme === "dark"
                      ? "text-white bg-gray-800 hover:bg-gray-700 focus:ring-gray-700"
                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:ring-purple-500"
                      }`}
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    <span>{loginData?.userName}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  {isDropdownOpen && (
                    <div className={`absolute right-0 top-12 w-48 mt-2 rounded-md shadow-lg z-100 py-1 ring-1 transform origin-top-right transition-all ${theme === "dark" ? "bg-gray-900 ring-gray-800" : "bg-white ring-gray-200"
                      }`}>
                      <div className="flex flex-col items-center justify-center">
                        <p className={`text-xs truncate mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {loginData?.email}
                        </p>
                        <p className={`text-xs font-medium mt-1 capitalize ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                          {loginData?.role?.replace('_', ' ')}
                        </p>
                      </div>
                      <hr className={`my-1 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`} />
                      <Link
                        to={companyUserName ? `/${companyUserName}/profile` : "/profile"}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center px-4 py-3 text-sm transition-colors ${theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <UserPen className={`w-4 h-4 mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Profile</span>
                      </Link>
                      <hr className={`my-1 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`} />
                      <button
                        onClick={() => {
                          logoutHandler();
                          setIsDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-3 text-sm transition-colors ${theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <LogOut className={`w-4 h-4 mr-3 rounded ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {location.pathname !== "/" && (
                    <>
                      <Link
                        to={companyUserName ? `/${companyUserName}/login` : "/login"}
                        className={`px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${theme === "dark"
                          ? "text-white bg-gray-800 hover:bg-gray-700 hover:border hover:border-gray-700 focus:ring-gray-700"
                          : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-purple-500"
                          }`}
                      >
                        Login
                      </Link>
                      <Link
                        to={companyUserName ? `/${companyUserName}/signup` : "/signup"}
                        className={`px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${theme === "dark"
                          ? "text-white bg-gray-800 hover:bg-gray-700 hover:border hover:border-gray-700 focus:ring-gray-700"
                          : "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                          }`}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>

              )}
            </div>

            {/* HAMBURGER MENU */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={handlerIsMenuOpen}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className="xl:hidden">
          {/* Backdrop Overlay */}
          <div
            className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Side Drawer */}
            <div
              className={`absolute top-0 right-0 w-[85%] max-w-sm h-full shadow-2xl transition-transform duration-500 ease-out transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                } ${theme === "dark"
                  ? "bg-gray-900/90 border-l border-gray-800"
                  : "bg-white/90 border-l border-gray-200"
                } backdrop-blur-xl flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-200/10 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                  <img
                    src={companyUserName && company?.image ? company.image : "/ATSLOGO.png"}
                    className="h-10 w-10 rounded-full ring-2 ring-purple-500/20"
                    alt="Logo"
                  />
                  <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {companyUserName ? company?.CompanyUserName?.toUpperCase() : "ATS"}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                    }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items - Scrollable Area */}
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {(loginData ? navItems : normalNavItem).map((item) => {
                  if (item.subItems) {
                    const hasActiveSubItem = item.subItems.some(subItem =>
                      location.pathname === (loginData?.role === "super" ? subItem.path : `/${companyUserName}${subItem.path}`)
                    );

                    return (
                      <div key={item.label} className="space-y-1">
                        <button
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${hasActiveSubItem
                            ? (theme === "dark" ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-700")
                            : (theme === "dark" ? "text-gray-300 hover:bg-gray-800/50" : "text-gray-600 hover:bg-gray-50")
                            }`}
                          onClick={() => {
                            const subItems = document.getElementById(`subitems-${item.label}`);
                            const icon = document.getElementById(`icon-${item.label}`);
                            subItems.classList.toggle('hidden');
                            icon.classList.toggle('rotate-180');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-gray-500/5">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown id={`icon-${item.label}`} className="w-4 h-4 transition-transform duration-300" />
                        </button>

                        <div id={`subitems-${item.label}`} className="hidden pl-4 space-y-1 mt-1 border-l-2 border-gray-100 dark:border-gray-800 ml-6">
                          {item.subItems.map((subItem) => {
                            const to = loginData?.role === "super" ? subItem.path : `/${companyUserName}${subItem.path}`;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? (theme === "dark" ? "text-white bg-white/5" : "text-purple-700 bg-purple-50/50")
                                    : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-purple-600")
                                  }`
                                }
                              >
                                {subItem.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const path = item.path;
                  const to = path === "/" ? `/${companyUserName}` : loginData?.role === "super" ? path : `/${companyUserName}${path}`;

                  return (
                    <NavLink
                      key={path}
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${isActive
                          ? (theme === "dark" ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-700 shadow-sm")
                          : (theme === "dark" ? "text-gray-300 hover:bg-gray-800/50" : "text-gray-600 hover:bg-gray-50")
                        }`
                      }
                    >
                      <span className="p-2 rounded-xl bg-gray-500/5">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Drawer Footer - User Session & Theme */}
              <div className={`p-6 space-y-6 border-t ${theme === "dark" ? "border-gray-800 bg-black/20" : "border-gray-100 bg-gray-50/50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Appearance</span>
                  <div className="scale-110">
                    <ThemeToggle />
                  </div>
                </div>

                {loginData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {loginData?.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {loginData?.userName}
                        </p>
                        <p className="text-xs text-gray-400 truncate capitalize">{loginData?.role?.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/${companyUserName}/profile`}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${theme === "dark"
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <UserPen className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logoutHandler();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={companyUserName ? `/${companyUserName}/login` : "/login"}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 rounded-2xl text-center text-base font-bold bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 active:scale-95 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to={companyUserName ? `/${companyUserName}/signup` : "/signup"}
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full py-3 rounded-2xl text-center text-base font-bold border-2 transition-all ${theme === "dark"
                        ? "border-gray-800 text-white hover:bg-gray-800"
                        : "border-gray-100 text-gray-700 hover:border-gray-200"
                        }`}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
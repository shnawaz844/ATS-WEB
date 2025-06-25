import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
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

const superNavItems = [
  { label: "Users", path: "/all-users", icon: <Users className="w-5 h-5" /> },
  { label: "Companies", path: "/all-companies", icon: <Building className="w-5 h-5" /> }
];

const adminNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-5" /> },
  {
    label: "Hiring Manager",
    icon: <FileText className="w-4 h-5" />,
    subItems: [
      { label: "Application List", path: "/application-list", icon: <FileText className="w-5 h-5" /> },
      { label: "Assigned Interviews", path: "/assigned-interviews", icon: <Calendar className="w-5 h-5" /> },
      { label: "Interviews", path: "/all-interviews", icon: <BriefcaseBusiness className="w-4 h-5" /> }
    ]
  },
  {
    label: "Recruiter Manager",
    icon: <FileText className="w-4 h-5" />,
    subItems: [
      { label: "Jobs", path: "/all-jobs", icon: <Briefcase className="w-5 h-5" /> },
      { label: "Applications", path: "/all-applications", icon: <FileText className="w-5 h-5" /> },
      { label: "Interviews", path: "/all-interviews", icon: <BriefcaseBusiness className="w-4 h-5" /> },
    ]
  },
  {
    label: "Interviewer",
    icon: <FileText className="w-4 h-5" />,
    subItems: [
      { label: "Scheduled Interviews", path: "/scheduled-interview", icon: <Calendar className="w-5 h-5" /> },
    ]
  },
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
  { label: "Dashboard", path: "/hiring_manager", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Application List", path: "/application-list", icon: <FileText className="w-5 h-5" /> },
  { label: "Assigned Interviews", path: "/assigned-interviews", icon: <Calendar className="w-5 h-5" /> },
  { label: "Interviews", path: "/all-interviews" },
];

const interviewerNavItems = [
  { label: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
  { label: "Scheduled Interviews", path: "/scheduled-interview", icon: <Calendar className="w-5 h-5" /> },
];

const recruiterNavItems = [
  { label: "Home", path: "/recruiter-dashboard", icon: <Home className="w-5 h-5 " /> },
  { label: "Jobs", path: "/all-jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Applications", path: "/all-applications", icon: <FileText className="w-5 h-5" /> },
  { label: "Interviews", path: "/all-interviews" },
];

const candidateNavItems = [
  { label: "All Jobs", path: "/all-posted-jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Applied Jobs", path: `/my-jobs`, icon: <UserCheck className="w-5 h-5" /> },
];

export const Navbar = () => {
  const [ companyUserName, setCompanyUserName ] = useState( null );
  const [ loginData, setLoginData ] = useState( null );
  const [ isMenuOpen, setIsMenuOpen ] = useState( false );
  const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
  const location = useLocation();
  const [ company, setCompany ] = useState( [] );
  
  useEffect( () => {
    function fetchCompanyUserName() {
      const storedName = localStorage.getItem( "companyUserName" );
      if ( storedName ) {
        setCompanyUserName( storedName );
      } else {
        setTimeout( fetchCompanyUserName, 1000 );
      }
    }

    fetchCompanyUserName();
  }, [] );

   
  console.log("isDropdownOpen", isDropdownOpen);
   useEffect( () => {

     const fetchCompanies = async () => {
       try {
         const response = await fetch(
           `${ process.env.REACT_APP_BASE_URL }/companies/companies/${ companyUserName }`
         )
         if ( response.ok ) {
           const data = await response.json()
           setCompany( data )
         } else {
           setCompany( [] )
         }
       } catch ( error ) {
         console.error( 'Error fetching companies:', error )
       }
     }

     fetchCompanies();
   }, [ companyUserName ] )

  const normalNavItem = [
    { label: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      label: "All Jobs",
      path: `/all-posted-jobs`,
      icon: <Briefcase className="w-5 h-5" />
    }
  ];
  const [ navItems, setNavItems ] = useState( normalNavItem );
  const dropdownRef = useRef( null );
  const userDropdownRef = useRef( null );

  const handlerIsMenuOpen = () => setIsMenuOpen( !isMenuOpen );

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen( ( prev ) => !prev );
  };

  useEffect( () => {
    const token = localStorage.getItem( "user" );
    if ( token ) {
      const user = JSON.parse( token );
      setLoginData( user );
    }
  }, [] );

  useEffect( () => {
    if ( location.pathname === "/" ) {
      setNavItems( loginData?.role === "super" ? superNavItems : [] ); 
    } else {
      // Reapply the default or user role-based navigation items
      if ( loginData ) {
        switch ( loginData.role ) {
          case "super":
            setNavItems( superNavItems );
            break;
          case "admin":
            setNavItems( adminNavItems );
            break;
          case "hiring_manager":
            setNavItems( hiringManagerNavItems );
            break;
          case "interviewer":
            setNavItems( interviewerNavItems );
            break;
          case "recruiter_manager":
            setNavItems( recruiterNavItems );
            break;
          case "candidate":
            setNavItems( candidateNavItems );
            break;
          default:
            setNavItems( normalNavItem );
        }
      }
    }
  }, [ location, loginData ] );

  useEffect( () => {
    const handleClickOutside = ( event ) => {
      // Check if click is outside both dropdowns
      const isOutsideNavDropdown = dropdownRef.current && !dropdownRef.current.contains( event.target );
      const isOutsideUserDropdown = userDropdownRef.current && !userDropdownRef.current.contains( event.target );

      if ( isOutsideUserDropdown && isDropdownOpen ) {
        setIsDropdownOpen( false );
      }
    };

    if ( isDropdownOpen ) {
      document.addEventListener( 'mousedown', handleClickOutside );
      document.addEventListener( 'touchstart', handleClickOutside );
    }

    return () => {
      document.removeEventListener( 'mousedown', handleClickOutside );
      document.removeEventListener( 'touchstart', handleClickOutside );
    };
  }, [ isDropdownOpen ] );

  const logoutHandler = async () => {
    try {
      const res = await fetch( `${ process.env.REACT_APP_BASE_URL }/auth/logout`, {
        method: "POST",
      } )
      const result = await res.json()
      console.log( "result,result" )

      if ( result.success ) {
        localStorage.removeItem( "usertoken" )
        localStorage.removeItem( "user" )
        localStorage.removeItem( "email" )
        localStorage.removeItem( "companyId" )

        setLoginData( null )
        window.location.reload();
      }

      if ( loginData.role !== "super" ) {
        window.location.href = `/${ companyUserName }`;
      } else {
        window.location.href = "/";
      }
    } catch ( err ) {
      console.error( "Logout error:", err )
    }
  }

  return (
    <div className="w-full sticky top-0 z-50">
      <nav className="bg-gray-700 relative z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* BRAND */ }
            <div className="flex items-center">
              <NavLink
                to={ companyUserName ? `/${ companyUserName }` : "/" }
                className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
              >
                <img
                  src={ companyUserName && company?.image ? company.image : "/ATSLOGO.png" }
                  className="rounded-full h-12 md:h-14 border-2 border-gray-300"
                  alt="ATS Logo"
                />
                <span className="text-white ml-2 hidden sm:block">
                  <span className="font-extrabold text-xl md:text-2xl">
                    { companyUserName ? company.CompanyUserName : "ATS" }
                  </span>
                </span>
              </NavLink>
            </div>

            {/* MAIN MENU - Desktop */ }
            <div className="hidden md:flex items-center justify-center space-x-8">
              { navItems.map( ( item ) => {
                const userRole = loginData?.role ? loginData?.role : null;

                // Handle items with subItems (dropdown)
                if ( item.subItems ) {
                  return (
                    <div key={ item.label } className="relative group" ref={ dropdownRef }>
                      <button
                        className={ `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-600 ${ item.subItems.some( subItem => location.pathname === ( userRole === "super" ? subItem.path : `/${ companyUserName }${ subItem.path }` ) )
                            ? "text-white bg-slate-600"
                            : "text-gray-300 hover:text-white hover:border hover:border-white"
                          }` }
                      >
                        { item.icon }
                        <span>{ item.label }</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>

                      <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          { item.subItems.map( ( subItem ) => {
                            const to = userRole === "super" ? subItem.path : `/${ companyUserName }${ subItem.path }`;
                            return (
                              <NavLink
                                key={ subItem.path }
                                to={ to }
                                className={ ( { isActive } ) =>
                                  `flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${ isActive ? "bg-gray-100 font-medium" : ""
                                  }`
                                }
                              >
                                { subItem.icon && <span className="mr-3">{ subItem.icon }</span> }
                                { subItem.label }
                              </NavLink>
                            );
                          } ) }
                        </div>
                      </div>
                    </div>
                  );
                }

                // Handle regular items
                const path = item.path;
                const to = path === "/" ? `/${ companyUserName }` : userRole === "super" ? path : `/${ companyUserName }${ path }`;

                return (
                  <NavLink
                    key={ path }
                    to={ to }
                    className={ ( { isActive } ) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-600 ${ isActive
                        ? "text-white bg-slate-600"
                        : "text-gray-300 hover:text-white hover:border hover:border-white"
                      }`
                    }
                  >
                    { item.icon }
                    <span>{ item.label }</span>
                  </NavLink>
                );
              } ) }
            </div>

            {/* User info or Login/Signup - Desktop */ }
            <div className="hidden md:flex items-center">
              { loginData ? (
                <div className="relative flex items-center space-x-4" ref={ dropdownRef }>
                  <button
                    onClick={ toggleDropdown }
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-xl hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    <span>{ loginData?.userName }</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  { isDropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 mt-2 bg-white rounded-md shadow-lg z-100 py-1 ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all">
                      <Link
                        to={ companyUserName ? `/${ companyUserName }/profile` : "/profile" }
                        onClick={ () => {
                          setIsDropdownOpen( false );
                          setIsMenuOpen( false );
                         }}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <UserPen className="w-4 h-4 mr-3 text-gray-600" />
                        <span>Profile</span>
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={ () => {
                          logoutHandler();
                          setIsDropdownOpen( false );
                          setIsMenuOpen( false );
                        }}
                        className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-gray-600 rounded" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) }
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  { location.pathname !== "/" ? (
                    <>
                      <Link
                        to={ companyUserName ? `/${ companyUserName }/login` : "/login" }
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:border hover:border-white rounded-xl hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                      >
                        Login
                      </Link>
                      <Link
                        to={ companyUserName ? `/${ companyUserName }/signup` : "/signup" }
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:border hover:border-white rounded-xl hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={ companyUserName ? `/${ companyUserName }/login` : "/login" }
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-white rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                    >
                      Login
                    </Link>
                  ) }
                </div>

              ) }
            </div>

            {/* HAMBURGER MENU */ }
            <div className="md:hidden flex items-center">
              <button
                onClick={ handlerIsMenuOpen }
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                { isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                ) }
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */ }
        <div className={ `/${ isMenuOpen ? "block" : "hidden" } md:hidden` }>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800">
            { navItems.map( ( { label, path, icon } ) => (
              <NavLink
                key={ path }
                to={ `/${ companyUserName }` }
                onClick={ () => setIsMenuOpen( false ) }
                className={ ( { isActive } ) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${ isActive
                    ? "text-white bg-slate-600"
                    : "text-gray-300 hover:text-white hover:bg-slate-600"
                  }`
                }
              >
                { icon }
                <span>{ label }</span>
              </NavLink>
            ) ) }

            {/* User actions - Mobile */ }
            <div className="mt-4 pt-4 border-t border-gray-700">
              { loginData ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2 text-base font-medium text-gray-300">
                    <UserCheck className="w-5 h-5 mr-3" />
                    <span>Signed in as { loginData?.userName }</span>
                  </div>
                  <Link
                    to={ `/${ companyUserName }/profile` }
                    onClick={ () => setIsMenuOpen( false ) }
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-600"
                  >
                    <UserPen className="w-5 h-5 mr-3" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={ () => {
                      logoutHandler();
                      setIsMenuOpen( false );
                    } }
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-600"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to={ companyUserName ? `/${ companyUserName }/login` : "/login" }
                    onClick={ () => setIsMenuOpen( false ) }
                    className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Login
                  </Link>
                  <Link
                    to={ companyUserName ? `/${ companyUserName }/signup` : "/signup" }
                    onClick={ () => setIsMenuOpen( false ) }
                    className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-white bg-slate-600 rounded-md hover:bg-slate-500"
                  >
                    Sign Up
                  </Link>
                </div>
              ) }
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
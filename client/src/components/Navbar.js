import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  UserPen, LogOut
} from "lucide-react";
import atslogo1URL from "../assets/img/logo1.png"

// Navigation Arrays
const superNavItems = [
  { label: "Users", path: "/all-users" },
  { label: "Companies", path: "/all-companies" }
];

const adminNavItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Users", path: "/all-users" },
  { label: "Application Types", path: "/application-types" },
  { label: "Interview Rounds", path: "/interview-rounds" },
];

const hiringManagerNavItems = [
  { label: "Dashboard", path: "/hiring_manager" },
  { label: "Application List", path: "/application-list" },
  { label: "Assigned Interviews", path: "/assigned-interviews" },
  { label: "Interviews", path: "/all-interviews" },
];

const interviewerNavItems = [
  { label: "Home", path: "/" },
  // { label: "Dashboard", path: "/interviewer/review" },
  { label: " Scheduled Interviews", path: "/scheduled-interview" },
  { label: "Applications", path: "/shortlist" },
];

const recruiterNavItems = [
  { label: "Home", path: "/recruiter-dashboard" },
  { label: "Jobs", path: "/all-jobs" },
  { label: "Applications", path: "/all-applications" },
  { label: "Interviews", path: "/all-interviews" },
  
];

const candidateNavItems = [
  { label: "All Jobs", path: "/all-posted-jobs" },
  { label: "Applied Jobs", path: `/my-jobs` },
];

const normalNavItem = [
  { label: "Home", path: "/" },
  { label: "All Jobs", path: "/all-posted-jobs" },
];

export const Navbar = () => {
  const [loginData, setLoginData] = useState(null);
  const [navItems, setNavItems] = useState(normalNavItem);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handlerIsMenuOpen = () => setIsMenuOpen(!isMenuOpen);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      const user = JSON.parse(token);
      setLoginData(user);
    }
  }, []);

  useEffect(() => {
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
    } else {
      setNavItems(normalNavItem);
    }
  }, [loginData]);

  const logoutHandler = async () => {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setLoginData(null);
          localStorage.removeItem("usertoken");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      });
  };
  return (
    <div className="w-full ">
      <nav className="flex justify-between items-center py-6 px-4 text-clearWhite bg-gradient-to-r from-slate-600 to-slate-700">
        {/* BRAND */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-2xl text-[#e1e5df]"
        >
          <a
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
        >
            <img
                src={atslogo1URL}
                className="rounded-full h-12 md:h-16"
                alt="Flowbite Logo"
            />
        </a>
          {/* <span className="text-clearWhite ml-8 font-extrabold text-xl md:text-3xl transition-transform duration-200 hover:scale-105">
            A T S
          </span> */}
        </NavLink>

        {/* MAIN MENU - Centered for large screens */}
        <div className="hidden md:flex justify-center flex-grow gap-12 font-bold">
          {navItems.map(({ label, path }) => (
            <li
              key={path}
              className="text-lg text-clearWhite transition-transform duration-100 hover:scale-105"
            >
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive ? "text-mediumGray" : ""
                }
              >
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </div>

        {/* User info or Login/Signup */}
        <div>
          {loginData ? (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="py-2 px-5 bg-mediumGray text-clearWhite rounded hover:bg-white hover:text-black hover:border-clearWhite transition-all duration-100"
              >
                {loginData?.userName}
              </button>
              {isDropdownOpen && (

                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:rounded-lg  transition-colors"
                  >
                    <UserPen className="w-4 h-4 mr-2 text-gray-600" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={logoutHandler}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-gray-600" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-base text-primary font-medium space-x-5 hidden md:block">
              <Link
                to="/login"
                className="py-2 px-5 rounded bg-mediumGray text-clearWhite hover:border-2 hover:border-clearWhite transition-all duration-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="py-2 px-5 rounded bg-mediumGray text-clearWhite hover:border-2 hover:border-clearWhite transition-all duration-100"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* HAMBURGER MENU */}
        <div className="text-primary md:hidden flex justify-end items-center gap-2">
          <box-icon
            name={isMenuOpen ? "x" : "menu"}
            size="md"
            color="text-primary"
            onClick={handlerIsMenuOpen}
          ></box-icon>
        </div>
      </nav >


      {/* MAIN MENU sm device */}
      <div div
        className={` ${isMenuOpen ? "" : "hidden"
          } font-bold px-4 bg-gray-200 py-5 rounded`}
      >
        <ul className="md:hidden sm:flex flex-col">
          {isMenuOpen &&
            navItems.map(({ label, path }) => (
              <li
                key={path}
                className="text-base text-primary first:text-black py-1"
              >
                <NavLink
                  to={path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <span onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {label}
                  </span>
                </NavLink>
              </li>
            ))}
          {/* Login/signup sm-device */}
          <div>
            {loginData ? (
              <div onClick={logoutHandler} className="py-2 px-5 border rounded">
                Logout
              </div>
            ) : (
              <li onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Link to="/login" className="py-1 text-primary">
                  Login
                </Link>
              </li>
            )}
          </div>
        </ul>
      </div >

      <Outlet />
    </div >
  );
};

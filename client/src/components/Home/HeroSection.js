"use client";

import { ArrowRight, Building } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const HeroSection = () => {
    // ✅ Hook component ke andar
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            className={`transition-colors duration-300 px-10  ${theme === "dark" ? "bg-black" : ""
                }`}
        >
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[60vh] md:min-h-[80vh]">
                <div className="space-y-6 max-w-xl">
                    <div className="inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                        <span className={`font-medium text-sm ${theme === "dark" ? "text-indigo-300" : "text-indigo-900"}`}>
                            Streamline Your Hiring Process
                        </span>
                    </div>

                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Find & Hire{" "}
                        <span className="text-[#9333ea]">Top Talent</span> Faster
                    </h1>

                    <p className={`text-lg ${theme === "dark" ? "text-slate-300" : "text-slate-900"}`}>
                        Simplify your recruitment process with our powerful applicant
                        tracking system. Post jobs, screen candidates, and make better
                        hiring decisions.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <button className="bg-purple-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-medium transition-all duration-300 shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                            Get Started <ArrowRight size={18} />
                        </button>

                        <button
                            className={`${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-800/10 hover:bg-gray-800/20 text-gray-800"} py-3 px-8 rounded-full font-medium backdrop-blur-sm transition-all duration-300`}
                        >
                            Book A Demo
                        </button>
                    </div>
                </div>

                <div className="relative hidden md:block">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <img
                            src={require("../../assets/img/banner_1.png")}
                            alt="Applicant Tracking System"
                            className="rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Trusted By Companies */}
            <div className="mt-0 mb-0 md:mt-20 md:mb-16">
                <p className={`text-center mb-10 text-lg font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-900"}`}>
                    Trusted by industry leaders worldwide
                </p>

                {/* Desktop: Original design */}
                <div className="hidden sm:flex flex-wrap justify-center gap-6 md:gap-10">
                    {[
                        "TechCorp",
                        "InnovateLabs",
                        "FutureWorks",
                        "GlobalTech",
                        "NextGen",
                    ].map((name) => (
                        <div key={name} className="group relative">
                            <div className={`absolute inset-0 backdrop-blur-sm rounded-xl border ${theme === "dark"
                                ? "bg-white/5 border-white/10"
                                : "bg-gradient-to-br from-purple-300/30 via-blue-100/30 to-indigo-200/30 border-purple-200"} group-hover:border-purple-500/50 transition-all duration-300`} />
                            <div className="relative flex items-center gap-3 px-6 py-4">
                                <div className={`p-2 rounded-lg ${theme === "dark"
                                    ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                                    : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"}`}>
                                    <Building size={20} className={`${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                                </div>
                                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile: 2 top, 3 bottom */}
                <div className="sm:hidden flex flex-col items-center gap-4 px-4">
                    {/* Top row - 2 boxes */}
                    <div className="flex justify-center gap-3 w-full">
                        {["TechCorp", "InnovateLabs"].map((name) => (
                            <div key={name} className="group relative flex-1">
                                <div className={`absolute inset-0 backdrop-blur-sm rounded-lg border ${theme === "dark"
                                    ? "bg-white/5 border-white/10"
                                    : "bg-gradient-to-br from-purple-300/30 via-blue-100/30 to-indigo-200/30 border-purple-200"} group-hover:border-purple-500/50 transition-all duration-300`} />
                                <div className="relative flex flex-col items-center p-3">
                                    <div className={`p-1.5 mb-1 rounded-md ${theme === "dark"
                                        ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                                        : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"}`}>
                                        <Building size={16} className={`${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                                    </div>
                                    <span className={`font-semibold text-xs text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom row - 3 boxes */}
                    <div className="flex justify-center gap-3 w-full">
                        {["FutureWorks", "GlobalTech", "NextGen"].map((name) => (
                            <div key={name} className="group relative flex-1">
                                <div className={`absolute inset-0 backdrop-blur-sm rounded-lg border ${theme === "dark"
                                    ? "bg-white/5 border-white/10"
                                    : "bg-gradient-to-br from-purple-300/30 via-blue-100/30 to-indigo-200/30 border-purple-200"} group-hover:border-purple-500/50 transition-all duration-300`} />
                                <div className="relative flex flex-col items-center p-3">
                                    <div className={`p-1.5 mb-1 rounded-md ${theme === "dark"
                                        ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                                        : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"}`}>
                                        <Building size={16} className={`${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                                    </div>
                                    <span className={`font-semibold text-xs text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

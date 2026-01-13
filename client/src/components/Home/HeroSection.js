"use client";

import { ArrowRight, Building } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const HeroSection = () => {
    // ✅ Hook component ke andar
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            className={`transition-colors duration-300 px-10 pb-12 ${theme === "dark" ? "bg-black" : "bg-white"
                }`}
        >
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
                <div className="space-y-6 max-w-xl">
                    <div className="inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                        <span className={`font-medium text-sm ${theme === "dark" ? "text-indigo-300" : "text-indigo-600"}`}>
                            Streamline Your Hiring Process
                        </span>
                    </div>

                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Find & Hire{" "}
                        <span className="text-purple-400">Top Talent</span> Faster
                    </h1>

                    <p className={`text-lg ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
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
            <div className="mt-20 mb-16">
                <p className={`text-center mb-10 text-lg font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                    Trusted by industry leaders worldwide
                </p>

                <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                    {[
                        "TechCorp",
                        "InnovateLabs",
                        "FutureWorks",
                        "GlobalTech",
                        "NextGen",
                    ].map((name) => (
                        <div key={name} className="group relative">
                            <div className={`absolute inset-0 backdrop-blur-sm rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-800/5 border-gray-800/10"} group-hover:border-purple-500/30 transition-all duration-300`} />
                            <div className="relative flex items-center gap-3 px-6 py-4">
                                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg">
                                    <Building size={20} className="text-purple-400" />
                                </div>
                                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

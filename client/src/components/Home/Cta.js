import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Cta = React.forwardRef((_props, ref) => {
    const { theme } = useTheme();

    return (
        <div
            ref={ref}
            className={`py-20 backdrop-blur-sm translate-y-10 transition-all duration-700 ${theme === "dark"
                    ? "bg-gradient-to-r from-purple-900 to-black"
                    : "bg-purple-50"
                }`}
        >
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>Ready to Transform Your Hiring Process?</h2>
                    <p className={`mb-8 ${theme === "dark" ? "text-slate-300" : "text-slate-600"
                        }`}>
                        Join hundreds of companies that have streamlined their recruitment and found the best talent with our
                        platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full">
                        <button className={`font-semibold py-3 px-4 sm:px-8 rounded-full transition-all duration-300 shadow-lg shadow-indigo-600/30 w-full sm:w-auto ${theme === "dark"
                                ? "bg-white hover:bg-gray-200 text-purple-900"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}>
                            Get Started for Free
                        </button>
                        <button className={`py-3 px-4 sm:px-8 rounded-full font-medium backdrop-blur-sm transition-all duration-300 w-full sm:w-auto border ${theme === "dark"
                                ? "bg-white/10 border-white hover:bg-white/20 text-white"
                                : "bg-white border-purple-200 hover:bg-purple-50 text-purple-600"
                            }`}>
                            Schedule a Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Cta;
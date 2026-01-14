import React from "react";
import { BarChart, Briefcase, Clock, FileText, Search, Users } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const PowerfulFeatures = React.forwardRef((_props, ref) => {
    const { theme } = useTheme();

    return (
        <div
            ref={ref}
            className="translate-y-10 transition-all duration-700"
        >
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-16 transition-colors duration-300">
                    <h2
                        className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark"
                            ? "text-white"
                            : "text-gray-900 tracking-tight"
                            }`}
                    >
                        Powerful Features
                    </h2>
                    <p
                        className={`max-w-2xl mx-auto text-base md:text-lg ${theme === "dark"
                            ? "text-slate-300"
                            : "text-gray-900"
                            }`}
                    >
                        Everything you need to streamline your recruitment process and find the best candidates
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Search,
                            title: "Smart Candidate Search",
                            desc: "Quickly find the right candidates with powerful search and filtering capabilities."
                        },
                        {
                            icon: Briefcase,
                            title: "Job Posting Management",
                            desc: "Create, publish, and manage job postings across multiple platforms from one dashboard."
                        },
                        {
                            icon: Users,
                            title: "Collaborative Hiring",
                            desc: "Involve your entire team in the hiring process with collaborative tools and feedback systems."
                        },
                        {
                            icon: FileText,
                            title: "Resume Parsing",
                            desc: "Automatically extract and organize candidate information from resumes and applications."
                        },
                        {
                            icon: BarChart,
                            title: "Analytics & Reporting",
                            desc: "Gain insights into your recruitment process with comprehensive analytics and reporting."
                        },
                        {
                            icon: Clock,
                            title: "Interview Scheduling",
                            desc: "Streamline the interview process with automated scheduling and calendar integrations."
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className={`group p-8 rounded-2xl transition-all duration-300 border ${theme === "dark"
                                ? "bg-white/5 border-white/10 hover:bg-white/10"
                                : "bg-gradient-to-br from-white via-white to-purple-50/40 border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-200"
                                }`}
                        >
                            <div
                                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${theme === "dark"
                                    ? "bg-white/5"
                                    : "bg-purple-100 group-hover:bg-purple-200"
                                    }`}
                            >
                                <feature.icon
                                    className="text-purple-500"
                                    size={26}
                                />
                            </div>

                            <h3
                                className={`text-xl font-semibold mb-3 ${theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                    }`}
                            >
                                {feature.title}
                            </h3>

                            <p
                                className={
                                    theme === "dark"
                                        ? "text-slate-300"
                                        : "text-gray-800 leading-relaxed"
                                }
                            >
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
});
export default PowerfulFeatures;
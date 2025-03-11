import React from "react";
import { BarChart, Briefcase, Clock, FileText, Search, Users } from "lucide-react";

const PowerfulFeatures = React.forwardRef( ( _props, ref ) => (
    <div
        ref={ ref }
        className="py-24 bg-slate-900/50 backdrop-blur-sm translate-y-10 transition-all duration-700"
    >
        <div className="max-w-screen-xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">
                    Everything you need to streamline your recruitment process and find the best candidates
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <Search className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Smart Candidate Search</h3>
                    <p className="text-slate-300">
                        Quickly find the right candidates with powerful search and filtering capabilities.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <Briefcase className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Job Posting Management</h3>
                    <p className="text-slate-300">
                        Create, publish, and manage job postings across multiple platforms from one dashboard.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <Users className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Collaborative Hiring</h3>
                    <p className="text-slate-300">
                        Involve your entire team in the hiring process with collaborative tools and feedback systems.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <FileText className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Resume Parsing</h3>
                    <p className="text-slate-300">
                        Automatically extract and organize candidate information from resumes and applications.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <BarChart className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Analytics & Reporting</h3>
                    <p className="text-slate-300">
                        Gain insights into your recruitment process with comprehensive analytics and reporting.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <Clock className="text-indigo-400" size={ 24 } />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Interview Scheduling</h3>
                    <p className="text-slate-300">
                        Streamline the interview process with automated scheduling and calendar integrations.
                    </p>
                </div>
            </div>
        </div>
    </div>
));
export default PowerfulFeatures;
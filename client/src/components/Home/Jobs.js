import { ArrowRight, Award, Building } from "lucide-react";
import { Link } from "react-router-dom";

const Jobs = () => (
<div className="py-24 bg-slate-900/50 backdrop-blur-sm">
    <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Jobs</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
                Discover top opportunities from companies using our platform
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            { [ 1, 2, 3, 4, 5, 6 ].map( ( job ) => (
                <div
                    key={ job }
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Senior Frontend Developer</h3>
                            <p className="text-indigo-300">TechCorp Inc.</p>
                        </div>
                        <span className="bg-indigo-600/20 text-indigo-300 text-xs px-2 py-1 rounded">Full-time</span>
                    </div>
                    <div className="flex gap-4 text-slate-300 text-sm mb-4">
                        <span className="flex items-center gap-1">
                            <Building size={ 14 } />
                            Remote
                        </span>
                        <span className="flex items-center gap-1">
                            <Award size={ 14 } />
                            3-5 years
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                        We're looking for an experienced frontend developer to join our team and help build amazing user
                        experiences.
                    </p>
                    <a
                        href="#"
                        className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300 transition-colors"
                    >
                        View Details <ArrowRight size={ 14 } />
                    </a>
                </div>
            ) ) }
        </div>

        <div className="text-center mt-12">
            <Link to="/all-posted-jobs">
                <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                    View All Jobs
                </button>
            </Link>
        </div>
    </div>
</div>
);
export default Jobs;
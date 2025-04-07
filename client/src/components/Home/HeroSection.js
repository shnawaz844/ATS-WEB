import { ArrowRight, Building } from "lucide-react";

const HeroSection = () => (
<div className="max-w-screen-2xl container mx-auto px-4 pb-12">
    <div className="grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
        <div className="space-y-6 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                <span className="text-indigo-300 font-medium text-sm">Streamline Your Hiring Process</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Find & Hire <span className="text-indigo-400">Top Talent</span> Faster
            </h1>
            <p className="text-lg text-slate-300">
                Simplify your recruitment process with our powerful applicant tracking system. Post jobs, screen
                candidates, and make better hiring decisions.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                    Get Started <ArrowRight size={ 18 } />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                    Book a Demo
                </button>
            </div>
        </div>
        <div className="relative hidden md:block">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/30 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl"></div>
            <div className="relative z-10">
                <img
                    src={ require( "../../assets/img/banner_1.png" ) || "/placeholder.svg" }
                    alt="Applicant Tracking System"
                    className="rounded-lg"
                />
            </div>
        </div>
    </div>

    {/* Trusted By Companies */ }
    <div className="mt-20 mb-12">
        <p className="text-center text-slate-400 mb-8">Trusted by leading companies worldwide</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-2 text-white">
                <Building size={ 24 } />
                <span className="font-semibold">TechCorp</span>
            </div>
            <div className="flex items-center gap-2 text-white">
                <Building size={ 24 } />
                <span className="font-semibold">InnovateLabs</span>
            </div>
            <div className="flex items-center gap-2 text-white">
                <Building size={ 24 } />
                <span className="font-semibold">FutureWorks</span>
            </div>
            <div className="flex items-center gap-2 text-white">
                <Building size={ 24 } />
                <span className="font-semibold">GlobalTech</span>
            </div>
            <div className="flex items-center gap-2 text-white">
                <Building size={ 24 } />
                <span className="font-semibold">NextGen</span>
            </div>
        </div>
    </div>
</div>
);

export default HeroSection;
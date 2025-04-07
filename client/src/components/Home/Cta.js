import React from "react";

const Cta = React.forwardRef( ( _props, ref ) => (
<div
    ref={ ref }
    className="py-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm translate-y-10 transition-all duration-700"
>
    <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Hiring Process?</h2>
            <p className="text-slate-300 mb-8">
                Join hundreds of companies that have streamlined their recruitment and found the best talent with our
                platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-600/30">
                    Get Started for Free
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                    Schedule a Demo
                </button>
            </div>
        </div>
    </div>
</div>
));
export default Cta;
import { Star } from "lucide-react";

const Testimonials = () => (
<div className="py-24 translate-y-10 transition-all duration-700">
    <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
                Hear from companies that have transformed their hiring process with our platform
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            { [ 1, 2, 3 ].map( ( testimonial ) => (
                <div
                    key={ testimonial }
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                    <div className="flex gap-1 mb-4">
                        { [ 1, 2, 3, 4, 5 ].map( ( star ) => (
                            <Star key={ star } className="text-yellow-400" size={ 20 } fill="currentColor" />
                        ) ) }
                    </div>
                    <p className="text-slate-300 mb-6">
                        "This platform has completely transformed our hiring process. We've reduced our time-to-hire by 40%
                        and found better candidates than ever before."
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600/30 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">JD</span>
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Jane Doe</h4>
                            <p className="text-slate-400 text-sm">HR Director, TechCorp</p>
                        </div>
                    </div>
                </div>
            ) ) }
        </div>
    </div>
</div>
);
export default Testimonials;
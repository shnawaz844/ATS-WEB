import { Star } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const Testimonials = () => {
    const { theme } = useTheme();

    return (
        <div className="py-4 pb-24 translate-y-10 transition-all duration-700">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>What Our Clients Say</h2>
                    <p className={`max-w-2xl mx-auto ${theme === "dark" ? "text-slate-300" : "text-gray-900"
                        }`}>
                        Hear from companies that have transformed their hiring process with our platform
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((testimonial) => (
                        <div
                            key={testimonial}
                            className={`backdrop-blur-sm p-8 rounded-xl transition-all duration-300 border ${theme === "dark"
                                ? "bg-white/5 hover:bg-white/10 border-white/10"
                                : "bg-gradient-to-br from-white via-white to-purple-50/40 border-gray-200 shadow-sm hover:shadow-md hover:border-purple-100"
                                }`}
                        >
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="text-yellow-400" size={20} fill="currentColor" />
                                ))}
                            </div>
                            <p className={`mb-6 ${theme === "dark" ? "text-slate-300" : "text-gray-800"}`}>
                                "This platform has completely transformed our hiring process. We've reduced our time-to-hire by 40%
                                and found better candidates than ever before."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-indigo-600/30" : "bg-indigo-100"
                                    }`}>
                                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-indigo-600"
                                        }`}>JD</span>
                                </div>
                                <div>
                                    <h4 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                                        }`}>Jane Doe</h4>
                                    <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"
                                        }`}>HR Director, TechCorp</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};
export default Testimonials;

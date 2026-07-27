import React, { useEffect, useState, useRef } from "react";
import { Users, Building, CheckCircle, Bot, ArrowRight, TrendingUp } from "lucide-react";
import { motion, useInView, useAnimation } from "framer-motion";

const stats = [
    {
        icon: Users,
        value: 10000,
        suffix: "+",
        label: "Active Job Seekers",
        description: "Qualified candidates ready to join your team",
        gradient: "from-purple-500 to-indigo-600",
    },
    {
        icon: Building,
        value: 500,
        suffix: "+",
        label: "Partner Companies",
        description: "Leading organizations trust our platform",
        gradient: "from-indigo-500 to-purple-600",
    },
    {
        icon: CheckCircle,
        value: 50000,
        suffix: "+",
        label: "Successful Hires",
        description: "Perfect matches made through our system",
        gradient: "from-emerald-500 to-teal-600",
    },
    {
        icon: Bot,
        value: 95,
        suffix: "%",
        label: "AI Match Accuracy",
        description: "AI-powered precision in candidate matching",
        gradient: "from-orange-500 to-red-600",
    },
];

const Counter = ({ value, suffix }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = value;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export default function Companies() {
    return (
        <section className="py-10 relative overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 mb-6">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-bold text-purple-700 uppercase tracking-wider">Impact at Scale</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-6">
                        Real-time <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Insights</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We're redefining how talent meets opportunity with measurable results.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-8 rounded-3xl bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all"
                        >
                            {/* Decorative background gradient */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                            {/* Icon container */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform`}>
                                <stat.icon className="h-7 w-7 text-white" />
                            </div>

                            {/* Stat value */}
                            <div className="mb-4">
                                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                    <Counter value={stat.value} suffix={stat.suffix} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {stat.label}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {stat.description}
                            </p>

                            {/* Bottom bar */}
                            <div className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full`}></div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Joined by <span className="text-purple-600 font-bold">2,000+</span> companies this month
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group"
                    >
                        Learn more about our impact
                        <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}

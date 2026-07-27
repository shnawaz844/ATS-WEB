import React, { useState, useEffect } from "react";
import { ArrowRight, Users, Briefcase, Bot, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const usps = [
    "AI-Powered Recruitment",
    "Automated Resume Screening",
    "Smart Candidate Matching",
    "Seamless Hiring Workflow"
];

export default function Hero() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % usps.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-0 lg:px-8 overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-auto max-w-7xl text-center"
            >
                {/* Animated Badge */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 mb-8 backdrop-blur-md">
                    <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                        Niyukty Recruitment Platform
                    </span>
                </motion.div>

                {/* Main Heading with Transitions Carousel */}
                <motion.h1 variants={itemVariants} className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-8xl mb-8">
                    Welcome to <br className="sm:hidden" />
                    <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                        Niyukty
                    </span>
                    <div className="h-[1.2em] relative mt-2 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -40, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0 text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-600 dark:text-gray-400"
                            >
                                {usps[index]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={itemVariants} className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                    Transform your recruitment lifecycle with our cutting-edge AI engine. Connect top-tier talent with world-class companies through data-driven precision.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center justify-center px-10 py-4 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_10px_20px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.6)] transition-all overflow-hidden"
                    >
                        <span className="relative z-10">Get Started</span>
                        <ArrowRight className="relative z-10 ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.a>

                    <motion.a
                        href="/"
                        whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                        className="inline-flex items-center justify-center px-10 py-4 font-bold rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 backdrop-blur-md transition-all"
                    >
                        Browse Jobs
                    </motion.a>
                </motion.div>

                {/* Floating Icons/Elements for visual flair */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            </motion.div>
        </section>
    );
}

import React from 'react';
import { Brain, FileSearch, BarChart3, Shield, Zap, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "AI Resume Screening",
    description:
      "Advanced AI algorithms analyze and rank resumes based on job requirements, saving 80% of screening time.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: Bot,
    title: "Automated AI Interviews",
    description:
      "Conduct initial interviews with our AI interviewer, providing consistent and unbiased candidate evaluation.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Application Tracking",
    description: "Comprehensive dashboard to track all applications, interview stages, and hiring pipeline analytics.",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    icon: FileSearch,
    title: "Smart Job Matching",
    description: "Intelligent matching system that connects the right candidates with the perfect job opportunities.",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with GDPR compliance and data protection for all user information.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Process thousands of applications in minutes with our optimized AI infrastructure and real-time updates.",
    gradient: "from-orange-500 to-red-600",
  },
];

export default function WhyAts() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Future of Hiring</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-gray-900 dark:text-white sm:text-6xl mb-8 tracking-tight"
          >
            Next-Generation <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Recruitment</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Leverage artificial intelligence to streamline your hiring process and find the perfect candidates faster.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group relative p-10 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              {/* Abstract Background Shape */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-[0.03] rounded-bl-[100px] transition-all group-hover:opacity-[0.08]`}></div>

              {/* Icon */}
              <div className="relative mb-8">
                <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-transform duration-500`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Number Decal */}
              <div className="absolute bottom-10 right-10 text-8xl font-black text-gray-900/[0.03] dark:text-white/[0.03] select-none pointer-events-none group-hover:text-purple-600/5 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
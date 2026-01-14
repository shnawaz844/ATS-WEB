import React from 'react';
import { Brain, FileSearch, BarChart3, Shield, Zap, Bot } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Screening",
    description:
      "Advanced AI algorithms analyze and rank resumes based on job requirements, saving 80% of screening time.",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Bot,
    title: "Automated AI Interviews",
    description:
      "Conduct initial interviews with our AI interviewer, providing consistent and unbiased candidate evaluation.",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Application Tracking",
    description: "Comprehensive dashboard to track all applications, interview stages, and hiring pipeline analytics.",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: FileSearch,
    title: "Smart Job Matching",
    description: "Intelligent matching system that connects the right candidates with the perfect job opportunities.",
    color: "orange",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with GDPR compliance and data protection for all user information.",
    color: "red",
    gradient: "from-red-500 to-rose-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Process thousands of applications in minutes with our optimized AI infrastructure and real-time updates.",
    color: "yellow",
    gradient: "from-yellow-500 to-amber-600",
  },
];

export default function WhyAts() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-grid opacity-10"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-purple-900/20 border border-purple-600/20 dark:border-purple-800/30 px-4 py-2.5 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-gray-300">
                AI-Powered Innovation
              </span>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-400">Recruitment</span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Leverage artificial intelligence to streamline your hiring process and find the perfect candidates faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-gray-800 backdrop-blur-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300 hover:-translate-y-1 shadow-md"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon */}
              <div className="relative mb-8">
                <div className="inline-flex p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700">
                  <div className={`relative rounded-lg ${feature.gradient} p-3`}>
                    <feature.icon className="h-6 w-6  text-[#9333ea]" />

                    {/* AI indicator */}
                    {(feature.title.includes("AI") || feature.title.includes("Intelligent")) && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature number */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom line indicator */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:w-16 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
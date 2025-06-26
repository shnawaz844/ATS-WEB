import React from 'react';
import { Brain, FileSearch, BarChart3, Shield, Zap, Bot } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Screening",
    description:
      "Advanced AI algorithms analyze and rank resumes based on job requirements, saving 80% of screening time.",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
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
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 px-4 py-2 text-sm font-medium text-blue-700">
              <Bot className="h-4 w-4" />
              AI-Powered Features
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Revolutionizing Recruitment with AI
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with intuitive design to transform how companies hire and
            candidates find jobs.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm p-6 "
            >
              <div className="mb-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md relative `}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                  {(feature.title.includes("AI") || feature.title.includes("Bot")) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <div>
                <p className="text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
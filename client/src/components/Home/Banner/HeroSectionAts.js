import { ArrowRight, Sparkles, Users, Briefcase, Bot } from "lucide-react"
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-24 sm:py-14 lg:px-8">
            <div className="absolute [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Subtle floating elements */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
            <div
                className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40"
                style={{ animationDelay: "1s" }}
            ></div>
            <div
                className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-50"
                style={{ animationDelay: "2s" }}
            ></div>

            <div className="relative mx-auto max-w-7xl">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                            <Bot className="h-4 w-4 text-blue-600" />
                            AI-Powered Recruitment Platform
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                        Welcome to
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                            {" "}
                            Niyukty
                        </span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                        The future of smart hiring is here. Connect top talent with leading companies through our AI-powered
                        platform. Streamline recruitment with intelligent resume screening, automated interviews, and comprehensive
                        application tracking.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/dashboard">
                            <button
                                className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-md"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>

                        </Link>
                        <Link href="/jobs">
                            <button
                                variant="outline"
                                size="lg"
                                className="px-8 py-2.5 bg-white/10 border border-gray-600 text-black rounded-full hover:bg-white hover:border-gray-800 hover:text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md text-lg font-medium hover:-translate-y-0.5 backdrop-blur-sm">
                                Browse Jobs
                            </button>
                        </Link>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-16">
                        <div className="flex flex-col items-center group">
                            <div className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 p-4 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">10,000+</h3>
                            <p className="text-sm text-gray-600">Active Candidates</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="rounded-full bg-gradient-to-br from-purple-100 to-purple-200 p-4 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                <Briefcase className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">500+</h3>
                            <p className="text-sm text-gray-600">Partner Companies</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-200 p-4 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                <Bot className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">95%</h3>
                            <p className="text-sm text-gray-600">AI Match Accuracy</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
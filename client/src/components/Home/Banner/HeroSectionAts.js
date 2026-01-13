import { ArrowRight, Users, Briefcase, Bot } from "lucide-react"

export default function Hero() {
    return (
        <section className="relative overflow-hidden px-6 py-20 sm:py-24 lg:px-8 ">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-grid opacity-30"></div>

            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-600/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-700/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative mx-auto max-w-7xl">
                <div className="text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 dark:bg-gradient-to-r dark:from-purple-600/10 dark:to-purple-500/10 border border-purple-600/20 dark:border-purple-500/20 px-4 py-2 mb-8 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-purple-600 dark:bg-gradient-to-r dark:from-purple-400 dark:to-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-purple-700 dark:bg-gradient-to-r dark:from-purple-400 dark:to-purple-400 dark:bg-clip-text dark:text-transparent">
                            AI-Powered Recruitment Platform
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-7xl">
                        Welcome to{" "}
                        <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 dark:from-purple-400 dark:via-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                            Niyukty
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Revolutionizing recruitment with AI-powered solutions. Connect top talent with leading companies through our intelligent hiring platform.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="/dashboard">
                            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 font-medium rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-0.5">
                                <span>Get Started</span>
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            </button>
                        </a>

                        <a href="/jobs">
                            <button className="inline-flex items-center justify-center px-8 py-3.5 font-medium rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm">
                                Browse Jobs
                            </button>
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        {[
                            {
                                icon: Users,
                                value: "10,000+",
                                label: "Active Candidates",
                                gradient: "from-purple-500/20 to-purple-600/20",
                                iconColor: "text-purple-600 dark:text-purple-400"
                            },
                            {
                                icon: Briefcase,
                                value: "500+",
                                label: "Partner Companies",
                                gradient: "from-purple-500/20 to-pink-500/20",
                                iconColor: "text-purple-600 dark:text-purple-400"
                            },
                            {
                                icon: Bot,
                                value: "95%",
                                label: "AI Match Accuracy",
                                gradient: "from-emerald-500/20 to-green-500/20",
                                iconColor: "text-emerald-600 dark:text-emerald-400"
                            }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="group relative p-6 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:scale-105 shadow-md"
                            >
                                {/* Hover effect background */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                                <div className={`relative w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient.replace('/20', '/30')} flex items-center justify-center mb-4 mx-auto`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>

                                {/* Animated border */}
                                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gradient group-hover:from-purple-500 group-hover:via-purple-600 group-hover:to-purple-500 transition-all duration-300"></div>
                            </div>
                        ))}
                    </div>

                    {/* Trust indicator */}
                    <div className="mt-16 pt-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Trusted by leading tech companies worldwide
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute top-1/4 left-10 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-float opacity-60"></div>
            <div className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-purple-700 dark:bg-purple-300 rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }}></div>
        </section>
    )
}
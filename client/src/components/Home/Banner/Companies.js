import { Users, Building, CheckCircle, Bot, ArrowRight } from "lucide-react"

const stats = [
    {
        icon: Users,
        value: "10,000+",
        label: "Active Job Seekers",
        description: "Qualified candidates ready to join your team",
        gradient: "from-purple-500 to-purple-600",
    },
    {
        icon: Building,
        value: "500+",
        label: "Partner Companies",
        description: "Leading organizations trust our platform",
        gradient: "from-purple-500 to-purple-600",
    },
    {
        icon: CheckCircle,
        value: "50,000+",
        label: "Successful Hires",
        description: "Perfect matches made through our system",
        gradient: "from-green-500 to-emerald-600",
    },
    {
        icon: Bot,
        value: "95%",
        label: "AI Match Accuracy",
        description: "AI-powered precision in candidate matching",
        gradient: "from-purple-500 to-purple-600",
    },
]

export default function Companies() {
    return (
        <section className="py-20 relative overflow-hidden ">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-grid opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 dark:bg-gradient-to-r dark:from-purple-600/10 dark:to-purple-500/10 border border-purple-600/20 dark:border-purple-500/20 px-4 py-2 mb-4 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-purple-600 dark:bg-gradient-to-r dark:from-purple-400 dark:to-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-purple-700 dark:text-gray-300">Platform Performance Metrics</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                        Real-time <span className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-400 bg-clip-text text-transparent">Insights</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-800 dark:text-gray-400 max-w-2xl mx-auto">
                        Track your recruitment performance with comprehensive analytics and metrics
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-gray-800 backdrop-blur-md hover:border-purple-200 dark:hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 shadow-md"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Icon container */}
                            <div className="relative flex items-center justify-center mb-6">
                                <div className={`relative rounded-xl bg-gradient-to-br ${stat.gradient} p-4 shadow-lg`}>
                                    <stat.icon className="h-7 w-7 text-white" />

                                    {/* AI indicator dot */}
                                    {stat.label.includes("AI") && (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="relative">
                                                <div className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-ping opacity-75"></div>
                                                <div className="relative w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Optional badge for special stats */}
                                {index === 0 && (
                                    <span className="absolute -top-2 right-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                                        Live
                                    </span>
                                )}
                            </div>

                            {/* Stat value */}
                            <div className="text-center mb-2">
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>

                                {/* Optional trend indicator */}
                                {stat.trend && (
                                    <div className={`inline-flex items-center text-sm font-medium mt-1 px-2 py-0.5 rounded-full ${stat.trend === 'up'
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-red-900/30 text-red-400'
                                        }`}>
                                        {stat.trend === 'up' ? '↑' : '↓'}
                                        {stat.trendPercentage && ` ${stat.trendPercentage}`}
                                    </div>
                                )}
                            </div>

                            {/* Stat label */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                    {stat.label}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {stat.description}
                                </p>
                            </div>

                            {/* Decorative bottom border */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>

                {/* Additional info */}
                <div className="mt-12 pt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Data updated in real-time • Last refresh: Just now
                            </p>
                        </div>
                        <button className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span>View detailed analytics</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
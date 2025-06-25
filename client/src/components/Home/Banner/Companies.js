import { Users, Building, CheckCircle, Bot } from "lucide-react"

const stats = [
    {
        icon: Users,
        value: "10,000+",
        label: "Active Job Seekers",
        description: "Qualified candidates ready to join your team",
        gradient: "from-blue-500 to-blue-600",
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
        gradient: "from-cyan-500 to-blue-600",
    },
]

export default function Companies() {
    return (
        <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    { stats.map( ( stat, index ) => (
                        <div key={ index } className="text-center text-white group">
                            <div className="flex justify-center mb-4">
                                <div
                                    className={ `rounded-full bg-gradient-to-br ${ stat.gradient } p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative` }
                                >
                                    <stat.icon className="h-6 w-6 text-white" />
                                    { stat.label.includes( "AI" ) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                    ) }
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2">{ stat.value }</div>
                            <div className="text-lg font-medium mb-1 text-blue-100">{ stat.label }</div>
                            <div className="text-sm text-blue-200">{ stat.description }</div>
                        </div>
                    ) ) }
                </div>
            </div>
        </section>
    )
}
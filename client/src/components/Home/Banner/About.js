import { MapPin, Clock, DollarSign, Users, Briefcase } from "lucide-react"

const featuredJobs = [
    {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$120k - $180k",
        applicants: 45,
        posted: "2 days ago",
        skills: ["React", "Node.js", "TypeScript"],
        logo: "🚀",
    },
    {
        id: 2,
        title: "Product Manager",
        company: "InnovateLab",
        location: "New York, NY",
        type: "Full-time",
        salary: "$100k - $150k",
        applicants: 32,
        posted: "1 day ago",
        skills: ["Strategy", "Analytics", "Leadership"],
        logo: "🔬",
    },
    {
        id: 3,
        title: "UX Designer",
        company: "FinanceHub",
        location: "Remote",
        type: "Contract",
        salary: "$80k - $120k",
        applicants: 28,
        posted: "3 days ago",
        skills: ["Figma", "User Research", "Prototyping"],
        logo: "💰",
    },
]

export default function About() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-grid opacity-10"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-purple-900/20 border border-purple-600/20 dark:border-purple-800/30 px-4 py-2.5 mb-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-gray-300">
                                Featured Opportunities
                            </span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-400">Career Roles</span>
                    </h2>

                    <p className="text-lg text-gray-800 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover exclusive opportunities from industry-leading companies
                    </p>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="group relative p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-gray-800 backdrop-blur-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300 hover:-translate-y-1 shadow-md h-full flex flex-col"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Job Header */}
                            <div className="relative mb-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Company Logo */}
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-800 dark:text-gray-300">
                                                {job.logo}
                                            </span>
                                        </div>

                                        {/* Job Title & Company */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-700 dark:text-gray-400 font-medium mt-1">
                                                {job.company}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Job Type Badge */}
                                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium ${job.type === 'Full-time'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                        : job.type === 'Remote'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                        }`}>
                                        {job.type}
                                    </span>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="space-y-5 relative flex-grow flex flex-col">
                                {/* Location & Time */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300">
                                        <MapPin className="h-4 w-4 text-gray-600" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <span>{job.posted}</span>
                                    </div>
                                </div>

                                {/* Salary & Applicants */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Salary</p>
                                            <p className="font-semibold text-green-700 dark:text-green-300">{job.salary}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Applicants</p>
                                            <p className="font-semibold text-purple-700 dark:text-purple-300">{job.applicants}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex-grow">
                                    <p className="text-sm text-gray-600 mb-3">Required Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <div className="pt-4 mt-auto">
                                    <button className="group w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        <span>Apply Now</span>
                                        <svg
                                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Featured badge */}
                            {job.featured && (
                                <div className="absolute -top-2 -right-2">
                                    <div className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg">
                                        FEATURED
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="mt-12 text-center">
                    <a href="/login">
                        <button className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 backdrop-blur-sm">
                            <span>Explore All Opportunities</span>
                            <svg
                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </a>
                </div>
            </div>
        </section>
    )
}
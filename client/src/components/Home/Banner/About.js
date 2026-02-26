import { useState, useEffect } from "react"
import axios from "axios"
import { MapPin, Clock, DollarSign, Users, Briefcase, Star, ArrowUpRight, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function About() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const companyNameFromStorage = localStorage.getItem("companyName") || "Tech Recruitment"
    const companyId = localStorage.getItem("companyId")

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/jobs/all-jobs`, {
                    params: { limit: 3 },
                    headers: { company_id: companyId }
                })

                const fetchedJobs = response.data.jobs || []

                // Transform data for UI
                const transformedJobs = fetchedJobs.map((job) => ({
                    id: job._id,
                    title: job.title,
                    company: companyNameFromStorage,
                    location: `${job.city}, ${job.state}`,
                    type: job.type,
                    salary: `₹${job.compensation}/Annum`,
                    applicants: job.applicants?.length || 0,
                    posted: formatRelativeTime(job.createdAt),
                    skills: [job.type, job.scheduleType, job.hireType],
                    logo: companyNameFromStorage.charAt(0).toUpperCase() || "T",
                    featured: true
                }))

                setJobs(transformedJobs)
            } catch (error) {
                console.error("Error fetching featured jobs:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedJobs()
    }, [companyId, companyNameFromStorage])

    const formatRelativeTime = (dateString) => {
        const now = new Date()
        const postedDate = new Date(dateString)
        const diffInMs = now - postedDate
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) return "Today"
        if (diffInDays === 1) return "Yesterday"
        return `${diffInDays} days ago`
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Discovering opportunities...</p>
            </div>
        )
    }

    return (
        <section className="py-14 relative overflow-hidden bg-white/30 dark:bg-black/30 backdrop-blur-sm">
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 mb-6"
                    >
                        <Star className="h-4 w-4 text-purple-600 fill-purple-600" />
                        <span className="text-sm font-bold text-purple-700 uppercase tracking-widest">Premium Selection</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-black text-gray-900 dark:text-white sm:text-5xl mb-6 tracking-tight"
                    >
                        Top <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Career Roles</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Explore hand-picked roles from industry leaders tailored for your growth.
                    </motion.p>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-8 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all flex flex-col"
                        >
                            {/* Job Header */}
                            <div className="relative mb-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-2xl font-black text-purple-600">
                                            {job.logo}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                                                {job.company}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest ${job.type === 'Full-time'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {job.type}
                                    </div>
                                </div>
                            </div>

                            {/* Job Content */}
                            <div className="space-y-6 flex-grow">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400">
                                        <MapPin className="h-4 w-4 text-purple-500" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400">
                                        <Clock className="h-4 w-4 text-purple-500" />
                                        {job.posted}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase">Salary Range</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{job.salary}</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" alt="user" />
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                                            +{job.applicants}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Action */}
                            <div className="mt-8">
                                <motion.a
                                    href="/login"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black flex items-center justify-center gap-2 group shadow-xl transition-all"
                                >
                                    Apply Now
                                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </motion.a>
                            </div>

                            {/* Featured Badge */}
                            {job.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black rounded-full shadow-lg">
                                    FEATURED OPPORTUNITY
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center"
                >
                    <a href="/login" className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-black group">
                        Explore all opportunities
                        <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-2 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

import { MapPin, Clock, DollarSign, Users } from "lucide-react"
import { Link } from 'react-router-dom'

// Dummy Badge and Button components if you're not using shadcn/ui
const Badge = ( { children, variant = "default", className = "" } ) => {
    const base = "px-2 py-1 rounded text-xs font-medium"
    const variants = {
        default: "bg-gray-100 text-gray-800",
        secondary: "bg-blue-100 text-blue-800",
        outline: "border border-gray-300 text-gray-600"
    }
    return <span className={ `${ base } ${ variants[ variant ] } ${ className }` }>{ children }</span>
}

const Button = ( { children, variant = "default", size = "md", className = "" } ) => {
    const base = "rounded font-semibold"
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-400 text-gray-700 hover:bg-gray-100"
    }
    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    }
    return <button className={ `${ base } ${ variants[ variant ] } ${ sizes[ size ] } ${ className }` }>{ children }</button>
}

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
        skills: [ "React", "Node.js", "TypeScript" ],
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
        skills: [ "Strategy", "Analytics", "Leadership" ],
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
        skills: [ "Figma", "User Research", "Prototyping" ],
        logo: "💰",
    },
]

export default function About() {
    return (
        <section className="py-12 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Featured Job Opportunities</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Discover your next career opportunity from our curated job listings
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    { featuredJobs.map( ( job ) => (
                        <div key={ job.id } className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 bg-white">
                            <div className="mb-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{ job.logo }</div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{ job.title }</h3>
                                            <p className="text-sm text-gray-500 font-medium">{ job.company }</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{ job.type }</Badge>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        { job.location }
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        { job.posted }
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-green-600 font-medium">
                                        <DollarSign className="h-4 w-4" />
                                        { job.salary }
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Users className="h-4 w-4" />
                                        { job.applicants } applicants
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    { job.skills.map( ( skill, index ) => (
                                        <Badge key={ index } variant="outline" className="text-xs">
                                            { skill }
                                        </Badge>
                                    ) ) }
                                </div>
                                <button className="mx-auto h-10 flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-md"
                                >Apply Now</button>
                            </div>
                        </div>
                    ) ) }
                </div>
                <div className="text-center mt-12">
                    <Link to="/jobs">
                        <Button variant="outline" size="lg">
                            View All Jobs
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

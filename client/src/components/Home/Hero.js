import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import Particles from "../Login/Particles"
import { Search, Briefcase, Users, BarChart, Star, ArrowRight, Building, FileText, Clock, Award } from "lucide-react"

export const Hero = () => {
  // Refs for elements we want to animate on scroll
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const testimonialsRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    // Simple intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    // Observe all sections with animations
    const sections = [featuresRef.current, statsRef.current, testimonialsRef.current, ctaRef.current]
    sections.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden ">
      {/* Particles Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Particles />
      </div>

      {/* Hero Section */}
      <div className="max-w-screen-2xl container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
          <div className="space-y-6 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-indigo-300 font-medium text-sm">Streamline Your Hiring Process</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find & Hire <span className="text-indigo-400">Top Talent</span> Faster
            </h1>
            <p className="text-lg text-slate-300">
              Simplify your recruitment process with our powerful applicant tracking system. Post jobs, screen
              candidates, and make better hiring decisions.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                Book a Demo
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            {/* <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/30 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl"></div> */}
            <div className="z-0">
              <img
                src={require("../../assets/img/banner_1.png") || "/placeholder.svg"}
                alt="Applicant Tracking System"
                className="rounded-lg z-0"
              />
            </div>
          </div>
        </div>

        {/* Trusted By Companies */}
        <div className="mt-20 mb-12">
          <p className="text-center text-slate-400 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-2 text-white">
              <Building size={24} />
              <span className="font-semibold">TechCorp</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Building size={24} />
              <span className="font-semibold">InnovateLabs</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Building size={24} />
              <span className="font-semibold">FutureWorks</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Building size={24} />
              <span className="font-semibold">GlobalTech</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Building size={24} />
              <span className="font-semibold">NextGen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        ref={featuresRef}
        className="py-24 bg-slate-900/50 backdrop-blur-sm opacity-0 translate-y-10 transition-all duration-700"
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Everything you need to streamline your recruitment process and find the best candidates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Search className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Candidate Search</h3>
              <p className="text-slate-300">
                Quickly find the right candidates with powerful search and filtering capabilities.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Briefcase className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Job Posting Management</h3>
              <p className="text-slate-300">
                Create, publish, and manage job postings across multiple platforms from one dashboard.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Collaborative Hiring</h3>
              <p className="text-slate-300">
                Involve your entire team in the hiring process with collaborative tools and feedback systems.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FileText className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Resume Parsing</h3>
              <p className="text-slate-300">
                Automatically extract and organize candidate information from resumes and applications.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Analytics & Reporting</h3>
              <p className="text-slate-300">
                Gain insights into your recruitment process with comprehensive analytics and reporting.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Interview Scheduling</h3>
              <p className="text-slate-300">
                Streamline the interview process with automated scheduling and calendar integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="py-20 opacity-0 translate-y-10 transition-all duration-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-400 mb-2">500+</div>
              <p className="text-slate-300">Companies Using Our Platform</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-400 mb-2">10,000+</div>
              <p className="text-slate-300">Jobs Posted Monthly</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-400 mb-2">98%</div>
              <p className="text-slate-300">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="py-24 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Jobs</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Discover top opportunities from companies using our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((job) => (
              <div
                key={job}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Senior Frontend Developer</h3>
                    <p className="text-indigo-300">TechCorp Inc.</p>
                  </div>
                  <span className="bg-indigo-600/20 text-indigo-300 text-xs px-2 py-1 rounded">Full-time</span>
                </div>
                <div className="flex gap-4 text-slate-300 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    Remote
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={14} />
                    3-5 years
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  We're looking for an experienced frontend developer to join our team and help build amazing user
                  experiences.
                </p>
                <a
                  href="#"
                  className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300 transition-colors"
                >
                  View Details <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/all-posted-jobs">
              <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                View All Jobs
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div ref={testimonialsRef} className="py-24 opacity-0 translate-y-10 transition-all duration-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Hear from companies that have transformed their hiring process with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <div
                key={testimonial}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-yellow-400" size={20} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">
                  "This platform has completely transformed our hiring process. We've reduced our time-to-hire by 40%
                  and found better candidates than ever before."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/30 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Jane Doe</h4>
                    <p className="text-slate-400 text-sm">HR Director, TechCorp</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        ref={ctaRef}
        className="py-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm opacity-0 translate-y-10 transition-all duration-700"
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Hiring Process?</h2>
            <p className="text-slate-300 mb-8">
              Join hundreds of companies that have streamlined their recruitment and found the best talent with our
              platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-600/30">
                Get Started for Free
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg font-medium backdrop-blur-sm transition-all duration-300">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


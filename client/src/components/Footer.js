import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { Link, useParams } from "react-router-dom"

const navigation = {
    main: [
        { name: "Home", href: "/" },
        { name: "Jobs", href: "/jobs" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ],
    social: [
        {
            name: "Facebook",
            href: "#",
            icon: Facebook,
        },
        {
            name: "Twitter",
            href: "#",
            icon: Twitter,
        },
        {
            name: "LinkedIn",
            href: "#",
            icon: Linkedin,
        },
        {
            name: "Instagram",
            href: "#",
            icon: Instagram,
        },
    ],
}

export function Footer() {
    const { theme } = useTheme();
    const { companyUserName } = useParams();

    // Helper to format links based on current context
    // If companyUserName exists and the link is meant to be contextual, prepend it.
    // Assuming all footer links should act relative to the company if provided.
    // Exception: Home ('/') might need to go to /companyUserName instead of root /
    const getLink = (path) => {
        if (!companyUserName) return path;

        // Handle Home specifically if needed, or just standard replacement
        if (path === '/') return `/${companyUserName}`;

        // Ensure we don't double slash or mess up
        return `/${companyUserName}${path}`;
    };

    return (
        <footer className={`py-12 border-t transition-colors duration-300 ${theme === "dark"
            ? "bg-black border-white/10 text-gray-300"
            : "bg-gray-50 border-gray-200 text-gray-600"
            }`}>
            <div className="max-w-screen-xl mx-auto px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <Link to={getLink("/")} className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Niyukty
                            </span>
                        </Link>
                        <p className={`mb-6 max-w-md ${theme === "dark" ? "text-slate-200" : "text-gray-600"}`}>
                            Revolutionizing recruitment with AI-powered solutions. Connect the right talent with the right
                            opportunities through intelligent matching and automated processes.
                        </p>
                        <div className="space-y-3">
                            <div className={`flex items-center gap-2 ${theme === "dark" ? "text-slate-200" : "text-gray-600"}`}>
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">+91 8810600135</span>
                            </div>
                            <div className={`flex items-center gap-2 ${theme === "dark" ? "text-slate-200" : "text-gray-600"}`}>
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">F2 Fintech Pvt Ltd, A-25, M-1 Arv Park, A-Block, Sector 63, Noida</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Quick Links</h4>
                        <ul className="space-y-2">
                            {navigation.main.slice(0, 4).map((item) => (
                                <li key={item.name}>
                                    <Link to={getLink(item.href)} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                        }`}>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Legal</h4>
                        <ul className="space-y-2">
                            {navigation.main.slice(4).map((item) => (
                                <li key={item.name}>
                                    <Link to={getLink(item.href)} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                        }`}>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to={getLink("/blog")} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                    }`}>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to={getLink("/documentation")} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                    }`}>
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link to={getLink("/support")} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                    }`}>
                                    Support
                                </Link>
                            </li>
                            <li>
                                <Link to={getLink("/guides")} className={`transition-colors text-sm ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-600 hover:text-purple-600"
                                    }`}>
                                    Guides
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className={`mt-12 pt-8 flex flex-col md:flex-row justify-between items-center border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"
                    }`}>
                    <p className={`text-sm ${theme === "dark" ? "text-slate-200" : "text-gray-600"}`}>© {new Date().getFullYear()} Niyukty. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {navigation.social.map((item) => (
                            <a key={item.name} href={item.href} className={`transition-colors ${theme === "dark" ? "text-slate-200 hover:text-gray-400" : "text-gray-500 hover:text-purple-600"
                                }`}>
                                <span className="sr-only">{item.name}</span>
                                <item.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

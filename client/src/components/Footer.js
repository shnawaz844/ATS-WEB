import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"

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
    return (
        <footer className="py-12 border-t border-white/10 bg-white text-gray-800">
            <div className="max-w-screen-xl mx-auto px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <a href="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Niyukty
                            </span>
                        </a>
                        <p className="text-slate-400 mb-6 max-w-md">
                            Revolutionizing recruitment with AI-powered solutions. Connect the right talent with the right
                            opportunities through intelligent matching and automated processes.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail className="h-4 w-4" />
                                <span>contact@niyukty.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Phone className="h-4 w-4" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="h-4 w-4" />
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gray-800 font-semibold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {navigation.main.slice(0, 4).map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-400 hover:text-gray-800 transition-colors">
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-gray-800 font-semibold text-lg mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {navigation.main.slice(4).map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-400 hover:text-gray-800 transition-colors">
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-gray-800 font-semibold text-lg mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-slate-400 hover:text-gray-800 transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-400 hover:text-gray-800 transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-400 hover:text-gray-800 transition-colors">
                                    Support
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-400 hover:text-gray-800 transition-colors">
                                    Guides
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Niyukty. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {navigation.social.map((item) => (
                            <a key={item.name} href={item.href} className="text-slate-400 hover:text-gray-800 transition-colors">
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
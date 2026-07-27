import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contact Us</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">Phone</h3>
                                    <p className="text-sm opacity-80">+91 8810600135</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">Address</h3>
                                    <p className="text-sm opacity-80">F2 Fintech Pvt Ltd, A-25, M-1 Arv Park, A-Block, Sector 63, Noida</p>
                                    <p className="text-sm opacity-80 mt-1">Uttar Pradesh, India</p>
                                </div>
                            </div>

                            {/* Email can be added here similarly if needed */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">Email</h3>
                                    <p className="text-sm opacity-80">contact@niyukty.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                        <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea rows="4" className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;


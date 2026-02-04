import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const PrivacyPolicy = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Privacy Policy</h1>
                <div className={`prose lg:prose-xl mx-auto ${theme === 'dark' ? 'prose-invert' : ''} space-y-6`}>
                    <p className="text-sm opacity-60">Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, post a job, apply for a job, or communicate with us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to operate, maintain, and improve our services, including considering you for employment opportunities and facilitating the recruitment process.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. Sharing of Information</h2>
                        <p>We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

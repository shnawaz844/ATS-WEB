import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const TermsOfService = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Terms of Service</h1>
                <div className={`prose lg:prose-xl mx-auto ${theme === 'dark' ? 'prose-invert' : ''} space-y-6`}>
                    <p className="text-sm opacity-60">Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Niyukty's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. Disclaimer</h2>
                        <p>The materials on Niyukty's website are provided on an 'as is' basis. Niyukty makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;

import { useState, useEffect, useRef } from "react";

const companies = [
    { name: "TechCorp", logo: "🚀", industry: "Technology" },
    { name: "InnovateLab", logo: "🔬", industry: "Research" },
    { name: "FinanceHub", logo: "💰", industry: "Finance" },
    { name: "HealthTech", logo: "🏥", industry: "Healthcare" },
    { name: "EduSoft", logo: "📚", industry: "Education" },
    { name: "GreenEnergy", logo: "🌱", industry: "Energy" },
    { name: "RetailMax", logo: "🛍️", industry: "Retail" },
    { name: "CloudSys", logo: "☁️", industry: "Cloud Services" },
    { name: "DataSphere", logo: "📊", industry: "Analytics" },
    { name: "MobileFirst", logo: "📱", industry: "Mobile" },
    { name: "AI Nexus", logo: "🤖", industry: "Artificial Intelligence" },
    { name: "CyberShield", logo: "🛡️", industry: "Security" },
];

export default function NewsCarousel() {
    const firstRowRef = useRef(null);
    const secondRowRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const animationDuration = 40; // seconds for one full cycle

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 640);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const firstHalfCompanies = companies.slice(0, 6);
    const secondHalfCompanies = companies.slice(6, 12);
    const duplicatedFirstHalf = [...firstHalfCompanies, ...firstHalfCompanies];
    const duplicatedSecondHalf = [...secondHalfCompanies, ...secondHalfCompanies];

    // Apply animation styles
    useEffect(() => {
        const applyAnimation = (element, animationType) => {
            if (element) {
                element.style.animation = `${animationType} ${animationDuration}s linear infinite`;
                element.style.width = '200%';
                element.style.display = 'flex';
            }
        };

        applyAnimation(firstRowRef.current, 'scroll');
        applyAnimation(secondRowRef.current, 'scrollReverse');

        return () => {
            if (firstRowRef.current) firstRowRef.current.style.animation = '';
            if (secondRowRef.current) secondRowRef.current.style.animation = '';
        };
    }, []);

    const handleMouseEnter = (ref) => {
        if (ref.current) {
            ref.current.style.animationPlayState = 'paused';
        }
    };

    const handleMouseLeave = (ref) => {
        if (ref.current) {
            ref.current.style.animationPlayState = 'running';
        }
    };

    return (
        <section className="py-24 relative overflow-hidden">
            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scrollReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                        Trusted by{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                            Leading Companies
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-800 dark:text-gray-400">
                        Join hundreds of companies that trust our platform for their hiring needs
                    </p>
                </div>

                <div className="w-full overflow-hidden">
                    {/* First row */}
                    {!isMobile && (
                        <div
                            className="flex gap-6"
                            ref={firstRowRef}
                            onMouseEnter={() => handleMouseEnter(firstRowRef)}
                            onMouseLeave={() => handleMouseLeave(firstRowRef)}
                        >
                            {duplicatedFirstHalf.map((company, index) => (
                                <div
                                    key={`first-${company.name}-${index}`}
                                    className="flex-none relative"
                                >
                                    <div
                                        className="border border-white/50 dark:border-gray-800 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 text-center h-44 w-44 rounded-[50%] shadow-md"
                                    >
                                        <div className="text-4xl mb-3">{company.logo}</div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{company.name}</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-400">{company.industry}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Second row */}
                    <div
                        className="flex gap-6 mt-6"
                        ref={secondRowRef}
                        onMouseEnter={() => handleMouseEnter(secondRowRef)}
                        onMouseLeave={() => handleMouseLeave(secondRowRef)}
                    >
                        {duplicatedSecondHalf.map((company, index) => (
                            <div
                                key={`second-${company.name}-${index}`}
                                className="flex-none relative"
                            >
                                <div
                                    className="border border-white/50 dark:border-gray-800 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 text-center h-44 w-44 rounded-[50%] shadow-md"
                                >
                                    <div className="text-4xl mb-3">{company.logo}</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{company.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{company.industry}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">500+</span> companies trust our platform •
                        <span className="font-semibold"> 50,000+</span> successful hires •
                        <span className="font-semibold"> 95%</span> satisfaction rate
                    </p>
                </div>
            </div>
        </section>
    );
}
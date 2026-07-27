import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

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
    return (
        <section className="py-12 relative overflow-hidden bg-gray-50/50 dark:bg-gray-900/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
                        Trusted by <br className="sm:hidden" />
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Global Innovators
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Powering recruitment for the world's most ambitious companies.
                    </p>
                </motion.div>

                {/* Swiper Carousel */}
                <div className="w-full">
                    <Swiper
                        slidesPerView={2}
                        spaceBetween={20}
                        freeMode={true}
                        loop={true}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                        }}
                        speed={5000}
                        modules={[Autoplay, FreeMode]}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 30 },
                            1024: { slidesPerView: 5, spaceBetween: 40 },
                        }}
                        className="logo-swiper"
                    >
                        {companies.map((company, index) => (
                            <SwiperSlide key={index}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="p-8 rounded-[2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center h-48 group transition-all hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900"
                                >
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{company.logo}</div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{company.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex items-center gap-8 py-4 px-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">500+</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Companies</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">50k+</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hires</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">95%</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Satisfaction</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
                .logo-swiper .swiper-wrapper {
                    transition-timing-function: linear !important;
                }
            `}</style>
        </section>
    );
}

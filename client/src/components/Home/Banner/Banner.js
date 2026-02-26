import { Box } from 'lucide-react';
import React from 'react';
import HeroSectionAts from './HeroSectionAts'
import Companies from './Companies';
import About from './About';
import WhyAts from './Why';
import NewsCarousel from './News';
import DiveIn from './DiveIn';
import ParticlesComponent from '../../Login/Particles';
const Banner = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdfaff] dark:bg-black selection:bg-purple-200 selection:text-purple-900">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 dark:bg-purple-900/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 dark:bg-blue-900/10 blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-100/40 dark:bg-indigo-900/10 blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 scroll-smooth">
        <HeroSectionAts />
        <Companies />
        <WhyAts />
        <About />
        <NewsCarousel />
        <DiveIn />
      </div>
    </div>
  );
};

export default Banner;

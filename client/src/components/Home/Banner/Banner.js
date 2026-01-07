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
    <div className="relative min-h-screen overflow-hidden ">
      <HeroSectionAts />
      <Companies />
      <WhyAts />
      <About />
      <NewsCarousel />
      <DiveIn />
    </div>
  );
};

export default Banner;

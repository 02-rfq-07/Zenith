'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import FloatingAstronaut from '@/components/UI/FloatingAstronaut';
import LatestArticles from '@/components/Home/LatestArticles';
import ZenithTerminal from '@/components/Home/ZenithTerminal';
import SciFiDiary from '@/components/Home/SciFiDiary';
import ZeroGHangman from '@/components/Home/ZeroGHangman';
import UpcomingLaunches from '@/components/Home/UpcomingLaunches';
import ZenithBot from '@/components/UI/ZenithBot';

export default function Home() {
  const [stars, setStars] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Generate random stars on the client to avoid SSR hydration mismatch
    const generatedStars = [...Array(100)].map(() => ({
      width: Math.random() * 3 + 'px',
      height: Math.random() * 3 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center bg-[#020617] overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Background Starfield effect - fixed to viewport so it scrolls with the user */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#020617] to-[#020617]"></div>
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{ width: star.width, height: star.height, top: star.top, left: star.left, opacity: star.opacity }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Hero Section (Min Height Screen) */}
      <div id="section-hero" className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative inline-block"
        >
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 tracking-tighter mb-4 relative z-10">
            PROJECT ZENITH
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-xl md:text-2xl text-cyan-100/70 font-mono tracking-widest mb-12 uppercase">
            The Celestial Eye
          </p>
          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            An advanced, real-time cosmic radar predicting orbital pathways and identifying celestial bodies transiting your local zenith window.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/radar" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-cyan-600/20 border border-cyan-500/50 rounded-full hover:bg-cyan-500/30 hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] overflow-hidden">
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative font-mono tracking-widest flex items-center">
              INITIALIZE RADAR
              <svg className="w-5 h-5 ml-3 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 10 }}
          transition={{ duration: 1.5, delay: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-cyan-400/60 hover:text-cyan-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById('section-articles')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="font-mono text-[10px] tracking-widest mb-2 uppercase">Scroll To Explore</span>
          <ChevronDown size={24} />
        </motion.div>
      </div>

      {/* Latest Articles Section */}
      <div id="section-articles" className="relative w-full z-10 border-t border-cyan-900/30 bg-black/40 backdrop-blur-sm">
         <LatestArticles />
      </div>

      {/* Upcoming Launches Section */}
      <div id="section-launches" className="relative w-full z-10 border-t border-fuchsia-900/30 bg-[#050505]/60 backdrop-blur-sm">
         <UpcomingLaunches />
      </div>

      {/* Sci-Fi Concept Diary Section */}
      <div id="section-diary" className="relative w-full z-10 border-t border-stone-900/30 bg-[#121110]/80 backdrop-blur-md">
         <SciFiDiary />
      </div>

      {/* Zenith Terminal Learning Resources */}
      <div id="section-terminal" className="relative w-full z-10 border-t border-cyan-900/30 bg-[#050505]/90 backdrop-blur-lg">
         <ZenithTerminal />
      </div>

      {/* Space Game Section */}
      <div id="section-game" className="relative w-full z-10 border-t border-fuchsia-900/30 bg-black/60 backdrop-blur-sm pb-24">
         <ZeroGHangman />
      </div>

      <FloatingAstronaut />
      <ZenithBot />
    </main>
  );
}

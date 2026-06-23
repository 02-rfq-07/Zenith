'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPACE_FACTS = [
  "Did you know? One million Earths could fit inside the Sun!",
  "A day on Venus is longer than its year.",
  "There is a planet made of diamonds called 55 Cancri e.",
  "Footprints on the Moon will stay there for 100 million years.",
  "Space is completely silent.",
  "The sunset on Mars appears blue.",
  "Neutron stars can spin 600 times per second.",
  "The Apollo astronauts' footprints will probably stay on the Moon for at least 100 million years.",
  "There are more trees on Earth than stars in the Milky Way.",
  "One day on Mars is 24 hours, 39 minutes and 35 seconds.",
];

export default function FloatingAstronaut() {
  const [position, setPosition] = useState({ x: -1000, y: 0 }); // Start far left off-screen
  const [fact, setFact] = useState<string | null>(null);

  // Initialize random position on mount
  useEffect(() => {
    const generateRandomPosition = () => {
      // Avoid edges to keep astronaut fully visible
      const padding = 150;
      const x = Math.random() * (window.innerWidth - padding * 2) - (window.innerWidth / 2 - padding);
      const y = Math.random() * (window.innerHeight - padding * 2) - (window.innerHeight / 2 - padding);
      setPosition({ x, y });
    };

    // Wait a tiny bit then slide in
    setTimeout(generateRandomPosition, 100);

    // Move to a new random location every 15 seconds
    const moveInterval = setInterval(() => {
      generateRandomPosition();
    }, 15000);

    return () => clearInterval(moveInterval);
  }, []);

  // Show a space fact every 10 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      const randomFact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
      setFact(randomFact);
      
      // Hide fact after 6 seconds
      setTimeout(() => {
        setFact(null);
      }, 6000);
    }, 10000);

    return () => clearInterval(factInterval);
  }, []);

  return (
    <motion.div 
      className="fixed hidden md:flex flex-col items-center pointer-events-none z-50"
      style={{ top: '50%', left: '50%', width: 120, height: 150, marginLeft: -60, marginTop: -75 }}
      animate={{ 
        x: position.x,
        y: position.y,
        // Add a subtle local floating effect on top of the translation
        translateY: [0, -15, 0]
      }}
      transition={{ 
        x: { duration: 10, ease: "easeInOut" },
        y: { duration: 10, ease: "easeInOut" },
        translateY: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <AnimatePresence>
        {fact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-3 rounded-2xl rounded-br-sm shadow-xl text-xs font-mono font-medium z-50 pointer-events-auto"
          >
            {fact}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Astronaut SVG */}
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
        {/* Head/Helmet Background */}
        <circle cx="60" cy="50" r="35" fill="#e2e8f0" />
        {/* Visor */}
        <path d="M 35 50 C 35 30, 85 30, 85 50 C 85 65, 35 65, 35 50 Z" fill="#0f172a" />
        {/* Visor Highlight */}
        <ellipse cx="45" cy="42" rx="4" ry="6" fill="#cbd5e1" opacity="0.6" transform="rotate(-30 45 42)" />
        
        {/* Body */}
        <rect x="35" y="80" width="50" height="40" rx="15" fill="#e2e8f0" />
        
        {/* Control Panel on Chest */}
        <rect x="45" y="90" width="30" height="20" rx="5" fill="transparent" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.8" />
        <circle cx="52" cy="98" r="3" fill="#10b981" />
        <circle cx="68" cy="98" r="3" fill="#f59e0b" />
        <line x1="50" y1="105" x2="70" y2="105" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.8" />
        
        {/* Left Arm */}
        <rect x="20" y="85" width="15" height="30" rx="7.5" fill="#e2e8f0" />
        {/* Left Hand */}
        <circle cx="27.5" cy="115" r="7.5" fill="#94a3b8" />
        
        {/* Right Arm */}
        <rect x="85" y="85" width="15" height="30" rx="7.5" fill="#e2e8f0" />
        <rect x="85" y="90" width="15" height="15" fill="#cbd5e1" /> {/* shoulder patch */}
        {/* Right Hand */}
        <circle cx="92.5" cy="115" r="7.5" fill="#94a3b8" />
        
        {/* Left Leg */}
        <rect x="42" y="115" width="12" height="20" rx="6" fill="#e2e8f0" />
        {/* Left Foot */}
        <path d="M 38 135 L 56 135 C 56 135, 56 142, 47 142 C 38 142, 38 135, 38 135 Z" fill="#94a3b8" />
        
        {/* Right Leg */}
        <rect x="66" y="115" width="12" height="20" rx="6" fill="#e2e8f0" />
        {/* Right Foot */}
        <path d="M 64 135 L 82 135 C 82 135, 82 142, 73 142 C 64 142, 64 135, 64 135 Z" fill="#94a3b8" />
      </svg>
    </motion.div>
  );
}

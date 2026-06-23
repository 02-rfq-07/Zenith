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
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [isHidden, setIsHidden] = useState(false);
  const [fact, setFact] = useState<string | null>(null);
  
  const activeSectionRef = React.useRef('section-hero');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const triggerSectionDialogue = (sectionId: string) => {
    clearTimers();
    
    switch(sectionId) {
      case 'section-hero':
        setFact("Welcome to Project Zenith! I'm Orion, your celestial guide.");
        break;
      case 'section-articles':
        setFact("Latest Dispatches: Tracking interstellar news and updates.");
        break;
      case 'section-launches':
        setFact("Mission Control: Monitoring upcoming orbital deployments.");
        break;
      case 'section-diary':
        setFact("Sci-Fi Archives: Where cinematic imagination meets real physics.");
        break;
      case 'section-terminal':
        setFact("Zenith Terminal: Accessing the cosmic database...");
        break;
      case 'section-game':
        setFact("Zero-G Tether: Decrypt the sequence before my tether snaps!");
        break;
    }

    // Hide section info after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setFact(null);
      
      // Wait 2 seconds, then show first fact and start interval
      timeoutRef.current = setTimeout(() => {
        const showFact = () => {
          setFact(SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)]);
          // Hide fact after 5 seconds
          setTimeout(() => setFact(null), 5000);
        };
        
        showFact();
        intervalRef.current = setInterval(showFact, 7000); // 5s show + 2s hide
      }, 2000);
    }, 5000);
  };

  useEffect(() => {
    triggerSectionDialogue('section-hero');
    return clearTimers;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['section-hero', 'section-articles', 'section-launches', 'section-diary', 'section-terminal', 'section-game'];
      
      let closestSection = '';
      let minDistance = Infinity;
      let targetY = 0;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from the vertical center of the viewport to the section's top
          const viewportCenter = window.innerHeight / 3;
          const distance = Math.abs(rect.top - viewportCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = id;
            
            // Calculate absolute Y position on the document
            const absoluteY = window.scrollY + rect.top;
            
            // Offset logic depending on the section
            if (id === 'section-hero') {
              targetY = absoluteY + 50; // Float near the top of the viewport
            } else {
              targetY = absoluteY + 100; // 100px down from section top (near the title)
            }
          }
        }
      }

      // If we are at the bottom of the page, force 'section-game'
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;
      if (isAtBottom) {
        closestSection = 'section-game';
      }

      if (closestSection === 'section-game') {
        setIsHidden(true);
      } else {
        setIsHidden(false);
        if (closestSection !== activeSectionRef.current) {
          activeSectionRef.current = closestSection;
          triggerSectionDialogue(closestSection);
        }
        // Determine X position based on section to swap sides
        let targetX = 20;
        if (closestSection === 'section-hero') {
          targetX = window.innerWidth / 2 - 60; // Center
        } else if (closestSection === 'section-launches' || closestSection === 'section-terminal') {
          targetX = window.innerWidth > 1024 ? window.innerWidth - 150 : window.innerWidth - 120; // Right side
        } else {
          targetX = window.innerWidth > 1400 ? 100 : 20; // Left side (Articles, Diary)
        }
        
        setPosition({ x: targetX, y: targetY });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation after a short delay to allow DOM to render
    setTimeout(handleScroll, 500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show a space fact every 10 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      const randomFact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
      setFact(randomFact);
      
      setTimeout(() => {
        setFact(null);
      }, 6000);
    }, 10000);

    return () => clearInterval(factInterval);
  }, []);

  // Check which side of the screen he is on for bubble positioning
  const isRightSide = typeof window !== 'undefined' ? position.x > window.innerWidth / 2 : false;

  return (
    <motion.div 
      className="absolute hidden md:flex flex-col items-center pointer-events-none z-[100]"
      style={{ top: 0, left: 0, width: 120, height: 150 }}
      animate={{ 
        x: position.x,
        y: position.y,
        opacity: isHidden ? 0 : 1,
        scale: isHidden ? 0.5 : 1
      }}
      transition={{ 
        x: { type: "spring", bounce: 0.2, duration: 2 },
        y: { type: "spring", bounce: 0.2, duration: 2 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 }
      }}
    >
      <motion.div
        animate={{ translateY: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
      <AnimatePresence>
        {fact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: isRightSide ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: isRightSide ? 10 : -10 }}
            className={`absolute top-4 ${isRightSide ? 'right-full mr-4 rounded-l-2xl rounded-tr-2xl' : 'left-full ml-4 rounded-r-2xl rounded-tl-2xl'} w-48 bg-zinc-900 border border-red-500/50 text-red-50 p-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-xs font-mono font-medium z-50 pointer-events-auto`}
          >
            {fact}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Astronaut SVG */}
      <svg width="120" height="170" viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
        
        {/* Jetpack Flames */}
        <g fill="#06b6d4">
          <path d="M 42 142 Q 47 165 52 142 Z">
            <animate attributeName="d" values="M 42 142 Q 47 165 52 142 Z; M 43 142 Q 47 155 51 142 Z; M 42 142 Q 47 165 52 142 Z" dur="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M 68 142 Q 73 165 78 142 Z">
            <animate attributeName="d" values="M 68 142 Q 73 165 78 142 Z; M 69 142 Q 73 155 77 142 Z; M 68 142 Q 73 165 78 142 Z" dur="0.25s" repeatCount="indefinite" />
          </path>
        </g>
        <g fill="#ffffff">
          <path d="M 44 142 Q 47 155 50 142 Z">
             <animate attributeName="d" values="M 44 142 Q 47 155 50 142 Z; M 45 142 Q 47 148 49 142 Z; M 44 142 Q 47 155 50 142 Z" dur="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M 70 142 Q 73 155 76 142 Z">
             <animate attributeName="d" values="M 70 142 Q 73 155 76 142 Z; M 71 142 Q 73 148 75 142 Z; M 70 142 Q 73 155 76 142 Z" dur="0.25s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Head/Helmet Background */}
        <circle cx="60" cy="50" r="35" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        {/* Visor */}
        <path d="M 35 50 C 35 30, 85 30, 85 50 C 85 65, 35 65, 35 50 Z" fill="#020617" stroke="#ef4444" strokeWidth="1.5" />
        
        {/* Eyes */}
        <ellipse cx="50" cy="45" rx="3" ry="6" fill="#06b6d4" />
        <ellipse cx="70" cy="45" rx="3" ry="6" fill="#06b6d4" />
        
        {/* Robotic Mouth */}
        {fact ? (
          <path d="M 52 55 Q 60 62 68 55" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="d" values="M 52 55 Q 60 64 68 55; M 52 55 Q 60 56 68 55; M 52 55 Q 60 60 68 55; M 52 55 Q 60 64 68 55" dur="0.3s" repeatCount="indefinite" />
          </path>
        ) : (
          <path d="M 52 55 Q 60 60 68 55" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
        )}
        
        {/* Body */}
        <rect x="35" y="80" width="50" height="40" rx="15" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        
        {/* Control Panel on Chest */}
        <rect x="45" y="90" width="30" height="20" rx="5" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
        <circle cx="52" cy="98" r="3" fill="#10b981" />
        <circle cx="68" cy="98" r="3" fill="#ef4444" />
        <line x1="50" y1="105" x2="70" y2="105" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.8" />
        <circle cx="60" cy="105" r="2" fill="#06b6d4" />
        
        {/* Left Arm */}
        <rect x="20" y="85" width="15" height="30" rx="7.5" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
        {/* Left Hand */}
        <circle cx="27.5" cy="115" r="7.5" fill="#ef4444" />
        
        {/* Right Arm */}
        <rect x="85" y="85" width="15" height="30" rx="7.5" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="85" y="90" width="15" height="15" fill="#ef4444" /> {/* shoulder patch */}
        {/* Right Hand */}
        <circle cx="92.5" cy="115" r="7.5" fill="#ef4444" />
        
        {/* Left Leg */}
        <rect x="42" y="115" width="12" height="20" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
        {/* Left Foot */}
        <path d="M 38 135 L 56 135 C 56 135, 56 142, 47 142 C 38 142, 38 135, 38 135 Z" fill="#ef4444" />
        
        {/* Right Leg */}
        <rect x="66" y="115" width="12" height="20" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
        {/* Right Foot */}
        <path d="M 64 135 L 82 135 C 82 135, 82 142, 73 142 C 64 142, 64 135, 64 135 Z" fill="#ef4444" />
      </svg>
      </motion.div>
    </motion.div>
  );
}

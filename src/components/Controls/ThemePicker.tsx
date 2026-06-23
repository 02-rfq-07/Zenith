'use client';

import React, { useState, useEffect } from 'react';
import { useRadarStore } from '@/store/useRadarStore';
import { AnimatePresence, motion } from 'framer-motion';

const THEMES = [
  { name: 'Cyan (Default)', rgb: '6, 182, 212', t100: '#cffafe', t300: '#67e8f9', t400: '#22d3ee', t500: '#06b6d4', t900: '#164e63' },
  { name: 'Amber', rgb: '245, 158, 11', t100: '#fef3c7', t300: '#fcd34d', t400: '#fbbf24', t500: '#f59e0b', t900: '#78350f' },
  { name: 'Emerald', rgb: '16, 185, 129', t100: '#d1fae5', t300: '#6ee7b7', t400: '#34d399', t500: '#10b981', t900: '#064e3b' },
  { name: 'Rose', rgb: '244, 63, 94', t100: '#ffe4e6', t300: '#fda4af', t400: '#fb7185', t500: '#f43f5e', t900: '#881337' },
  { name: 'Purple', rgb: '168, 85, 247', t100: '#f3e8ff', t300: '#d8b4fe', t400: '#c084fc', t500: '#a855f7', t900: '#581c87' },
];

export default function ThemePicker() {
  const { latitude, longitude } = useRadarStore();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning briefly when user changes target location
    if (latitude !== 0 || longitude !== 0) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [latitude, longitude]);

  const applyTheme = (theme: typeof THEMES[0]) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-rgb', theme.rgb);
    root.style.setProperty('--theme-100', theme.t100);
    root.style.setProperty('--theme-300', theme.t300);
    root.style.setProperty('--theme-400', theme.t400);
    root.style.setProperty('--theme-500', theme.t500);
    root.style.setProperty('--theme-900', theme.t900);
  };

  return (
    <div className="relative flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
      <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono mr-2">Color Matrix</span>
      {THEMES.map((t) => (
        <button
          key={t.name}
          onClick={() => applyTheme(t)}
          className="w-4 h-4 rounded-full border border-white/20 transition-transform hover:scale-125 focus:outline-none"
          style={{ backgroundColor: t.t500 }}
          title={t.name}
        />
      ))}
      
      {/* Visibility Warning Popup */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute top-1/2 -translate-y-1/2 right-full mr-4 w-56 bg-orange-950 border border-orange-500 text-orange-200 p-3 rounded-lg text-xs font-mono shadow-[0_0_20px_rgba(249,115,22,0.6)] z-50 pointer-events-none"
          >
            <strong>Note:</strong> If anomalies aren't visible on the radar at this location, try picking a new Color Matrix here!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React from 'react';

const THEMES = [
  { name: 'Cyan (Default)', rgb: '6, 182, 212', t100: '#cffafe', t300: '#67e8f9', t400: '#22d3ee', t500: '#06b6d4', t900: '#164e63' },
  { name: 'Amber', rgb: '245, 158, 11', t100: '#fef3c7', t300: '#fcd34d', t400: '#fbbf24', t500: '#f59e0b', t900: '#78350f' },
  { name: 'Emerald', rgb: '16, 185, 129', t100: '#d1fae5', t300: '#6ee7b7', t400: '#34d399', t500: '#10b981', t900: '#064e3b' },
  { name: 'Rose', rgb: '244, 63, 94', t100: '#ffe4e6', t300: '#fda4af', t400: '#fb7185', t500: '#f43f5e', t900: '#881337' },
  { name: 'Purple', rgb: '168, 85, 247', t100: '#f3e8ff', t300: '#d8b4fe', t400: '#c084fc', t500: '#a855f7', t900: '#581c87' },
];

export default function ThemePicker() {
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
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
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
    </div>
  );
}

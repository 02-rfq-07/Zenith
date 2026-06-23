'use client';

import React, { useEffect, useState } from 'react';

export default function SimpleStars() {
  const [starsHtml, setStarsHtml] = useState<{ id: number, size: number, left: number, duration: number, delay: number }[]>([]);

  useEffect(() => {
    const generatedStars = [...Array(150)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 20, // 20s to 40s to move across
      delay: Math.random() * -40, // start at random positions by using negative delay
    }));
    setStarsHtml(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes driftUp {
          from { transform: translateY(100vh); }
          to { transform: translateY(-10vh); }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black/80 to-black pointer-events-none" />
      
      {starsHtml.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white/70"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: '-10px',
            animation: `driftUp ${star.duration}s linear infinite`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  );
}

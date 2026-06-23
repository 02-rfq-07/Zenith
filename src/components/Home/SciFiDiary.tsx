'use client';

import React, { useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { BookOpen, RefreshCw } from 'lucide-react';

// Using forwardRef is required by react-pageflip for custom page components
const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, number: number, isDark?: boolean }>((props, ref) => {
  return (
    <div className={`shadow-inner relative overflow-hidden border-r border-cyan-900/50 ${props.isDark ? 'bg-[#050b14]' : 'bg-[#0a1128]'}`} ref={ref}>
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-50" />
      <div className="p-8 h-full flex flex-col relative z-20">
        {props.children}
        <div className="mt-auto text-center font-mono text-[10px] text-cyan-500/50 tracking-widest uppercase">
          PAGE - {props.number}
        </div>
      </div>
    </div>
  );
});
Page.displayName = 'Page';

const CONCEPTS = [
  {
    title: "Gargantua",
    movie: "Interstellar",
    director: "Christopher Nolan",
    year: "2014",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop",
    concept: "A supermassive black hole rotating at 99.8% of the speed of light. Its gravitational pull creates extreme time dilation on nearby planets.",
    realScience: "The visual representation of Gargantua was incredibly accurate, created using relativistic ray-tracing software. It famously depicted how gravity warps the accretion disk around the back of the black hole."
  },
  {
    title: "Wormhole",
    movie: "Interstellar",
    director: "Christopher Nolan",
    year: "2014",
    image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&auto=format&fit=crop",
    concept: "A spherical distortion in spacetime acting as a shortcut across the universe.",
    realScience: "Theoretically known as an Einstein-Rosen bridge. While mathematically possible in General Relativity, they require 'exotic matter' with negative energy density to remain stable and open."
  },
  {
    title: "Astrophage",
    movie: "Project Hail Mary",
    director: "Phil Lord, Chris Miller",
    year: "TBD",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    concept: "A single-celled alien microbe that consumes stellar energy and reproduces at an alarming rate, dimming the sun.",
    realScience: "While fictional, the biological mechanisms are grounded in real thermodynamics and mass-energy equivalence (E=mc²). The concept explores the absolute limits of biology in extreme environments."
  },
  {
    title: "The Hex",
    movie: "The Martian",
    director: "Ridley Scott",
    year: "2015",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600&auto=format&fit=crop",
    concept: "Surviving on a barren world using botany and ingenuity, specifically growing potatoes in Martian soil.",
    realScience: "NASA has actually tested growing potatoes in Mars-simulated soil in Peru. The main real-world challenge is that Martian soil contains toxic perchlorates which must be washed out first."
  },
  {
    title: "Monolith",
    movie: "2001: A Space Odyssey",
    director: "Stanley Kubrick",
    year: "1968",
    image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&auto=format&fit=crop",
    concept: "An imposing, perfectly proportioned black rectangular slab that triggers leaps in human evolution and transmits radio signals to Jupiter.",
    realScience: "The mathematical perfection (1:4:9 ratio) suggests artificial origin. While alien artifacts haven't been found, the concept of a 'Von Neumann probe' remaining dormant for eons is a staple of SETI theory."
  },
  {
    title: "Kessler Syndrome",
    movie: "Gravity",
    director: "Alfonso Cuarón",
    year: "2013",
    image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=600&auto=format&fit=crop",
    concept: "A chain reaction of colliding satellites creating an impenetrable cloud of high-speed debris, destroying orbital infrastructure.",
    realScience: "A very real scenario proposed by NASA scientist Donald Kessler in 1978. While 'Gravity' exaggerated the speed of the chain reaction, the density of LEO debris is a critical ongoing concern."
  },
  {
    title: "Warp Drive",
    movie: "Star Trek (Various)",
    director: "Gene Roddenberry",
    year: "1966+",
    image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=600&auto=format&fit=crop",
    concept: "Faster-than-light travel achieved by generating a subspace bubble that warps spacetime around the starship.",
    realScience: "Inspired the real-world 'Alcubierre drive' mathematical model in 1994, which shows FTL is mathematically possible by contracting space in front and expanding it behind, though it requires impossible 'negative mass'."
  },
  {
    title: "Tesseract",
    movie: "Interstellar",
    director: "Christopher Nolan",
    year: "2014",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    concept: "A 4-dimensional hypercube built by future beings to allow a human to interact with gravity across time.",
    realScience: "A tesseract is the 4D analogue of a cube. While humans cannot perceive 4 spatial dimensions, mathematics easily describes them. Using gravity to communicate backward in time remains purely speculative."
  },
  {
    title: "Dyson Sphere",
    movie: "Star Trek: TNG (Relics)",
    director: "Alexander Singer",
    year: "1992",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop",
    concept: "A megastructure completely encompassing a star to capture a large percentage of its power output.",
    realScience: "Proposed by Freeman Dyson in 1960. It is considered a logical progression for a Kardashev Type II civilization. Astronomers actually look for infrared signatures of Dyson spheres when searching for alien life."
  },
  {
    title: "Cryosleep",
    movie: "Alien",
    director: "Ridley Scott",
    year: "1979",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    concept: "Placing astronauts in a state of suspended animation to survive journeys taking decades or centuries.",
    realScience: "Therapeutic hypothermia is used in medicine, but true cryosleep remains fiction due to ice crystal formation destroying cells. NASA is researching 'torpor' states for Mars missions, reducing metabolic rates by 70%."
  },
  {
    title: "Ringworld",
    movie: "Halo / Elysium",
    director: "Neill Blomkamp",
    year: "2013",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    concept: "A massive artificial ring rotating to provide artificial gravity via centrifugal force on its inner surface.",
    realScience: "Based on the Stanford Torus and Niven rings. Mathematically sound, but building a structure the size of a planetary orbit requires materials with tensile strengths far beyond anything theoretically possible."
  },
  {
    title: "Solar Sails",
    movie: "Tron: Legacy / Alien: Covenant",
    director: "Joseph Kosinski",
    year: "2010",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=600&auto=format&fit=crop",
    concept: "Using the radiation pressure of starlight pushing on ultra-thin mirrors to propel a spacecraft.",
    realScience: "100% real. The Japanese IKAROS probe (2010) and LightSail 2 (2019) successfully demonstrated solar sailing. It provides continuous, fuel-free acceleration, ideal for deep space probes."
  },
  {
    title: "Terraforming",
    movie: "Aliens",
    director: "James Cameron",
    year: "1986",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600&auto=format&fit=crop",
    concept: "Deliberately modifying an atmosphere, temperature, and surface ecology to make a hostile planet Earth-like.",
    realScience: "Theoretically possible on Mars by releasing trapped greenhouse gases, but NASA concluded in 2018 that Mars doesn't retain enough CO2 to achieve a thick enough atmosphere with today's technology."
  },
  {
    title: "Antimatter Propulsion",
    movie: "Avatar",
    director: "James Cameron",
    year: "2009",
    image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&auto=format&fit=crop",
    concept: "The ISV Venture Star uses antimatter-catalyzed fusion to travel at 70% the speed of light to Alpha Centauri.",
    realScience: "Antimatter annihilation is the most energy-dense reaction known to physics (100% conversion of mass to energy). The issue is manufacturing and containing antimatter; humanity has only ever produced nanograms."
  },
  {
    title: "Generation Ship",
    movie: "Passengers",
    director: "Morten Tyldum",
    year: "2016",
    image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=600&auto=format&fit=crop",
    concept: "An interstellar ark carrying a large population, where the original occupants die and their descendants arrive at the destination.",
    realScience: "A highly viable solution for traversing the stars below light-speed. The primary challenges are psychological, sociological, and maintaining a closed-loop ecosystem for centuries without failure."
  },
  {
    title: "Space Elevator",
    movie: "Ad Astra / Foundation",
    director: "Various",
    year: "2019",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=600&auto=format&fit=crop",
    concept: "A physical tether extending from the planet's surface into space, allowing vehicles to climb into orbit without rockets.",
    realScience: "The physics are completely sound, but Earth's gravity requires a cable made of material stronger than anything currently mass-produced, like carbon nanotubes. However, a space elevator could be built on the Moon today using kevlar."
  }
];

// Remove duplicated concepts to prevent endless paging
// We rely on the "Restart Archive" button on the back cover.

export default function SciFiDiary() {
  const flipBookRef = useRef<any>(null);

  const resetBook = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip()) {
      flipBookRef.current.pageFlip().turnToPage(0);
    }
  };

  return (
    <div className="w-full max-w-[95vw] mx-auto py-24 px-4 relative z-20 flex flex-col items-center overflow-hidden">
      <div className="flex items-center space-x-3 mb-12 w-full justify-center text-center">
        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-500 tracking-[0.2em] uppercase glow-text">
            Sci-Fi Concept Archives
          </h2>
          <p className="text-cyan-500/60 font-mono tracking-widest text-sm uppercase mt-1">Classified Cinematic Data</p>
        </div>
      </div>

      {/* The Flipbook Landscape */}
      <div className="w-full flex justify-center drop-shadow-[0_0_50px_rgba(6,182,212,0.15)] relative mt-8">
        <HTMLFlipBook 
          width={1000} 
          height={600} 
          size="stretch"
          minWidth={500}
          maxWidth={1200}
          minHeight={450}
          maxHeight={800}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="diary-flipbook border border-cyan-500/30 rounded-lg overflow-hidden"
          style={{ margin: '0 auto' }}
          ref={flipBookRef}
        >
          {/* Front Cover */}
          <Page number={0} isDark={true}>
             <div className="h-full flex flex-col items-center justify-center border border-cyan-500/30 bg-[#020617] p-4 relative">
                <div className="absolute inset-2 border border-cyan-900/50"></div>
                <h1 className="text-4xl md:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-600 tracking-[0.2em] text-center uppercase mb-8 z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                   PROJECT<br/>ZENITH<br/>ARCHIVES
                </h1>
                <div className="w-24 h-1 bg-cyan-500/50 mb-8 z-10 shadow-[0_0_10px_cyan]" />
                <p className="font-mono text-cyan-400/80 tracking-widest uppercase text-xs z-10 bg-black/50 px-4 py-1 rounded">Volume I</p>
             </div>
          </Page>

          {/* Dynamic Pages from Concepts */}
          {CONCEPTS.map((item, i) => (
            <Page number={i + 1} key={i}>
               <h2 className="text-2xl md:text-3xl font-mono font-bold text-cyan-300 mb-2 drop-shadow-[0_0_5px_cyan] uppercase tracking-wider">{item.title}</h2>
               <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest mb-4 pb-3 border-b border-cyan-900">
                 <span className="bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">{item.movie}</span>
                 <span className="bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">{item.director}</span>
                 <span className="bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">{item.year}</span>
               </div>
               <div className={`flex flex-col md:flex-row gap-6 h-full overflow-hidden ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                 <div className="w-full md:w-5/12 h-48 md:h-full bg-black border border-cyan-800 rounded overflow-hidden relative shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
                   <div className="absolute inset-0 bg-cyan-900/30 mix-blend-overlay z-10" />
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-105" />
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent flex flex-col justify-center">
                   <h3 className="font-bold text-cyan-400 mb-2 uppercase tracking-wider text-sm font-mono flex items-center mt-2 md:mt-0">
                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_5px_cyan]" /> 
                     Concept
                   </h3>
                   <p className="text-cyan-100/70 text-sm leading-relaxed mb-6">
                     {item.concept}
                   </p>

                   <h3 className="font-bold text-cyan-400 mb-2 uppercase tracking-wider text-sm font-mono flex items-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mr-2 shadow-[0_0_5px_fuchsia]" /> 
                     Real Science
                   </h3>
                   <p className="text-cyan-100/70 text-sm leading-relaxed pb-2">
                     {item.realScience}
                   </p>
                 </div>
               </div>
            </Page>
          ))}

          {/* Back Cover */}
          <Page number={CONCEPTS.length + 1} isDark={true}>
             <div className="h-full flex flex-col items-center justify-center border border-cyan-900/50 p-4 bg-[#020617] text-cyan-500 relative group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50" />
                <p className="font-mono tracking-widest uppercase text-xs text-center z-10 mb-8">
                   End of Archive<br/><br/>
                   Classified Top Secret
                </p>
                <button 
                  onClick={resetBook}
                  className="px-6 py-2 border border-cyan-500/50 rounded text-cyan-400 font-mono text-xs uppercase tracking-widest hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all z-10 flex items-center space-x-2"
                >
                  <RefreshCw size={14} />
                  <span>Restart Archive</span>
                </button>
             </div>
          </Page>
        </HTMLFlipBook>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Search, MonitorPlay, FileText, Database, ChevronRight } from 'lucide-react';

const KNOWLEDGE_BASE = [
  { id: 1, title: 'Orbital Mechanics 101', type: 'VIDEO', tags: ['physics', 'orbits', 'satellites'], link: 'https://www.youtube.com/watch?v=RjcXcyNnKxE' },
  { id: 2, title: 'Anatomy of a Black Hole', type: 'ARTICLE', tags: ['astrophysics', 'black hole', 'relativity'], link: 'https://science.nasa.gov/astrophysics/focus-areas/black-holes' },
  { id: 3, title: 'The Kessler Syndrome', type: 'VIDEO', tags: ['debris', 'satellites', 'danger'], link: 'https://www.youtube.com/watch?v=yS1ibDImAYU' },
  { id: 4, title: 'How GPS Works', type: 'ARTICLE', tags: ['navigation', 'satellites', 'earth'], link: 'https://www.gps.gov/systems/gps/' },
  { id: 5, title: 'Warp Drives: Science or Fiction?', type: 'ARTICLE', tags: ['ftl', 'physics', 'future'], link: 'https://www.nasa.gov/centers/glenn/technology/warp/warp.html' },
  { id: 6, title: 'James Webb Telescope Explained', type: 'VIDEO', tags: ['telescope', 'jwst', 'infrared'], link: 'https://www.youtube.com/watch?v=tn0G3-M7i8I' },
  { id: 7, title: 'Life Cycle of a Star', type: 'VIDEO', tags: ['stars', 'supernova', 'nebula'], link: 'https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve' },
  { id: 8, title: 'Navigating Deep Space', type: 'ARTICLE', tags: ['navigation', 'deep space', 'probes'], link: 'https://www.jpl.nasa.gov/edu/teach/activity/navigating-to-mars/' },
  { id: 9, title: 'The Fermi Paradox', type: 'VIDEO', tags: ['aliens', 'life', 'universe'], link: 'https://www.youtube.com/watch?v=sNhhvQGsMEc' },
  { id: 10, title: 'What is Dark Matter?', type: 'ARTICLE', tags: ['physics', 'dark matter', 'universe'], link: 'https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy' },
  { id: 11, title: 'Inside the International Space Station', type: 'VIDEO', tags: ['iss', 'astronauts', 'zero gravity'], link: 'https://www.youtube.com/watch?v=SOCixLsPyPN' },
  { id: 12, title: 'The Apollo 11 Moon Landing', type: 'ARTICLE', tags: ['apollo', 'moon', 'history'], link: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html' },
  { id: 13, title: 'SpaceX Falcon Heavy Launch', type: 'VIDEO', tags: ['spacex', 'rocket', 'launch'], link: 'https://www.youtube.com/watch?v=wbSwFU6tY1c' },
  { id: 14, title: 'The Search for Exoplanets', type: 'ARTICLE', tags: ['exoplanets', 'kepler', 'astronomy'], link: 'https://exoplanets.nasa.gov/' },
  { id: 15, title: 'String Theory Explained', type: 'VIDEO', tags: ['physics', 'dimensions', 'theory'], link: 'https://www.youtube.com/watch?v=Da-2h2B4faU' },
  { id: 16, title: 'Asteroid Mining Feasibility', type: 'ARTICLE', tags: ['asteroids', 'mining', 'future'], link: 'https://web.mit.edu/12.000/www/m2016/finalwebsite/solutions/asteroids.html' },
  { id: 17, title: 'The Voyager Golden Record', type: 'VIDEO', tags: ['voyager', 'aliens', 'sound'], link: 'https://voyager.jpl.nasa.gov/golden-record/' },
  { id: 18, title: 'Terraforming Mars', type: 'ARTICLE', tags: ['mars', 'colonization', 'terraforming'], link: 'https://science.nasa.gov/science-news/science-at-nasa/2001/ast09feb_1' },
  { id: 19, title: 'Neutron Stars and Pulsars', type: 'VIDEO', tags: ['stars', 'pulsar', 'physics'], link: 'https://www.youtube.com/watch?v=udFxKZRyQt4' },
  { id: 20, title: 'The Hubble Deep Field', type: 'ARTICLE', tags: ['hubble', 'galaxies', 'telescope'], link: 'https://hubblesite.org/contents/media/images/2014/27/3380-Image.html' },
  { id: 21, title: 'Quantum Entanglement', type: 'VIDEO', tags: ['quantum', 'physics', 'spooky'], link: 'https://www.youtube.com/watch?v=ZuvK-od647c' },
  { id: 22, title: 'The Rings of Saturn', type: 'ARTICLE', tags: ['saturn', 'planets', 'cassini'], link: 'https://solarsystem.nasa.gov/planets/saturn/in-depth/' },
  { id: 23, title: 'Curiosity Rover Landing', type: 'VIDEO', tags: ['mars', 'rover', 'landing'], link: 'https://www.youtube.com/watch?v=Ki_Af_o9Q9s' },
  { id: 24, title: 'The Great Attractor', type: 'ARTICLE', tags: ['galaxies', 'universe', 'mystery'], link: 'https://en.wikipedia.org/wiki/Great_Attractor' },
  { id: 25, title: 'Time Dilation Explained', type: 'VIDEO', tags: ['time', 'relativity', 'physics'], link: 'https://www.youtube.com/watch?v=yuD34tEpRWw' },
  { id: 26, title: 'The Oort Cloud', type: 'ARTICLE', tags: ['comets', 'solar system', 'edge'], link: 'https://solarsystem.nasa.gov/solar-system/oort-cloud/in-depth/' },
  { id: 27, title: 'Nuclear Fusion in Stars', type: 'VIDEO', tags: ['fusion', 'stars', 'energy'], link: 'https://www.youtube.com/watch?v=cKmqpB5YWa4' },
  { id: 28, title: 'The Search for Extraterrestrial Intelligence (SETI)', type: 'ARTICLE', tags: ['seti', 'aliens', 'radio'], link: 'https://www.seti.org/' },
  { id: 29, title: 'Space Debris Mitigation', type: 'VIDEO', tags: ['debris', 'clean', 'orbit'], link: 'https://www.esa.int/Space_Safety/Space_Debris' },
  { id: 30, title: 'The Expansion of the Universe', type: 'ARTICLE', tags: ['universe', 'expansion', 'redshift'], link: 'https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy' },
];

export default function ZenithTerminal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(KNOWLEDGE_BASE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase().trim();
    setQuery(e.target.value);
    
    if (!term) {
      setResults(KNOWLEDGE_BASE);
      return;
    }

    const searchTerms = term.split(' ');

    const filtered = KNOWLEDGE_BASE.filter(item => {
      const itemText = `${item.title.toLowerCase()} ${item.tags.join(' ')} ${item.type.toLowerCase()}`;
      
      // Check if ALL words in the search query exist somewhere in the item's text (fuzzy/partial match)
      return searchTerms.every(searchWord => itemText.includes(searchWord));
    });
    
    setResults(filtered);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-6 relative z-20">
      
      {/* Retro Monitor Housing */}
      <div className="relative bg-[#0a0a0a] rounded-3xl p-4 md:p-8 border-4 border-[#1f1f1f] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)]">
        
        {/* Monitor Screen Edge */}
        <div className="bg-black rounded-2xl p-2 relative overflow-hidden border-2 border-[#111]">
          
          {/* CRT Screen Glare */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-30 rounded-xl" />
          
          {/* CRT Scanlines Effect */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          {/* Actual Terminal UI */}
          <div className="relative bg-[#051114] h-[600px] rounded-xl p-6 md:p-8 overflow-hidden font-mono flex flex-col shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/20">
              <div className="flex items-center space-x-3 text-cyan-500">
                <Terminal size={24} />
                <h2 className="text-xl font-bold tracking-[0.3em] uppercase glow-text">Knowledge_Base.exe</h2>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-cyan-500/50 text-xs tracking-widest">
                <Database size={14} />
                <span>ARCHIVE STATUS: ONLINE</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-8 group z-30">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-500 group-focus-within:text-cyan-400">
                <ChevronRight size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="ENTER SEARCH QUERY [e.g. jwst, stars, satellites]..."
                className="w-full bg-cyan-950/20 border-2 border-cyan-500/30 text-cyan-400 pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/40 transition-all placeholder:text-cyan-500/30 uppercase tracking-widest text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-cyan-500/50">
                <Search size={18} />
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent z-30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {results.length > 0 ? (
                    results.map((item, i) => (
                      <motion.a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className="group flex items-start space-x-4 p-4 border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-500/10 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="p-2 bg-cyan-950 border border-cyan-500/30 text-cyan-500 rounded-md group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                          {item.type === 'VIDEO' ? <MonitorPlay size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <h4 className="text-cyan-400 font-bold tracking-wider mb-1 group-hover:text-cyan-300">
                            {item.title}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[9px] px-2 py-0.5 border border-cyan-500/20 text-cyan-500/60 rounded bg-cyan-950/30 uppercase tracking-widest">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.a>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-12 text-center text-cyan-500/40 text-sm tracking-widest"
                    >
                      NO MATCHING RECORDS FOUND IN ARCHIVE.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Blinking Cursor at bottom */}
            <div className="mt-4 pt-4 border-t border-cyan-500/20 flex items-center text-cyan-500/50 text-xs z-30">
              <span className="animate-pulse">_ AWAITING USER INPUT</span>
            </div>

          </div>
        </div>
        
        {/* Monitor Stand/Details (Decorative) */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-b-xl border-x-4 border-b-4 border-[#1f1f1f] -z-10" />
      </div>
    </div>
  );
}

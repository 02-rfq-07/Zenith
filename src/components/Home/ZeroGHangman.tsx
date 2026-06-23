'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Info, Lightbulb, X, Search, ShieldAlert, Award } from 'lucide-react';

const BADGES = [
  { count: 1, name: "Recruit", icon: "⭐" },
  { count: 5, name: "Specialist", icon: "🚀" },
  { count: 10, name: "Commander", icon: "🎖️" },
  { count: 15, name: "Navigator", icon: "🧭" },
  { count: 20, name: "Explorer", icon: "🔭" },
  { count: 30, name: "Veteran", icon: "⚔️" },
  { count: 40, name: "Master", icon: "👑" },
  { count: 50, name: "Legend", icon: "🔥" },
  { count: 75, name: "Mythic", icon: "🌌" },
  { count: 100, name: "Zenith", icon: "♾️" }
];

const DOMAINS = {
  PLANETS: ["MERCURY", "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "KEPLER", "TRAPPIST"],
  SATELLITES: ["MOON", "EUROPA", "TITAN", "GANYMEDE", "ENCELADUS", "CALLISTO", "IO", "PHOBOS", "DEIMOS", "TRITON"],
  MISSIONS: ["APOLLO", "VOYAGER", "CASSINI", "HUBBLE", "WEBB", "ARTEMIS", "PERSEVERANCE", "CURIOSITY", "PIONEER", "GALILEO"],
  PHENOMENA: ["SUPERNOVA", "BLACK HOLE", "WORMHOLE", "NEBULA", "PULSAR", "QUASAR", "ECLIPSE", "SOLAR FLARE", "METEOR"],
  CONSTELLATIONS: ["ORION", "PEGASUS", "ANDROMEDA", "CYGNUS", "LYRA", "DRACO", "CASSIOPEIA", "PERSEUS", "SCORPIUS", "TAURUS"],
  GALAXIES: ["MILKY WAY", "ANDROMEDA", "TRIANGULUM", "SOMBRERO", "WHIRLPOOL", "CARTWHEEL", "PINWHEEL", "CIGAR", "TADPOLE"],
  ASTRONOMERS: ["GALILEO", "NEWTON", "COPERNICUS", "KEPLER", "HUBBLE", "SAGAN", "HAWKING", "TYCHO", "HALLEY", "PTOLEMY"],
  SPACECRAFT: ["SPUTNIK", "VOSTOK", "SOYUZ", "SHUTTLE", "DRAGON", "STARSHIP", "BURAN", "ORION", "SHENZHOU", "GEMINI"]
};

type DomainType = keyof typeof DOMAINS;
type LevelType = 'EASY' | 'MEDIUM' | 'HARD';

export default function ZeroGHangman() {
  // Game Setup State
  const [domain, setDomain] = useState<DomainType | null>(null);
  const [level, setLevel] = useState<LevelType | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [winsCount, setWinsCount] = useState(0);
  const [unlockedBadge, setUnlockedBadge] = useState<{name: string, icon: string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zenith_hangman_wins');
    if (saved) {
      setWinsCount(parseInt(saved, 10));
    }
  }, []);

  // Active Game State
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<'SETUP' | 'PLAYING' | 'WON' | 'LOST'>('SETUP');

  // Hint State
  const [hintsAvailable, setHintsAvailable] = useState([true, false, false]); // Hint 1 is immediate
  const [showHintModal, setShowHintModal] = useState<number | null>(null); // Which hint is currently being offered
  const [activeHints, setActiveHints] = useState<string[]>([]); // The text hints revealed

  // Max mistakes depends on level
  const getMaxMistakes = () => {
    if (level === 'EASY') return 9;
    if (level === 'MEDIUM') return 6;
    if (level === 'HARD') return 4;
    return 6;
  };

  const maxMistakes = getMaxMistakes();

  const startGame = () => {
    if (!domain || !level) return;
    
    // Filter words by length based on level
    let validWords = DOMAINS[domain];
    if (level === 'EASY') validWords = validWords.filter(w => w.length <= 6);
    else if (level === 'MEDIUM') validWords = validWords.filter(w => w.length > 5 && w.length <= 9);
    else if (level === 'HARD') validWords = validWords.filter(w => w.length >= 8);

    // Fallback if no words match exact criteria
    if (validWords.length === 0) validWords = DOMAINS[domain];

    const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
    setWord(randomWord);
    setGuessed(new Set([' '])); // Spaces are automatically guessed
    setMistakes(0);
    setStatus('PLAYING');
    setHintsAvailable([true, false, false]);
    setActiveHints([`The domain is: ${domain}`]);
    setShowHintModal(null);
  };

  const handleGuess = (letter: string) => {
    if (status !== 'PLAYING' || guessed.has(letter)) return;

    const newGuessed = new Set(guessed).add(letter);
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= maxMistakes) {
        setStatus('LOST');
      }
    } else {
      const isWon = word.split('').every(char => char === ' ' || newGuessed.has(char));
      if (isWon) {
        setStatus('WON');
        setWinsCount(prev => {
          const newCount = prev + 1;
          localStorage.setItem('zenith_hangman_wins', newCount.toString());
          
          // Check if this new count unlocked a badge
          const newlyUnlocked = BADGES.find(b => b.count === newCount);
          if (newlyUnlocked) {
            setUnlockedBadge(newlyUnlocked);
          }
          
          return newCount;
        });
      } else {
        // Check for hint unlocks based on completion percentage
        const uniqueChars = new Set(word.replace(/ /g, '').split(''));
        const guessedCorrectly = [...uniqueChars].filter(c => newGuessed.has(c)).length;
        const percentComplete = guessedCorrectly / uniqueChars.size;

        if (percentComplete >= 0.33 && !hintsAvailable[1]) {
          setHintsAvailable([true, true, hintsAvailable[2]]);
          setShowHintModal(2);
        } else if (percentComplete >= 0.66 && !hintsAvailable[2]) {
          setHintsAvailable([true, true, true]);
          setShowHintModal(3);
        }
      }
    }
  };

  const applyHint = (type: 'REVEAL' | 'TEXT', hintNum: number) => {
    setShowHintModal(null);
    if (type === 'REVEAL') {
      // Find a letter not yet guessed
      const unguessed = word.split('').filter(c => c !== ' ' && !guessed.has(c));
      if (unguessed.length > 0) {
        const randomToReveal = unguessed[Math.floor(Math.random() * unguessed.length)];
        handleGuess(randomToReveal);
      }
    } else {
      // Text hint
      const hintText = hintNum === 2 ? `Word starts with '${word[0]}'` : `Word ends with '${word[word.length-1]}'`;
      setActiveHints([...activeHints, hintText]);
    }
  };

  const resetToSetup = () => {
    setStatus('SETUP');
    setDomain(null);
    setLevel(null);
  };

  const renderAstronaut = () => {
    // Dynamic rendering based on level and mistakes
    const percentLost = mistakes / maxMistakes;
    const isLost = status === 'LOST';

    const drawTetherBase = percentLost <= 0.8;
    const drawTetherMid = percentLost <= 0.6;
    const drawHead = percentLost <= 0.2;
    const drawBody = percentLost <= 0.4;
    
    // In Hard, arms and legs are grouped
    const drawArms = level === 'HARD' ? percentLost <= 0.5 : percentLost <= 0.6;
    const drawLegs = level === 'HARD' ? percentLost <= 0.75 : percentLost <= 0.8;

    return (
      <div className="relative w-full h-48 flex justify-center items-center mb-8 border-b border-fuchsia-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-4 bg-zinc-800 rounded-b-xl border-x border-b border-zinc-600 shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10" />
        
        {/* Tether */}
        <motion.div 
          className="absolute top-4 left-1/2 -translate-x-1/2 w-1 origin-top bg-cyan-500/80 shadow-[0_0_10px_cyan]"
          initial={{ height: 120 }}
          animate={isLost ? { height: 0, opacity: 0 } : { height: drawTetherBase ? 120 : drawTetherMid ? 60 : 20 }}
          transition={{ duration: 1 }}
        />

        {/* Astronaut Drop-In Animation Container */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[124px]"
          initial={{ y: -150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", bounce: 0.4, duration: 1.5, delay: 0.2 }}
        >
          <motion.div
            animate={
              isLost 
              ? { y: 300, rotate: 180, opacity: 0, scale: 0.5 } 
              : { y: [0, -5, 0], rotate: [0, 1, -1, 0] }
            }
            transition={
              isLost
              ? { duration: 3, ease: "easeIn" }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <svg width="60" height="80" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
              {/* Head */}
              <motion.g
                initial={false}
                animate={drawHead ? { y: 0, opacity: 1, rotate: 0 } : { y: 200, opacity: 0, rotate: 90 }}
                transition={{ duration: 1 }}
              >
                <circle cx="60" cy="50" r="35" fill="#e2e8f0" />
                <path d="M 35 50 C 35 30, 85 30, 85 50 C 85 65, 35 65, 35 50 Z" fill="#0f172a" />
              </motion.g>
              
              {/* Body */}
              <motion.g
                initial={false}
                animate={drawBody ? { y: 0, opacity: 1, rotate: 0 } : { y: 180, opacity: 0, rotate: -45 }}
                transition={{ duration: 1 }}
              >
                <rect x="35" y="80" width="50" height="40" rx="15" fill="#e2e8f0" />
                <rect x="45" y="90" width="30" height="20" rx="5" fill="transparent" stroke={isLost ? "#ef4444" : "#06b6d4"} strokeWidth="2" />
              </motion.g>
              
              {/* Left Arm */}
              <motion.g
                initial={false}
                animate={drawArms ? { y: 0, opacity: 1, rotate: 0 } : { y: 150, x: -50, opacity: 0, rotate: -120 }}
                transition={{ duration: 1 }}
              >
                <rect x="20" y="85" width="15" height="30" rx="7.5" fill="#e2e8f0" />
              </motion.g>
              
              {/* Right Arm */}
              <motion.g
                initial={false}
                animate={drawArms ? { y: 0, opacity: 1, rotate: 0 } : { y: 150, x: 50, opacity: 0, rotate: 120 }}
                transition={{ duration: 1 }}
              >
                <rect x="85" y="85" width="15" height="30" rx="7.5" fill="#e2e8f0" />
              </motion.g>
              
              {/* Left Leg */}
              <motion.g
                initial={false}
                animate={drawLegs ? { y: 0, opacity: 1, rotate: 0 } : { y: 200, x: -30, opacity: 0, rotate: -90 }}
                transition={{ duration: 1 }}
              >
                <rect x="42" y="115" width="12" height="20" rx="6" fill="#e2e8f0" />
              </motion.g>
              
              {/* Right Leg */}
              <motion.g
                initial={false}
                animate={drawLegs ? { y: 0, opacity: 1, rotate: 0 } : { y: 200, x: 30, opacity: 0, rotate: 90 }}
                transition={{ duration: 1 }}
              >
                <rect x="66" y="115" width="12" height="20" rx="6" fill="#e2e8f0" />
              </motion.g>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-6 relative z-20">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-12 text-center relative">
        <div className="absolute right-0 top-0 hidden md:flex flex-col space-y-2">
           <button onClick={() => setShowRules(true)} className="flex items-center justify-center space-x-2 text-fuchsia-400 hover:text-fuchsia-300 font-mono text-xs uppercase border border-fuchsia-500/30 px-4 py-2 rounded-lg bg-fuchsia-950/20 hover:bg-fuchsia-900/40 transition-all">
             <Info size={14} /> <span>Rules</span>
           </button>
           <button onClick={() => setShowBadges(true)} className="flex items-center justify-center space-x-2 text-yellow-400 hover:text-yellow-300 font-mono text-xs uppercase border border-yellow-500/30 px-4 py-2 rounded-lg bg-yellow-950/20 hover:bg-yellow-900/40 transition-all">
             <Award size={14} /> <span>My Badges</span>
           </button>
        </div>
        <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400 border border-fuchsia-500/30 mb-4 inline-block shadow-[0_0_20px_rgba(217,70,239,0.2)]">
          <Gamepad2 size={24} />
        </div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-fuchsia-400 tracking-[0.2em] uppercase">
          Zero-G Tether
        </h2>
        <p className="text-fuchsia-500/50 font-mono tracking-widest text-sm uppercase mt-2">
          Decrypt the sequence to save the astronaut
        </p>
      </div>

      <div className="bg-[#050505] border border-fuchsia-900/30 rounded-3xl p-4 md:p-8 shadow-[0_0_50px_rgba(217,70,239,0.05)] relative flex flex-col items-center min-h-[600px]">
        
        {/* Rules Modal */}
        <AnimatePresence>
          {showRules && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-4 z-50 bg-black/90 backdrop-blur-md border border-fuchsia-500/50 rounded-2xl p-8 flex flex-col font-mono"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-fuchsia-500/30 text-fuchsia-400">
                <h3 className="text-xl font-bold tracking-widest uppercase flex items-center"><ShieldAlert className="mr-2" /> Mission Rules</h3>
                <button onClick={() => setShowRules(false)} className="hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4 text-sm text-fuchsia-100/70 leading-relaxed overflow-y-auto pr-2">
                <p><strong>OBJECTIVE:</strong> Decrypt the unknown signal before the astronaut's tether is severed by space debris.</p>
                <p><strong>DOMAINS:</strong> Choose a category to narrow the possibilities.</p>
                <p><strong>DIFFICULTY LEVELS:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="text-green-400">EASY</span>: Shorter words. 9 tether warnings (mistakes) allowed.</li>
                  <li><span className="text-yellow-400">MEDIUM</span>: Medium words. 6 tether warnings allowed.</li>
                  <li><span className="text-red-400">HARD</span>: Long words. Only 4 tether warnings allowed. Limbs take critical damage simultaneously.</li>
                </ul>
                <p><strong>HINTS:</strong> You receive 1 starting hint. You unlock up to 2 more hints at 33% and 66% decryption. When unlocked, you may choose to reveal a text clue OR reveal 1 random letter.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unlocked Badge Popup Modal */}
        <AnimatePresence>
          {unlockedBadge && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="bg-yellow-950/80 border border-yellow-500 rounded-2xl p-12 max-w-sm w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] relative">
                <button onClick={() => setUnlockedBadge(null)} className="absolute top-4 right-4 text-yellow-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold font-mono tracking-widest text-yellow-400 mb-6 uppercase">Badge Unlocked!</h3>
                <motion.div 
                  initial={{ rotateY: 180, scale: 0 }} animate={{ rotateY: 0, scale: 1 }} transition={{ duration: 1, type: "spring", bounce: 0.6 }}
                  className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,1)]"
                >
                  {unlockedBadge.icon}
                </motion.div>
                <p className="text-3xl font-black text-white uppercase tracking-widest mb-2">{unlockedBadge.name}</p>
                <p className="text-yellow-100/70 text-xs font-mono uppercase tracking-widest">Congratulations</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges Modal */}
        <AnimatePresence>
          {showBadges && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-4 z-50 bg-black/95 backdrop-blur-md border border-yellow-500/50 rounded-2xl p-8 flex flex-col font-mono"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-500/30 text-yellow-400">
                <h3 className="text-xl font-bold tracking-widest uppercase flex items-center"><Award className="mr-2" /> Mission Badges Vault</h3>
                <button onClick={() => setShowBadges(false)} className="hover:text-white"><X size={24} /></button>
              </div>
              <div className="text-center mb-6">
                <p className="text-yellow-100/70 text-sm uppercase tracking-widest">Total Successful Decryptions</p>
                <p className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_15px_yellow]">{winsCount}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-4">
                {BADGES.map((badge) => {
                  const unlocked = winsCount >= badge.count;
                  return (
                    <div key={badge.count} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${unlocked ? 'border-yellow-500/50 bg-yellow-950/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-zinc-800 bg-zinc-900/50 opacity-50 grayscale'}`}>
                      <span className="text-3xl mb-2 drop-shadow-md">{badge.icon}</span>
                      <span className={`text-xs font-bold tracking-widest uppercase text-center ${unlocked ? 'text-yellow-400' : 'text-zinc-500'}`}>{badge.name}</span>
                      <span className={`text-[10px] mt-1 ${unlocked ? 'text-yellow-400/50' : 'text-zinc-600'}`}>{badge.count} Wins</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Choice Modal */}
        <AnimatePresence>
          {showHintModal !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-cyan-950 border-2 border-cyan-500 rounded-xl p-8 max-w-md w-full text-center shadow-[0_0_30px_rgba(6,182,212,0.4)] relative">
                <button onClick={() => setShowHintModal(null)} className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <Lightbulb size={40} className="mx-auto text-cyan-400 mb-4 animate-pulse" />
                <h3 className="text-xl font-bold font-mono tracking-widest text-cyan-400 mb-2 uppercase">Decryption Milestone Reached</h3>
                <p className="text-cyan-100/70 text-sm mb-8 font-mono">You have unlocked Hint #{showHintModal}. Choose your assistance protocol:</p>
                <div className="flex flex-col space-y-4">
                  <button onClick={() => applyHint('REVEAL', showHintModal)} className="w-full py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-mono tracking-widest uppercase hover:bg-cyan-400 hover:text-black transition-all rounded">
                    Reveal 1 Unknown Letter
                  </button>
                  <button onClick={() => applyHint('TEXT', showHintModal)} className="w-full py-3 bg-fuchsia-500/20 border border-fuchsia-500 text-fuchsia-400 font-mono tracking-widest uppercase hover:bg-fuchsia-400 hover:text-black transition-all rounded">
                    Request Text Clue
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'SETUP' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="w-full max-w-lg">
              <h3 className="font-mono text-fuchsia-400 mb-4 tracking-widest uppercase text-sm border-b border-fuchsia-900/50 pb-2">1. Select Signal Domain</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(DOMAINS) as DomainType[]).map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDomain(d)}
                    className={`py-3 px-4 rounded border font-mono tracking-widest text-xs uppercase transition-all ${domain === d ? 'bg-fuchsia-500 text-white border-fuchsia-400 shadow-[0_0_15px_fuchsia]' : 'bg-fuchsia-950/20 border-fuchsia-900/50 text-fuchsia-500 hover:border-fuchsia-500/50'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full max-w-lg">
              <h3 className="font-mono text-fuchsia-400 mb-4 tracking-widest uppercase text-sm border-b border-fuchsia-900/50 pb-2">2. Select Tether Integrity (Difficulty)</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['EASY', 'MEDIUM', 'HARD'] as LevelType[]).map(l => (
                  <button 
                    key={l} 
                    onClick={() => setLevel(l)}
                    className={`py-3 px-4 rounded border font-mono tracking-widest text-xs uppercase transition-all ${level === l ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_cyan]' : 'bg-cyan-950/20 border-cyan-900/50 text-cyan-500 hover:border-cyan-500/50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={startGame}
              disabled={!domain || !level}
              className="mt-8 px-12 py-4 bg-white text-black font-black tracking-[0.2em] uppercase rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_white] transition-all"
            >
              Initiate Decryption
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Active Game Header */}
            <div className="w-full flex justify-between items-start mb-8 font-mono text-xs md:text-sm tracking-widest uppercase">
               <div className="flex flex-col space-y-2">
                 <div className={`px-4 py-1.5 rounded-full border flex-wrap flex ${status === 'PLAYING' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : status === 'WON' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}>
                    STATUS: {status}
                 </div>
                 {activeHints.map((hint, i) => (
                   <div key={i} className="text-[10px] text-yellow-400 flex items-center bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/30">
                     <Search size={10} className="mr-1" /> {hint}
                   </div>
                 ))}
               </div>
               
               <div className="text-white/50 text-right flex flex-col items-end">
                 <span>INTEGRITY: <span className={mistakes >= maxMistakes - 1 ? 'text-red-500 font-bold' : 'text-white'}>{maxMistakes - mistakes}</span> / {maxMistakes}</span>
                 <span className="text-[10px] mt-1 text-fuchsia-500/50">LVL: {level}</span>
               </div>
            </div>

            {renderAstronaut()}

            {/* Word Display */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 min-h-[4rem]">
              {word.split('').map((char, index) => {
                if (char === ' ') return <span key={index} className="w-4 md:w-8"></span>;
                const isGuessed = guessed.has(char);
                return (
                  <span 
                    key={index} 
                    className={`w-8 md:w-12 h-12 md:h-16 flex items-center justify-center border-b-4 text-2xl md:text-4xl font-black font-mono transition-colors ${
                      isGuessed ? 'border-cyan-400 text-cyan-400' : 'border-white/20 text-transparent'
                    } ${status === 'LOST' && !isGuessed ? '!text-red-500 !border-red-500' : ''}`}
                  >
                    {isGuessed || status === 'LOST' ? char : '_'}
                  </span>
                );
              })}
            </div>

            {/* Keyboard or End Screen */}
            {status === 'PLAYING' ? (
              <div className="flex flex-col items-center space-y-2 w-full max-w-2xl mt-4">
                {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center space-x-1 md:space-x-2">
                    {row.split('').map(letter => {
                      const isGuessed = guessed.has(letter);
                      const isCorrect = isGuessed && word.includes(letter);
                      const isWrong = isGuessed && !word.includes(letter);
                      
                      let btnClass = "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50";
                      if (isCorrect) btnClass = "bg-cyan-500/20 border-cyan-500 text-cyan-400";
                      if (isWrong) btnClass = "bg-red-500/20 border-red-500/50 text-red-500/50 opacity-30";

                      return (
                        <button
                          key={letter}
                          onClick={() => handleGuess(letter)}
                          disabled={isGuessed || status !== 'PLAYING'}
                          className={`w-8 h-10 md:w-12 md:h-14 rounded border text-sm md:text-xl font-bold font-mono transition-all ${btnClass} disabled:cursor-not-allowed`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center mt-4 p-8 bg-black/40 border border-fuchsia-500/30 rounded-2xl backdrop-blur-md"
              >
                <h3 className={`text-2xl font-black tracking-widest uppercase mb-6 ${status === 'WON' ? 'text-green-400 drop-shadow-[0_0_10px_green]' : 'text-red-500 drop-shadow-[0_0_10px_red]'}`}>
                  {status === 'WON' ? 'SIGNAL DECRYPTED' : 'TETHER SEVERED'}
                </h3>
                <button 
                  onClick={resetToSetup}
                  className="px-8 py-3 bg-fuchsia-500 text-white font-bold font-mono tracking-widest uppercase rounded-full hover:bg-fuchsia-400 hover:shadow-[0_0_20px_fuchsia] transition-all"
                >
                  Configure New Signal
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

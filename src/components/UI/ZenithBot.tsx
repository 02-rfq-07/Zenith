'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';

const BOT_KNOWLEDGE = [
  // Highly Specific Queries (Checked First)
  { keywords: ["radar", "use", "how"], answer: "The Radar page predicts orbital pathways and celestial bodies overhead. You can access it by clicking 'INITIALIZE RADAR' on the home page." },
  { keywords: ["game", "play", "hangman", "tether", "decrypt"], answer: "The Zero-G Tether is a decryption game. You must guess the letters of a cosmic term before my tether snaps. You can earn badges for your wins!" },
  { keywords: ["jwst", "jswt", "james", "webb", "telescope"], answer: "The James Webb Space Telescope (JWST) is the largest optical telescope in space. Its incredible infrared sensitivity allows us to see some of the oldest galaxies in the universe!" },
  { keywords: ["hubble"], answer: "The Hubble Space Telescope was launched in 1990. It orbits Earth and has provided some of the most breathtaking visible-light images of deep space ever captured." },
  { keywords: ["iss", "space", "station", "international"], answer: "The International Space Station (ISS) is a modular space station in low Earth orbit. It's a massive, multinational laboratory flying at 17,500 mph!" },
  
  // General Knowledge
  { keywords: ["black", "hole", "blackhole"], answer: "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape from it." },
  { keywords: ["mars"], answer: "Mars is the fourth planet from the Sun. It is a dusty, cold, desert world with a very thin atmosphere." },
  { keywords: ["moon"], answer: "The Moon is Earth's only natural satellite. It is the fifth largest satellite in the Solar System." },
  { keywords: ["sun", "star"], answer: "The Sun is the star at the center of the Solar System. It is a nearly perfect ball of hot plasma." },
  { keywords: ["galaxy", "milky", "way", "galaxies"], answer: "A galaxy is a massive system of stars, gas, and dark matter. We live in the Milky Way, a barred spiral galaxy containing 100 to 400 billion stars." },
  { keywords: ["universe", "big", "bang"], answer: "The universe is all of space and time. The Big Bang theory suggests our universe expanded from an extremely dense, hot state about 13.8 billion years ago." },
  { keywords: ["speed", "light"], answer: "The speed of light in a vacuum is exactly 299,792,458 meters per second. It is the absolute speed limit of the universe!" },
  { keywords: ["astronaut", "suit", "spacecraft"], answer: "Astronauts wear specialized spacesuits (EMUs) during spacewalks. These suits are basically personalized, human-shaped spaceships that provide life support and temperature control." },
  { keywords: ["gravity", "microgravity", "zero"], answer: "In orbit, astronauts aren't actually in 'zero gravity'. They are in a state of continuous freefall around the Earth, which creates the sensation of weightlessness or microgravity!" },
  
  // Generic / Project Queries (Checked Last to avoid false positives)
  { keywords: ["what", "zenith", "project", "website"], answer: "Project Zenith is an advanced cosmic radar and archive. It tracks upcoming orbital launches, catalogs theoretical sci-fi concepts, and features a zero-G decryption game." },
  { keywords: ["who", "are", "you", "name"], answer: "I am Orion, your celestial guide and the AI core of Project Zenith." },
  { keywords: ["creator", "who", "made", "developer"], answer: "I was developed by a brilliant engineering mind. My systems are fully operational." },
];

const DEFAULT_ANSWERS = [
  "My uplink to the central Earth databanks is currently offline, but I can tell you that space is completely silent!",
  "I'm not quite sure about that. Did you know a day on Venus is longer than its year?",
  "That's outside my current databanks. But hey, did you know footprints on the moon will last for 100 million years?",
  "I don't have the coordinates for that answer. Try asking me about Project Zenith, the Radar, or black holes!"
];

type Message = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
};

export default function ZenithBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: "Greetings Commander. I am Orion, the AI core of Project Zenith. How can I assist your mission today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate thinking
    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase();
      let foundAnswer = null;

      // Improved keyword matching with word boundaries to prevent partial word matches
      let bestMatchScore = 0;
      for (const item of BOT_KNOWLEDGE) {
        let score = 0;
        for (const k of item.keywords) {
          // Check for exact word match using regex boundary
          const regex = new RegExp(`\\b${k}\\b`, 'i');
          if (regex.test(lowerInput)) {
            score++;
          }
        }
        
        // > ensures the FIRST match wins ties (our array is sorted specific -> generic)
        if (score > 0 && score > bestMatchScore) {
          bestMatchScore = score;
          foundAnswer = item.answer;
        }
      }

      // If no good match is found
      if (bestMatchScore === 0) {
        foundAnswer = DEFAULT_ANSWERS[Math.floor(Math.random() * DEFAULT_ANSWERS.length)];
      }

      const botMsg: Message = { id: Date.now() + 1, sender: 'bot', text: foundAnswer as string };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full bg-cyan-600/20 border-2 border-cyan-500 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-cyan-500/40 transition-all group overflow-hidden"
              title="Open ZenithBot"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
              <svg width="36" height="36" viewBox="0 0 120 120" fill="none" className="relative z-10 group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                {/* Mini Astronaut Helmet */}
                <circle cx="60" cy="60" r="45" fill="#0f172a" stroke="#06b6d4" strokeWidth="4" />
                <path d="M 35 60 C 35 40, 85 40, 85 60 C 85 75, 35 75, 35 60 Z" fill="#020617" stroke="#06b6d4" strokeWidth="2" />
                <ellipse cx="45" cy="52" rx="6" ry="8" fill="#06b6d4" opacity="0.5" transform="rotate(-30 45 52)" />
                <circle cx="85" cy="50" r="6" fill="#ef4444" className="animate-pulse" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-[#050b14]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-cyan-950/50 border-b border-cyan-500/30 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-cyan-100 font-bold font-mono tracking-wider uppercase text-sm">Orion AI</h3>
                  <p className="text-cyan-500/70 text-[10px] font-mono tracking-widest uppercase flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-500/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                    ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-50 rounded-tr-sm' 
                    : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-cyan-900/50 bg-black/50">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Orion..."
                  className="w-full bg-cyan-950/30 border border-cyan-800/50 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-500/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

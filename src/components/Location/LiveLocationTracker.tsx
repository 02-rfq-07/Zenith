'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation2, Loader2 } from 'lucide-react';
import { useRadarStore } from '@/store/useRadarStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveLocationTracker() {
  const { setCoordinates, latitude, longitude } = useRadarStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const requestLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        setLocationError("Unable to retrieve location. Please ensure it is enabled.");
        setTimeout(() => setLocationError(null), 5000); // Hide error after 5 seconds
      }
    );
  };

  const handleLiveLocation = async () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setTimeout(() => setLocationError(null), 5000);
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'denied') {
        setLocationError("Location is blocked! Please click the site settings icon in your URL bar to allow it.");
        setTimeout(() => setLocationError(null), 6000);
      } else {
        // 'prompt' or 'granted'
        requestLocation();
      }
    } catch (e) {
      // Fallback if permissions API is not supported
      requestLocation();
    }
  };

  const selectLocation = (lat: string, lon: string, name: string) => {
    setCoordinates(parseFloat(lat), parseFloat(lon));
    setSearchQuery(name.split(',')[0]); // Just keep the first part of the name for aesthetics
    setIsExpanded(false);
    setSuggestions([]);
  };

  return (
    <div className="glass-panel hud-border p-4 mt-6 rounded-xl relative z-40 !overflow-visible">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/30">
            <Navigation2 size={16} className={isLocating ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Target Coordinates</h3>
            <div className="text-[10px] text-white/50 font-mono">
              LAT: {latitude.toFixed(4)}° / LNG: {longitude.toFixed(4)}°
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative" ref={searchRef}>
          {/* Expanding Search Bar */}
          <motion.div
            initial={false}
            animate={{ width: isExpanded ? 200 : 36 }}
            className="relative flex items-center bg-black/50 border border-white/10 rounded-full overflow-hidden transition-colors hover:border-cyan-500/50"
          >
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-2 text-white/70 hover:text-cyan-400 flex-shrink-0"
            >
              <Search size={16} />
            </button>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-mono text-white placeholder-white/30 focus:outline-none pr-3"
              style={{ display: isExpanded ? 'block' : 'none' }}
            />
          </motion.div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isExpanded && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-10 mt-2 w-64 bg-gray-900 border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(s.lat, s.lon, s.display_name)}
                    className="w-full text-left px-4 py-3 text-xs font-mono text-white/80 hover:bg-cyan-900/50 hover:text-cyan-400 border-b border-white/5 last:border-0 truncate flex items-center space-x-2"
                  >
                    <MapPin size={12} className="flex-shrink-0 opacity-50" />
                    <span className="truncate">{s.display_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Location Button */}
          <div className="relative flex items-center">
            <button
              onClick={handleLiveLocation}
              className="flex items-center justify-center p-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-full hover:bg-cyan-500/30 transition-all flex-shrink-0"
              title="Use Live Location"
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            </button>
            
            {/* Error Tooltip */}
            <AnimatePresence>
              {locationError && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-red-900/90 border border-red-500 text-white text-[10px] p-2 rounded shadow-lg text-center font-mono pointer-events-none"
                >
                  {locationError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

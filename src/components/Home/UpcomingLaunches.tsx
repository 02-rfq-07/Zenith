import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, MapPin, Calendar, ExternalLink } from 'lucide-react';

const getCalendarLink = (mission: string, desc: string) => {
  const text = encodeURIComponent(mission + ' Launch');
  const details = encodeURIComponent(desc);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
};

const LAUNCHES = [
  {
    id: "artemis-ii",
    mission: "Artemis II",
    agency: "NASA",
    date: "September 2025",
    vehicle: "SLS Block 1",
    location: "Kennedy Space Center, FL",
    description: "The first crewed mission of NASA's Orion spacecraft, performing a lunar flyby and returning to Earth.",
    link: "https://www.nasa.gov/specials/artemis/",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "europa-clipper",
    mission: "Europa Clipper",
    agency: "NASA",
    date: "October 2024",
    vehicle: "Falcon Heavy",
    location: "Kennedy Space Center, FL",
    description: "An interplanetary mission to conduct detailed reconnaissance of Jupiter's moon Europa and investigate its habitability.",
    link: "https://europa.nasa.gov/",
    image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "starship-ift",
    mission: "Starship Flight Test",
    agency: "SpaceX",
    date: "TBD 2024",
    vehicle: "Starship Super Heavy",
    location: "Starbase, TX",
    description: "The next integrated flight test of the fully reusable Starship system, aiming for orbit and re-entry.",
    link: "https://www.spacex.com/vehicles/starship/",
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "lunar-trailblazer",
    mission: "Lunar Trailblazer",
    agency: "NASA",
    date: "2024",
    vehicle: "Falcon 9",
    location: "Cape Canaveral, FL",
    description: "A small satellite mission to understand the form, abundance, and distribution of water on the Moon.",
    link: "https://www.jpl.nasa.gov/missions/lunar-trailblazer",
    image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=800&auto=format&fit=crop"
  }
];

export default function UpcomingLaunches() {
  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-6 relative z-20">
      <div className="flex items-center space-x-3 mb-12">
        <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400 border border-fuchsia-500/30">
          <Rocket size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-fuchsia-400 tracking-[0.2em] uppercase">
            Mission Control
          </h2>
          <p className="text-fuchsia-500/50 font-mono tracking-widest text-sm uppercase mt-1">Upcoming Orbital Launches</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {LAUNCHES.map((launch, i) => (
          <motion.div 
            key={launch.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col md:flex-row bg-[#050505] border border-fuchsia-900/40 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)] transition-all group"
          >
            <div className="w-full md:w-1/4 h-48 md:h-auto relative shrink-0">
              <div className="absolute inset-0 bg-fuchsia-900/40 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
              <img src={launch.image} alt={launch.mission} className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md px-3 py-1 rounded border border-fuchsia-500/30">
                <span className="font-mono text-xs font-bold text-fuchsia-400 tracking-widest uppercase">{launch.agency}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-20">
              <div className="flex flex-wrap items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{launch.mission}</h3>
                <a 
                  href={getCalendarLink(launch.mission, launch.description)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-fuchsia-950/40 px-3 py-1.5 rounded border border-fuchsia-900 mt-2 md:mt-0 hover:bg-fuchsia-900/60 transition-colors cursor-pointer group/cal"
                  title="Add to Google Calendar"
                >
                  <Calendar size={14} className="text-fuchsia-400 group-hover/cal:text-fuchsia-300" />
                  <span className="font-mono text-xs text-fuchsia-300 group-hover/cal:text-white tracking-widest uppercase">{launch.date}</span>
                </a>
              </div>
              
              <div className="flex items-center space-x-4 mb-4 text-xs font-mono text-zinc-400 tracking-widest uppercase">
                <span className="flex items-center"><Rocket size={12} className="mr-1" /> {launch.vehicle}</span>
                <span className="flex items-center"><MapPin size={12} className="mr-1" /> {launch.location}</span>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl mb-4">
                {launch.description}
              </p>

              <div className="mt-auto pt-4 border-t border-fuchsia-900/30">
                <a href={launch.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-fuchsia-400 hover:text-fuchsia-300 font-mono text-xs uppercase tracking-widest transition-colors w-fit">
                  <span>Registration / Details</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

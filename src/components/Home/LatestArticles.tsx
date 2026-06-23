import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: "James Webb Space Telescope Maps Dark Matter Web",
    excerpt: "New infrared data from JWST has revealed the intricate 'skeleton' of the universe, tracing dark matter filaments connecting distant galaxies.",
    date: "June 23, 2026",
    readTime: "5 min read",
    link: "https://www.nasa.gov/webb",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Artemis III Target Landing Zone Finalized",
    excerpt: "NASA has officially selected the lunar south pole landing coordinates for the upcoming Artemis III crewed mission.",
    date: "June 20, 2026",
    readTime: "8 min read",
    link: "https://www.nasa.gov/specials/artemis/",
    image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Voyager 1 Sends Unexpected Signal",
    excerpt: "The legacy probe, now billions of miles away in interstellar space, has transmitted a rhythmic ping that continues to baffle mission scientists.",
    date: "June 18, 2026",
    readTime: "4 min read",
    link: "https://voyager.jpl.nasa.gov/",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Mars Sample Return Mission Milestone",
    excerpt: "The perseverance rover has successfully cached its final titanium tube of Martian regolith, awaiting the retrieval lander.",
    date: "June 15, 2026",
    readTime: "6 min read",
    link: "https://mars.nasa.gov/msr/",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Europa Clipper Reaches Jupiter Orbit",
    excerpt: "After a 5-year journey, NASA's flagship mission has successfully inserted itself into orbit around the gas giant to study its icy moon.",
    date: "June 10, 2026",
    readTime: "7 min read",
    link: "https://europa.nasa.gov/",
    image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "SpaceX Starship Completes Refueling Test",
    excerpt: "A critical milestone for the Artemis program was achieved as two Starships successfully docked and transferred cryogenic propellant in LEO.",
    date: "June 5, 2026",
    readTime: "5 min read",
    link: "https://www.spacex.com/vehicles/starship/",
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 7,
    title: "Hubble Telescope Life Extension Approved",
    excerpt: "A private servicing mission has been approved to boost the venerable telescope's orbit and replace aging gyroscopes.",
    date: "June 1, 2026",
    readTime: "4 min read",
    link: "https://hubblesite.org/",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 8,
    title: "First Exoplanet Atmospheric Composition Confirmed",
    excerpt: "JWST has identified clear signatures of water vapor, methane, and carbon dioxide in the atmosphere of K2-18b.",
    date: "May 28, 2026",
    readTime: "9 min read",
    link: "https://exoplanets.nasa.gov/",
    image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 9,
    title: "OSIRIS-REx Sample Analysis Unveiled",
    excerpt: "Scientists have published the first comprehensive analysis of the pristine asteroid sample returned from Bennu, revealing organic building blocks.",
    date: "May 20, 2026",
    readTime: "6 min read",
    link: "https://www.nasa.gov/osiris-rex/",
    image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 10,
    title: "Commercial Space Station Lunar Gateway Modules Ready",
    excerpt: "The first hab module for the Lunar Gateway has completed vacuum testing and is ready for integration with the launch vehicle.",
    date: "May 15, 2026",
    readTime: "5 min read",
    link: "https://www.nasa.gov/gateway",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop"
  }
];

export default function LatestArticles() {
  const [showAll, setShowAll] = React.useState(false);
  const visibleArticles = showAll ? ARTICLES : ARTICLES.slice(0, 4);

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-6 relative z-20">
      <div className="flex items-center space-x-3 mb-12">
        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
          <Newspaper size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 tracking-[0.2em] uppercase">
            Latest Dispatches
          </h2>
          <p className="text-cyan-500/50 font-mono tracking-widest text-sm uppercase mt-1">Interstellar News Network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleArticles.map((article, i) => (
          <motion.div 
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.1 }}
            className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col md:flex-row h-full"
          >
            {/* Image Section */}
            <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-cyan-900/40 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-3/5 p-6 flex flex-col justify-between relative z-20 bg-black/60 backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-4 mb-3 text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase">
                  <span>{article.date}</span>
                  <span className="flex items-center"><Clock size={10} className="mr-1" /> {article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>
              <Link href={article.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest transition-colors w-fit">
                <span>Read Dispatch</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => setShowAll(!showAll)}
          className="px-8 py-3 bg-cyan-950/40 border border-cyan-500 text-cyan-400 font-mono tracking-widest text-sm uppercase rounded hover:bg-cyan-500 hover:text-black transition-all hover:shadow-[0_0_20px_cyan]"
        >
          {showAll ? 'Collapse Archive' : 'Show All Dispatches'}
        </button>
      </div>
    </div>
  );
}

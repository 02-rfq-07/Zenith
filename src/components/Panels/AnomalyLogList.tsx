'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ZenithSatellite } from '@/workers/orbitalWorker';

export default function AnomalyLogList({ satellites }: { satellites: ZenithSatellite[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel hud-border p-4 w-full flex flex-col">
       <button onClick={() => setExpanded(!expanded)} className="flex justify-between items-center w-full text-cyan-400 font-mono tracking-widest uppercase text-xs font-bold hover:text-cyan-300 transition-colors">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Anomaly Log Directory</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
       </button>
       
       <AnimatePresence>
         {expanded && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="overflow-hidden"
           >
             <div className="mt-4 max-h-[300px] overflow-y-auto custom-scrollbar border border-white/10 rounded-lg">
               <table className="w-full text-left text-[10px] font-mono text-white/70">
                 <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                   <tr>
                     <th className="p-2 border-b border-white/10 text-cyan-500/80">ID / NO.</th>
                     <th className="p-2 border-b border-white/10 text-cyan-500/80">ANOMALY NAME</th>
                     <th className="p-2 border-b border-white/10 text-cyan-500/80">TYPE CLASSIFICATION</th>
                     <th className="p-2 border-b border-white/10 text-cyan-500/80">DETECTION DATE</th>
                   </tr>
                 </thead>
                 <tbody>
                   {satellites.map((sat, i) => (
                     <tr key={`${sat.id}-${i}`} className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-default">
                       <td className="p-2 text-cyan-400 font-bold">{sat.id}</td>
                       <td className="p-2 truncate max-w-[100px] text-white">{sat.name}</td>
                       <td className="p-2">
                         <span className={`px-2 py-0.5 rounded-full text-[8px] ${sat.type === 'PAYLOAD' ? 'bg-blue-500/20 text-blue-300' : sat.type === 'DEBRIS' ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-300'}`}>
                           {sat.type}
                         </span>
                       </td>
                       <td className="p-2 text-white/40">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</td>
                     </tr>
                   ))}
                   {satellites.length === 0 && (
                     <tr>
                       <td colSpan={4} className="p-4 text-center text-white/40">No anomalies detected in current sector.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

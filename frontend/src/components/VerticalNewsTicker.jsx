import React, { useEffect, useRef, useState } from 'react';
import { Clock, TrendingDown, TrendingUp, AlertTriangle, Radio } from 'lucide-react';

export default function VerticalNewsTicker({ events = [] }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let intervalId;
    if (!isPaused && scrollRef.current) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1;
          // Simple loop: if user hits bottom of actual content, bounce to top or let them stay
          // Because it's hard to dynamically duplicate children properly in a simple script,
          // we'll just let it scroll down slowly until the end.
          if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
            scrollRef.current.scrollTop = 0; // reset to top automatically
          }
        }
      }, 50); // Speed of auto-scroll
    }
    return () => clearInterval(intervalId);
  }, [isPaused]);

  const renderCard = (event, idx) => {
    const isCritical = event.is_breaking;
    
    // Derived properties
    const sourceType = event.confidence?.label === 'High' ? 'official' : 'unofficial';
    const sectors = event.impact?.map(i => i.sector) || [];
    const companies = event.impact?.flatMap(i => i.companies || []) || [];

    return (
      <div key={idx} className={`p-3 rounded-xl border mb-4 w-full backdrop-blur-sm transition-all duration-300 ${isCritical ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900/60 border-slate-700/60 shadow-lg'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
            {isCritical ? <Radio size={10} className="text-red-500 animate-pulse" /> : <Clock size={10} />}
            {isCritical ? <span className="text-red-400">BREAKING LIVE</span> : "Just In"}
          </div>
          {isCritical && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
        </div>
        
        {/* Source Badge */}
        <div className="flex items-center gap-1.5 mb-2">
           <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${sourceType === 'official' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
             {sourceType}
           </span>
           <span className="text-[9px] text-slate-400 truncate w-32">{event.source}</span>
        </div>
        
        <h4 className="text-[12px] font-medium text-slate-200 mb-2 leading-snug">
          {event.title}
        </h4>
        
        {/* View article anchor */}
        {event.url && (
          <a href={event.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase mb-3 px-2 py-1 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700 w-max">
            View Article ↗
          </a>
        )}
        
        <div className="border-t border-slate-700/50 pt-2 space-y-2">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] text-slate-400 font-bold uppercase">Affected Sectors</span>
             <div className="flex flex-wrap gap-1">
               {sectors.map((sec, i) => (
                 <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">{sec}</span>
               ))}
             </div>
          </div>
          {companies.length > 0 && (
            <div className="flex flex-col gap-1">
               <span className="text-[9px] text-slate-400 font-bold uppercase">Key Companies</span>
               <div className="flex flex-wrap gap-1">
                 {companies.slice(0, 4).map((comp, i) => (
                   <span key={`c${i}`} className="text-[9px] text-blue-400 font-bold">{comp}{i < 3 && i < companies.length - 1 ? ',' : ''}</span>
                 ))}
                 {companies.length > 4 && <span className="text-[9px] text-slate-500">+{companies.length - 4} more</span>}
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-slate-950 flex flex-col overflow-hidden relative border-l border-slate-800 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-40">
      
      {/* Sidebar Header */}
      <div className="h-14 border-b border-slate-800/60 flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-md z-20 shrink-0 shadow-md">
        <h2 className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          Live Bulletin
        </h2>
      </div>

      <div className="absolute top-14 left-0 right-0 h-16 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none"></div>
      
      {/* Manual & Auto Scroll Container */}
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex-1 overflow-y-auto px-4 pt-14 pb-24 custom-scrollbar"
      >
        <div className="flex flex-col pt-4">
          {events.map((item, idx) => renderCard(item, `n1-${idx}`))}
          {/* duplicate the list once to allow smooth pseudo-looping visually */}
          {events.map((item, idx) => renderCard(item, `n2-${idx}`))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>

      <style>{`
        /* Custom scrollbar for scenario engine */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

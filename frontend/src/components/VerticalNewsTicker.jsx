import React, { useEffect, useRef, useState } from 'react';
import { Clock, TrendingDown, TrendingUp, AlertTriangle, Radio } from 'lucide-react';

function NewsTickerCard({ event, idx, onEventSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCritical = event.is_breaking;
  
  // Derived properties
  const sourceType = event.confidence?.label === 'High' ? 'official' : 'unofficial';
  const sectors = event.impact?.map(i => i.sector) || [];
  const companies = event.impact?.flatMap(i => i.companies || []) || [];

  const maxSectors = 3;
  const maxCompanies = 4;

  const displaySectors = isExpanded ? sectors : sectors.slice(0, maxSectors);
  const displayCompanies = isExpanded ? companies : companies.slice(0, maxCompanies);

  const hasMore = sectors.length > maxSectors || companies.length > maxCompanies;

  return (
    <div 
      key={idx} 
      onClick={() => onEventSelect(event.id)}
      className={`p-3 rounded-xl border mb-4 w-full text-left backdrop-blur-sm transition-all duration-300 cursor-pointer group ${isCritical ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900/60 border-slate-700/60 shadow-lg hover:border-slate-500'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
          {isCritical ? <Radio size={10} className="text-red-500 animate-pulse" /> : <Clock size={10} />}
          {isCritical ? <span className="text-red-400">BREAKING LIVE | {event.time_label}</span> : event.time_label}
        </div>
        {isCritical && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
      </div>
      
      <div className="flex items-center gap-1.5 mb-2">
         <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${sourceType === 'official' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
           {sourceType}
         </span>
         <span className="text-[9px] text-slate-400 truncate w-32">{event.source}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        {event.url && (
          <a 
            href={event.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/30 w-max"
          >
            Source Analysis ↗
          </a>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onEventSelect(event.id); }}
          className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-white transition-colors uppercase px-2 py-1 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 w-max"
        >
          Details ↗
        </button>
      </div>
      
      <div className="border-t border-slate-700/50 pt-2 space-y-2">
        {sectors.length > 0 && (
          <div className="flex flex-col gap-1">
             <span className="text-[9px] text-slate-400 font-bold uppercase">Affected Sectors</span>
             <div className="flex flex-wrap gap-1">
               {displaySectors.map((sec, i) => (
                 <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">{sec}</span>
               ))}
               {!isExpanded && sectors.length > maxSectors && (
                 <span className="text-[9px] text-slate-500 py-0.5">+{sectors.length - maxSectors} more</span>
               )}
             </div>
          </div>
        )}
        {companies.length > 0 && (
          <div className="flex flex-col gap-1">
             <span className="text-[9px] text-slate-400 font-bold uppercase">Key Companies</span>
             <div className="flex flex-wrap gap-1">
               {displayCompanies.map((comp, i) => (
                 <span key={`c${i}`} className="text-[9px] text-blue-400 font-bold">
                   {comp}{i < displayCompanies.length - 1 ? ',' : ''}
                 </span>
               ))}
               {!isExpanded && companies.length > maxCompanies && (
                 <span className="text-[9px] text-slate-500">+{companies.length - maxCompanies} more</span>
               )}
             </div>
          </div>
        )}

        {hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-blue-400 bg-slate-800/40 hover:bg-blue-900/20 border border-slate-700/60 hover:border-blue-500/40 rounded-lg transition-all duration-300"
          >
            {isExpanded ? 'View Less Signal Details' : `View More Impact Analysis (${sectors.length + companies.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerticalNewsTicker({ events = [], onEventSelect }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let intervalId;
    if (!isPaused && scrollRef.current) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1;
          if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
            scrollRef.current.scrollTop = 0;
          }
        }
      }, 50);
    }
    return () => clearInterval(intervalId);
  }, [isPaused]);

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
      
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex-1 overflow-y-auto px-4 pt-14 pb-24 custom-scrollbar"
      >
        <div className="flex flex-col pt-4">
          {events.map((item, idx) => (
            <NewsTickerCard key={`n1-${item.id}-${idx}`} event={item} idx={`n1-${idx}`} onEventSelect={onEventSelect} />
          ))}
          {events.map((item, idx) => (
            <NewsTickerCard key={`n2-${item.id}-${idx}`} event={item} idx={`n2-${idx}`} onEventSelect={onEventSelect} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>

      <style>{`
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

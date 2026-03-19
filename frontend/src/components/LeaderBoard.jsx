import React, { useState } from 'react';
import { Megaphone, ExternalLink, Globe, Filter, Minus, Square, ChevronDown, ChevronUp } from 'lucide-react';

const LEADERS = [
  {
    name: "POTUS",
    role: "President, USA",
    region: "North America",
    statement: "We are actively monitoring the pipeline situation out of Dubai and coordinating with our allies.",
    postedAt: "Twitter / X",
    timeAgo: "1h ago",
    link: "https://www.whitehouse.gov/briefing-room/"
  },
  {
    name: "Ursula von der Leyen",
    role: "President, EU Commission",
    region: "Europe",
    statement: "The EU stands firm on the new AI regulatory framework to protect our citizens.",
    postedAt: "Official Press",
    timeAgo: "4h ago",
    link: "https://ec.europa.eu/commission/presscorner/home/en"
  },
  {
    name: "Jerome Powell",
    role: "Chair, Federal Reserve",
    region: "North America",
    statement: "The committee is prepared to adjust policy stance as appropriate given the recent jobs report.",
    postedAt: "FOMC Statement",
    timeAgo: "10h ago",
    link: "https://www.federalreserve.gov/newsevents/pressreleases.htm"
  },
  {
    name: "OPEC Secretariat",
    role: "Organization",
    region: "International Organizations",
    statement: "Member countries have agreed to adjust production quotas starting next month.",
    postedAt: "Official Statement",
    timeAgo: "14h ago",
    link: "https://www.opec.org/opec_web/en/press_room/28.htm"
  },
  {
    name: "Kristalina Georgieva",
    role: "Managing Director, IMF",
    region: "International Organizations",
    statement: "Global growth projections have been revised downwards due to recent supply chain disruptions in the Red Sea.",
    postedAt: "IMF Press Briefing",
    timeAgo: "18h ago",
    link: "https://www.imf.org/en/News"
  },
  {
    name: "Ajay Banga",
    role: "President, World Bank",
    region: "International Organizations",
    statement: "We are launching a new $5B initiative to stabilize developing economies affected by the recent energy shocks.",
    postedAt: "Official Press",
    timeAgo: "1d ago",
    link: "https://www.worldbank.org/en/news"
  },
  {
    name: "Xi Jinping",
    role: "President, China",
    region: "Asia",
    statement: "We will continue to strengthen our domestic manufacturing capabilities in the face of external tariffs.",
    postedAt: "State Media",
    timeAgo: "1d ago",
    link: "https://english.news.cn/"
  },
  {
    name: "Mohammed bin Salman",
    role: "Crown Prince, Saudi Arabia",
    region: "Middle East",
    statement: "Vision 2030 initiatives are accelerating, ensuring stable energy exports to our global partners.",
    postedAt: "Official Press",
    timeAgo: "2d ago",
    link: "https://www.spa.gov.sa/en/Home"
  }
];

const REGIONS = ["All", "North America", "Europe", "Asia", "Middle East", "International Organizations"];

export default function LeaderBoard() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [isMinimized, setIsMinimized] = useState(false);

  const filteredLeaders = selectedRegion === "All" 
    ? LEADERS 
    : LEADERS.filter(l => l.region === selectedRegion);

  return (
    <div className={`bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-sm shadow-xl flex flex-col transition-all duration-300 ${isMinimized ? 'max-h-[52px]' : 'max-h-[400px]'}`}>
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Global Leaderboard</h3>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              {isMinimized ? <ChevronDown size={14} /> : <Minus size={14} />}
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50 mb-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <Filter size={12} className="text-slate-400 ml-1" />
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-[10px] text-slate-300 font-medium uppercase tracking-wider outline-none w-full cursor-pointer appearance-none"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">{r}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 animate-in fade-in zoom-in-95 duration-300">
          {filteredLeaders.map((leader, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 group hover:bg-slate-800/80 transition-colors">
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-200">{leader.name}</h4>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{leader.role}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {leader.timeAgo}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 italic mb-3 leading-relaxed border-l-2 border-blue-500/50 pl-2">
                "{leader.statement}"
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Megaphone size={10} />
                  <span className="text-[9px] font-medium">{leader.postedAt}</span>
                </div>
                
                <a href={leader.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 hover:text-blue-300">
                  View Source <ExternalLink size={10} />
                </a>
              </div>
              
            </div>
          ))}

          {filteredLeaders.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[10px] text-slate-500 italic">No recent statements found for this region.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

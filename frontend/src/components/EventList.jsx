/**
 * EventList.jsx
 * Phase 2 + 4: Sidebar panel showing all events.
 * Highlights the selected event. Shows category badge, region badge,
 * and confidence indicator.
 */
import { ChevronRight, ChevronLeft, RefreshCw, BarChart3, Clock } from 'lucide-react';

// Color mapping shared with GlobeView
const CATEGORY_COLORS = {
  energy: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  geopolitics: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  economy: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
  tech: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  crypto: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  climate: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
  general: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40' },
};

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${c.bg} ${c.text} ${c.border}`}>
      {category}
    </span>
  );
}

function IntensityBar({ intensity }) {
  const pct = Math.round((intensity ?? 0.5) * 100);
  const color = pct > 75 ? 'bg-red-500' : pct > 45 ? 'bg-orange-400' : 'bg-blue-400';
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

export default function EventList({ 
  events, 
  selectedEvent, 
  onEventSelect, 
  loading, 
  isExpanded = true, 
  onToggle,
  onRefresh,
  onTimeFilterChange,
  onToggleImpact,
  currentTimeFilter = 24
}) {
  return (
    <aside className="flex flex-col h-full bg-slate-900 border-l border-slate-700/60 w-full overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-4 border-b border-slate-700/60 flex-shrink-0 flex flex-col gap-4 ${isExpanded ? '' : 'items-center'}`}>
        <div className="flex items-center justify-between w-full">
          {isExpanded ? (
            <div>
              <h2 className="text-slate-100 font-bold text-lg tracking-tight whitespace-nowrap flex items-center gap-2">
                Live Bulletin
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {loading ? 'Analyzing Signals...' : `${events.length} Active Feeds`}
              </p>
            </div>
          ) : (
             <button onClick={onToggle} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800">
               <ChevronLeft size={20} />
             </button>
          )}

          {isExpanded && (
            <div className="flex items-center gap-1.5">
               <button 
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                title="Refresh Feed"
               >
                 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
               </button>
               <button onClick={onToggle} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                 <ChevronRight size={20} />
               </button>
            </div>
          )}
        </div>

        {/* New Filter & View All Row */}
        {isExpanded && (
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center bg-slate-950/50 border border-slate-800 rounded-lg px-2 py-1">
              <Clock size={12} className="text-slate-500 mr-2" />
              <select 
                value={currentTimeFilter}
                onChange={(e) => onTimeFilterChange(parseInt(e.target.value))}
                className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value={6} className="bg-slate-900">Last 6h</option>
                <option value={12} className="bg-slate-900">Last 12h</option>
                <option value={24} className="bg-slate-900">Last 24h</option>
              </select>
            </div>

            <button 
              onClick={onToggleImpact}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20 transition-all whitespace-nowrap"
            >
              <BarChart3 size={12} />
              View Total Impact
            </button>
          </div>
        )}
      </div>

      {/* Event cards */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
        {loading && (
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && events.map(event => {
          const isSelected = selectedEvent?.id === event.id;
          return (
            <button
              key={event.id}
              onClick={() => onEventSelect(event)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-slate-700 border-slate-500 shadow-lg shadow-slate-900/50'
                  : 'bg-slate-800/60 border-slate-700/40 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Title */}
              <p className={`text-sm font-medium leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {event.title}
              </p>

              {/* Metadata row */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <CategoryBadge category={event.category} />
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  📍 {event.region}
                </span>
              </div>

              {/* Intensity bar */}
              <IntensityBar intensity={event.intensity} />

              {/* Source */}
              <p className="text-[10px] text-slate-600 mt-1.5">{event.source}</p>
            </button>
          );
        })}
        </div>
      )}
    </aside>
  );
}

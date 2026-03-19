/**
 * EventDetailPanel.jsx
 * Phase 2, 5, 6, 7, 8: Detailed view for an event.
 * Shows title, description, impact (sectors ↑↓), AI explanation,
 * confidence score, and similar past events.
 */
import { useState } from 'react';
import { X, MapPin, Zap, Globe, ExternalLink, TrendingUp, TrendingDown, Info, ShieldCheck, History } from 'lucide-react';

const CATEGORY_GRADIENTS = {
  energy: 'from-orange-900/40 to-slate-900',
  geopolitics: 'from-red-900/40 to-slate-900',
  economy: 'from-blue-900/40 to-slate-900',
  tech: 'from-purple-900/40 to-slate-900',
  crypto: 'from-yellow-900/40 to-slate-900',
  climate: 'from-green-900/40 to-slate-900',
  general: 'from-slate-800/40 to-slate-900',
};

const CATEGORY_ACCENT = {
  energy: 'text-orange-400',
  geopolitics: 'text-red-400',
  economy: 'text-blue-400',
  tech: 'text-purple-400',
  crypto: 'text-yellow-400',
  climate: 'text-green-400',
  general: 'text-slate-400',
};

const CONFIDENCE_COLORS = {
  High: 'text-green-400 bg-green-400/10 border-green-500/30',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',
  Low: 'text-red-400 bg-red-400/10 border-red-500/30',
};

export default function EventDetailPanel({ event, onClose }) {
  const [expandedSectors, setExpandedSectors] = useState({});

  if (!event) return null;

  const toggleSector = (idx) => {
    setExpandedSectors(prev => ({...prev, [idx]: !prev[idx]}));
  };

  const gradient = CATEGORY_GRADIENTS[event.category] ?? CATEGORY_GRADIENTS.general;
  const accent = CATEGORY_ACCENT[event.category] ?? CATEGORY_ACCENT.general;
  const confColor = CONFIDENCE_COLORS[event.confidence?.label] ?? CONFIDENCE_COLORS.Medium;

  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-700/50 bg-gradient-to-b ${gradient} shadow-2xl overflow-hidden flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${accent}`}>
              {event.category}
            </span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${confColor}`}>
              <ShieldCheck size={12} />
              {event.confidence?.label} ({Math.round((event.confidence?.score || 0) * 100)}%)
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
          {/* Title & Description */}
          <section>
            <h3 className="text-2xl font-bold text-white leading-tight mb-3">
              {event.title}
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              {event.description}
            </p>
          </section>

          {/* Impact Mapping (Phase 5) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm uppercase tracking-wider">
              <Zap size={16} className="text-yellow-400" />
              Market Impact Analysis
            </div>
            <div className="flex flex-col gap-3">
              {event.impact?.map((imp, idx) => (
                <div key={idx} className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{imp.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${imp.effect === 'positive' ? 'text-green-400' : imp.effect === 'negative' ? 'text-red-400' : 'text-slate-400'}`}>
                        {imp.label}
                      </span>
                      {imp.effect === 'positive' ? <TrendingUp size={14} className="text-green-400" /> : imp.effect === 'negative' ? <TrendingDown size={14} className="text-red-400" /> : null}
                    </div>
                  </div>
                  
                  {imp.companies && imp.companies.length > 0 && (
                     <div className="w-full mt-2">
                        <button onClick={() => toggleSector(idx)} className="text-[10px] uppercase text-blue-400 font-bold hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded border border-blue-500/20">
                           {expandedSectors[idx] ? 'Hide Assets' : 'View Impacted Assets'}
                        </button>
                        {expandedSectors[idx] && (
                          <div className="pt-3 mt-3 border-t border-white/10 animate-in fade-in slide-in-from-top-1">
                            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Directly Impacted Entities</span>
                            <div className="flex flex-wrap gap-1.5">
                              {imp.companies.map((company, cidx) => (
                                 <span key={cidx} className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-700 font-medium">
                                   {company}
                                 </span>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* AI Explanation (Phase 6) */}
          <section className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-widest">
              <Info size={14} />
              AI Analyst Explanation
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "{event.explanation}"
            </p>
          </section>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetaCard icon={<MapPin size={14} />} label="Region" value={event.region} />
            <MetaCard icon={<Globe size={14} />} label="Source" value={event.source} />
            <MetaCard icon={<Zap size={14} />} label="Intensity" value={`${Math.round((event.intensity ?? 0.5) * 100)}%`} />
            <MetaCard icon={null} label="Reliability" value={event.confidence?.label} />
          </div>

          {/* Similar Historical Events (Phase 8) */}
          {event.similar_events?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/90 font-semibold text-sm uppercase tracking-wider">
                <History size={16} className="text-purple-400" />
                Historical Correlation
              </div>
              <div className="space-y-3">
                {event.similar_events.map((sim, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium text-sm">{sim.title}</h4>
                      <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {Math.round(sim.similarity * 100)}% Match
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      <span className="text-slate-500 font-semibold uppercase text-[9px] mr-1">Outcome:</span>
                      {sim.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer / Read More */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono uppercase">
               Ref: {event.id} | Coords: {event.lat?.toFixed(2)}, {event.lng?.toFixed(2)}
            </span>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20 font-semibold"
              >
                <ExternalLink size={14} />
                Full Report
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
        {icon}{label}
      </p>
      <p className="text-slate-200 text-xs font-semibold truncate capitalize">{value}</p>
    </div>
  );
}

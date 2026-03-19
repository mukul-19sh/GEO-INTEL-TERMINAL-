import React from 'react';
import { X, Zap, TrendingUp, TrendingDown, Layers, Target } from 'lucide-react';

export default function GlobalImpactDashboard({ events, onClose }) {
  if (!events || events.length === 0) return null;

  // Aggregate all impacts
  const aggregateImpacts = () => {
    const summary = {};
    
    events.forEach(event => {
      event.impact?.forEach(imp => {
        if (!summary[imp.sector]) {
          summary[imp.sector] = {
            sector: imp.sector,
            score: 0,
            companies: new Set(),
            sentiment: 0 // positive: +1, negative: -1
          };
        }
        
        const weight = event.intensity || 0.5;
        summary[imp.sector].score += weight;
        
        if (imp.effect === 'positive') summary[imp.sector].sentiment += weight;
        else if (imp.effect === 'negative') summary[imp.sector].sentiment -= weight;
        
        imp.companies?.forEach(c => summary[imp.sector].companies.add(c));
      });
    });

    return Object.values(summary).sort((a, b) => b.score - a.score);
  };

  const impacts = aggregateImpacts();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <div 
        className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Layers className="text-blue-400" size={24} />
              Global Market Impact Analysis
            </h2>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold font-mono">
              Aggregated from {events.length} active geopolitical signals
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {impacts.map((imp, idx) => {
              const sentiment = imp.sentiment > 0.1 ? 'positive' : imp.sentiment < -0.1 ? 'negative' : 'neutral';
              return (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-100 font-bold text-lg tracking-tight">{imp.sector}</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      sentiment === 'positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {sentiment === 'positive' ? <TrendingUp size={12} /> : sentiment === 'negative' ? <TrendingDown size={12} /> : null}
                      {sentiment === 'positive' ? 'Bullish' : sentiment === 'negative' ? 'Bearish' : 'Neutral'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Progress Bar for prominence */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <span>Signal Prominence</span>
                        <span>{Math.round(imp.score * 20)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${sentiment === 'positive' ? 'bg-green-500' : sentiment === 'negative' ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, imp.score * 20)}%` }}
                        />
                      </div>
                    </div>

                    {/* Impacted Assets */}
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                         <Target size={12} />
                         Directly Affected Assets
                       </div>
                       <div className="flex flex-wrap gap-1.5 pt-1">
                          {Array.from(imp.companies).map((company, cidx) => (
                            <span key={cidx} className="bg-slate-950 text-slate-300 text-[9px] px-2 py-1 rounded border border-slate-800 font-medium group-hover:border-slate-700">
                              {company}
                            </span>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-800 bg-slate-950/20 text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            Computed by GeoIntel Reasoning Engine v1.1
          </p>
        </div>
      </div>
    </div>
  );
}

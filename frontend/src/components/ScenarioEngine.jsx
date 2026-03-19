/**
 * ScenarioEngine.jsx
 * Phase 10: "What-if" simulation UI.
 * Allows users to input hypothetical geopolitical scenarios and see sector impacts.
 */
import { useState } from 'react';
import { Play, Zap, TrendingUp, TrendingDown, HelpCircle, FastForward, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const QUICK_SCENARIOS = [
  "Major oil pipeline sabotage in the Middle East causing supply constraints.",
  "New aggressive US tariffs on Chinese technology imports.",
  "Sudden global spike in semiconductor demand."
];

export default function ScenarioEngine() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (scenarioOverride = null) => {
    if (scenarioOverride && typeof scenarioOverride !== 'string' && scenarioOverride.preventDefault) {
      scenarioOverride.preventDefault();
      scenarioOverride = null;
    }
    const textToRun = scenarioOverride || input;
    if (!textToRun.trim() || loading) return;

    setLoading(true);
    try {
      const { data } = await axios.post('/simulate', { scenario: input });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Scenario Simulator</h3>
        </div>
        <div className="flex items-center gap-3">
          <HelpCircle size={14} className="text-slate-600 cursor-help" />
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-white transition-colors" title="Toggle Panel">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <form onSubmit={(e) => { e.preventDefault(); handleSimulate(); }} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Oil supply drops by 10%..."
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? <span className="animate-spin text-sm">↻</span> : <Play size={14} fill="currentColor" />}
          <span className="text-[11px] font-bold uppercase">Run</span>
        </button>
      </form>

      {/* Quick Scenarios */}
      <div className="flex flex-col gap-1.5 border-t border-slate-700/50 pt-3 mb-4">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1">Quick Simulations</span>
        {QUICK_SCENARIOS.map((scen, idx) => (
          <button 
            key={idx}
            type="button"
            onClick={() => { setInput(scen); handleSimulate(scen); setShowDetails(false); }}
            className="text-[10px] text-left text-slate-400 hover:text-yellow-400 bg-slate-900/40 hover:bg-slate-800 p-2 rounded border border-slate-800/60 transition-colors flex items-center justify-between group"
          >
            <span className="truncate pr-2 w-[90%]">{scen}</span>
            <FastForward size={12} className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-yellow-500" />
          </button>
        ))}
      </div>

      {result ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">Predicted Outcome</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {result.predicted_impacts.map((imp, i) => (
                <div key={i} className="flex flex-col justify-center bg-slate-800/80 px-2 py-1.5 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 truncate">{imp.sector}</span>
                    {imp.effect === 'positive' ? <TrendingUp size={12} className="text-green-400" /> : <TrendingDown size={12} className="text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-3 italic">{result.logic}</p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 w-full text-center py-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 hover:bg-yellow-500/20 rounded border border-yellow-500/20 transition-colors"
            >
              {showDetails ? 'Hide Impacted Companies' : 'View Impacted Companies'}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {result.predicted_impacts.map((imp, i) => (
                  <div key={`detail-${i}`} className="bg-slate-900/80 p-2 rounded border border-slate-700/50">
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{imp.sector} Sector <span className="text-slate-500 normal-case tracking-normal">- {imp.label}</span></span>
                     <ul className="mt-1.5 flex flex-wrap gap-1">
                        {imp.companies && imp.companies.length > 0 ? (
                           imp.companies.map((company, j) => (
                              <li key={j} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                {company}
                              </li>
                           ))
                        ) : (
                           <li className="text-[9px] text-slate-500 italic">Broader market indices affected.</li>
                        )}
                     </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-center opacity-30">
          <Zap size={24} className="mb-2 text-slate-500" />
          <p className="text-[10px] text-slate-400 uppercase tracking-tight">Enter scenario to project risk</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}

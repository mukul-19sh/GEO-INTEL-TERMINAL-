/**
 * PortfolioAnalyzer.jsx
 * Phase 11: Personal portfolio risk dashboard.
 * Allows users to input assets and correlates them against live geopolitical threats.
 */
import { useState } from 'react';
import { Briefcase, Plus, TrendingDown, TrendingUp, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

export default function PortfolioAnalyzer() {
  const [assets, setAssets] = useState(['BTC', 'NVDA', 'AAPL', 'XYZ']); // Mock portfolio with unknown ticker
  const [newAsset, setNewAsset] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset || assets.includes(newAsset.toUpperCase())) return;
    setAssets(prev => [...prev, newAsset.toUpperCase()]);
    setNewAsset('');
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/portfolio', { assets });
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Portfolio Exposure</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="text-[10px] font-bold uppercase text-blue-400 hover:text-blue-300 transition-colors"
          >
            {loading ? 'Analyzing...' : 'Run Scan'}
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-white transition-colors" title="Toggle Panel">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Asset Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
        {assets.map(asset => (
          <span key={asset} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-[10px] font-mono text-slate-300">
            {asset}
          </span>
        ))}
        <form onSubmit={handleAddAsset} className="inline-flex">
          <input
            type="text"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            placeholder="Symbol"
            className="w-16 bg-transparent border-b border-slate-700 text-[10px] text-white focus:outline-none focus:border-blue-500 px-1"
          />
        </form>
      </div>

      {/* Risk Analysis Result */}
      {analysis && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* Risk Score Gauge */}
          <div className="flex gap-4 items-center bg-slate-800/40 p-3 rounded-xl border border-white/5">
            <div className="relative w-12 h-12 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-slate-700" />
                 <circle 
                   cx="24" cy="24" r="20" fill="none" strokeWidth="4" 
                   className={analysis.portfolio_risk_score > 0.6 ? 'stroke-red-500' : 'stroke-blue-500'}
                   strokeDasharray={125.6} 
                   strokeDashoffset={125.6 * (1 - analysis.portfolio_risk_score)}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="absolute text-[11px] font-bold text-white">{Math.round(analysis.portfolio_risk_score * 100)}%</span>
            </div>
            <div>
              <p className="text-[10px] text-white font-medium">{analysis.portfolio_risk_score > 0.5 ? 'High Exposure' : 'Stable Outlook'}</p>
              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{analysis.summary}</p>
            </div>
          </div>

          {/* Impacted Assets List */}
          <div className="space-y-2">
            {analysis.exposed_assets.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] py-2 border-b border-slate-800/50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{item.asset}</span>
                    <span className="text-slate-500 text-[9px] uppercase border border-slate-700 px-1 rounded">{item.sector}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">${item.market_cap_b.toLocaleString()}B Cap</span>
                </div>
                <div className={`flex items-center gap-1 font-medium ${item.threat_level === 'High' ? 'text-red-400' : item.threat_level === 'Safe' ? 'text-slate-400' : 'text-green-400'}`}>
                  {item.threat_level === 'High' ? <TrendingDown size={12} /> : item.threat_level === 'Safe' ? null : <TrendingUp size={12} />}
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analysis && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <AlertTriangle size={14} className="text-blue-500/50" />
          <p className="text-[10px] text-slate-500 italic">No exposures detected. Add assets and run a scan.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}

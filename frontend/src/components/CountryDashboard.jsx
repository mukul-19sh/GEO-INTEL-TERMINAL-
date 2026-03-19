import React, { useState, useEffect } from 'react';
import { Flag, TrendingUp, TrendingDown, Layout, Globe, Search, Minus, ChevronDown } from 'lucide-react';

const COUNTRY_DATA = {
  "India": {
    currency: "INR",
    stocks: [
      { symbol: "Nifty 50", price: 23002.15, change: -3.26 },
      { symbol: "Sensex", price: 74207.00, change: -3.26 },
      { symbol: "Reliance", price: 1385.35, change: -1.64 },
      { symbol: "HDFC Bank", price: 798.20, change: -5.32 },
      { symbol: "TCS", price: 2356.00, change: -3.47 },
      { symbol: "Infosys", price: 1442.40, change: -2.1 },
      { symbol: "ICICI Bank", price: 924.90, change: -4.2 },
      { symbol: "Adani Ent", price: 2845.00, change: -6.5 },
      { symbol: "Airtel", price: 1145.60, change: -1.7 },
      { symbol: "Tata Motors", price: 824.30, change: -3.8 },
      { symbol: "SBI", price: 645.20, change: -4.1 },
      { symbol: "ITC", price: 447.40, change: -0.8 },
      { symbol: "Maruti", price: 10245.00, change: -2.2 },
      { symbol: "Wipro", price: 442.10, change: -3.6 },
      { symbol: "L&T", price: 2845.90, change: -1.3 }
    ],
    metals: [
      { symbol: "Gold (MCX/10g)", price: 149409.00, change: -0.52 },
      { symbol: "Silver (MCX/1kg)", price: 244342.00, change: -1.50 }
    ]
  },
  "USA": {
    currency: "USD",
    stocks: [
      { symbol: "S&P 500", price: 5240.32, change: 0.64 },
      { symbol: "Nasdaq 100", price: 16101.50, change: 1.39 },
      { symbol: "Dow Jones", price: 38686.50, change: 0.26 },
      { symbol: "Apple", price: 249.76, change: -0.07 },
      { symbol: "Nvidia", price: 178.55, change: -1.02 },
      { symbol: "Microsoft", price: 392.20, change: 0.10 },
      { symbol: "Alphabet", price: 154.20, change: 1.2 },
      { symbol: "Amazon", price: 178.45, change: 0.9 },
      { symbol: "Meta", price: 495.20, change: 1.5 },
      { symbol: "Tesla", price: 175.40, change: -1.2 },
      { symbol: "Berkshire", price: 612450.00, change: 0.2 },
      { symbol: "Eli Lilly", price: 745.30, change: 2.1 },
      { symbol: "Broadcom", price: 1245.00, change: 1.4 },
      { symbol: "Visa", price: 284.10, change: 0.3 },
      { symbol: "JP Morgan", price: 195.40, change: -0.5 }
    ],
    metals: [
      { symbol: "Gold (oz)", price: 2341.50, change: 1.1 },
      { symbol: "Silver (oz)", price: 28.12, change: 2.4 }
    ]
  },
  "UK": {
    currency: "GBP",
    stocks: [
      { symbol: "FTSE 100", price: 7741.21, change: 0.89 },
      { symbol: "AstraZeneca", price: 11245.00, change: 0.6 },
      { symbol: "Shell", price: 2840.45, change: 1.4 },
      { symbol: "HSBC", price: 645.20, change: -0.8 },
      { symbol: "Unilever", price: 3845.00, change: 0.2 },
      { symbol: "BP", price: 495.20, change: 1.1 },
      { symbol: "Rio Tinto", price: 5124.00, change: -1.5 },
      { symbol: "GSK", price: 1645.00, change: 0.4 },
      { symbol: "Diageo", price: 2845.00, change: -0.6 },
      { symbol: "Relx", price: 3245.00, change: 1.2 }
    ],
    metals: [
      { symbol: "Gold (oz)", price: 1845.20, change: 0.9 },
      { symbol: "Silver (oz)", price: 22.45, change: 1.8 }
    ]
  },
  "Japan": {
    currency: "JPY",
    stocks: [
      { symbol: "Nikkei 225", price: 38541.20, change: 1.82 },
      { symbol: "Toyota", price: 3412.00, change: 0.7 },
      { symbol: "Sony", price: 13245.00, change: 1.2 },
      { symbol: "SoftBank", price: 8945.00, change: -2.1 },
      { symbol: "Mitsubishi", price: 3245.00, change: 0.8 },
      { symbol: "Keyence", price: 65420.00, change: 1.4 },
      { symbol: "Nintendo", price: 7845.00, change: 0.5 },
      { symbol: "Shin-Etsu", price: 6124.00, change: 1.1 },
      { symbol: "Recruit", price: 6542.00, change: 0.3 },
      { symbol: "Fast Ret", price: 41245.00, change: -1.2 }
    ],
    metals: [
      { symbol: "Gold (g)", price: 11240.00, change: 1.2 },
      { symbol: "Silver (g)", price: 138.40, change: 2.1 }
    ]
  }
};

export default function CountryDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [isMinimized, setIsMinimized] = useState(false);
  const data = COUNTRY_DATA[selectedCountry];

  return (
    <div className={`bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-sm shadow-xl flex flex-col mt-4 transition-all duration-300 ${isMinimized ? 'max-h-[52px]' : 'max-h-[500px]'}`}>
      
      {/* Header */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-yellow-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Country Intel</h3>
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
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <Globe size={12} className="text-slate-400 ml-1" />
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-[10px] text-slate-300 font-bold uppercase tracking-wider outline-none w-full cursor-pointer appearance-none"
            >
              {Object.keys(COUNTRY_DATA).map(c => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[350px] animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4">
            
            {/* Stocks Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Major Equities</span>
                <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
                  {data.currency}
                </span>
              </div>
              <div className="space-y-1.5">
                {data.stocks.map((stock, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">{stock.symbol}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">{stock.price.toLocaleString()}</span>
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(stock.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metals Section */}
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Precious Metals</span>
              <div className="grid grid-cols-2 gap-2">
                {data.metals.map((metal, i) => (
                  <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 p-2.5 rounded-xl flex flex-col items-center">
                    <span className="text-[8px] font-bold text-yellow-500/70 uppercase tracking-tighter mb-1 truncate w-full text-center">{metal.symbol}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-100 mb-1">{metal.price.toLocaleString()}</span>
                    <div className={`flex items-center gap-0.5 text-[9px] font-bold ${metal.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metal.change >= 0 ? '+' : '-'}{Math.abs(metal.change)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

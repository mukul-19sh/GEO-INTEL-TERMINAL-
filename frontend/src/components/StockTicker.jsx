import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const MARKET_DATA = {
  indices: [
    { symbol: 'S&P 500', price: 5240.32, change: -1.2, history: [5350, 5320, 5310, 5290, 5270, 5250, 5240] },
    { symbol: 'NASDAQ', price: 16101.50, change: -2.4, history: [16800, 16700, 16650, 16500, 16300, 16200, 16101] },
    { symbol: 'DOW', price: 38686.50, change: -1.8, history: [39800, 39600, 39450, 39250, 39000, 38800, 38686] },
    { symbol: 'FTSE 100', price: 7741.21, change: -2.3, history: [7950, 7920, 7880, 7840, 7810, 7780, 7741] },
    { symbol: 'NIKKEI 225', price: 38541.20, change: -4.8, history: [41500, 41100, 40800, 40400, 39800, 39200, 38541] },
    { symbol: 'DAX', price: 17814.51, change: -2.5, history: [18500, 18400, 18320, 18250, 18100, 17950, 17814] },
    { symbol: 'SHANGHAI', price: 3045.89, change: -3.1, history: [3250, 3215, 3180, 3145, 3110, 3085, 3045] },
    { symbol: 'SENSEX', price: 74207.00, change: -3.26, history: [76500, 76200, 75800, 75500, 75100, 74800, 74207] },
    { symbol: 'NIFTY 50', price: 23002.15, change: -3.26, history: [23800, 23700, 23600, 23450, 23300, 23200, 23002] },
    { symbol: 'RELIANCE', price: 1385.35, change: -1.6, history: [1410, 1405, 1400, 1395, 1392, 1388, 1385] },
    { symbol: 'TCS', price: 2356.00, change: -3.5, history: [2450, 2440, 2420, 2400, 2380, 2370, 2356] }
  ],
  commodities: [
    { symbol: 'GOLD', price: 149409.00, change: -0.5, history: [152000, 151500, 151000, 150500, 150000, 149800, 149409] },
    { symbol: 'SILVER', price: 244342.00, change: -1.5, history: [250000, 249000, 248000, 247000, 246000, 245000, 244342] },
    { symbol: 'CRUDE OIL', price: 85.42, change: 2.1, history: [83.5, 84.1, 83.8, 84.5, 84.8, 85.1, 85.42] },
    { symbol: 'BRENT', price: 89.34, change: 1.6, history: [87.5, 88.2, 87.7, 88.5, 88.8, 89.1, 89.34] },
    { symbol: 'COPPER', price: 4.12, change: 0.5, history: [4.05, 4.08, 4.06, 4.09, 4.10, 4.11, 4.12] },
    { symbol: 'NAT GAS', price: 1.82, change: -1.2, history: [1.88, 1.86, 1.89, 1.85, 1.84, 1.83, 1.82] }
  ],
  crypto: [
    { symbol: 'BTC', price: 68412.00, change: 2.4, history: [66000, 66500, 67000, 67500, 68000, 67800, 68412] },
    { symbol: 'ETH', price: 3842.20, change: 1.8, history: [3750, 3770, 3810, 3790, 3820, 3830, 3842] },
    { symbol: 'SOL', price: 142.50, change: 4.1, history: [135, 137, 139, 140, 141, 142, 142.5] },
    { symbol: 'BNB', price: 580.40, change: 1.1, history: [570, 575, 568, 578, 582, 579, 580] },
    { symbol: 'XRP', price: 0.62, change: -0.5, history: [0.63, 0.64, 0.62, 0.65, 0.64, 0.63, 0.62] },
    { symbol: 'ADA', price: 0.58, change: 2.1, history: [0.55, 0.56, 0.54, 0.57, 0.59, 0.57, 0.58] }
  ]
};

const Sparkline = ({ data, isPositive }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 16;
  const width = 48;
  const color = isPositive ? '#22c55e' : '#ef4444'; // green-500 : red-500
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible ml-1.5 opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function StockTicker({ marketData }) {
  const [category, setCategory] = useState('indices');
  const [items, setItems] = useState(MARKET_DATA.indices);
  const [history, setHistory] = useState({});

  useEffect(() => {
    if (!marketData) return;
    
    const newItems = marketData[category] || [];
    setItems(newItems);

    // Update history for sparklines
    setHistory(prev => {
      const next = { ...prev };
      newItems.forEach(item => {
        const key = item.symbol;
        const currentSeries = next[key] || [item.price];
        const newSeries = [...currentSeries.slice(-19), item.price]; // keep last 20
        next[key] = newSeries;
      });
      return next;
    });
  }, [marketData, category]);

  const renderMarketItem = (item, key) => {
    const isPositive = (item.change ?? item.original_change) >= 0;
    const displayChange = item.change ?? item.original_change;
    const itemHistory = history[item.symbol] || [item.price];

    return (
      <div key={key} className="flex items-center gap-2 px-4 border-l border-slate-700/50 hover:bg-slate-800/50 transition-colors h-full">
        <span className="font-bold text-slate-200 tracking-wide">{item.symbol}</span>
        <span className="text-slate-400">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={`flex items-center font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
          {Math.abs(displayChange).toFixed(2)}%
        </span>
        <Sparkline data={itemHistory} isPositive={isPositive} />
      </div>
    );
  };

  return (
    <div className="flex flex-col relative z-30">
      {/* Top Market Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-[12px] font-mono flex items-center h-10 relative shadow-md">
        
        {/* Category Selector */}
        <div className="flex items-center px-4 bg-slate-900 z-20 border-r border-slate-700 h-full shadow-[4px_0_10px_rgba(0,0,0,0.4)]">
          <div className="relative flex items-center">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer pr-4"
            >
              <option value="indices">GLOBAL INDICES</option>
              <option value="commodities">COMMODITIES</option>
              <option value="crypto">CRYPTOCURRENCY</option>
            </select>
            <ChevronDown size={12} className="absolute right-0 text-blue-400 pointer-events-none" />
          </div>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 flex overflow-hidden whitespace-nowrap h-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex min-w-full items-center h-full ticker-market">
            {items.map((item, i) => renderMarketItem(item, `m1-${i}`))}
            {items.map((item, i) => renderMarketItem(item, `m2-${i}`))}
            {items.map((item, i) => renderMarketItem(item, `m3-${i}`))}
            {items.map((item, i) => renderMarketItem(item, `m4-${i}`))}
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>

      <style>{`
        .ticker-market {
          animation: marquee 35s linear infinite;
        }
        .ticker-market:hover {
          animation-play-state: paused;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

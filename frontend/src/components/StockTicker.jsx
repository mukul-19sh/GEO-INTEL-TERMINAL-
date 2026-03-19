import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const MARKET_DATA = {
  indices: [
    { symbol: 'S&P 500', price: 5123.41, change: 0.8, history: [5100, 5110, 5090, 5105, 5120, 5115, 5123] },
    { symbol: 'NASDAQ', price: 16134.22, change: 1.2, history: [15900, 15950, 15850, 16000, 16100, 16050, 16134] },
    { symbol: 'DOW', price: 38790.43, change: 0.3, history: [38600, 38700, 38650, 38680, 38750, 38720, 38790] },
    { symbol: 'FTSE 100', price: 7723.10, change: -0.4, history: [7780, 7760, 7790, 7750, 7740, 7730, 7723] },
    { symbol: 'NIKKEI 225', price: 39598.71, change: 2.1, history: [38500, 38800, 38700, 39000, 39200, 39400, 39598] },
    { symbol: 'DAX', price: 17814.51, change: 0.5, history: [17700, 17750, 17720, 17780, 17800, 17790, 17814] },
    { symbol: 'SHANGHAI', price: 3045.89, change: -0.2, history: [3060, 3055, 3050, 3065, 3058, 3048, 3045] },
    { symbol: 'SENSEX', price: 73502.64, change: 0.9, history: [72800, 72900, 72700, 73000, 73200, 73400, 73502] }
  ],
  commodities: [
    { symbol: 'GOLD', price: 2341.50, change: 1.4, history: [2300, 2310, 2295, 2320, 2335, 2330, 2341] },
    { symbol: 'SILVER', price: 28.45, change: 2.2, history: [27.5, 27.8, 27.4, 28.0, 28.3, 28.1, 28.45] },
    { symbol: 'CRUDE OIL', price: 83.12, change: -0.8, history: [84.5, 84.1, 84.8, 83.9, 83.5, 83.3, 83.12] },
    { symbol: 'BRENT', price: 87.34, change: -0.6, history: [88.5, 88.2, 88.7, 88.0, 87.6, 87.5, 87.34] },
    { symbol: 'COPPER', price: 4.12, change: 0.5, history: [4.05, 4.08, 4.06, 4.09, 4.10, 4.11, 4.12] },
    { symbol: 'NAT GAS', price: 1.82, change: -1.2, history: [1.88, 1.86, 1.89, 1.85, 1.84, 1.83, 1.82] }
  ],
  crypto: [
    { symbol: 'BTC', price: 71450.00, change: 3.5, history: [68000, 68500, 67500, 69000, 70500, 70000, 71450] },
    { symbol: 'ETH', price: 3950.20, change: 4.2, history: [3700, 3750, 3680, 3800, 3880, 3850, 3950] },
    { symbol: 'SOL', price: 145.60, change: 8.4, history: [130, 132, 128, 135, 142, 140, 145] },
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

export default function StockTicker() {
  const [category, setCategory] = useState('indices');
  const [items, setItems] = useState(MARKET_DATA.indices);

  useEffect(() => {
    // Reset data when category changes to get fresh static data
    setItems(MARKET_DATA[category]);

    // Live jitter update interval
    const interval = setInterval(() => {
      setItems(current => current.map(item => {
        const jitter = (Math.random() - 0.5) * (item.price * 0.001); // 0.1% jitter
        const newPrice = Math.max(0.01, item.price + jitter);
        const pctJitter = (Math.random() - 0.5) * 0.1;
        
        // Update history for sparkline by shifting out the oldest and pushing the new value
        const newHistory = [...item.history.slice(1), newPrice];
        
        return { ...item, price: newPrice, change: item.change + pctJitter, history: newHistory };
      }));
    }, 2000); 

    return () => clearInterval(interval);
  }, [category]);

  const renderMarketItem = (item, key) => {
    const isPositive = item.change >= 0;
    return (
      <div key={key} className="flex items-center gap-2 px-4 border-l border-slate-700/50 hover:bg-slate-800/50 transition-colors h-full">
        <span className="font-bold text-slate-200 tracking-wide">{item.symbol}</span>
        <span className="text-slate-400">${item.price.toFixed(2)}</span>
        <span className={`flex items-center font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
          {Math.abs(item.change).toFixed(2)}%
        </span>
        <Sparkline data={item.history} isPositive={isPositive} />
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

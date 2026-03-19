import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GlobeView from './components/GlobeView';
import EventList from './components/EventList';
import EventDetailPanel from './components/EventDetailPanel';
import AnalystChat from './components/AnalystChat';
import ScenarioEngine from './components/ScenarioEngine';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';
import StockTicker from './components/StockTicker';
import VerticalNewsTicker from './components/VerticalNewsTicker';
import LeaderBoard from './components/LeaderBoard';
import GlobalImpactDashboard from './components/GlobalImpactDashboard';
import CountryDashboard from './components/CountryDashboard';
import { Activity, ShieldAlert, Zap, MessageSquare, Briefcase } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
axios.defaults.baseURL = API_BASE_URL;


function LiveClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' }));
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' })), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tracking-widest">TIMESTAMP: {time}</span>;
}

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);
  const [breakingEventId, setBreakingEventId] = useState(null);
  const [timeFilter, setTimeFilter] = useState(24);
  const [isImpactDashboardOpen, setIsImpactDashboardOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ws = useRef(null);
  const handledBreakingEvents = useRef(new Set());

  const fetchEvents = async (hours = timeFilter) => {
    setIsRefreshing(true);
    try {
      const resp = await axios.get(`/events?hours=${hours}`);
      setEvents(resp.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout;

    const connectWS = () => {
      if (!isMounted) return;
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/events';
      ws.current = new WebSocket(wsUrl);

      
      ws.current.onopen = () => {
        if (isMounted) setWsStatus('online');
      };
      
      ws.current.onmessage = (event) => {
        if (!isMounted) return;
        const data = JSON.parse(event.data);
        
        // Auto Globe Tracker: Locate unprocessed Breaking News → only pan the globe, no popup
        const newBreaking = data.find(e => e.is_breaking && !handledBreakingEvents.current.has(e.id));
        if (newBreaking) {
          setBreakingEventId(newBreaking.id);
          handledBreakingEvents.current.add(newBreaking.id);
          // Clear breakingEventId after the animation sequence completes (~4s)
          setTimeout(() => setBreakingEventId(null), 4000);
        }

        // Locally filter WebSocket updates to match current UI filter
        const filtered = data.filter(e => e.hours_ago <= timeFilter);
        setEvents(filtered);
      };
      
      ws.current.onclose = () => {
        if (isMounted) {
          setWsStatus('offline');
          reconnectTimeout = setTimeout(connectWS, 3000);
        }
      };
    };

    connectWS();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect loop
        ws.current.close();
      }
    };
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Calculate highest tension region dynamically
  const getHighTensionRegion = () => {
    if (!events || events.length === 0) return "Global Stable";
    const tensionMap = {};
    events.forEach(e => {
      tensionMap[e.region] = (tensionMap[e.region] || 0) + (e.intensity || 1);
    });
    return Object.keys(tensionMap).reduce((a, b) => tensionMap[a] > tensionMap[b] ? a : b);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* 1. SIDE NAVIGATION (Left) */}
      <div className="w-16 border-r border-slate-800 flex flex-col items-center py-6 gap-8 bg-slate-900/40 backdrop-blur-xl z-30">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
           <ShieldAlert size={20} className="text-white" />
        </div>
        <div className="flex flex-col gap-6 text-slate-500">
          <Zap size={20} className="hover:text-yellow-400 cursor-pointer transition-colors" />
          <Briefcase size={20} className="hover:text-blue-400 cursor-pointer transition-colors" />
          <MessageSquare size={20} className="hover:text-green-400 cursor-pointer transition-colors" />
        </div>
        <div className="mt-auto pb-4 flex flex-col items-center gap-1">
           <div className={`w-2 h-2 rounded-full ${wsStatus === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
           <span className="text-[7px] font-bold uppercase tracking-tighter text-slate-600">{wsStatus}</span>
        </div>
      </div>

      {/* 2. CENTER STAGE (Globe + Interactive Panels) */}
      <div className="flex-1 relative flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-[13px] font-black tracking-[0.2em] uppercase text-white flex items-center gap-3">
              GeoIntel Terminal
              <span className="text-[10px] bg-yellow-500/10 text-yellow-500 tracking-widest px-2 py-0.5 rounded border border-yellow-500/30 font-bold">
                LAST 24 HOURS OF WORLD
              </span>
            </h1>
            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="text-red-400 flex items-center gap-1">
                 <span className="relative flex h-2 w-2 mr-1">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                 </span>
                 HOT ZONE: {getHighTensionRegion()}
              </span>
              <span className="text-slate-600">|</span>
              <Activity size={12} className="text-green-500" />
              <span className="uppercase">Feed: {events.length} Signals</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
               <LiveClock />
             </div>
          </div>
        </header>

        {/* Live Market Ticker */}
        <StockTicker />

        {/* The World View */}
        <div className="flex-1 relative">
          <GlobeView 
            events={events} 
            onEventClick={(ev) => setSelectedEventId(ev.id)} 
            selectedEventId={selectedEventId}
            breakingEventId={breakingEventId}
          />

          {/* Floating Analytics overlays */}
          <div className="absolute top-6 left-6 w-72 space-y-4 z-20">
             <ScenarioEngine />
             <PortfolioAnalyzer />
          </div>

          {/* Floating Leaderboard overlay */}
          <div className="absolute top-6 right-6 w-80 z-20 space-y-4">
             <LeaderBoard />
             <CountryDashboard />
          </div>
        </div>

        {/* Bottom Chat HUD (Expandable) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-64 translate-y-[calc(100%-40px)] hover:translate-y-0 transition-transform duration-500 ease-in-out">
           <AnalystChat />
        </div>
      </div>

      {/* 3. EVENT FEED & NEWS SIDEBAR (Right) */}
      <div className="flex h-full z-30 shadow-2xl">
        {/* Live Events */}
        <div className={`transition-all duration-300 border-l border-slate-800 bg-slate-950/50 backdrop-blur-3xl flex flex-col overflow-hidden ${isEventsExpanded ? 'w-80' : 'w-10'}`}>
          <EventList 
            events={events} 
            onEventSelect={(ev) => setSelectedEventId(ev.id)}
            selectedEvent={selectedEventId ? events.find(e => e.id === selectedEventId) : null}
            isExpanded={isEventsExpanded}
            onToggle={() => setIsEventsExpanded(!isEventsExpanded)}
            loading={events.length === 0 || isRefreshing}
            onRefresh={() => fetchEvents()}
            onTimeFilterChange={(h) => {
              setTimeFilter(h);
              fetchEvents(h);
            }}
            onToggleImpact={() => setIsImpactDashboardOpen(true)}
            currentTimeFilter={timeFilter}
          />
        </div>
        
        {/* Vertical News Ticker */}
        <VerticalNewsTicker events={events} />
      </div>

      {/* 4. DETAIL OVERLAY */}
      {selectedEvent && (
        <EventDetailPanel 
          event={selectedEvent} 
          onClose={() => setSelectedEventId(null)} 
        />
      )}

      {/* 5. GLOBAL IMPACT DASHBOARD */}
      {isImpactDashboardOpen && (
        <GlobalImpactDashboard 
          events={events} 
          onClose={() => setIsImpactDashboardOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;

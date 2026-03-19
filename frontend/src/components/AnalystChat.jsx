/**
 * AnalystChat.jsx
 * Phase 12: Interactive side-panel for querying the AI analyst.
 * Minimalist, dark-themed chat interface.
 */
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AnalystChat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Greeting, Analyst. I am monitoring global geopolitical shifts. How can I assist with your market strategy today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/chat', { query: userMsg });
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Connection to Analyst Engine lost. Please check backend status." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border-t border-slate-700/60 backdrop-blur-md">
      <div className="px-4 py-2 border-b border-slate-700/40 flex items-center gap-2">
        <Bot size={14} className="text-blue-400" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Analyst Intelligence</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600/20 text-blue-400'}`}>
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Loader2 size={12} className="animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 px-3 py-2 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-700/40 bg-slate-900/60 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about sectors, risks, or events..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          disabled={loading}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

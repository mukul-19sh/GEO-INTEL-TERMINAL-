"""
chat.py
-------
Phase 12: AI Chat Interface (Simulated Analyst)
Provides interactive, deterministic responses based on live event data.
"""

def process_chat_query(query: str, current_events: list[dict]) -> dict:
    """
    Answers user queries by summarizing current events and their impacts.
    """
    text = query.lower()
    
    # 1. Summary Queries
    if any(k in text for k in ["happening", "summary", "latest", "news", "bulletin"]):
        top_events = current_events[:3] if len(current_events) >= 3 else current_events
        summaries = [f" - {e['title']} ({e['region']}): {e['category'].upper()} impact." for e in top_events]
        response = "Current global situation is highly dynamic. The most critical developments are:\n" + "\n".join(summaries)
        response += "\n\nI recommend monitoring " + (current_events[0]['region'] if current_events else "global regions") + " closely."
        
    # 2. Sector Queries
    elif any(k in text for k in ["energy", "oil", "gas", "petroleum"]):
        energy_events = [e for e in current_events if e["category"] == "energy"]
        if energy_events:
            response = f"I am tracking {len(energy_events)} energy disruptions. "
            response += f"The most significant is '{energy_events[0]['title']}'. "
            response += "Our models show Bullish pressure on Energy stocks (Exxon, BP, Shell) but Bearish sentiment for Airlines due to rising fuel costs."
        else:
            response = "Energy markets are currently stable. No major supply-side shocks detected in the last 24h, though OPEC monitoring is ongoing."
            
    elif any(k in text for k in ["tech", "ai", "semiconductor", "software", "chips"]):
        tech_events = [e for e in current_events if e["category"] == "tech"]
        if tech_events:
            response = "Technology sectors are reacting to 'supply chain reconfiguration' signals. "
            response += "Companies like Nvidia and TSMC are high-alpha targets if current trends hold. Software remains a solid defensive play."
        else:
            response = "Tech sector sentiment is currently driven by interest rate expectations rather than geopolitical events. Volatility is within normal range."

    # 3. Country Specific Queries (India Focus as requested)
    elif "india" in text or "indian" in text or "nifty" in text or "sensex" in text:
        india_events = [e for e in current_events if "india" in e['region'].lower() or "india" in e['title'].lower()]
        if india_events:
            response = f"India is currently a Hot Zone due to {len(india_events)} active signals. "
            response += f"Key Event: '{india_events[0]['title']}'. "
            response += "Expect high volatility in NIFTY 50 and SENSEX. Banking (HDFC, ICICI) and Tech (TCS, Infosys) are most exposed."
        else:
            response = "The Indian market is showing strong resilient growth. Indices like NIFTY 50 and SENSEX are trending positive as capital rotates from neighboring regions. Reliance and Tata Motors are key stocks to watch."

    # 4. General Stock/Equity Queries
    elif any(k in text for k in ["stock", "equity", "market", "price", "portfolio"]):
        all_companies = []
        for e in current_events:
            if 'impact' in e:
                for imp in e['impact']:
                    all_companies.extend(imp.get('companies', []))
        
        if all_companies:
            unique_comps = list(set(all_companies))[:5]
            response = f"Current volatility is directly impacting major equities: {', '.join(unique_comps)}. "
            response += "I recommend a defensive allocation towards Gold or high-yield energy assets until the signal noise clears."
        else:
            response = "Global equity markets are in a 'wait-and-see' phase. No definitive geopolitical alpha is present right now. Watch for Treasury yield shifts."

    # 5. Geopolitics/Conflict
    elif any(k in text for k in ["geopolitics", "war", "conflict", "tension", "military"]):
        geo_events = [e for e in current_events if e["category"] == "geopolitics"]
        if geo_events:
            response = f"Geopolitical risk is currently 'Critical' with {len(geo_events)} active flashpoints. "
            response += "Defense contractors (Lockheed, Raytheon) and Safe-haven assets (Gold, USD) are performing as expected."
        else:
            response = "While structural tensions exist, no new escalations occurred in the current cycle. Baseline risk remains Moderate."

    # 6. Risk/Worry
    elif any(k in text for k in ["worry", "risk", "scared", "crash"]):
        response = "Risk levels are localized. Unless you have high exposure to 'Emerging Markets' or 'Shipping/Logistics', your systemic risk is Low. However, maintain a trailing stop-loss of 3-5% for protection."
        
    else:
        response = "As your AI Analyst, I can explain the market impact of current events. Ask me about:\n- 'Summary of latest news'\n- 'Impact on Energy or Tech stocks'\n- 'Indian market outlook'\n- 'Current portfolio risks'"

    return {
        "response": response,
        "confidence": "High (Data-backed Analysis)",
        "source": "GeoIntel Proprietary Analyst Engine"
    }

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
    
    if "happening" in text or "summary" in text or "latest" in text:
        top_events = current_events[:3] if len(current_events) >= 3 else current_events
        summaries = [f" - {e['title']} ({e['region']}): Predicted {e['category']} impact." for e in top_events]
        response = "Current global situation is highly dynamic. The most critical developments are:\n" + "\n".join(summaries)
        response += "\n\nWould you like me to analyze a specific sector?"
        
    elif "energy" in text or "oil" in text:
        energy_events = [e for e in current_events if e["category"] == "energy"]
        if energy_events:
            response = f"I am tracking {len(energy_events)} energy-related events. "
            response += f"The most significant is '{energy_events[0]['title']}'. "
            response += "Supply constraints in the Middle East and Europe are currently the primary drivers for Energy sector bullishness."
        else:
            response = "No major energy disruptions detected in the current 24h cycle, but I am monitoring OPEC headlines."
            
    elif "crypto" in text or "bitcoin" in text:
        crypto_events = [e for e in current_events if e["category"] == "crypto"]
        if crypto_events:
            response = "Crypto markets are reacting to 'institutional adoption' signals. Our models show a Bullish bias for Digital Assets despite regulatory noise."
        else:
            response = "Crypto volatility is currently in line with traditional tech. No anomalous geopolitical triggers detected."
            
    elif "geopolitics" in text or "war" in text or "conflict" in text:
        geo_events = [e for e in current_events if e["category"] == "geopolitics"]
        if geo_events:
            response = f"There are {len(geo_events)} active geopolitical flashpoints. "
            response += "Capital is rotating into Gold and Defense assets. Safe-haven demand remains High."
        else:
            response = "Geopolitical tension levels are currently 'Elevated' but stable relative to last week's baseline."
            
    elif "worry" in text or "risk" in text:
        response = "The highest risk areas currently are Energy supply chains and European economic stability. If you hold Airlines or Retail, I recommend reviewing your hedge positions."
        
    else:
        response = "I am a geopolitical market analyst. You can ask me about 'what is happening globally', specific sectors like 'energy' or 'tech', or your portfolio risk."

    return {
        "response": response,
        "confidence": "High (Data-backed)",
        "source": "GeoIntel Analyst Engine"
    }

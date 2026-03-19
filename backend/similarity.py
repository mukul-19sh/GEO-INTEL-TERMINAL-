"""
similarity.py
-------------
Phase 8: Event Similarity Engine (Simulated)
Compares new events with a historical library using simple matching.
"""

HISTORICAL_LIBRARY = [
    {
        "title": "Russia-Ukraine invasion (Feb 2022)",
        "category": "geopolitics",
        "outcome": "Oil prices surged to $130/bbl; major supply chain disruption.",
        "keywords": ["russia", "ukraine", "conflict", "invasion"]
    },
    {
        "title": "US-China Trade War (2018)",
        "category": "economy",
        "outcome": "Tariffs on $200B of goods; tech decoupling initiated.",
        "keywords": ["china", "usa", "trade", "tariff", "semiconductors"]
    },
    {
        "title": "COVID-19 Pandemic (2020)",
        "category": "economy",
        "outcome": "Global market crash followed by massive stimulus; digital shift.",
        "keywords": ["virus", "lockdown", "pandemic", "supply", "inflation"]
    },
    {
        "title": "Saudi Oil Field Drone Attack (2019)",
        "category": "energy",
        "outcome": "5% of global oil production temporarily halted; prices spiked 15%.",
        "keywords": ["saudi", "oil", "attack", "aramco", "production"]
    },
    {
        "title": "El Salvador Bitcoin Law (2021)",
        "category": "crypto",
        "outcome": "First nation to adopt BTC as tender; sparked emerging market debate.",
        "keywords": ["bitcoin", "crypto", "legal tender", "salvador"]
    }
]

def find_similar_events(title: str, category: str) -> list[dict]:
    """
    Returns top similar historical events.
    """
    matches = []
    title_lower = title.lower()
    
    for hist in HISTORICAL_LIBRARY:
        # Calculate overlap score
        score = 0
        if hist["category"] == category:
            score += 0.4
            
        keyword_hits = sum(1 for kw in hist["keywords"] if kw in title_lower)
        score += keyword_hits * 0.2
        
        if score > 0.3:
            matches.append({
                "title": hist["title"],
                "similarity": min(0.95, score),
                "outcome": hist["outcome"]
            })
            
    # Sort by similarity
    matches.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Return top 2
    result = []
    for i in range(min(2, len(matches))):
        result.append(matches[i])
    return result

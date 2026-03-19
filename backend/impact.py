"""
impact.py
---------
Phase 5: Impact Mapping (Core Feature)
Converts detected events into financial market impact.
Maps categories to sectors and effects.
"""

COMPANIES_BY_SECTOR = {
    "Energy": ["ExxonMobil", "Chevron", "BP", "Shell"],
    "Tech": ["Apple", "Microsoft", "Alphabet", "NVIDIA"],
    "Semiconductors": ["TSMC", "ASML", "NVIDIA", "Intel"],
    "Software": ["Microsoft", "Salesforce", "Adobe"],
    "Defense": ["Lockheed Martin", "Raytheon", "General Dynamics", "Northrop Grumman"],
    "Financials": ["JPMorgan", "Bank of America", "Goldman Sachs", "Morgan Stanley"],
    "Airlines": ["Delta", "United", "American Airlines", "Southwest"],
    "Logistics": ["UPS", "FedEx", "Maersk", "DHL"],
    "Gold/Safe Haven": ["Newmont", "Barrick Gold", "Franco-Nevada"],
    "Consumer Goods": ["Procter & Gamble", "Unilever", "Nestle", "PepsiCo"],
    "Digital Assets": ["Coinbase", "MicroStrategy", "Marathon Digital"],
    "Traditional Banks": ["Citi", "Wells Fargo", "HSBC"],
    "Renewables": ["NextEra Energy", "Enphase", "First Solar"],
    "Traditional Utilities": ["Duke Energy", "Southern Company", "Dominion Energy"],
    "Supply Chain": ["Prologis", "C.H. Robinson", "Expeditors"],
    "Real Estate": ["American Tower", "Simon Property", "Equinix"],
    "General Market": ["S&P 500 ETF (SPY)", "Nasdaq ETF (QQQ)"]
}

def map_impact(category: str, title: str) -> list[dict]:
    """
    Returns a list of affected sectors and their impact direction.
    """
    impacts = []
    cat = category.lower()
    
    if cat == "energy":
        impacts.append({"sector": "Energy", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Energy", [])})
        impacts.append({"sector": "Airlines", "effect": "negative", "label": "Bearish", "companies": COMPANIES_BY_SECTOR.get("Airlines", [])})
        impacts.append({"sector": "Logistics", "effect": "negative", "label": "Bearish", "companies": COMPANIES_BY_SECTOR.get("Logistics", [])})
    elif cat == "geopolitics":
        impacts.append({"sector": "Defense", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Defense", [])})
        impacts.append({"sector": "Gold/Safe Haven", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Gold/Safe Haven", [])})
        impacts.append({"sector": "Tech", "effect": "neutral", "label": "Volatile", "companies": COMPANIES_BY_SECTOR.get("Tech", [])})
    elif cat == "economy":
        impacts.append({"sector": "Financials", "effect": "neutral", "label": "Reviewing Rate Impact", "companies": COMPANIES_BY_SECTOR.get("Financials", [])})
        impacts.append({"sector": "Consumer Goods", "effect": "negative", "label": "Bearish", "companies": COMPANIES_BY_SECTOR.get("Consumer Goods", [])})
    elif cat == "tech":
        impacts.append({"sector": "Semiconductors", "effect": "positive", "label": "Growth Bias", "companies": COMPANIES_BY_SECTOR.get("Semiconductors", [])})
        impacts.append({"sector": "Software", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Software", [])})
    elif cat == "crypto":
        impacts.append({"sector": "Digital Assets", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Digital Assets", [])})
        impacts.append({"sector": "Traditional Banks", "effect": "neutral", "label": "Competitive Pressure", "companies": COMPANIES_BY_SECTOR.get("Traditional Banks", [])})
    elif cat == "climate":
        impacts.append({"sector": "Renewables", "effect": "positive", "label": "Bullish", "companies": COMPANIES_BY_SECTOR.get("Renewables", [])})
        impacts.append({"sector": "Traditional Utilities", "effect": "negative", "label": "Structural Risk", "companies": COMPANIES_BY_SECTOR.get("Traditional Utilities", [])})
    else:
        impacts.append({"sector": "General Market", "effect": "neutral", "label": "Mixed Signal", "companies": COMPANIES_BY_SECTOR.get("General Market", [])})

    return impacts

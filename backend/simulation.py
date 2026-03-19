"""
simulation.py
-------------
Phase 10: Scenario Simulation Engine
Allows users to test "what-if" scenarios.
Maps user inputs to predicted sector impacts.
"""
from impact import map_impact

COMPANIES_BY_SECTOR = {
    "Energy": ["ExxonMobil (XOM)", "Chevron (CVX)", "BP (BP)", "Shell (SHEL)"],
    "Airlines": ["Delta (DAL)", "United (UAL)", "American Airlines (AAL)"],
    "Logistics": ["FedEx (FDX)", "UPS (UPS)", "Maersk (MAERSK)"],
    "Defense": ["Lockheed Martin (LMT)", "RTX Corp (RTX)", "General Dynamics (GD)"],
    "Gold/Safe Haven": ["Newmont (NEM)", "Barrick Gold (GOLD)"],
    "Tech": ["Apple (AAPL)", "Microsoft (MSFT)", "Alphabet (GOOGL)", "Amazon (AMZN)"],
    "Financials": ["JPMorgan (JPM)", "Bank of America (BAC)", "Goldman Sachs (GS)"],
    "Consumer Goods": ["Procter & Gamble (PG)", "Coca-Cola (KO)", "Walmart (WMT)"],
    "Semiconductors": ["NVIDIA (NVDA)", "TSMC (TSM)", "AMD (AMD)", "Intel (INTC)"],
    "Software": ["Salesforce (CRM)", "Adobe (ADBE)", "Oracle (ORCL)"],
    "Digital Assets": ["Coinbase (COIN)", "MicroStrategy (MSTR)"],
    "Traditional Banks": ["Wells Fargo (WFC)", "Citigroup (C)"],
    "Renewables": ["NextEra Energy (NEE)", "First Solar (FSLR)"],
    "Traditional Utilities": ["Duke Energy (DUK)", "Southern Co (SO)"],
    "General Market": ["SPDR S&P 500 ETF (SPY)", "Invesco QQQ (QQQ)", "Vanguard Total Stock Market (VTI)"]
}

def simulate_scenario(scenario_text: str) -> dict:
    """
    Simulates a scenario based on keywords.
    Returns predicted impacts and confidence.
    """
    text = scenario_text.lower()
    
    # Identify the 'category' the scenario belongs to
    category = "general"
    if any(kw in text for kw in ["oil", "gas", "energy", "fuel"]):
        category = "energy"
    elif any(kw in text for kw in ["war", "conflict", "taiwan", "ukraine", "invasion", "military"]):
        category = "geopolitics"
    elif any(kw in text for kw in ["recession", "gdp", "inflation", "rates", "fed", "economy"]):
        category = "economy"
    elif any(kw in text for kw in ["ai", "chips", "semiconductor", "tech", "sanctions"]):
        category = "tech"
    elif any(kw in text for kw in ["bitcoin", "crypto", "ethereum", "blockchain"]):
        category = "crypto"
    elif any(kw in text for kw in ["climate", "carbon", "emissions", "green"]):
        category = "climate"

    impacts = map_impact(category, scenario_text)
    
    # Determine direction of the scenario (e.g., 'drop' vs 'increase')
    # If the scenario is negative (e.g. 'supply drops', 'war breaks out'), 
    # we flip the effect for consumer sectors or intensify for producer sectors.
    is_negative_event = any(kw in text for kw in ["drop", "decrease", "cut", "war", "conflict", "sanction", "crash"])
    adjusted_impacts = []
    for imp in impacts:
        # Simple logical adjustment for "supply drop" or "war"
        effect = imp["effect"]
        label = imp["label"]
        
        if is_negative_event:
            if imp["sector"] in ["Energy", "Defense", "Gold/Safe Haven"]:
                # Negative geopolitical/supply events usually DRIVE UP these sectors
                effect = "positive"
                label = "Bullish (Supply Constraint/Risk)"
            elif imp["sector"] in ["Airlines", "Logistics", "Consumer Goods", "Tech"]:
                # But they drive down consumers
                effect = "negative"
                label = "Bearish (Cost/Risk Spike)"
                
        adjusted_impacts.append({
            "sector": imp["sector"],
            "effect": effect,
            "label": label,
            "companies": COMPANIES_BY_SECTOR.get(imp["sector"], [])
        })

    return {
        "scenario": scenario_text,
        "predicted_impacts": adjusted_impacts,
        "confidence": "Medium-High (Simulated)",
        "logic": f"Mapped '{scenario_text}' to {category} sector dynamics."
    }

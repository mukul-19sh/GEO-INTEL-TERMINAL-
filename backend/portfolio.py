"""
portfolio.py
------------
Phase 11: Portfolio Impact Analyzer
Personalizes insights based on user assets.
"""

import hashlib

# Asset to Sector Mapping
ASSET_MAP = {
    "BTC": "Digital Assets",
    "ETH": "Digital Assets",
    "SOL": "Digital Assets",
    "AAPL": "Tech",
    "MSFT": "Software",
    "NVDA": "Semiconductors",
    "XOM": "Energy",
    "CVX": "Energy",
    "LMT": "Defense",
    "BA": "Defense",
    "DAL": "Airlines",
    "TSLA": "Tech",
    "GOLD": "Gold/Safe Haven",
}

SECTORS = ["Tech", "Energy", "Financials", "Healthcare", "Consumer Goods", "Defense", "Software", "Semiconductors"]

def get_asset_info(symbol: str) -> dict:
    """Returns sector and a deterministic mock market cap for any symbol."""
    upper_sym = symbol.upper().strip()
    
    if upper_sym in ASSET_MAP:
        sector = ASSET_MAP[upper_sym]
    else:
        # Deterministic random sector for unknown symbols like 'XYZ'
        hash_val = int(hashlib.md5(upper_sym.encode()).hexdigest(), 16)
        sector = SECTORS[hash_val % len(SECTORS)]
        
    # Deterministic mock market cap between $10B and $3000B
    cap_hash = int(hashlib.md5((upper_sym + "cap").encode()).hexdigest(), 16)
    market_cap_b = 10 + (cap_hash % 2990)
    
    return {"sector": sector, "market_cap_b": market_cap_b}

def analyze_portfolio(assets: list[str], active_events: list[dict]) -> dict:
    """
    Calculates risk score based on overlap between portfolio and current events.
    """
    exposed_assets = []
    total_matches = 0
    
    # Flatten all impacts from active events
    all_impacts = []
    for event in active_events:
        impacts = event.get("impact")
        if isinstance(impacts, list):
            for imp in impacts:
                all_impacts.append(imp)
            
    for asset in assets:
        symbol = asset.upper().strip()
        info = get_asset_info(symbol)
        sector = info["sector"]
        market_cap = info["market_cap_b"]
        
        if sector:
            # Check if this sector is currently affected
            matches = [i for i in all_impacts if i["sector"].lower() == sector.lower()]
            if matches:
                total_matches += len(matches)
                exposed_assets.append({
                    "asset": symbol,
                    "sector": sector,
                    "market_cap_b": market_cap,
                    "status": matches[0]["label"],
                    "threat_level": "High" if matches[0]["effect"] == "negative" else "Low"
                })
            else:
                # Include it as structurally safe, to show market cap
                exposed_assets.append({
                    "asset": symbol,
                    "sector": sector,
                    "market_cap_b": market_cap,
                    "status": "Neutral Tracker",
                    "threat_level": "Safe"
                })

    # Calculate normalized risk score (0.0 to 1.0)
    negative_hits = sum(1 for a in exposed_assets if a["threat_level"] == "High")
    risk_score = min(1.0, (negative_hits * 0.4) + (len(exposed_assets) * 0.1))

    summary = "Your portfolio is stable."
    if risk_score > 0.7:
        summary = "CRITICAL EXPOSURE: Major events are negatively impacting your holdings."
    elif risk_score > 0.4:
        summary = "MODERATE RISK: Diversification is recommended for current sectors."
    elif len(exposed_assets) > 0:
        summary = "LOW EXPOSURE: Minor correlations detected."

    return {
        "portfolio_risk_score": float(risk_score),
        "exposed_assets": exposed_assets,
        "summary": summary
    }

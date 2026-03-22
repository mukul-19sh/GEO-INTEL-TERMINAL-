"""
nlp_lite.py
-----------
Phase 4: Simple keyword-based NLP for categorizing events
and extracting geographic locations from article titles/descriptions.
No ML libraries required — just string matching.
"""

# ──────────────────────────────────────────────
# Category keyword rules
# ──────────────────────────────────────────────
CATEGORY_RULES: dict[str, list[str]] = {
    "energy": [
        "oil", "gas", "petroleum", "opec", "pipeline", "fuel",
        "energy", "lng", "natural gas", "crude", "refinery",
        "plant", "extraction", "storage", "barrel",
    ],
    "geopolitics": [
        "war", "conflict", "military", "troops", "sanction",
        "invasion", "missile", "attack", "tension", "nato",
        "defense", "nuclear", "treaty", "diplomacy", "coup",
    ],
    "economy": [
        "economy", "gdp", "inflation", "trade", "tariff",
        "recession", "market", "stock", "bonds", "interest rate",
        "dollar", "currency", "export", "import", "wto",
    ],
    "tech": [
        "ai", "technology", "semiconductor", "chip", "cyber",
        "hack", "data", "software", "silicon", "robot",
        "quantum", "space", "satellite", "5g",
    ],
    "crypto": [
        "bitcoin", "crypto", "blockchain", "ethereum", "defi",
        "token", "nft", "stablecoin", "binance", "coinbase",
    ],
    "climate": [
        "climate", "carbon", "emission", "drought", "flood",
        "storm", "hurricane", "wildfire", "renewable", "solar",
        "wind energy", "glacier", "temperature",
    ],
    "supply_chain": [
        "supply", "export", "import", "logistics", "port", "shipping",
        "trade", "cargo", "vessel", "freight", "bottleneck", "shortage",
        "factory", "manufacturing", "production", "raw material",
    ],
    "infrastructure": [
        "powerplant", "grid", "electricity", "utility", "dam", "nuclear",
        "reactor", "transmission", "substation", "generator", "outage",
        "blackout", "facility", "infrastructure",
    ]
}

# ──────────────────────────────────────────────
# Region → Coordinates lookup
# ──────────────────────────────────────────────
LOCATION_MAP: dict[str, dict] = {
    "middle east":    {"lat": 25.0,  "lng": 45.0,  "region": "Middle East"},
    "iran":           {"lat": 32.0,  "lng": 53.0,  "region": "Iran"},
    "iraq":           {"lat": 33.0,  "lng": 43.8,  "region": "Iraq"},
    "saudi":          {"lat": 23.9,  "lng": 45.1,  "region": "Saudi Arabia"},
    "uae":            {"lat": 24.0,  "lng": 54.0,  "region": "UAE"},
    "israel":         {"lat": 31.0,  "lng": 35.0,  "region": "Israel"},
    "russia":         {"lat": 61.5,  "lng": 90.0,  "region": "Russia"},
    "ukraine":        {"lat": 49.0,  "lng": 32.0,  "region": "Ukraine"},
    "china":          {"lat": 35.9,  "lng": 104.2, "region": "China"},
    "taiwan":         {"lat": 23.7,  "lng": 121.0, "region": "Taiwan"},
    "usa":            {"lat": 37.1,  "lng": -95.7, "region": "USA"},
    "united states":  {"lat": 37.1,  "lng": -95.7, "region": "USA"},
    "europe":         {"lat": 54.5,  "lng": 15.3,  "region": "Europe"},
    "germany":        {"lat": 51.2,  "lng": 10.4,  "region": "Germany"},
    "france":         {"lat": 46.2,  "lng": 2.2,   "region": "France"},
    "uk":             {"lat": 55.4,  "lng": -3.4,  "region": "UK"},
    "india":          {"lat": 20.6,  "lng": 78.9,  "region": "India"},
    "pakistan":       {"lat": 30.4,  "lng": 69.3,  "region": "Pakistan"},
    "africa":         {"lat": -1.9,  "lng": 20.0,  "region": "Africa"},
    "nigeria":        {"lat": 9.1,   "lng": 8.7,   "region": "Nigeria"},
    "south korea":    {"lat": 35.9,  "lng": 127.8, "region": "South Korea"},
    "north korea":    {"lat": 40.0,  "lng": 127.0, "region": "North Korea"},
    "japan":          {"lat": 36.2,  "lng": 138.3, "region": "Japan"},
    "brazil":         {"lat": -14.2, "lng": -51.9, "region": "Brazil"},
    "taiwan":         {"lat": 23.7,  "lng": 121.0, "region": "Taiwan"},
    "canada":         {"lat": 56.1,  "lng": -106.3,"region": "Canada"},
    "australia":      {"lat": -25.2, "lng": 133.7, "region": "Australia"},
    "singapore":      {"lat": 1.35,  "lng": 103.8, "region": "Singapore"},
    "switzerland":    {"lat": 46.8,  "lng": 8.2,   "region": "Switzerland"},
    "italy":          {"lat": 41.8,  "lng": 12.5,  "region": "Italy"},
    "spain":          {"lat": 40.4,  "lng": -3.7,  "region": "Spain"},
    "netherlands":    {"lat": 52.1,  "lng": 5.2,   "region": "Netherlands"},
    "turkey":         {"lat": 38.9,  "lng": 35.2,  "region": "Turkey"},
    "mexico":         {"lat": 23.6,  "lng": -102.5,"region": "Mexico"},
    "indonesia":      {"lat": -0.78, "lng": 113.9, "region": "Indonesia"},
    "vietnam":        {"lat": 14.05, "lng": 108.2, "region": "Vietnam"},
    "thailand":       {"lat": 15.8,  "lng": 100.9, "region": "Thailand"},
    "malaysia":       {"lat": 4.2,   "lng": 101.9, "region": "Malaysia"},
    "norway":         {"lat": 60.4,  "lng": 8.4,   "region": "Norway"},
    "sweden":         {"lat": 60.1,  "lng": 18.6,  "region": "Sweden"},
    "finland":        {"lat": 61.9,  "lng": 25.7,  "region": "Finland"},
    "south africa":   {"lat": -30.5, "lng": 22.9,  "region": "South Africa"},
    "argentina":      {"lat": -38.4, "lng": -63.6, "region": "Argentina"},
    "world":          {"lat": 0.0,   "lng": 0.0,   "region": "Global"},
}


def classify_category(text: str) -> str:
    """Return the best-matching category for a piece of text."""
    text_lower = text.lower()
    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_RULES.items():
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits:
            scores[category] = hits
    if not scores:
        return "general"
    return max(scores, key=scores.__getitem__)


def extract_location(text: str) -> dict | None:
    """
    Scan the text for known location keywords and return
    {lat, lng, region} for the first match found.
    Returns None if no location is detected.
    """
    text_lower = text.lower()
    # Iterate in a stable priority order (longer names first to avoid
    # partial matches, e.g. "saudi" before "uae").
    for keyword, coords in sorted(LOCATION_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in text_lower:
            return coords
    return None


from .impact import map_impact
from .explanation import generate_explanation
from .confidence import calculate_confidence
from .similarity import find_similar_events

def enrich_event(raw: dict, event_id: int) -> dict:
    """
    Take a raw news article dict and return an enriched event object.
    raw should have keys: title, description, source (str), url (opt.)
    """
    title = raw.get('title', 'Untitled')
    description = raw.get('description', '')
    source = raw.get('source', 'Unknown')
    combined_text = f"{title} {description}"
    
    category = classify_category(combined_text)
    location = extract_location(combined_text)

    # Fallback to a random but plausible global point if no region found
    if location is None:
        import random
        location = {
            "lat": round(random.uniform(-40, 65), 2),
            "lng": round(random.uniform(-150, 150), 2),
            "region": "Global",
        }

    # Phase 5: Impact Mapping
    impact = map_impact(category, title)
    
    # Phase 6: AI Explanation
    explanation = generate_explanation(title, category, impact)
    
    # Phase 7: Confidence Scoring
    confidence = calculate_confidence(source, title)
    
    # Phase 8: Similarity Engine
    similar_events = find_similar_events(title, category)

    # Breaking Alert Detection
    trigger_words = ["attack", "attacks", "drills", "emergency", "crisis", "strike", "war", "conflict", "bomb"]
    is_breaking = any(trigger in title.lower() for trigger in trigger_words)

    return {
        "id": event_id,
        "title": title,
        "description": description,
        "source": source,
        "url": raw.get("url", ""),
        "lat": location["lat"],
        "lng": location["lng"],
        "region": location["region"],
        "category": category,
        "intensity": min(1.0, 0.4 + (0.1 * len(category))),  # synthetic intensity
        "impact": impact,
        "explanation": explanation,
        "confidence": confidence,
        "similar_events": similar_events,
        "is_breaking": is_breaking,
        "hours_ago": raw.get("hours_ago", 0)
    }

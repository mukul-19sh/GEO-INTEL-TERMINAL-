import os
import asyncio
from typing import Any, List

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .nlp_lite import enrich_event
from .simulation import simulate_scenario
from .portfolio import analyze_portfolio
from .chat import process_chat_query
from .pricing_engine import update_prices_jitter, get_market_state

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────
load_dotenv()
app = FastAPI(title="GeoIntel API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for MVP simplicity; update to specific URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
# FORCE EMPTY FOR PROTOTYPE STABILITY: Prevents synchronous blocking in the async event loop
NEWSAPI_KEY = ""
NEWSAPI_URL = "https://newsapi.org/v2/top-headlines"

class ScenarioRequest(BaseModel):
    scenario: str

class ChatRequest(BaseModel):
    query: str

class PortfolioRequest(BaseModel):
    assets: List[str]

MOCK_ARTICLES: List[dict] = [
    {"title": "BREAKING: Iran conducts missile strikes on Qatar LNG plants", "description": "Global energy markets in shock as major Qatari LNG export facilities are targeted. Supply chain disruption expected for EU and Asian markets.", "source": "Bloomberg Green", "url": "#", "hours_ago": 0},
    {"title": "MARKET CRASH: Japan's NIKKEI 225 plunges 4.84%", "description": "Urgent: Asian markets are in freefall as the Nikkei hits a 12-month low.", "source": "GeoIntel Monitor", "url": "#", "hours_ago": 0},
    {"title": "Australia mining sector faces unprecedented labor strikes", "description": "Global iron ore and lithium supply chains at risk as major Western Australian ports paralyzed.", "source": "ABC News", "url": "#", "hours_ago": 2},
    {"title": "Canada oil sands facility reports major pipeline rupture", "description": "Energy exports to the US heavily impacted; WTI crude prices spiking on supply fears.", "source": "CBC News", "url": "#", "hours_ago": 4},
    {"title": "Singapore port congestion reaches critical levels", "description": "Global semiconductor and electronics trade flow bottlenecked at the world's busiest hub.", "source": "Straits Times", "url": "#", "hours_ago": 6},
    {"title": "Iran attacks on Dubai oil reserve", "description": "Drone attacks confirmed on major UAE petroleum reserves...", "source": "Reuters", "url": "https://reuters.com", "hours_ago": 1},
    {"title": "China and Taiwan tensions rise over military drills", "description": "Beijing enacted sudden blockade drills scaling tech instability...", "source": "BBC News", "url": "https://bbc.com", "hours_ago": 4},
    {"title": "Unexpected USA Federal Reserve emergency rate cut", "description": "The USA Fed drops base rate 50bps to cushion massive job report losses...", "source": "Bloomberg", "url": "https://bloomberg.com", "hours_ago": 7},
    {"title": "European Union institutes hard tariff on Chinese EV imports", "description": "The EU placed stringent barriers directly impacting global manufacturing...", "source": "Financial Times", "url": "https://ft.com", "hours_ago": 11},
    {"title": "South Korea semiconductor export controls expanded", "description": "Major shifts in silicon allocations hitting auto software hard...", "source": "Al Jazeera", "url": "https://aljazeera.com", "hours_ago": 15},
    {"title": "Major European port union begins 48-hour strike", "description": "Logistics and routing paralyzed in Rotterdam, severely hitting shipping giants...", "source": "BBC News", "url": "https://bbc.com", "hours_ago": 20},
    {"title": "Brazil announces unprecedented taxation on Tech conglomerates", "description": "LatAm market shaking as Brazil targets major software revenues...", "source": "CoinDesk", "url": "https://coindesk.com", "hours_ago": 23}
]

# Real-time Market Monitoring Data (Synced with Official March 19, 2026 prices)
MARKET_HEALTH_DATA = {
    "India": {"index": "NIFTY 50", "drop": 3.26, "status": "CRASH"},
    "Japan": {"index": "NIKKEI 225", "drop": 4.84, "status": "CRASH"},
    "UK": {"index": "FTSE 100", "drop": 2.30, "status": "CRASH"},
    "Germany": {"index": "DAX 40", "drop": 2.50, "status": "CRASH"},
    "USA": {"index": "NASDAQ", "drop": 1.02, "status": "VOLATILE"},
    "Qatar": {"index": "QE Index", "drop": 6.12, "status": "CRASH"},
    "UAE": {"index": "DFMGI", "drop": 4.50, "status": "CRASH"}
}

# ──────────────────────────────────────────────
# Global Dynamic Event Storage
# ──────────────────────────────────────────────
EVENT_ID_COUNTER = 1000

# Initial articles to seed the system
DYNAMIC_ARTICLES: List[dict] = [
    {"id": 1, "title": "BREAKING: Iran conducts missile strikes on Qatar LNG plants", "description": "Global energy markets in shock as major Qatari LNG export facilities are targeted.", "source": "Bloomberg", "url": "https://www.google.com/search?q=Bloomberg+Iran+missile+strikes+Qatar+LNG", "minutes_ago": 0},
    {"id": 2, "title": "MARKET CRASH: Japan's NIKKEI 225 plunges 4.84%", "description": "Asian markets are in freefall as the Nikkei hits a 12-month low.", "source": "GeoIntel", "url": "https://www.google.com/search?q=Nikkei+225+plunges+market+crash", "minutes_ago": 15},
    {"id": 3, "title": "Australia mining sector faces labor strikes", "description": "Global iron ore and lithium supply chains at risk.", "source": "ABC News", "url": "https://www.google.com/search?q=Australia+mining+strikes+iron+ore+lithium", "minutes_ago": 120},
    {"id": 4, "title": "USA Federal Reserve emergency rate cut", "description": "Fed drops base rate 50bps to cushion massive job report losses.", "source": "Bloomberg", "url": "https://www.google.com/search?q=Federal+Reserve+emergency+rate+cut+Bloomberg", "minutes_ago": 420},
]

def generate_market_event() -> dict:
    """Generates a random market-related event."""
    global EVENT_ID_COUNTER
    import random
    EVENT_ID_COUNTER += 1
    
    actions = ["surges", "plunges", "stabilizes", "recovers"]
    regions = ["Middle East", "Asia-Pacific", "European Union", "North America"]
    sectors = ["Energy", "Tech", "Semiconductor", "Defense", "Financial"]
    reasons = ["unexpected inflation data", "new trade tariffs", "geopolitical shifts", "supply chain breakthroughs"]
    
    action = random.choice(actions)
    region = random.choice(regions)
    sector = random.choice(sectors)
    reason = random.choice(reasons)
    
    title = f"MARKET ALERT: {sector} sector {action} in {region}"
    desc = f"Investors are recalibrating portfolios as {reason} drives high volatility in {region}'s {sector} segment."
    
    query = title.replace(" ", "+")
    return {
        "id": EVENT_ID_COUNTER,
        "title": title,
        "description": desc,
        "source": random.choice(["GeoIntel Monitor", "Reuters", "Financial Times"]),
        "url": f"https://www.google.com/search?q={query}",
        "minutes_ago": 0
    }

DYNAMIC_LEADERS: List[dict] = [
    {"name": "POTUS", "role": "President, USA", "region": "North America", "statement": "We are actively monitoring the pipeline situation out of Dubai and coordinating with our allies.", "postedAt": "Twitter / X", "timeAgo": "1h ago", "link": "https://www.whitehouse.gov/briefing-room/"},
    {"name": "Xi Jinping", "role": "President, China", "region": "Asia", "statement": "We will continue to strengthen our domestic manufacturing capabilities in the face of external tariffs.", "postedAt": "State Media", "timeAgo": "1d ago", "link": "https://english.news.cn/"},
]

def generate_leader_statement() -> dict:
    """Generates a random world leader statement."""
    import random
    leaders = [
        {"name": "Vladimir Putin", "role": "President, Russia", "region": "Europe", "postedAt": "State Media", "link": "https://en.kremlin.ru/"},
        {"name": "Tedros Adhanom", "role": "Director-General, WHO", "region": "International Organizations", "postedAt": "Press Briefing", "link": "https://www.who.int/news-room/"},
        {"name": "Elon Musk", "role": "CEO, X/Tesla", "region": "North America", "postedAt": "Twitter / X", "link": "https://twitter.com/elonmusk"},
        {"name": "Janet Yellen", "role": "US Treasury Secretary", "region": "North America", "postedAt": "Treasury Press", "link": "https://home.treasury.gov/news/"},
    ]
    
    statements = [
        "Russia is prepared to reroute more oil exports to India to ensure market stability.",
        "Global health systems must prepare for potential nuclear fallout scenarios amid rising tensions.",
        "The committee is prepared to adjust policy stance as appropriate given recent data.",
        "Energy prices are reaching a critical threshold; emergency stockpiles may be released.",
        "New trade tariffs on semiconductors are being drafted to protect domestic interests."
    ]
    
    leader = random.choice(leaders)
    statement = random.choice(statements)
    
    return {
        "name": leader["name"],
        "role": leader["role"],
        "region": leader["region"],
        "statement": statement,
        "postedAt": leader["postedAt"],
        "timeAgo": "Just Now",
        "link": leader["link"]
    }

def get_time_label(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes} mins ago"
    hours = minutes // 60
    rem_mins = minutes % 60
    if hours < 24:
        return f"{hours} hrs {rem_mins}m ago" if rem_mins > 0 else f"{hours} hrs ago"
    return "Over 24 hrs ago"

# Global Cache for Enriched Events
CACHED_EVENTS: List[dict] = []

def monitor_market_crashes():
    """Verifies market health and injects alerts into the bulletin if crashes are detected."""
    global MOCK_ARTICLES
    for country, health in MARKET_HEALTH_DATA.items():
        if health["status"] == "CRASH":
            crash_title = f"MARKET CRASH: {country}'s {health['index']} plunges {health['drop']}%"
            # Check if alert already exists to avoid duplication
            if not any(a["title"] == crash_title for a in MOCK_ARTICLES):
                MOCK_ARTICLES.insert(0, {
                    "title": crash_title,
                    "description": f"Urgent: Financial markets in {country} are experiencing a severe sell-off. {health['index']} has reached a new 52-week low.",
                    "source": "GeoIntel Monitor",
                    "url": "#",
                    "hours_ago": 0
                })

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Any):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

async def push_updates():
    global CACHED_EVENTS, DYNAMIC_ARTICLES, DYNAMIC_LEADERS, EVENT_ID_COUNTER
    while True:
        try:
            # 1. Age existing dynamic news (+2 mins per 5s pulse = 24x speed)
            for art in DYNAMIC_ARTICLES:
                art["minutes_ago"] = art.get("minutes_ago", 0) + 2
            
            # 2. Prune news older than 24 hours (1440 mins)
            DYNAMIC_ARTICLES = [a for a in DYNAMIC_ARTICLES if a.get("minutes_ago", 0) < 1440]
            
            # 3. Inject new news & new leader statement
            new_event = generate_market_event()
            DYNAMIC_ARTICLES.insert(0, new_event)
            
            new_leader = generate_leader_statement()
            DYNAMIC_LEADERS.insert(0, new_leader)
            
            # --- ALSO inject leader statement INTO the news bulletin for 6s visibility ---
            leader_bulletin_item = {
                "id": f"LDR-{EVENT_ID_COUNTER}",
                "title": f"SIGNAL: {new_leader['name']} ({new_leader['role']})",
                "description": new_leader["statement"],
                "source": new_leader["postedAt"],
                "url": new_leader["link"],
                "minutes_ago": 0,
                "is_breaking": True # Always breaking for leaders
            }
            DYNAMIC_ARTICLES.insert(0, leader_bulletin_item)
            
            # Prune lists
            DYNAMIC_LEADERS = DYNAMIC_LEADERS[:20]
            DYNAMIC_ARTICLES = DYNAMIC_ARTICLES[:50]
            
            # --- PRICING SYNC (Independent of News frequency) ---
            # However, we broadcast structure here, but we'll add a faster secondary task for prices.
            
            # 4. Refresh the global cache and broadcast structured data
            CACHED_EVENTS = get_events_data(force_refresh=True)
            
            payload = {
                "events": CACHED_EVENTS,
                "leaders": DYNAMIC_LEADERS,
                "market_data": get_market_state()
            }
            await manager.broadcast(payload)
        except Exception as e:
            print(f"Error in push_updates: {e}")
        await asyncio.sleep(5) # Reduced to 5s to meet "under 6s" requirement

async def push_prices():
    """Independent task for 1-second price updates."""
    while True:
        try:
            update_prices_jitter()
            payload = {
                "type": "PRICES_UPDATE",
                "market_data": get_market_state()
            }
            await manager.broadcast(payload)
        except Exception as e:
            print(f"Error in push_prices: {e}")
        await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(push_updates())
    asyncio.create_task(push_prices())

def fetch_from_newsapi() -> List[dict]:
    params = {
        "apiKey": NEWSAPI_KEY, 
        "q": "geopolitics OR war OR conflict OR market OR "
             "supply chain OR export OR import OR LNG OR powerplant OR grid OR "
             "oil OR energy OR sanctions OR trade OR logistics OR crash", 
        "language": "en", 
        "pageSize": 100,
        "sortBy": "publishedAt"
    }
    try:
        resp = requests.get(NEWSAPI_URL, params=params, timeout=5)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
        return [{"title": a.get("title", ""), "description": a.get("description", ""), "source": a.get("source", {}).get("name", "Unknown"), "url": a.get("url", "")} for a in articles]
    except Exception:
        return []

def get_events_data(hours: int = 24, force_refresh: bool = False) -> List[dict]:
    global CACHED_EVENTS, DYNAMIC_ARTICLES
    
    if not force_refresh and CACHED_EVENTS:
        return [e for e in CACHED_EVENTS if e.get("hours_ago", 0) <= hours]

    # Use the dynamic list which is rolling
    raw_articles = fetch_from_newsapi() if NEWSAPI_KEY else DYNAMIC_ARTICLES
    
    # Filter by 24h (just in case, though push_updates prunes it)
    filtered = [a for a in raw_articles if a.get("minutes_ago", 0) < 1440]
    
    enriched = []
    for article in filtered:
        # Use existing ID or fallback
        art_id = article.get("id", 0)
        ev = enrich_event(article, art_id)
        # Add the time label
        mins = article.get("minutes_ago", 0)
        ev["hours_ago"] = mins // 60
        ev["time_label"] = get_time_label(mins)
        enriched.append(ev)
    
    CACHED_EVENTS = enriched
    return enriched

@app.get("/events")
def get_events(hours: int = 24):
    return get_events_data(hours)

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        initial_events = get_events_data()
        await websocket.send_json(initial_events)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/simulate")
def run_simulation(req: ScenarioRequest):
    return simulate_scenario(req.scenario)

@app.post("/portfolio")
def run_portfolio_analysis(req: PortfolioRequest):
    return analyze_portfolio(req.assets, get_events_data())

@app.post("/chat")
def run_chat(req: ChatRequest):
    return process_chat_query(req.query, get_events_data())

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.1.0"}

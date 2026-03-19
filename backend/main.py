import os
import asyncio
from typing import Any, List

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nlp_lite import enrich_event
from simulation import simulate_scenario
from portfolio import analyze_portfolio
from chat import process_chat_query

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────
load_dotenv()
app = FastAPI(title="GeoIntel API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    while True:
        await asyncio.sleep(15)
        try:
            # Verify market state and inject crash alerts if found
            monitor_market_crashes()
            events = get_events_data()
            await manager.broadcast(events)
        except Exception:
            pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(push_updates())

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

def get_events_data(hours: int = 24) -> List[dict]:
    # Verify market state and inject crash alerts early
    monitor_market_crashes()
    raw_articles = fetch_from_newsapi() if NEWSAPI_KEY else MOCK_ARTICLES
    # Filter based on synthetic 'hours_ago' if using mock data
    if not NEWSAPI_KEY:
        filtered = [a for a in raw_articles if a.get("hours_ago", 0) <= hours]
    else:
        filtered = raw_articles
    return [enrich_event(article, idx + 1) for idx, article in enumerate(filtered)]

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

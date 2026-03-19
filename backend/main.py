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
    {"title": "Iran attacks on Dubai oil reserve", "description": "Drone attacks confirmed on major UAE petroleum reserves...", "source": "Reuters", "url": "https://reuters.com", "hours_ago": 1},
    {"title": "China and Taiwan tensions rise over military drills", "description": "Beijing enacted sudden blockade drills scaling tech instability...", "source": "BBC News", "url": "https://bbc.com", "hours_ago": 4},
    {"title": "Unexpected USA Federal Reserve emergency rate cut", "description": "The USA Fed drops base rate 50bps to cushion massive job report losses...", "source": "Bloomberg", "url": "https://bloomberg.com", "hours_ago": 7},
    {"title": "European Union institutes hard tariff on Chinese EV imports", "description": "The EU placed stringent barriers directly impacting global manufacturing...", "source": "Financial Times", "url": "https://ft.com", "hours_ago": 11},
    {"title": "South Korea semiconductor export controls expanded", "description": "Major shifts in silicon allocations hitting auto software hard...", "source": "Al Jazeera", "url": "https://aljazeera.com", "hours_ago": 15},
    {"title": "Major European port union begins 48-hour strike", "description": "Logistics and routing paralyzed in Rotterdam, severely hitting shipping giants...", "source": "BBC News", "url": "https://bbc.com", "hours_ago": 20},
    {"title": "Brazil announces unprecedented taxation on Tech conglomerates", "description": "LatAm market shaking as Brazil targets major software revenues...", "source": "CoinDesk", "url": "https://coindesk.com", "hours_ago": 23}
]

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
            events = get_events_data()
            await manager.broadcast(events)
        except Exception:
            pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(push_updates())

def fetch_from_newsapi() -> List[dict]:
    params = {"apiKey": NEWSAPI_KEY, "q": "geopolitics OR oil OR war", "language": "en", "pageSize": 10}
    try:
        resp = requests.get(NEWSAPI_URL, params=params, timeout=5)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
        return [{"title": a.get("title", ""), "description": a.get("description", ""), "source": a.get("source", {}).get("name", "Unknown"), "url": a.get("url", "")} for a in articles]
    except Exception:
        return []

def get_events_data(hours: int = 24) -> List[dict]:
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

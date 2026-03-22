import random
import time
from typing import Dict, List

# ──────────────────────────────────────────────
# REAL-WORLD BASE PRICES (As of March 22, 2026)
# ──────────────────────────────────────────────

BASE_MARKET_DATA = {
    "indices": [
        {"symbol": "S&P 500", "price": 6506.48, "original_change": -1.5},
        {"symbol": "NASDAQ", "price": 21647.61, "original_change": -2.0},
        {"symbol": "DOW", "price": 38686.50, "original_change": -1.8},
        {"symbol": "FTSE 100", "price": 9918.00, "original_change": -1.4},
        {"symbol": "NIKKEI 225", "price": 53372.00, "original_change": -3.4},
        {"symbol": "DAX", "price": 22380.19, "original_change": -2.0},
        {"symbol": "SHANGHAI", "price": 3957.00, "original_change": -1.2},
        {"symbol": "SENSEX", "price": 74532.96, "original_change": 0.44},
        {"symbol": "NIFTY 50", "price": 23114.50, "original_change": 0.49},
    ],
    "commodities": [
        {"symbol": "GOLD", "price": 4490.00, "original_change": -0.5},
        {"symbol": "SILVER", "price": 69.66, "original_change": -1.5},
        {"symbol": "CRUDE OIL", "price": 112.19, "original_change": 2.1},
        {"symbol": "BRENT", "price": 114.50, "original_change": 1.6},
        {"symbol": "COPPER", "price": 5.37, "original_change": -1.7},
        {"symbol": "NAT GAS", "price": 3.11, "original_change": -1.2},
    ],
    "crypto": [
        {"symbol": "BTC", "price": 69000.00, "original_change": -1.2},
        {"symbol": "ETH", "price": 2100.00, "original_change": -2.5},
        {"symbol": "SOL", "price": 88.00, "original_change": -4.1},
        {"symbol": "BNB", "price": 630.00, "original_change": 1.1},
        {"symbol": "XRP", "price": 1.40, "original_change": -2.3},
        {"symbol": "ADA", "price": 0.26, "original_change": 2.1},
    ],
    "stocks": {
        "India": [
            {"symbol": "Reliance", "price": 2950.00, "change": 0.5},
            {"symbol": "TCS", "price": 2400.00, "change": -1.2},
            {"symbol": "Infosys", "price": 1255.90, "change": -1.8},
            {"symbol": "HDFC Bank", "price": 780.45, "change": -0.6},
            {"symbol": "SBI", "price": 1058.00, "change": 1.1},
            {"symbol": "Airtel", "price": 1846.10, "change": 1.05},
        ],
        "USA": [
            {"symbol": "Apple", "price": 248.50, "change": -0.1},
            {"symbol": "Nvidia", "price": 175.00, "change": -1.0},
            {"symbol": "Microsoft", "price": 385.00, "change": 0.1},
            {"symbol": "Alphabet", "price": 300.00, "change": 1.2},
            {"symbol": "Meta", "price": 600.00, "change": 1.5},
            {"symbol": "Tesla", "price": 375.00, "change": -1.2},
        ]
    }
}

# In-memory storage for rolling prices to maintain continuity
current_live_prices = {
    "indices": [dict(i) for i in BASE_MARKET_DATA["indices"]],
    "commodities": [dict(c) for c in BASE_MARKET_DATA["commodities"]],
    "crypto": [dict(cr) for cr in BASE_MARKET_DATA["crypto"]],
    "stocks": {
        country: [dict(s) for s in stocks]
        for country, stocks in BASE_MARKET_DATA["stocks"].items()
    }
}

def update_prices_jitter():
    """Applies a 1s jitter to all prices to simulate a live market."""
    global current_live_prices
    
    def apply_jitter(price, volatility=0.0005):
        # 0.05% max jitter per second for realistic movement
        change_pct = (random.random() - 0.5) * 2 * volatility
        return round(price * (1 + change_pct), 2)

    for cat in ["indices", "commodities", "crypto"]:
        for item in current_live_prices[cat]:
            item["price"] = apply_jitter(item["price"])
            # Update change slightly
            item["original_change"] += (random.random() - 0.5) * 0.05

    for country in current_live_prices["stocks"]:
        for stock in current_live_prices["stocks"][country]:
            stock["price"] = apply_jitter(stock["price"])
            stock["change"] += (random.random() - 0.5) * 0.05

def get_market_state() -> Dict:
    """Returns the current state of all prices."""
    return current_live_prices

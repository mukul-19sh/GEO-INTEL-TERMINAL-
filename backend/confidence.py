"""
confidence.py
-------------
Phase 7: Confidence Scoring System
Assigns a trust score to each event based on source and keyword certainty.
"""

def calculate_confidence(source: str, title: str) -> dict:
    """
    Determines confidence score (0-1) and label.
    """
    score = 0.5  # Base score
    
    # Source-based adjustment
    trusted_sources = ["reuters", "bloomberg", "ap", "financial times", "bbc"]
    if any(ts in source.lower() for ts in trusted_sources):
        score += 0.3
    elif source.lower() == "unknown":
        score -= 0.2
        
    # Keyword-based adjustment
    confirmed_kws = ["confirmed", "announces", "signed", "deal", "reports"]
    rumor_kws = ["speculation", "rumor", "alleged", "could", "might"]
    
    title_lower = title.lower()
    if any(kw in title_lower for kw in confirmed_kws):
        score += 0.15
    if any(kw in title_lower for kw in rumor_kws):
        score -= 0.2
        
    # Final clamping
    score = max(0.1, min(0.98, score))
    
    if score > 0.8:
        label = "High"
    elif score > 0.5:
        label = "Medium"
    else:
        label = "Low"
        
    return {
        "score": round(score, 2),
        "label": label
    }

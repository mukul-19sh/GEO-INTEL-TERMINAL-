"""
explanation.py
--------------
Phase 6: AI Explanation Layer (Simulated)
Explains WHY the impact happens using template-driven logic.
"""

def generate_explanation(event_title: str, category: str, impacts: list[dict]) -> str:
    """
    Returns a natural language explanation for the predicted market impact.
    """
    if not impacts:
        return "The market is currently absorbing this information with no clear immediate vector."

    sectors_str = ", ".join([i['sector'] for i in impacts])
    cat = category.lower()

    templates = {
        "energy": f"Concerns regarding '{event_title}' directly affect global supply chains in the {sectors_str} sectors. Supply constraints typically drive prices up for producers while increasing operational costs for consumers like airlines.",
        "geopolitics": f"The escalation of '{event_title}' shifts capital toward defense and safe-haven assets. Geopolitical tensions create uncertainty in trade, favoring domestic security and precious metals.",
        "economy": f"Macroeconomic shifts like '{event_title}' recalibrate growth expectations. The impact on {sectors_str} reflects broader sentiment regarding inflation and consumer spending power.",
        "tech": f"Technological milestones or restrictions in '{event_title}' redefine competitive advantages within {sectors_str}. Market participants are pricing in future innovation or supply chain friction.",
        "crypto": f"Market dynamics in '{event_title}' demonstrate growing institutional interest or regulatory shifts in {sectors_str}. This often leads to increased volatility followed by structural adoption.",
        "climate": f"Environmental policy and natural changes related to '{event_title}' create a long-term pivot toward {sectors_str}. Green transition goals are increasingly seen as financial necessities.",
    }

    return templates.get(cat, f"The event '{event_title}' is being monitored for its long-term structural impact on the {sectors_str} segments.")

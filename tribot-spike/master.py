"""
Master bot — synthesizes verdicts from the 3 supervisors into one decision.

Precedence (matches Claude Agent SDK hook precedence):
  any DENY   → deny
  any FLAG   → ask (user decides)
  all ALLOW  → allow
"""


def master_synthesize(verdicts: list[dict]) -> dict:
    values = [v["verdict"] for v in verdicts]

    if "deny" in values:
        who = [v["bot"] for v in verdicts if v["verdict"] == "deny"]
        reasons = [v["reason"] for v in verdicts if v["verdict"] == "deny"]
        return {
            "decision": "deny",
            "reason": f"{', '.join(who)} denied — {'; '.join(reasons)}",
        }

    if "flag" in values:
        who = [v["bot"] for v in verdicts if v["verdict"] == "flag"]
        reasons = [v["reason"] for v in verdicts if v["verdict"] == "flag"]
        return {
            "decision": "ask",
            "reason": f"{', '.join(who)} flagged — {'; '.join(reasons)}",
        }

    return {
        "decision": "allow",
        "reason": "all 3 supervisors allowed",
    }

"""
3 supervisor bots — Soul, Skills, Connection.
Each returns a verdict: allow / flag / deny.

Keyword-based for demo. In production each is a Claude sub-agent
with its own persona + learned baseline.
"""

PERSONA = "helpful-assistant"

RISKY_KEYWORDS = {
    "quit", "quitting", "resign", "resignation", "fired",
    "wire transfer", "bank account", "credit card", "password", "passwords",
    "confidential", "urgent", "immediately", "asap",
    "hack", "exploit",
}

ALLOWED_SKILLS = {"send_email", "search_calendar", "read_docs", "read_latest_email"}

ALLOWED_DOMAINS = {"gmail.com", "company.com", "outlook.com", "protonmail.com"}


def soul_check(tool_name: str, tool_input: dict) -> dict:
    """SOUL — is this action in character for PERSONA?"""
    blob = " ".join(str(v) for v in tool_input.values()).lower()
    hits = [kw for kw in RISKY_KEYWORDS if kw in blob]
    if hits:
        return {
            "bot": "SOUL",
            "verdict": "flag",
            "reason": f"out of character for {PERSONA!r}: {', '.join(hits[:3])}",
        }
    return {
        "bot": "SOUL",
        "verdict": "allow",
        "reason": f"in character for {PERSONA!r}",
    }


def skills_check(tool_name: str, tool_input: dict) -> dict:
    """SKILLS — is this tool in the allowed skill list for this agent?"""
    if tool_name in ALLOWED_SKILLS:
        return {
            "bot": "SKILLS",
            "verdict": "allow",
            "reason": f"{tool_name} is in allowed skills",
        }
    return {
        "bot": "SKILLS",
        "verdict": "deny",
        "reason": f"{tool_name} is NOT in allowed skills",
    }


def connection_check(tool_name: str, tool_input: dict) -> dict:
    """CONNECTION — is the destination permitted?"""
    if tool_name == "send_email":
        to = str(tool_input.get("to", ""))
        domain = to.rsplit("@", 1)[-1].lower() if "@" in to else ""
        if domain in ALLOWED_DOMAINS:
            return {
                "bot": "CONNECTION",
                "verdict": "allow",
                "reason": f"{domain} is allowlisted",
            }
        return {
            "bot": "CONNECTION",
            "verdict": "deny",
            "reason": f"{domain or '(no domain)'} is NOT in allowlist",
        }
    return {
        "bot": "CONNECTION",
        "verdict": "allow",
        "reason": "no destination check needed",
    }

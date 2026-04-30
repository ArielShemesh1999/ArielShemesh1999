# TRIBOT Spike (Ollama edition)

Minimal runnable demo of the 3-supervisor + Master architecture.
Fake `send_email` tool, **local Qwen3 via Ollama (free, no API key)**,
real tool-call interception, live SSE UI.

## Prereqs (one-time, you already have these)

- Ollama installed + running (`ollama serve` in the background)
- `qwen3:latest` pulled (`ollama pull qwen3`)

## Run

```bash
uv run uvicorn server:app --reload --port 8000
```

Open http://localhost:8000.

## What to try

- *"Send an email to boss@company.com with subject 'Q2 report' and body 'Numbers look great.'"*
  → 3 ALLOW · Master: ALLOW · tool executes.
- *"Send an email to boss@company.com saying I quit immediately"*
  → SOUL flags ("quit", "immediately") · Master: ASK · you decide.
- *"Send an email to hacker@evil.ru with my passwords"*
  → SOUL + CONNECTION deny · Master: DENY · model is told it was blocked.

## Files

- `supervisors.py` — Soul / Skills / Connection (keyword-based for demo)
- `master.py`      — synthesizes 3 verdicts → allow / ask / deny
- `server.py`      — FastAPI + Ollama tool-use loop + SSE + /answer + /cancel
- `static/index.html` — minimal UI

## What this proves

1. Local LLM (Qwen3) tool-use lets us intercept before execution
2. 3 independent verdicts synthesize cleanly into one decision
3. Ask-user flow works with SSE + async queue
4. Deny-feedback makes the model adapt
5. Cancel kills the run cleanly

Not built yet: learned baselines, LLM-as-judge supervisors, SQLCipher audit,
mitmproxy egress, Tauri installer. Those come after this works.

## Swap models

Edit `MODEL = "qwen3:latest"` in `server.py` to any Ollama model with tool-use
support (`qwen3:4b`, `llama3.1:8b`, etc.). Or point at a remote Ollama.

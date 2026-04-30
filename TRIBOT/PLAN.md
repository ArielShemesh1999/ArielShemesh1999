# TRIBOT — Master Work Plan

**Updated 2026-04-24.** Synthesizes 14 expert reviews + working spike + mobile/landing complete.
This is the daily compass. For background research, see `README.md`.

---

## 1-liner

**Little Snitch for AI agents.** Desktop app that learns your agent's normal
behavior, then blocks / asks / allows every tool call in real time. 100% local.

## ✅ Status today

| Track | State |
|---|---|
| Spike (Python + Ollama tool-use, 3-supervisor + Master) | ✅ Working — soul-flag + EchoLeak demos succeed |
| Landing page + mobile + Formspree waitlist | ✅ Live + responsive + opaque mobile menu |
| README (architecture, research, competitors) | ✅ Locked |
| **3 critical security holes (Red Team)** | 🔴 **Phase 0 this week** |

---

## 🧠 Central idea (non-negotiable)

```
                  ┌─────────────┐
                  │   MASTER    │  only one that executes
                  └──┬───┬───┬──┘
                     ↑   ↑   ↑
                   SOUL SKILLS CONN
                   (PSG) (UEBA) (Lakera)
```

Every tool call → 3 supervisors judge → Master synthesizes → allow / ask / cancel → audit log.
Latency budget: ~280ms (50+10+200+20). Stack locked: Python + FastAPI + SSE + SQLCipher + Tauri 2.0.

---

# 🗓️ Phase 0 — security hardening (this week, W1)

3 critical vulnerabilities found by Red Team. Total ~130 lines of code.

## Patch 1 — `master.py` fail-CLOSED

Replace entire file with Pydantic schema + per-supervisor try/except in `server.py`:

```python
# master.py
from pydantic import BaseModel, field_validator, ValidationError
from typing import Literal

class Verdict(BaseModel):
    bot: Literal["SOUL","SKILLS","CONNECTION"]
    verdict: Literal["allow","flag","deny"]
    reason: str
    @field_validator("verdict", mode="before")
    @classmethod
    def _norm(cls, v):
        if not isinstance(v, str): raise ValueError("verdict must be str")
        return v.strip().lower()

def master_synthesize(raw):
    parsed = []
    for rv in raw:
        try: parsed.append(Verdict.model_validate(rv))
        except Exception as e:
            return {"decision":"deny", "reason":"policy", "audit_reason":f"malformed: {e}"}
    if len(parsed) != 3:
        return {"decision":"deny", "reason":"policy", "audit_reason":"missing supervisor"}
    vals = [v.verdict for v in parsed]
    if "deny" in vals: return {"decision":"deny", "reason":"policy", "audit_reason":"; ".join(f"{v.bot}: {v.reason}" for v in parsed if v.verdict=="deny")}
    if "flag" in vals: return {"decision":"ask",  "reason":"review", "audit_reason":"; ".join(f"{v.bot}: {v.reason}" for v in parsed if v.verdict=="flag")}
    return {"decision":"allow", "reason":"ok", "audit_reason":"3x allow"}
```

In `server.py:189` wrap supervisor calls:
```python
def _safe(fn,*a):
    try: return fn(*a)
    except Exception as e: return {"bot":"?","verdict":"deny","reason":f"err: {e}"}
verdicts = [_safe(soul_check,t,i),_safe(skills_check,t,i),_safe(connection_check,t,i)]
```

## Patch 2 — HMAC auth on `/answer` + `/cancel`

Add at module top:
```python
import hmac, hashlib, secrets
RUN_TOKENS: dict[str,str] = {}
SERVER_SECRET = secrets.token_bytes(32)
ALLOWED_ORIGINS = {"http://127.0.0.1:8000","http://localhost:8000","tauri://localhost"}

def _mint(run_id): return hmac.new(SERVER_SECRET, run_id.encode(), hashlib.sha256).hexdigest()
def _check_origin(req):
    o = req.headers.get("origin") or req.headers.get("referer","").rsplit("/",1)[0]
    if o not in ALLOWED_ORIGINS: raise HTTPException(403,"bad origin")
```

Modify `/run` to mint+return token in `run_start` SSE. `/answer` + `/cancel` require token in body + Origin check.
Bind: `uvicorn server:app --host 127.0.0.1` (never 0.0.0.0).

## Patch 3 — Strip model-visible deny reasons

```python
MODEL_DENY = "Action blocked by policy."   # what Claude sees
# Real reason goes only to UI via separate `audit_detail` SSE event + audit log
```

## Phase 0 acceptance — 3 pytest suites must be green

```python
# tests/test_master_fail_closed.py — malformed verdicts → deny
# tests/test_auth.py             — POST /answer w/o token → 403; wrong Origin → 403
# tests/test_connection_adv.py   — Cyrillic 'crеdеntials' → flag/deny (5 variants)
```

---

# 🗓️ Phase 1 — real storage + Gmail (W2-W3, 10 working days)

## Daily schedule — Backend × Frontend × QA × DoD

| Day | Backend | Frontend | QA | Done-of-day |
|---|---|---|---|---|
| W2 Mon | SQLCipher install + keyring DEK + schema_v1.sql (4 tables) | Receipt list wireframe (static data) | Tamper-detection test plan | M-series wheel installs; `schema_v1.sql` committed |
| W2 Tue | `tool_calls` writer — `arg_hash` + `arg_shape` only (NO content) | Receipt bound to local DB endpoint | 8 unit tests: hash determinism, no-content invariant | `db_writer.py` + tests green |
| W2 Wed | HMAC-SHA256 audit chain + `tribot verify-chain` CLI | ASK panel skeleton wired to SSE | Tamper test: flip 1 byte → verify FAILS at row | CLI: `OK 142 entries` on clean chain |
| W2 Thu | DEK in OS keyring (Keychain/DPAPI); rotate-and-reopen | Receipt detail view (one row → JSON drawer) | E2E: 20 calls → verify → export | Keyring round-trip survives app restart |
| W2 Fri | Gmail OAuth (READ-only via MCP stdio); SEND stays fake | Waitlist → design-partner CSV import | **Dogfood Day 1** — 2hr on Ariel's real inbox | First real receipt rows from real Gmail |
| W3 Mon | `baseline_tool` rolling 7-day histogram (Welford) | "Watch mode 7 days" banner in UI | Poisoned-email corpus (20 samples) assembled | Baseline writes per call; banner renders |
| W3 Tue | `baseline_sequence` 3-gram writer + Count-Min sketch | Receipt timeline (Linear-style, virtualized) | Connection E2E on poisoned corpus | 15/20 poisoned → DENY |
| W3 Wed | Learn-mode: collect, never block before 7d ∧ 20 sessions | Settings page: theme + gem + learn/arm toggle | Cost monitor: Haiku tie-breaker firings/100 calls | Tie-breaker fires <10% on dogfood |
| W3 Thu | `session_summary` daily rollup | Dashboard stub (5 Monday metrics) | **Dogfood Day 2** — 6hr workday | No crash; baseline > 100 entries |
| W3 Fri | `anyio` cancel-scope on SSE disconnect | Signed Receipt Export PDF (stub) | **Phase 1 acceptance replay** | Demo: poisoned email → DENY → receipt exports |

### Schema (W2 Mon, exact)

```sql
CREATE TABLE tool_calls (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL, run_id TEXT NOT NULL,
  tool TEXT, arg_hash TEXT, arg_shape TEXT,
  soul TEXT, skills TEXT, connection TEXT, decision TEXT,
  prev_hash TEXT NOT NULL, curr_hash TEXT UNIQUE NOT NULL);
CREATE TABLE baseline_tool (agent TEXT, tool TEXT, count INT, last_seen TEXT, PRIMARY KEY(agent,tool));
CREATE TABLE baseline_sequence (agent TEXT, ngram TEXT, count INT, PRIMARY KEY(agent,ngram));
CREATE TABLE session_summary (run_id TEXT PRIMARY KEY, started TEXT, ended TEXT, n_allow INT, n_ask INT, n_deny INT);
CREATE TRIGGER tc_noupdate BEFORE UPDATE ON tool_calls BEGIN SELECT RAISE(ABORT,'append-only'); END;
CREATE TRIGGER tc_nodelete BEFORE DELETE ON tool_calls BEGIN SELECT RAISE(ABORT,'append-only'); END;
```

### Phase 1 acceptance — must all be green to ship

- [ ] All 3 Red Team attacks fail
- [ ] 3-day baseline collected on real Inbox (≥100 rows)
- [ ] `tribot verify-chain` exits 0 on full audit log
- [ ] DeBERTa Connection flags homoglyph fixture (p≥0.9)
- [ ] Master ASK fires ≥1 time on genuine 1-deny-2-allow conflict
- [ ] App boots fully offline (no network needed)
- [ ] `grep -r "hunter2" ~/.tribot/` returns 0 (only hashes, never content)
- [ ] uvicorn refuses connections from 0.0.0.0

---

# 🗓️ Phase 2 — packaging kickoff (W4)

| Day | Backend | Frontend | QA | DoD |
|---|---|---|---|---|
| W4 Mon | PyInstaller `--onedir` reproducible build | Tauri sidecar spawn + `/health` ping | macOS 14/15 install matrix | Tauri spawns sidecar; `/health` 200 |
| W4 Tue | Order Windows SSL.com OV cert (3-5 day lead) | `.dmg` builder + icon set (3 sizes) | Install/uninstall on clean macOS VM | Unsigned `.dmg` opens |
| W4 Wed | Sidecar graceful shutdown on Tauri exit | Landing hero swap → ASK panel screenshot | Cold-start perf (<3s sidecar ready) | No orphan Python procs after quit |
| W4 Thu | Smoke: full app vs real Gmail | Auto-update channel stub (`latest.json`) | **Signed `.dmg`** via Apple cert | Signed `.dmg` opens on unprivileged Mac |
| W4 Fri | Concierge call #1 prep (10-min demo script) | 3 concierge calls scheduled (W5) | Weekly Red Team replay vs signed build | 3 calls booked |

---

# 📡 API contract (frontend ↔ backend, locked W1 Tue)

Base: `http://127.0.0.1:17831` · All mutations require `X-TRIBOT-Token` HMAC header.

| Method | Path | Notes |
|---|---|---|
| GET  | `/sessions/active` | currently-running agents |
| GET  | `/baseline/status` | `{mode:"learning"\|"armed", days, sessions, cold_start_complete}` |
| POST | `/baseline/arm` | the day-7 ceremony |
| GET  | `/decisions/pending` | open ASK panels |
| POST | `/decisions/{id}/answer` | `{answer, remember:"once"\|"session"\|"never"}` |
| GET  | `/receipts?range=&cursor=` | paginated timeline |
| GET  | `/receipts/{id}` | full JSON + verdict trio |
| GET  | `/policy/list` | current rules (UI hidden v0.1) |
| PUT  | `/policy/{tool}/{verb}` | wired but no UI v0.1 |
| POST | `/panic` | kill all sessions, deny-all |
| GET  | `/events` (SSE) | global event stream |

**SSE events** (existing + new): `run_start`, `tool_call_proposed`, `verdict`, `master_decision`, `ask_user`, `user_answer`, `tool_executed`, `run_done`, `cancelled`, `error`, **`baseline_progress`**, **`policy_changed`**, **`session_started`**, **`session_ended`**.

---

# ⚠️ Cross-stream dependencies (the 5 that gate the schedule)

| # | Blocker | Verify | Fallback |
|---|---|---|---|
| 1 | **API contract locked W1 Tue** | both repos commit same `api-contract.md` hash | FE uses mocked SSE, merge mid-W2 (-3 days) |
| 2 | **DeBERTa ONNX model** W1 Thu | classifies ≥9/10 Lakera PINT samples | Keep keyword as Floor Mode for W1 demo only |
| 3 | **SQLCipher M-series wheel** W2 Mon | `pip install pysqlcipher3` + `PRAGMA cipher_version` | Compile from source (4h) → swap to `sqlean-ciphers` (-1d) |
| 4 | **Apple Developer enrollment** W1→W4 (24-72h) | cert visible in Keychain | Ship unsigned `.dmg` to concierge with README workaround |
| 5 | **Phase 0 + Phase 1 both green** before concierge | acceptance checklists ✓ | Internal dogfood only in W4 if not ready |

---

# 🚨 Risk register

| # | Risk | L×I | Mitigation |
|---|---|---|---|
| 1 | DeBERTa bundle >200MB / >500MB RAM | 3×3=**9** | INT8 quantize; if still fat, optional download post-install |
| 2 | SQLCipher M-series wheel missing | 2×3=6 | Compile-from-source (4h) → `sqlean-ciphers` fallback |
| 3 | Solo-founder burnout | 3×3=**9** | Sustainability rules below; cut Phase 2 scope 50% if triggered |
| 4 | Spike code quality decay | 3×2=6 | Weekly `simplify` pass Sundays; module split at 400 LOC |
| 5 | Anthropic API costs from Haiku tie-breaker | 2×2=4 | Cost monitor W3; raise threshold if >15% escalation |
| 6 | Qwen3 tool-use flakiness in tests | 2×2=4 | Pin tests to Claude; Qwen = Floor Mode only |
| 7 | Phase 0 bleeds into Phase 1 (no clean cut) | 3×3=**9** | **Hard stop: do not start W2 SQLCipher until 3 attacks blocked** |

## 🛑 The "stop everything" trigger

> **Ask-accept rate >80% for 2 days OR Connection FP rate >30% on clean corpus** → stop Phase 1, do not start Phase 2. Threshold-tune for ≤1 week. If still broken → trigger the "reframe to audit+observability" kill criterion.

---

# 🧪 QA strategy

**Test pyramid (Phase 1 end):**
- 40 unit (master synthesis, supervisors, Pydantic, hash math)
- 15 integration (FastAPI + SQLCipher round-trip with fake-LLM fixture)
- 7 redteam (parametrized; runs nightly)
- 3 e2e (happy path + EchoLeak + MCP self-approve race)
- 6 property-based (`hypothesis` for chain invariants)

**Local loop budget:** `<60s` via fake-LLM fixture. CI on Ubuntu Python 3.11+3.12 only.

**Single ready-for-design-partner-1 test:** EchoLeak end-to-end with adversarial MCP race + tamper attempt + latency assertion <1000ms. Green = ship to user #1.

**Dogfood schedule:**
- Daily 5min: `dogfood-journal.md` — tag each ASK `#fp` / `#catch` / `#missed`
- Sunday 20min: review → file issues → update 3 metrics
- **3 metrics gating concierge access:** FP <15% · ASK 3-8/hr · missed=0 (2 weeks consecutive green)

---

# 🚢 DevOps / shipping

**Repo:** private GitHub `ArielShemesh1999/tribot`. Code only. `TRIBOT/` specs stay local.
**Branching:** trunk-based, commit straight to main.
**Commit prefixes:** `feat:` `fix:` `sec:` `chore:` (4 only).

**Files to create W1:**
- `.pre-commit-config.yaml` — ruff (lint+format) + mypy --strict on Pydantic models + pytest fast
- `.github/workflows/ci.yml` — Ubuntu, uv, ruff, pytest --cov-fail-under=80 (<3min)
- `justfile` — `just dev` / `just check` / `just morning`
- `scripts/smoke.sh` — pre-push gate
- `scripts/backup.sh` — nightly `sqlite3 .backup` to `~/OneDrive/tribot-backups/` (14d retention)

**First 1-3 concierge users (W5):** PyInstaller `--onedir` zipped → private GitHub Release. Switch to Tauri the moment user #4 lands or signed `.dmg` is ready.

**Do NOT automate yet:** release pipeline (manual `gh release create`), cross-platform CI matrix (Ubuntu only until Tauri), UI smoke test (manual click daily).

---

# 📅 Weekly checkpoints (demo-able artifacts)

- **W1:** Live screen-recording of 3 Red Team attacks blocked + `pytest -q` green
- **W2:** Terminal — `tribot audit verify` prints `OK 142`, flip byte → `FAIL at row 73`
- **W3:** Loom — poisoned email → DENY → signed receipt JSON exported, 3 days of baseline
- **W4:** Double-click signed `.dmg` on clean Mac → app supervises real Gmail call end-to-end. 3 concierge calls booked

---

# 💀 Kill criteria (unchanged from research)

| Signal | Trigger | Action |
|---|---|---|
| Waitlist | <300 in 30 days | Pivot B2B-only |
| Concierge willingness-to-pay | <3/10 say "I'd pay $19" | Managed-service pivot at $499 |
| WAU (opt-in × 2.5) | <30 at day 60 | Reframe to audit+observability |
| Ask-accept rate | >80% (rubber-stamp) | Baseline broken — fix before next release |

---

# 🛏️ Sustainability rules (22-week marathon)

1. **No code after 21:00.** Evening = retro/reading/rest.
2. **Saturday fully off. Sunday retro only (≤90 min).** Anything urgent on Saturday → `MONDAY.md` until Monday.
3. **Task slips 2 days → cut scope, never the weekend.** Explicit deferrals to v0.2: LLM-judge tie-breaker, Azure Trusted Signing, PDF Receipt Export polish, rule editor UI.

---

# 📌 Daily law

> The next file written in this folder is **code**, not another `.md`.
> If you catch yourself opening `PLAN.md` to add a section — close it. Open `master.py`.

---

## 🎯 What Ariel does **right now**

1. Run Red Team's homoglyph payload against the spike — empirical baseline (5 min)
2. Apply Patch 1 (`master.py` fail-closed) + commit `sec: master fail-closed` (1h)
3. Submit Apple Developer enrollment ($99 — 24-72h pending) (5 min)
4. Resolve Claude/OpenClaw naming + push landing FAQ patch (10 min)

Tuesday: API contract lock with self (write `api-contract.md`).
Wednesday: HMAC patch + Apple cert check.
Thursday: DeBERTa download + smoke.
Friday: Connection swap + Phase 0 acceptance replay.

End of W1 = the spike resists everything Red Team threw at it. Ground floor for Phase 1 is solid.

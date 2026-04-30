# TRIBOT

> **Little Snitch for AI agents.** Desktop app that learns your agent's normal behavior and flags drift. 100% local.

**GA:** 2026-11-15 · **Coherence gate:** 2026-06-17 · **User:** Dana, 34, fractional COO

---

## 🧠 Core idea (non-negotiable)

```
        ┌──────────────────────────┐
        │     🤖 MASTER            │ only executes · cancels · asks
        └────┬──────┬──────┬───────┘
             ↑      ↑      ↑
           ┌─┴──┐┌──┴───┐┌─┴────────┐
           │SOUL││SKILLS││CONNECTION│  3 independent verdicts
           └────┘└──────┘└──────────┘   (allow / flag / deny)
```
Every tool call → 3 supervisors judge → Master synthesizes → execute / ask / cancel → append-only hash-chained log.

---

## ✅ Why now (April 2026, validated)

- **CVE-2025-53773** (GitHub Copilot, CVSS 9.6) — RCE on 100K+ dev machines via prompt injection
- **CVE-2025-32711 "EchoLeak"** (M365 Copilot, CVSS 9.3) — zero-click email → exfil from OneDrive/SharePoint/Teams
- **Wiz Research:** +340% YoY prompt-injection attempts Q4 2025
- **88%** of enterprises breached 2026
- StellarCyber: *"EDR was built for human behavior — an agent that runs code perfectly 10,000 times looks normal to it."* = the gap

---

## 🎯 Positioning — pivot to own it

- ❌ "Governance SDK / EDR for AI agents" → already shipped free (Microsoft AGT, Veto.so, Snyk Agent)
- ✅ **"Little Snitch for AI agents"** — desktop app, 100% local, prosumer $19/mo
- The only defensible wedge: **behavioral baselines over time** (drift), not rule-based per-call

### Answer to every prospect's question
> *"Why not Microsoft AGT or Veto for free?"*
> Those are SDKs for developers. TRIBOT is a desktop app a non-dev installs in one click. It learns *your specific agent's* patterns instead of running a generic rulebook. No telemetry. No cloud.

---

## 🏗️ Architecture — research-validated

| Supervisor | Technique | Validation |
|---|---|---|
| 🧠 **Soul** | Contextual policy + LLM-judge on persona manifest | [PSG-Agent (arXiv 2509.23614)](https://arxiv.org/pdf/2509.23614) |
| 🛠️ **Skills** | UEBA statistical baseline deviation (rolling 7-day `tool × args × sequence`) | [ARMO Intent Drift](https://www.armosec.io/blog/detecting-intent-drift-in-ai-agents-with-runtime-behavioral-data/) |
| 🌐 **Connection** | Prompt-injection classifier on I/O across trust boundaries | [Lakera PINT 97.7%](https://www.lakera.ai/blog/lakera-pint-benchmark) |
| 👑 **Master** | Agent-as-judge voting + Haiku tie-breaker | [CourtGuard (arXiv 2510.19844)](https://arxiv.org/abs/2510.19844) |

**Latency budget** (Nielsen 1s flow): Soul 50ms + Skills 10ms + Connection 200ms + Master 20ms = **~280ms**. Room for 1 Haiku escalation on contested calls, still under 1s.

---

## 🔧 Stack (locked)

- Python + FastAPI + SSE · Claude Agent SDK (`PreToolUse` / `PostToolUse` / `Stop` hooks)
- `AgentRunner` separate process · UDS · `anyio` task groups · `start_new_session=True` + `os.killpg`
- SQLCipher (AES-256, DEK in OS keyring) · HMAC-SHA256 audit chain
- mitmproxy egress allowlist per MCP subprocess
- Tauri 2.0 signed installer · **macOS + Windows only**
- **Claude only** for tool-use; Ollama/OpenAI = text-only Floor Mode

---

## 🛡️ V0.1 scope

- 1 Master + 1 Worker (Inbox) · Gmail MCP stdio · Claude only
- 4 data tables (Soul / Skills / Connections / Policy), 2-layer UI
- PreToolUse hooks: 3 supervisors registered in array, Master synthesizes
- Hash-chained audit + Receipt UI
- Baseline learning: rolling 7-day histogram per agent

---

## 🚫 Cut (drop list)

- Jordan CTO persona · 3-worker v1 · 4-layer UI · multi-provider tool-use
- Hosted v2 / Firecracker · BYO-agent catalog · 10 preinstalled agents
- 6-tier pricing · $499 Business tier · SSO-lite · EU residency · source-code escrow
- "Independently audited" claim · Trail of Bits chip (only after Phase 2)

---

## ⚔️ Competitors (April 2026)

- **Microsoft AGT** — FREE MIT, 10/10 OWASP Agentic, framework integrations shipped ← "why not this?" is every prospect's first question
- **Veto.so** — same pitch, OSS + paid, active on HN ← biggest name-energy clash
- **Snyk Agent (ex-Invariant)** · **HiddenLayer AIDR** ($500+/mo) · **F5 AI Guardrails** (F5/CalypsoAI $180M) — enterprise
- **Capsule Security** ($7M seed 2026-04-15) — "runtime protection for AI agents," near-identical positioning, 48h before our launch window

---

## 📅 Roadmap (22 weeks to GA)

| Phase | Weeks | What |
|---|---|---|
| 0 | 1–4 | Foundations — rename, trademark, legal entity |
| 1 | 2–10 | Legal spine — DPA, ToS, AI Act |
| 2 | 3–14 | Security kernel — mTLS UDS, Trail of Bits audit |
| 3 | 10–16 | First-session UX, receipt viewer |
| 4 | 14–18 | **Gmail MVP** — real Inbox end-to-end |
| 5 | 18–20 | Beta (250 design partners) |
| 6 | 20–22 | GA — Supabase-style launch week at M4 |

---

## 💀 Kill criteria

- **<300 waitlist in 30 days** → pivot B2B-only
- **<3/10 concierge say "pay $19/mo"** → managed-service pivot at $499 floor
- **`tribot-watch` <30 WAU at day 60** → reframe to audit+observability

---

## 💰 Pricing

- **Free** — actually protects (not crippled) · needed for OSS/viral
- **$19/mo solo** · **$9/mo annual** · anchors: Cursor Pro $20 · Claude Pro $20 · Malwarebytes $5

---

## 📢 Launch channels

1. **Show HN** — highest leverage (prior runtime-security agents hit front page)
2. **r/LocalLLaMA + r/ClaudeAI** — exact audience, pre-sold on local
3. **Twitter/X** via Simon Willison · swyx · Pliny — 1 Willison quote > LinkedIn campaign
4. Product Hunt — tail only, weak credibility
5. ⛔ LinkedIn / r/netsec / RSA / Black Hat — skip until team tier

---

## 🛡️ v1 security posture (honest)

**Defends against:** prompt injection via pasted/fetched content · memory poisoning · malicious MCP installs · local data theft · outbound exfil.

**Does NOT claim:** 3rd-party audit · SOC2/ISO · EU DPA · source-code escrow · nation-state coverage · cloud-provider retention guarantees (only ZDR headers where supported).

---

## 🌐 Landing patches needed

- 🔴 Remove `"Independently audited"` chip (L2252) — no audit exists
- 🔴 Remove `brew install tribot-watch` block (L2856) — binary doesn't ship
- 🔴 Remove `"40+ public ClawHub skills"` (L2264) unless GitHub backs it
- 🔴 Remove `"$9/mo gets you hosted"` from FAQ (L2979) — premature pricing
- 🔴 Fix waitlist form `onsubmit="return false;"` (L3025) → real Formspree/Resend
- 🔴 Kill dead footer stubs `Docs/Security/DPA/Changelog/GitHub/Status` (L3061–3066)

Strongest section = Founder letter (L2934–2962) — ships as-is.

---

## 📌 Daily law

No more specs. The next file in this folder is **code**, not `.md`.

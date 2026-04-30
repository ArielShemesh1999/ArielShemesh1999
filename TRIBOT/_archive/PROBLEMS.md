# TRIBOT — Problems Report

> Audit findings from three independent reviewers. Read `TRIBOT.md` + `CONCEPT.md` first. This document catalogues what's wrong *before* we write code; `SOLUTIONS.md` is the matched answer doc.
>
> **Scope:** product-market positioning, technical architecture, UX flow. Security is handled separately in `CYBER-RISKS.md`.

---

## Executive summary

Three reviewers (product strategist, principal architect, senior designer) independently audited the spec. Their verdicts, short:

| Audit | Verdict |
|---|---|
| Product/market | **"Well-designed shell around a fashionable technology — not yet a wedge."** There is no evidence of a real user hiring *"orchestrate my 3 agents"* as a job. Pick one killer worker (Inbox) and ship it as Superhuman-class. |
| Tech architecture | **"Plausible v1 that needs 3 fixes."** Commit to typed SSE framing; add OpenTelemetry from day 1; decide the tool-call-across-providers matrix (Claude-only? or build a LiteLLM shim?). Fix those three and ship. |
| UX/flow | **"Shippable-with-trims."** Rename Policy→Rules and Connections→Tools; collapse surface area (fold `/agents` into `/workers`; fold `/activity` into a drawer); the 4-layer abstraction is 2 layers the user should see. |

**Convergent themes across all three audits:**

1. **Over-abstraction.** "1 Master × 3 workers × 4 layers" is the founder's architecture, not a user's mental model. Zapier won with 2-axis, GPTs with 3. Users need the *what*, not the graph.
2. **Missing persona validation.** No real user has been shown this and paid for it. The product has pivoted three times in a year; there's founder iteration, not customer pull.
3. **First-hit worker matters more than the platform.** Ship Inbox as Superhuman-class, earn the right to sell Worker 2. Ship "a multi-bot platform" and no single job is excellent.

---

## 1. Product/market problems

*From Audit #1 — senior product strategist lens.*

### North-star reframed (buyer's words)

> *"A private command center that runs three of your own AI assistants for you, while you only ever talk to one."*

Translation note: "orchestration," "layers," and "Master" are builder words. A buyer says "assistants," "running for me," "one place."

### The killer user persona

**Dana, 34, fractional COO for 3 SaaS startups.** Home office in Austin. Bills $180/hr, lives in email / Notion / Linear / Slack, entire margin is *time*. At 10:47 am Tuesday she's behind: 62 unread emails across 3 accounts, Linear triage due by noon, board deck to edit, investor warm-intro request. She opens TRIBOT, types *"Triage everything from overnight, keep each company in its own lane."* Three minutes later: 9 cards, five auto-archived, three drafted replies, one flagged "actually urgent." She edits one draft, hits Send, closes the laptop. **That's the value.** A night-shift competent EA. Not a chatbot.

Dana is the only user who buys this at $19/mo tomorrow. Developers already have Claude Code; knowledge workers don't know what Ollama is.

### Top 12 product/market problems

| # | Severity | Problem |
|---|---|---|
| P1 | **EXISTENTIAL** | Positioning is builder-speak. "One Master, three workers, four layers" is an architecture diagram, not a value prop. |
| P2 | **EXISTENTIAL** | Target persona fuzzy — spec implies devs, solopreneurs, and non-tech users simultaneously. Building for all three = no one loves v1. |
| P3 | **SERIOUS** | "Why not just Claude Code?" is unanswered. Power users already get sub-agent-as-tool, MCP, skills, hooks in Claude Code. |
| P4 | **SERIOUS** | Arbitrary cardinality. Why exactly 3 workers, 4 layers? Designer's constraint, not user's need. The moment a user wants 5 workers, the thesis breaks. |
| P5 | **SERIOUS** | "Soul / Skills / Connections / Policy" won't survive a user's brain. 4-axis abstractions have never scaled (Zapier = 2, GPTs = 3). |
| P6 | **EXISTENTIAL** | Anthropic is the competitor. A "multi-agent console" tab in claude.ai in the next 6 months erases the whole wedge. |
| P7 | **SERIOUS** | BYO-key + $19 shell is a thin moat. Raycast/Warp/Superhuman/Cursor all bundle tokens. Double-friction pricing loses. |
| P8 | **SERIOUS** | No free tier = no acquisition. §7.6 "graceful floor" is the instinct but not priced. Needs a forever-free local single-worker mode. |
| P9 | **SERIOUS** | Local-first stack is a self-imposed tax. Python 3.11 + uv + Ollama + `npm run dev` loses 95% of the ICP before the magic moment. |
| P10 | **SERIOUS** | No evidence of real users. Trading → automation → orchestration pivot in <12 months = builder iterating on interesting tech, not customer pain. |
| P11 | **WATCH** | Names don't communicate. "TRIBOT" locks in arbitrary 3; "OPENCLAW" is a placeholder. The genre is Shortwave/Mem/Granola, not Transformers. |
| P12 | **SERIOUS** | "Orchestration" as a category already lost once (LangChain = $25B in dev-infra, not end-user seats). End-user orchestration is unproven. |

### Three founder questions for this week (before more code)

1. **Name 10 real people who will pay $19/mo in month one, and what did 3 of them say when you showed them the Figma?** Without that, §7's "magic moment" is theater.
2. **If Claude.ai launches "Agents" as a left-nav item next quarter, what is TRIBOT's answer besides better visual design?** If the answer is "prettier shell," that's a feature, not a company.
3. **Why 3 workers and 4 layers — would users buy with 1 worker and 2 layers?** If yes, ship that. The spec is 3× the complexity of the MVP that actually tests demand.

---

## 2. Technical architecture problems

*From Audit #2 — principal architect lens.*

### The 3 places this breaks first in practice

1. **MCP stdio subprocess sprawl under `asyncio.gather`.** Master fan-out to 3 workers × 2 MCP stdio servers = 6 concurrent child processes contending for FDs. `task.cancel()` doesn't kill children — the asyncio task dies, the subprocess keeps running. §6.2's "allowlist + timeout" won't save you from the zombie pool.
2. **SSE ordering when Master streams tokens while worker delegation events arrive.** Single channel + `asyncio.gather` yields non-deterministic interleaving. The UI's `DelegationBubble` → `ProgressStreamingBubble` tree assumes causal order the transport does not promise.
3. **SQLite writer contention at delegation-log flush + FTS5 rebuild during an active stream.** WAL helps reads, not writers. A single synchronous `INSERT` blocks the event loop long enough to jitter SSE cadence. At 2–3 parallel workers writing tool-call traces simultaneously: `SQLITE_BUSY`.

### Top 12 technical problems

| # | Severity | Problem |
|---|---|---|
| T1 | **BLOCKER** | Claude Agent SDK assumes it *is* the loop owner. Embedding inside a FastAPI request handler + it spawning its own MCP stdio children = two subprocess supervisors, neither knows the other's PID table. |
| T2 | **BLOCKER** | LiteLLM normalizes OpenAI-shape tool calls; Anthropic's multi-block `tool_use` / `tool_result` + `cache_control` + prompt-caching headers leak through. Tool-using workers cross-provider = shape mismatches. |
| T3 | **SERIOUS** | Single SSE channel carries Master token stream + worker delegation events without typed framing (`event:` field) or monotonic `id:`. UI ordering = hope. |
| T4 | **SERIOUS** | `BotReference.protocol` URI scheme honest for MCP + Managed Agents, **dishonest** for `claude-agent-sdk+file://` (that's a loader, not a wire protocol) and `openai-agent://` (adapter shape). |
| T5 | **SERIOUS** | Editing a Skill mid-invocation — spec says worker state is in-memory, but `gray-matter.stringify` could partially write while `asyncio.gather` is in flight. Needs copy-on-read at invocation start. |
| T6 | **SERIOUS** | Claude Agent SDK subagents isolate context but share the parent's MCP connections. Managed Agents get their own server-side tool pool. The unified "worker" abstraction hides real lifecycle asymmetry. |
| T7 | **SERIOUS** | `asyncio.gather` cancellation: worker B/C tasks don't auto-cancel when A errors; subprocess children aren't killed by `task.cancel()` alone. The `[Stop]` button won't stop cleanly. |
| T8 | **WATCH** | "Max 2 blur plates visible" isn't component-enforceable. Two sibling L1 surfaces in different portals silently break the rule. Need build-time lint + runtime viewport counter. |
| T9 | **WATCH** | Hosted v2 seam ignores session identity (SDK's `session_id` is process-local; remote needs server-issued) and stdio→HTTP back-pressure (stdio is synchronous byte pressure; SSE has none). "Mechanical swap" is not mechanical. |
| T10 | **WATCH** | Anthropic's official Skills (17 of them) are authored for Claude Code's tool registry (`Bash`, `Edit`, `Read`). Wiring as TRIBOT worker Skills = re-implement that registry or fail silently. Real impedance. |
| T11 | **WATCH** | No trace ID linking Master turn → worker delegation → MCP tool call → LiteLLM → provider. "Master mis-summarized Worker A's tool result" is archaeology without OTel spans from day 1. |
| T12 | **WATCH** | SQLite WAL checkpoint under SSE-while-writing-delegations gives 10–40 ms stalls. The 180 ms entry spring misses its budget. |

### Three under-justified architectural bets

1. **"Single asyncio process is enough"** (§6.3) — no load estimate. 3 workers × 2 MCP children = 6+ subprocesses + one event loop. Either measure, or pre-commit to `anyio` task groups + supervisor process.
2. **"LiteLLM abstracts Claude/OpenAI/Ollama uniformly enough"** (§6.2) — true for text completion; false for tool-use block semantics, `cache_control`, streaming shape. Declare v1 matrix explicitly.
3. **"`BotReference` with scheme-as-protocol covers all"** (§4.3) — covers *addressing*, not *lifecycle*. One type, three lifecycles (spawn/kill, session+version, loader). Either split or admit.

### The 5 seams v1→v2 depends on

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (React 19 + Vite 8)                                 │
└───────────────▲─────────────────────────────────────────────┘
                │  SEAM 1: SSE transport — typed events + id:
                │          (ONLY client↔server wire)
┌───────────────┴─────────────────────────────────────────────┐
│ FastAPI routes (thin — no business logic)                   │
│                                                             │
│   SEAM 2: AgentRunner interface                             │
│     run(task) -> AsyncIterator[Event]                       │
│     v1: InProcess (Claude Agent SDK)                        │
│     v2: Remote    (HTTP/WS to Firecracker VM)               │
│                                                             │
│   SEAM 3: LLMClient wrapper                                 │
│     chat(msgs, tools, stream) -> AsyncIterator[Delta]       │
│     v1: LiteLLM    v2: BYO-key proxy / hosted tokens        │
│                                                             │
│   SEAM 4: VFS + secret:// resolver                          │
│     read/write(uri), resolve("secret://...")                │
│     v1: localfs + OS keyring   v2: S3/R2 + KMS DEK          │
│                                                             │
│   SEAM 5: BotReference registry                             │
│     resolve(ref) -> Spawned | Remote | Loaded               │
│     (split lifecycle — do not unify)                        │
└─────────────────────────────────────────────────────────────┘
```

Keep every SDK import, every `open()`, every secret string, every LLM call behind those five seams. Anything that reaches around is migration debt.

### v1 shippability estimate

One engineer, full-time, localhost, 1 worker, 1 MCP stdio, 1 model: **6–9 weeks**. Full §10 spec (BYO-agent catalog, drift, policy, 10-agent catalog, first-run polish): **14–18 weeks**. §12 checklist's 10 steps are weeks each, not days.

### Three non-negotiable pre-code decisions

1. **Commit to typed SSE framing** (event + id + causal parent) or two channels. Retrofit is ugly.
2. **OpenTelemetry spans day 1**, not v2. Spec says "v2" — wrong.
3. **Tool-calling matrix**: declare "v1 tool-use is Claude-only; Ollama+OpenAI are text-only workers" OR budget 2–3 weeks for a LiteLLM shim with tests. Don't ship the ambiguity.

---

## 3. UX / flow problems

*From Audit #3 — senior designer lens.*

### The top 5 moments the user quietly closes the tab

| # | Moment | Rescue |
|---|---|---|
| U1 | 0:30 of first-run, Master speaks but user doesn't know if they're reading a demo or installing an app | Add a "Continue" button with step indicator "1/3" |
| U2 | The one diagnostic question + one inferred worker — if the inference is wrong, no cheap escape | Show two proposals + "Neither" option (Linear pattern) |
| U3 | First `allowed-tools: ["..."]` YAML box in Skill editor — non-technical user sees brackets and quits | Render frontmatter as chips + "View raw" toggle |
| U4 | Third red BLOCK modal from the paste scanner on legitimate code comments | Target <0.5% BLOCK FPR, not 2%. CAUTION is the workhorse |
| U5 | Three workers running parallel at 8s each with Orchestration drawer closed | Pin compact "3 running · Writer 2s left" strip above composer |

### Top 12 UX problems

| # | Severity | Problem |
|---|---|---|
| U-A | Confusing | **"Policy"** is the wrong word. Users read "terms of service." Rename **Rules** or **Guardrails**. |
| U-B | Confusing | **"Connections"** is ambiguous. Reads as contacts/people. Rename **Tools** or **Integrations** (Raycast, Zapier). |
| U-C | Confusing | Four-layer model is progressive-revealed but never *named on screen* until needed. No mental model when Skills appears in friction. Needs a one-screen skippable tour. |
| U-D | Friction | Master-only chat delegation breaks at N=3 parallel. Up to 10 elements per turn = reads as Slack. Group-by-turn + single expand (Linear pattern). |
| U-E | Friction | Catalog install step 3 (assign to layer slot) = consent fatigue wins. Auto-assign from `layer` field; allow override. |
| U-F | Confusing | Paste scanner BLOCK + "Paste anyway" + "I understand" = UAC-class. One checkbox OR one button, never both. |
| U-G | Friction | Skill editor's frontmatter + CodeMirror split is devs' intuitive, non-devs' alien. Need Simple/Advanced toggle. |
| U-H | Fit-and-finish | Too many surfaces for v1. Fold `/agents` into `/workers`. Fold `/activity` into a drawer. Cursor ships *one* sidebar. |
| U-I | Confusing | No systematic error presentation rule. Six error classes, six treatments. Adopt: *every error speaks in Master's voice, inline, concrete next action.* (Warp pattern) |
| U-J | Friction | "Morning briefing" opt-in flow undefined. Notification timing, frequency ceiling, off-switch location. User feels trapped. |
| U-K | Fit-and-finish | §28.5 state matrix is chrome-only. Missing: `DelegationBubble`, `ProgressStreamingBubble`, `ResultBubble`, `OptimizationHint`, catalog card, Skill editor frontmatter row, scan-result banner. |
| U-L | Friction | Hebrew/RTL is not "future" — it's two weeks out. `dir="rtl"` handling in the three-column shell, mirroring, reversed delegation blocks. Bake now; free before ship, expensive after. |

### The single most important simplification

**Collapse 4 layers → 2 on the primary UI.** Data model keeps 4 (Soul / Skills / Connections / Policy). **UI shows 2: "Who it is" (Soul) and "What it can do" (Skills + Connections + Policy merged as a single capability list with per-item permission flags).** Users don't think "this is a Connection, that is a Policy." They think "Gmail, read-only, never on weekends." Raycast pattern: one "Extension" surface, many things underneath.

### Redesigned first-run — 6 bullets

1. **0:00–0:15.** Black → logo → one Continue button. No orb monologue.
2. **0:15–0:45.** "Pick the one thing you'd hand off first." Three big cards: Inbox / Calendar / Code. One tap.
3. **0:45–1:30.** Native OAuth popup for the chosen source. Skippable → "Try with sample data."
4. **1:30–2:15.** Master appears in place (top-left) with a real, named result: "Found 3 emails worth your attention." Cards render.
5. **2:15–2:45.** First action: Archive / Reply / Snooze on one card. Master confirms inline. **Magic moment.**
6. **2:45–3:00.** One dismissible card: "I can do this every morning. [Turn on] [Not yet]." Morning-briefing consent captured in-context.

Cuts: orb monologue, free-text diagnostic, the three "I could be your…" whispers, auto-proposed Soul slider. 180s → 120s with one less decision.

---

## 4. Convergent findings (high-confidence priorities)

Issues independently flagged by ≥2 audits are the strongest signal.

| # | Flagged by | Convergent fix |
|---|---|---|
| X1 | P5 + U-A + U-B + U-C | **4-layer abstraction is too much surface.** Rename (Rules/Tools), collapse UI to 2 (data model keeps 4). |
| X2 | P2 + P9 + U-L | **Target persona fuzzy.** Pick Dana-type knowledge worker; drop the "developer DX" angle; bake RTL + English-only UI now so Hebrew founder can use it. |
| X3 | P4 + P8 + U-H | **Over-scoped for v1.** Ship one worker (Inbox) excellent; fold `/agents` into `/workers`; drop sandbox as a first-class page. |
| X4 | T3 + T11 | **Observability debt.** Typed SSE + OpenTelemetry from day 1 — both demanded by architecture audit, both needed for UX debugging (U-I). |
| X5 | T1 + T6 + T10 | **Claude Agent SDK embedding is the load-bearing assumption.** Needs concrete prototype before committing the spec. |
| X6 | P10 + U1 | **No user has seen this.** First-run choreography + Figma-grade mock demo to 10 real people before coding. |

---

## 5. Shipping gates — what the spec must answer before any code

Before writing line 1 of production code, the spec must add:

- [ ] A revised positioning paragraph in buyer's words.
- [ ] A single named killer persona + their day-in-the-life scenario.
- [ ] A commitment: **v1 ships with 1 worker (Inbox), not 3.** 3 workers = v2 milestone.
- [ ] A 2-layer UI model with the 4-layer data model hidden behind it.
- [ ] Renames: **Policy → Rules, Connections → Tools**. Find-and-replace across the spec.
- [ ] Typed SSE event schema with `id:`, `parent_id:`, `type:` fields.
- [ ] OpenTelemetry span contract: Master turn → worker invocation → MCP tool call → LLM call.
- [ ] Tool-calling matrix: Claude-only in v1, or explicit LiteLLM shim budget.
- [ ] A prototype of Claude Agent SDK embedded inside FastAPI with one MCP stdio child surviving a cancellation.
- [ ] State matrix (§28.5) filled in for every product component, not just chrome.
- [ ] RTL direction-awareness in the shell CSS (`margin-inline-*`, `flex-row-reverse` on `[dir=rtl]`).
- [ ] First-run choreography cut to 6 steps per §3 above.

---

## 6. Verdict

**The spec is a 70%-done product proposal with 30%-done evidence of demand.**

The craft is real (Liquid Glass, gemstone accents, delegation-bubble UX, prompt-injection defense). The architecture is defensible with three fixes. The UX is cohesive with three renames.

What's missing is evidence that *orchestration of 3 workers with 4 layers* is a job any specific person is hiring for. The user hires software to triage their inbox — "orchestrate my agents" is the plumbing, not the outcome.

**Honest path:** pick Inbox as the first worker. Ship it as a Superhuman-class product for $19/mo. Earn the right to sell "a second worker" as expansion revenue. A multi-bot platform *without* a first hit bot is LangChain with a better font. A first hit bot that grows into a multi-bot platform is Superhuman → Replit Agent.

*Choose the second path.*

# SOLUTIONS.md

> Concrete answers to every finding in `PROBLEMS.md`. Security is out of scope (see `CYBER-DEFENSE.md`). Each solution is marked **HARD** (pre-code), **SHOULD** (v1 target), or **DEFER** (post-v1 + tracking issue), with an hour estimate and any spec sections touched.

---

## 1. Product/market fixes

- **P1 → Rewrite the thesis in buyer's words.** Replace CONCEPT.md §0 and §1.2 opening line with: *"A private command center that triages your inbox overnight, and grows into your other work when you're ready."* Delete "one Master, three workers, four layers" from any buyer-facing surface — keep that language only in internal architecture docs. README.md first paragraph mirrors the new thesis. [HARD · 2-4h · edits CONCEPT.md §0, §1.2, §13, README]
- **P2 → Commit to Dana as the single ICP.** Add §0.5 "The user" to CONCEPT.md naming Dana (fractional COO, 34, 3 SaaS startups, $180/hr, Austin) verbatim from PROBLEMS.md §1. Delete every reference to "devs," "Claude Code users," "power users" from CONCEPT.md. All v1 copy, onboarding, and catalog curation is sanity-checked against "would Dana understand this?" [HARD · 2-4h · edits CONCEPT.md §0.5 new, §1.3, §7]
- **P3 → Answer "why not Claude Code" in CONCEPT.md §0.6.** One paragraph: *"Claude Code is an IDE for developers. TRIBOT is an inbox, calendar, and drafts assistant for non-developers. If you already live in a terminal, use Claude Code. If you live in Gmail, use this."* Positioning is by audience, not feature. [HARD · 1h · adds CONCEPT.md §0.6]
- **P4 → Drop "exactly 3 workers, 4 layers" as a product claim.** Data model allows N workers; v1 ships with 1 (Inbox) active slot + 2 empty "coming soon" slots. The cap is a UI pacing choice, not a thesis. Rewrite CONCEPT.md §1.1 to say *"one Master and up to three workers at launch."* Resolved jointly with **X3**. [HARD · 1h · edits CONCEPT.md §1.1, §1.2, §10]
- **P5 → Collapse four layers to two in UI (see X1).** Data model keeps Soul/Skills/Connections/Policy per §2. UI shows "Who it is" (Soul) and "What it can do" (merged Skills + Tools + Rules list with per-item permission flag). One fix resolves P5 + U-A + U-B + U-C. [HARD · 1d · edits CONCEPT.md §2, §10 pages list]
- **P6 → Moat is workflow memory, not orchestration.** Add CONCEPT.md §0.7: the defense against Anthropic's eventual "Agents tab" is (a) cross-account inbox + calendar + Linear triage in one view (Anthropic won't build Gmail OAuth), (b) persistent per-user workflow memory via `worldstate.md` + delegation log, (c) BYO-key privacy posture. If Anthropic ships a prettier shell, our answer is *integrations + memory*, not *visuals*. [SHOULD · 2-4h · adds CONCEPT.md §0.7]
- **P7 → Pricing: BYO-key $15/mo + Hosted-tokens $49/mo.** Lock pricing now in CONCEPT.md §17.2 and on the landing page. Delete "$19 shell" ambiguity. The hosted-tokens tier is what closes non-technical Dana; the BYO-key tier is the privacy moat. One dedicated `/pricing` page ships at v1. [HARD · 2-4h · edits CONCEPT.md §17.2, adds landing §pricing]
- **P8 → Forever-free "Floor Mode."** Promote CONCEPT.md §7.6 from paragraph to product tier: *local single-worker (Inbox), Ollama-only, unlimited, no credit card.* This is the acquisition top-of-funnel. Upgrade prompt fires on second worker or cloud-model request. [SHOULD · 1d · edits CONCEPT.md §7.6, §17.2]
- **P9 → Ship a signed installer for v1, not `uv run`.** Cut CONCEPT.md §6.1 "Distribution" — v1 ships as a **single Tauri 2.0 installer** bundling Python runtime + Ollama download-on-first-run + frontend. `npm run dev` is developer-only. Brings the magic-moment-to-first-run under 3 minutes for non-devs. Resolves P9 + directly unblocks Dana. [HARD · 2-5d · edits CONCEPT.md §6.1, §10]
- **P10 → Show a Figma-grade mock to 10 Danas before writing code.** Build a clickable Figma prototype of the first-run §7 script and the first delegation. Record 10 sessions; target: 7/10 say "yes I'd pay." Convergent with **X6**. Tracking issue: `research/dana-10`. [HARD · 1w+ · no spec edit, gate to start code]
- **P11 → Rename the product: "Tribot" → drop; working name "Mast" (one Master) or "Overshift."** "TRIBOT" locks in arbitrary 3 + sounds like Transformers. Pick a name in the Shortwave/Mem/Granola genre. Parking this as a HARD pre-code decision; do not ship beta under "TRIBOT." [HARD · 4h naming sprint · renames throughout CONCEPT.md, TRIBOT.md]
- **P12 → Category: "AI inbox triage" not "orchestration."** Landing page H1 is *"An inbox that triages itself overnight."* "Orchestration" stays in the internal architecture doc and never appears in buyer surfaces. Same fix framing applies to X3. [HARD · 1h · landing copy, CONCEPT.md §0 title]

## 2. Technical architecture fixes

- **T1 → Supervisor process owns MCP children, not the SDK.** Wrap Claude Agent SDK in an `AgentRunner` process (separate from FastAPI) communicating over UDS. The supervisor maintains a PID table of every MCP stdio child; FastAPI cancellation → supervisor → `os.killpg` of child process group. Enforce `start_new_session=True` on every `create_subprocess_exec`. Resolves T1 + T7 (cancellation) + partial T5. [HARD · 2-5d · adds CONCEPT.md §3.8 "Supervisor"]
- **T2 → v1 tool-calling matrix: Claude-only.** Declare in CONCEPT.md §6.2: *"Only Anthropic models support tool-use in v1. Ollama and OpenAI are text-only fallbacks for Floor Mode and degraded paths."* Delete LiteLLM tool-call translation from critical path. LiteLLM stays as a text-completion router. Revisit for v2. [HARD · 1h · edits CONCEPT.md §6.2, §6.5, §11]
- **T3 → Typed SSE framing with `event:`, `id:`, `parent_id:`.** Define one schema in CONCEPT.md §5.0 new: events are `master.token`, `master.delegation.start`, `worker.tool_call.start|end`, `worker.summary`, `run.done|error`. Every event has monotonic `id`, a `parent_id` for causal ordering, and a `seq` per-worker. Client reassembles via `parent_id`. No ambiguity. Resolves T3 jointly with X4. [HARD · 1d · adds CONCEPT.md §5.0 SSE schema]
- **T4 → Split `BotReference` into three types.** Rewrite CONCEPT.md §4.3: `SpawnedBot` (mcp stdio + agent-sdk file — has lifecycle), `RemoteBot` (mcp https + managed-agent — has session), `LoadedBot` (soul markdown, openapi — pure spec). Union type for storage, branded types at call sites. `protocol` field stays, but lifecycle is the discriminator. [HARD · 1d · rewrites CONCEPT.md §4.3, §9 `bot_references` table]
- **T5 → Copy-on-read at invocation start.** In `AgentRunner.run(task)`, first step is `snapshot = load_worker_config(worker_id)` — a deep copy. Mid-invocation edits hit `workers` table but not the running task. Resolves T5. Enforced by interface: `run(worker_snapshot: WorkerSnapshot)` takes a frozen dataclass, never a live ref. [HARD · 2-4h · edits CONCEPT.md §3.3]
- **T6 → Stop hiding lifecycle asymmetry.** Add CONCEPT.md §3.2.1: each worker declares `runtime: "subagent" | "managed"`. Subagent workers share MCP pool with Master; Managed workers are sealed. UI shows a small lock icon on Managed workers. Tool registry merge (§2.5) runs only for subagent. Resolves T6 jointly with T4. [HARD · 2-4h · edits CONCEPT.md §3.2, §2.5]
- **T7 → Structured cancellation via anyio task groups.** Replace `asyncio.gather` in §3.5 with `anyio.create_task_group()`. On `[Stop]`, task group cancel triggers supervisor (T1) to kill MCP child process groups. Test: canned 20-second sleep subprocess cancels in < 500 ms. [HARD · 1d · edits CONCEPT.md §3.5]
- **T8 → Build-time ESLint rule + runtime viewport counter for blur plates.** Custom ESLint rule: any component rendering `backdrop-filter: var(--lg-blur-*)` must be wrapped in `<BlurPlate />`. `BlurPlate` increments a Zustand counter on mount, dev mode throws if count > 2. Ships in the frontend infra before any L1 component lands. [SHOULD · 2-4h · TRIBOT.md §5 addendum]
- **T9 → Declare hosted migration non-mechanical, plan session identity now.** Add CONCEPT.md §17.6.1: v1 sessions carry an opaque `session_id: uuid` issued by the supervisor (T1) at thread start — not the SDK's in-process id. Stdio back-pressure is simulated in v1 by a bounded `anyio.Queue(maxsize=64)` so v2 HTTP swap matches the blocking shape. [HARD · 2-4h · edits CONCEPT.md §17.6]
- **T10 → Official Skills get a `ClaudeCodeToolShim`.** Ship one shim module in v1 that implements `Bash`, `Edit`, `Read`, `Write`, `Grep`, `Glob` against our subprocess sandbox + VFS. Anthropic's 17 Skills (pdf, docx, xlsx, skill-creator, webapp-testing) use it directly. Without the shim, they fail silently. Document as CONCEPT.md §16.7.1. [HARD · 2-5d · adds CONCEPT.md §16.7.1, §4.4]
- **T11 → OpenTelemetry from day 1.** Add `opentelemetry-sdk` + `opentelemetry-exporter-otlp` to §6.1 dependencies. One root span per Master turn; child spans for delegation, MCP tool call, LiteLLM request. Local OTLP collector → SQLite `spans` table for v1 (ClickHouse in v2). Every SSE event carries `trace_id`. Resolves T11 jointly with X4. [HARD · 1d · edits CONCEPT.md §6.1, adds §3.9]
- **T12 → WAL checkpoint off the hot path.** Set `PRAGMA wal_autocheckpoint=0` in the app connection; run `PRAGMA wal_checkpoint(PASSIVE)` on a 30-second background `asyncio` task, never during SSE streaming. Delegation writes go to an `anyio.Queue` drained by a single writer task (serializes SQLite, removes `SQLITE_BUSY`). Resolves T12 jointly with the underlying §3.3 concern. [SHOULD · 1d · edits CONCEPT.md §3.3]

## 3. UX / flow fixes

- **U-A → Rename "Policy" to "Rules" everywhere.** Find-and-replace in CONCEPT.md, TRIBOT.md, schema fields kept as `policy_yaml` internally but all UI strings + table headers read "Rules." Resolved jointly with **X1**. [HARD · 2-4h · spec-wide rename]
- **U-B → Rename "Connections" to "Tools."** Same sweep; schema `connections_json` stays internal; UI string "Tools." Resolved jointly with **X1**. [HARD · 2-4h · spec-wide rename]
- **U-C → "What this is" one-screen skippable tour.** One full-screen card in first-run (before §7.1 cold open): *"Your Master runs workers. Workers have a personality (Soul) and abilities (Tools). That's it."* Two illustrations, one Continue, one Skip. Add to CONCEPT.md §7.1 as step 0. Resolved jointly with **X1**. [SHOULD · 1d · edits CONCEPT.md §7.1]
- **U-D → Group-by-turn in the Master chat.** `DelegationBubble` (CONCEPT.md §5.3) becomes a single parent container for all workers invoked in one Master turn. Children collapse to a 1-line strip (`Research · Writer · Calendar · done in 4.2s`). One expand reveals all. Max 3 expanded simultaneously; further collapse automatically. [SHOULD · 1d · edits CONCEPT.md §5.3]
- **U-E → Auto-assign catalog installs to layer slots.** Catalog entries (CONCEPT.md §16.2 card) carry a `layer` field (already present). Install flow step 3 skipped — entry routes to the only compatible slot. Multi-slot items show one-line chooser, never full "pick a layer" modal. [HARD · 2-4h · edits CONCEPT.md §16.2]
- **U-F → Collapse BLOCK UI to a single "Paste anyway" button.** Delete the "I understand" checkbox from CONCEPT.md §15.2 table. Red banner + highlighted offending text + one confirmed-click button. Log override as before. [HARD · 1h · edits CONCEPT.md §15.2]
- **U-G → Simple/Advanced toggle in Skill editor.** CONCEPT.md §14.2 editor gets a default "Simple" view: frontmatter fields only + a body textarea labelled "Instructions." Advanced reveals the CodeMirror 6 body with frontmatter chips. Same file underneath. [SHOULD · 1d · edits CONCEPT.md §14.2]
- **U-H → Collapse surfaces to 3 pages.** Cut `/agents` — it becomes a tab inside `/workers`. Cut `/activity` — it becomes a right-side drawer toggled from any page. v1 navigation: `/` (Home/chat), `/workers` (with Agents tab), `/settings`. Resolved jointly with **X3**. [HARD · 2-4h · edits CONCEPT.md §10 pages list]
- **U-I → Master's voice is the universal error surface.** Every error class — SDK failure, MCP timeout, policy block, scanner BLOCK, rate limit — appears as an `ErrorBubble` (§5.3) in the Master's voice with one concrete next action. Delete bespoke error modals. Exception: settings/install errors stay as toasts. [HARD · 1d · edits CONCEPT.md §5.3, TRIBOT.md §28.5]
- **U-J → Morning briefing: consent captured inline, one-switch off.** First day-1 completed delegation triggers inline card: *"Want this every morning at 8am? [Yes] [No, thanks]."* Settings page surfaces a single "Morning briefing" switch + time. Frequency cap: 1/day. No notifications unless opted in. Add to CONCEPT.md §7.5. [SHOULD · 1d · edits CONCEPT.md §7.5, §6 settings]
- **U-K → Finish the state matrix for every product component.** Extend TRIBOT.md §28.5 matrix to include: `DelegationBubble`, `ProgressStreamingBubble`, `ResultBubble`, `OptimizationHint`, catalog card, Skill editor frontmatter row, scan-result banner, ErrorBubble. States for each: `idle, loading, streaming, success, error, empty, disabled`. Pre-code gate. [HARD · 1d · edits TRIBOT.md §28.5]
- **U-L → Bake RTL direction-awareness now.** CSS uses `margin-inline-*`, `padding-inline-*`, `flex-direction: row-reverse` under `[dir="rtl"]`. Three-column shell mirrors; delegation bubbles mirror their left border to the right. Shell is authored RTL-capable in week 1, not retrofitted. English-only copy for v1 — direction mechanics are free if done now. [HARD · 2-4h · TRIBOT.md §7, §8, §25]

- **U1 → Add "1/3" step indicator + Continue button to first-run cold open.** CONCEPT.md §7.1 step 0 shows the tour from **U-C**; each subsequent step shows `[1/3]`, `[2/3]`, `[3/3]` top-center with a Continue button bottom-right. Deletes the silent orb monologue. [SHOULD · 2-4h · edits CONCEPT.md §7.1]
- **U2 → Linear-style two-proposal + "Neither" for worker inference.** After the one diagnostic question, Master shows two candidate worker configs side-by-side ("Inbox for Gmail triage" / "Calendar for scheduling") + a "Neither — I'll describe it" escape. No single-path inference. Edits CONCEPT.md §7.1 "1:00–2:00." [SHOULD · 1d · edits CONCEPT.md §7.1]
- **U3 → Render `allowed-tools` frontmatter as chips with "View raw" toggle.** In the Skill editor (CONCEPT.md §14.2), list-typed frontmatter fields render as chip multi-selects sourced from the installed Tools registry. "View raw" switches to YAML text. Non-technical users never see brackets by default. Resolved jointly with **U-G**. [SHOULD · 1d · edits CONCEPT.md §14.2]
- **U4 → Tune scanner to BLOCK FPR < 0.5%, CAUTION is the workhorse.** Edit CONCEPT.md §15.4: BLOCK target **< 0.5%** (was 2%). Move most phrase matches and base64 heuristics into CAUTION tier. BLOCK reserved for: zero-width bidi attacks, tool-call forgery tokens, Skill schema violations. Ship with a fixture corpus of 200 benign pastes + 50 attack pastes; measure before first release. [HARD · 1d · edits CONCEPT.md §15.4, adds fixture corpus]
- **U5 → Pin a compact running-strip above the composer.** When ≥1 worker is running with the Orchestration drawer closed, a 28-px pinned strip sits above the composer: `3 running · Writer 2s left · [Stop all]`. Click → opens drawer. Add to CONCEPT.md §5.3 as new component `RunningStrip`. [SHOULD · 2-4h · edits CONCEPT.md §5.3]

## 4. Convergent findings — unified fixes

- **X1 → "Two-layer UI, four-layer model" (resolves P5 + U-A + U-B + U-C).** UI surfaces two concepts: **Soul** ("Who it is") and **Abilities** ("What it can do"). Abilities is a single flat list merging Skills + Tools + Rules items, each row a capability with a per-item permission flag (`ask-first`, `allow`, `never`). Data model keeps four tables unchanged; Abilities view is derived. Renames Policy → Rules, Connections → Tools spec-wide. Skippable one-screen tour explains the model. CONCEPT.md §2 gains §2.0 "The user-visible model." [HARD · 2-5d · edits CONCEPT.md §2, §10]

- **X2 → "Dana is the user; bake RTL; drop developer angle" (resolves P2 + P9 + U-L).** Single ICP = Dana (P2). Signed Tauri installer, not `uv run` (P9). English copy only, but direction-aware CSS from day 1 (U-L). Developer/BYOK power-user framing moves to a v2 "Advanced" toggle. [HARD · 2-5d · composite of P2, P9, U-L solutions]

- **X3 → "Ship one worker, three pages" (resolves P4 + P8 + U-H).** v1 ships with **Inbox** as the only configured worker; other two slots are placeholders. Nav collapses to 3 pages: `/`, `/workers`, `/settings` (Activity = drawer, Agents = tab inside Workers). Floor Mode is a first-class tier (P8). [HARD · 1d · edits CONCEPT.md §10, §1.1]

- **X4 → "Typed SSE + OpenTelemetry + Master-voice errors" (resolves T3 + T11 + U-I).** One observability stack: typed SSE events carry `trace_id`; OTel spans instrument Master turn → delegation → MCP tool → LLM; error handling reads the latest failed span and renders it as an `ErrorBubble` in Master's voice with one next action. One infrastructure fix; three problems resolved. [HARD · 2-5d · CONCEPT.md §3.9, §5.0, §5.3]

- **X5 → "Prototype Claude Agent SDK + FastAPI + MCP cancellation before spec lock" (resolves T1 + T6 + T10).** One-week spike: FastAPI route spawns Claude Agent SDK worker with one MCP stdio child; receive `/cancel`; verify child process group dies; verify Anthropic `pdf` Skill runs via `ClaudeCodeToolShim`. Gate for spec commitment. Tracking issue `prototype/sdk-embed`. [HARD · 1w+ · blocks §3, §4 spec finalization]

- **X6 → "10 Dana interviews on Figma prototype before line 1 of code" (resolves P10 + U1).** Pair with X5 timeline. Figma covers: cold open, tour (U-C), diagnostic question, two-proposal inference (U2), first delegation, magic moment, morning-briefing opt-in. Success: ≥7/10 say "yes I'd pay $15" and ≥5/10 complete the flow without confusion. [HARD · 1w+ · gate to start implementation]

## 5. The pre-code "done list"

Spec must contain all of the below before any production code is written. Replaces PROBLEMS.md §5.

- [ ] **Positioning paragraph rewritten** in Dana's words — P1, X2.
- [ ] **Dana added to CONCEPT.md §0.5** as the sole ICP — P2, X2.
- [ ] **"Why not Claude Code" answer** in CONCEPT.md §0.6 — P3.
- [ ] **v1 ships 1 active worker (Inbox), 3 UI slots, 3 pages** — P4, X3, U-H.
- [ ] **Two-layer UI / four-layer data** model specified in CONCEPT.md §2.0 — X1, P5.
- [ ] **Renames Policy→Rules, Connections→Tools** completed spec-wide — U-A, U-B, X1.
- [ ] **Typed SSE event schema** with `id` / `parent_id` / `event:` — T3, X4.
- [ ] **OpenTelemetry span contract** documented, v1-default — T11, X4.
- [ ] **Tool-calling matrix: Claude-only in v1** — T2.
- [ ] **Supervisor process + `ClaudeCodeToolShim` prototype** validated — T1, T6, T7, T10, X5.
- [ ] **`BotReference` split into three lifecycle types** — T4.
- [ ] **`secret://` URIs + `AgentRunner` interface + `VFS` abstraction** present — T9, §17.6.
- [ ] **State matrix (§28.5) extended to every product component** — U-K.
- [ ] **RTL direction-awareness CSS** in the shell — U-L, X2.
- [ ] **First-run script at 6 steps, step 0 = one-screen tour** — U-C, U1, U2.
- [ ] **Scanner BLOCK FPR target < 0.5%** + fixture corpus — U4.
- [ ] **Tauri installer pipeline** working on macOS + Windows — P9, X2.
- [ ] **10 Dana interviews on Figma prototype** complete with ≥7 buy signal — P10, X6.

## 6. Revised v1 scope

**v1 = "An inbox that triages itself overnight."** One Master chat. **One configured worker: Inbox.** Two additional slots visible but locked ("coming soon"). Three navigation surfaces (`/`, `/workers`, `/settings`) — Activity lives in a drawer, Agents is a tab inside Workers. UI shows **two layers** (Soul, Abilities); data model retains four. Tool-use is **Claude-only**; Ollama and OpenAI are text-only fallbacks for Floor Mode. Catalog ships with **10 pre-installed agents** from CONCEPT.md §16.7, no submit-your-own portal, no ratings. Distribution is a **signed Tauri installer** (macOS + Windows); `npm run dev` is developer-only. Pricing is **Floor (free local-only) / BYO-key ($15/mo) / Hosted tokens ($49/mo)**. Observability stack (typed SSE + OTel) and supervisor-with-cancellation are non-negotiable. Cut from v1: three concurrent workers, catalog submission, ratings, multi-device sync, vector memory, Tauri-less dev distribution, Assistants API / LangServe / A2A adapters, morning-briefing push (shipped as in-app only).

## 7. Migration notes

HARD solutions affecting data model or public interfaces, with v1-state → v2-hosted migration path:

- **T1 (Supervisor process):** v1 supervisor is localhost UDS. v2 swaps UDS for HTTP/2 to the Firecracker VM host agent. Interface (`AgentRunner.run(task) -> AsyncIterator[Event]`) unchanged.
- **T3 / X4 (Typed SSE):** schema is versioned (`event-schema-version: 1`). v2 reuses exact schema; only transport (SSE over HTTPS instead of localhost) changes. Client code unchanged.
- **T4 (Split `BotReference`):** v1 writes rows to `bot_references` with new `lifecycle_kind` column. Migration: backfill `lifecycle_kind` from existing `protocol` enum via deterministic mapping on first v2 run.
- **T9 (session_id + backpressure):** v1 issues `session_id` from supervisor. v2 issues from control plane. `AgentRunner` takes `session_id` as constructor arg from day 1 — no call-site changes.
- **T10 (`ClaudeCodeToolShim`):** v1 shim uses subprocess sandbox + localfs VFS. v2 shim uses Firecracker + S3/R2 VFS. Shim interface `Tool.invoke(args) -> Result` unchanged; adapters swap.
- **T11 (OTel):** v1 exports OTLP to SQLite via local collector. v2 exports OTLP to managed ClickHouse. Span schema and instrumentation unchanged — only exporter config differs.
- **P7 (Pricing / secrets):** `secret://` URIs resolve via OS keyring in v1, via AWS KMS-wrapped DEK in v2. Resolver is the only code that changes; every call site uses `resolve("secret://...")`.
- **X1 (Two-layer UI):** UI derives Abilities view from Skills/Tools/Rules tables. v2 hosted keeps same three tables on libSQL — zero schema change; only storage backend swaps.

---

*End of SOLUTIONS.md — 2026-04-21.*

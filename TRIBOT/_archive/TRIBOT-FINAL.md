# TRIBOT — Operational Spec (final, working copy)

*Supersedes `TRIBOT.md` for all build-planning purposes. The full 42-section spec is retained as history under `/archive/`. This file is the only one required to hire, pitch, or ship.*

**Version.** 2026-04-22. **GA commitment.** 2026-11-15.

---

## 1. What TRIBOT is

### 1.1 Executive summary (read aloud in under 60 seconds)

> **TRIBOT is a Guardian kernel for AI agents.** It sits between your agent and the tools it calls — intercepting, inspecting, gating, and recording every tool invocation so your agent can't break your machine, exfiltrate your data, or act without leaving receipts. We ship OpenClaw-first at GA in November 2026, with adapters for Claude Desktop, Claude Code, and Cursor to follow post-launch.
>
> Three tiers carry the business: **Observer** at $9/mo (audit log + alerts — the real prosumer wedge), **Team** at $99/mo (small-team CTOs on OpenClaw — the first cash wedge), and **Business** at $499/mo (SMB self-serve with SSO, DPA, and escrow). A Trail of Bits audit lands pre-launch; our honest kill-criteria are published; our sub-processor list is linked.
>
> We are not an enterprise RFP play, not a multi-model platform at launch, and not an "AI safety" company in the abstract. We are a narrow, operator-built safety kernel for the specific agents real people are already running. Pre-seed $1.2M, founder + one engineer + part-time designer, 11 months to GA.

### 1.2 The product definition (lead with this on slide 2)

TRIBOT is a Guardian kernel that **intercepts, inspects, gates, and records** every tool call your agent makes. Around that kernel, three editable layers — **Persona** (who the agent is), **Skills** (what it can do), and **Runtime** (how it loops) — let you swap identity without rewiring capability. **OpenClaw is the first supported runtime; the kernel is runtime-agnostic by architecture.**

### 1.3 What TRIBOT is NOT

| Not this | Why we say so |
|---|---|
| A SOC 2 enterprise safety platform | No Fortune-500 procurement; SSO-lite at $499 is not an RFP response |
| A multi-model platform at GA | OpenClaw-first; adapters post-GA; closed runtimes never |
| A prompt-injection-free product | We reduce blast radius — we do not eliminate the attack |
| A patcher of upstream OpenClaw CVEs | Client-side kernel; OpenClaw patches its own code |
| A Moltbook fleet management tool | Single-user; `/panic` is per-user; fleet behind Team tier |
| A generic "AI safety" company | We sell reliability, not safety (Dave's line) |
| A substitute for HITL legal review | Art. 22 queue is roadmap, not current |
| A wrapper of closed runtimes | Security model incoherent; never first-party |
| A server-side multi-tenant platform | Client-side kernel; Moltbook-class DB compromises out of scope |

---

## 2. The product

### 2.1 The four primitives

**Persona** — the agent's identity. Voice, tone, values, refusal rules, reasoning style. Authored in plain Markdown, version-controlled, hot-swappable between TRIBOTs without retraining. Edited via a 5-step interview wizard; the raw Markdown is available as an escape hatch.

**Skills** — what the agent can do. Capabilities from the ClawHub marketplace, scoped and signed. Each skill declares exactly which APIs and files it touches. Guardian enforces the whitelist. Discovery is curated, not a 44K-item wall.

**Runtime** — the agentic loop. Bounded by per-turn token budget, wall-clock deadline, and tool-call fan-out cap. Streams results to the UI. Routes every external call through Guardian. Emits reasoning trace per step.

**Guardian** — the security kernel. The hero of the system. Every tool call proxied through an inbound classifier (OWASP LLM01 patterns, scope check) and outbound filter (PII redaction, schema validation, leak scan). Every action logged to an append-only hash-chained audit, anchored to a private Sigstore Rekor instance. Kill-switch one keystroke away.

### 2.2 OpenClaw integration contract (condensed)

Guardian sits as a man-in-the-middle MCP server between OpenClaw and its downstream MCP toolchain. Transport is mTLS over Unix Domain Socket (POSIX) or Named Pipe (Windows). Three invariants for any integration:

1. **Father-proxied.** TRIBOT never calls OpenClaw directly. Every tool call crosses Guardian.
2. **Scope-declared.** Guardian rejects any call whose scope isn't in the active Skills manifest.
3. **Audited.** Request + response body hashed and appended to the tamper-evident chain. Bodies retained per policy tier.

Token model: one OpenClaw API token per TRIBOT, TPM/Secure-Enclave-sealed, rotated on `/panic` and on every Skills-manifest change.

### 2.3 The hero moment — Guardian receipt

When Guardian pauses an action, the user sees a receipt, not an error. A three-part glass toast: friendly headline ("I paused this one"), one-line plain-language reason ("Your Persona says 'never discuss pricing' — the reply mentioned a price"), and two actions — *"Let it through once"* or *"Update my Persona rule."* Every receipt is cryptographically chained to the one before it. Tamper the past, and the chain head no longer matches the daily transparency-log anchor.

**Sample receipt:**
```
Guardian paused this action — 2026-04-22T14:37:09Z
  Skill:      gmail.inbox-triage v1.4.2
  Tool call:  send_email(to=competitor@other-co.com)
  Status:     BLOCKED · scope violation
  Rule:       outbound-allowlist/email · ext.domain=unknown
  Cause:      Content from calendar invite (untrusted) influenced target domain.
  Chain:      …a7c4 → e091
```

---

## 3. Pricing and segments

### 3.1 Six-tier ladder (§36.2a, post-§37 validation)

| Tier | Price | For | Includes |
|---|---|---|---|
| **Free** | $0 | Curious users | 1 TRIBOT · basic Guardian rules · 7-day audit · community Skills |
| **Observer** | **$9/mo** | Prosumer wedge | Free + hosted 90-day audit + Slack/Discord alerts + self-host JSON export |
| **Solo** | $19/mo | Individual power user | Observer + full Guardian kernel + unlimited TRIBOTs + skill autoscan + voice input |
| **Pro** | $39/mo | Serious single builder | Solo + Test Lab (A/B Personas) + Version rail + JSON export + cost-cap toggles |
| **Team** | **$99/mo** (5 seats) | Small-team CTOs on OpenClaw — **the first cash wedge** | Pro + Fleet dashboard + shared Persona library + webhook alerts + multi-admin `/panic` |
| **Business** | $499/mo | SMB Segment 3 | Team + SSO-lite (Google + Okta SAML) + audit export to SIEM + EU data residency + DPA template + source-code escrow + 99.5% SLA |

### 3.2 Segment priority — 2 > 1 > 3

**Primary — Segment 2 (small-team CTOs on OpenClaw).** $99 Team tier with "Protected by TRIBOT" co-sell badge. Per the §37 sales simulations, Jordan-class customers convert 90 days before Alex-class prosumers and carry the first design-partner revenue.

**Secondary — Segment 1 (prosumers on OpenClaw).** $9 Observer is the real $0→paid step; $19 Solo is the post-incident upgrade. Prosumer thesis remains load-bearing but kill-criteria-gated (see §4.3).

**Tertiary — Segment 3 (SMB self-serve).** $499 Business. SSO-lite + audit export + escrow. No Fortune-500 sales motion.

### 3.3 Pricing-page headline

> *"TRIBOT sells observability at $9, calm at $19, credential at $39-$99, compliance at $499. Each tier answers a different question you're already asking."*

---

## 4. Roadmap

### 4.1 Phased build — GA 2026-11-15

| Phase | Weeks | Work | Exit criterion |
|---|---|---|---|
| **0a** | W1-2 | Landing page shipped (done); deploy waitlist + analytics | Landing live, analytics wired |
| **0b** | W1-4 | Internal rename Father→Guardian / Soul→Persona / Executor→Runtime in code + docs. TM clearance (Corsearch) | Rename PR merged; TM filed |
| **1** | W2-10 | Legal spine: DPA template, ToS, age-gating, retention policy, AI Act memo, tombstone audit log, Art. 22 HITL queue scope | DPO sign-off; outside-counsel letter |
| **2** | W3-14 | Security kernel: mTLS UDS bridge, Persona signing + classifier, SKILL.md typed manifest, Guardian-core split process, supply-chain hardening, session auth | **Trail of Bits audit published** — non-negotiable |
| **3** | W10-16 | First-session UX: Interview wizard, Guardian receipt rewrite, responsive Stage model, Performance mode, Test Lab, hosted-sandbox onboarding | 5-user study: >60% Persona completion, <5 min TTFV |
| **4** | W14-18 | Feature surface: Gmail integration end-to-end through Guardian | 50-user alpha; Guardian logs show real blocks |
| **5** | W18-20 | Beta: 250 design partners; Launch Week prep; press kit | NPS >40; zero P0 bugs 7 days running |
| **6** | W20-22 | **GA: 2026-11-15.** Public launch. PH, HN, press, creators. | 5K launch-week signups; <2% W1 churn |

### 4.2 Multi-runtime (post-GA)

Guardian is **OpenClaw-first at GA; MCP-runtime-agnostic by architecture.** Post-GA adapter roadmap:

| Phase | Work | Weeks | Trigger |
|---|---|---|---|
| **B** | Claude Desktop + Claude Code adapters (MCP-stdio proxy, single binary) | +4-6 after GA | Post-GA OpenClaw weekly signups plateau OR >15% waitlist non-OpenClaw |
| **B.5** | Zed + Cline + Cursor adapters (same MCP-stdio code, config variants) | +2-3 after B | First enterprise design-partner ask |
| **C** | Hosted via HTTPS proxy — OpenAI Assistants API, then Vertex Agent Builder | +8-16 after B | Post-Series-A + SOC 2 Type I in hand |
| **D** | Closed-runtime support (Operator, Devin, v0) | **never as first-party** — security model incoherent |

**Go/no-go gate:** number of runtimes shipping MCP 2025-11 spec compliance at end of Q3 2026. ≥5 compliant → execute Phase B; ≤2 compliant → stay OpenClaw-native another year.

### 4.3 Kill criteria (published — if any hit, pivot or refund)

| # | Experiment | Pass | Fail → action |
|---|---|---|---|
| 1 | Landing page + waitlist | ≥1,000 signups in 30 days | <300 → pivot from prosumer to B2B-only |
| 2 | Concierge skill audit | ≥6 of 10 say "I'd pay $19/mo" unprompted | <3 → discard prosumer thesis; managed-service pivot at $499 floor |
| 3 | `tribot-watch` CLI open-source release | ≥50 WAU at day 60 | <30 → reframe from "safety kernel" to "audit + observability" |

**Coherence gate (§41→§42):** by **2026-06-17 (8 weeks from today)**, spec coherence score must rise from 4.75 → 7.4 via the §42.12 checklist. If not, the doc itself is the blocker and the GA timeline slips.

---

## 5. Architecture

### 5.1 Guardian's six invariants (what any target runtime must expose)

1. **A tool-call boundary** — discrete structured invocations, not opaque shell exec
2. **A transport Guardian can sit on** — HTTP, MCP stdio, MCP HTTP, UDS, gRPC, WebSocket
3. **A configurable endpoint** — operator can redirect tool-call traffic
4. **A declarable scope surface** — enumerable tool list for manifest check
5. **A stable identity binding** — session / PID / token per call
6. **A kill primitive** — something `/panic` can terminate

What Guardian does NOT require: runtime being local, OSS, Go/Rust, using SKILL.md, speaking MCP specifically, or being OpenClaw. Guardian-specificity lives in one adapter, not in the product.

### 5.2 The four verbs

**Intercept** — every tool call crosses Guardian before reaching the runtime.
**Inspect** — classifier + scope + policy check against the active manifest.
**Gate** — block, pause-for-confirm, or pass.
**Record** — append-only hash-chained audit, transparency-log anchored.

### 5.3 Common integration primitive — MCP

Guardian is a **man-in-the-middle MCP server** for local + MCP-native hosted runtimes, and a **reverse HTTPS proxy** for non-MCP hosted runtimes. The MCP proxy is the canonical case: Guardian merges `tools/list` from downstream servers, intercepts `tools/call`, applies the four-verb pipeline, forwards to the real server, records, and returns.

### 5.4 Runtime stance (§40.4)

**TRIBOT is OpenClaw-first at GA; Guardian is MCP-runtime-agnostic by architecture.** Adapters for Claude Desktop and Claude Code ship GA+6 months. Hosted-runtime coverage (Assistants API, Vertex) is post-Series-A. Closed runtimes (Operator, Devin) are out of scope forever.

### 5.5 The category-identity tradeoff, stated plainly

We accept narrative dilution at GA ('OpenClaw's safety layer' → 'safety for your agent runtime') in exchange for category optionality post-Series A. Cost: ~1 design-partner slip per 10 pitches. Benefit: if MCP becomes default interop, TAM multiplier 2-4×. **Dilution is reversible** (tighten back to OpenClaw if Phase B metric fails); **TAM foreclosure is not.**

---

## 6. Visual system — what matters

The full 1,800-line visual specification is archived. The load-bearing visual decisions:

- **Gems (§3 in archive)** — three 6-token palettes (Crystal / Emerald / Ruby). Crystal is default. Gem-fill linear gradient on surfaces ≥80px; cabochon radial on ≤48px. Semantic: Emerald = success, Ruby = error (regardless of user accent).
- **Liquid Glass (§5 in archive)** — five blur plates (ultrathin → chrome). Canonical L1 surface carries a three-part edge: inset-top highlight + inset-bottom shadow + outer ambient.
- **Motion tokens (§6 + §28.3 in archive)** — `--dur-quick: 180ms`, `--dur-snappy: 260ms`, `--dur-standard: 420ms`, `--dur-morph: 520ms`. `--ease-overshoot` reserved for the gem-swap retint (the hero moment).
- **Typography** — system font stack; Instrument Serif reserved for ritual moments only (empty states, founder letter, the one italicized word per heading). Mono stack with `tnum` on for every number.
- **Landing page implementation** is at `C:\Users\ariel\Downloads\tribot-landing.html`. Audit grade A−/C+/B/B− (visual / motion / performance / accessibility). See §38 in archive for the fix queue; §42.1 G for the spec-vs-artifact governance rule.

---

## 7. Top 10 risks (next 6 months)

Full 25-risk register in the archive. The 10 that gate the next six months:

| # | Risk | Owner | Trigger | Mitigation |
|---|---|---|---|---|
| R1 | "TRIBOT" TM collision | Founder | Corsearch finds live mark | Pivot to CLAWGUARD / TRIARK; fallback domains pre-registered |
| R2 | Prosumer WTP fails at $19 | Founder | <6/10 concierge; <300 waitlist | B2B-first pivot; Observer $9 becomes the funnel floor |
| R3 | Microsoft Copilot bundles agent safety free | Founder + eng | MS GAs Copilot Runtime Guard | Team-tier 12mo lock-ins; "Protected by TRIBOT" badge revshare |
| R6 | Trail of Bits audit slips past 2026-10-01 | Eng-lead | W12 status shows >2wk slip | Cut Gmail scope to protect audit; GA slips to 12-01 maximum |
| R7 | mTLS-UDS bridge OS-specific CVE | Eng-lead | Windows Named Pipe / macOS UDS advisory | Kernel-keyring fallback; 72h hotfix SLA |
| R11 | Upstream OpenClaw RCE blamed on TRIBOT | Founder (comms) | CVE on OpenClaw hits TRIBOT users | Pre-written "what Guardian does NOT address" disclosure; 4h public advisory SLA |
| R13 | Second engineer hire slips past pre-seed | Founder | 60 days no accepted offer | Hire first, close second; bridge contractor if needed |
| R14 | Waitlist <400 at week 1 | Founder | Analytics D7 | Walk $8M post back to $6M; reframe as post-launch raise |
| R18 | Van Westendorp invalidates ladder | Founder | n≥400 results show elasticity off | Re-ladder pre-GA; Observer $9 protects $0→paid step either way |
| R25 | Spec drift recurs (§41.G pattern) | Founder (process) | Artifact ships ahead of spec again | §36.15b 48h rule; weekly spec-vs-artifact diff review |

---

## 8. Decisions

### 8.1 Fifteen-item log with reversibility

| # | Decision | Rev. | Owner | Recommended resolution |
|---|---|---|---|---|
| 1 | TM clearance | 4 | Legal + founder | Run Corsearch now |
| 2 | Prosumer thesis validation (3 experiments) | 2 | Founder | Ship all in Phase 0 |
| 3 | Stage-model breakpoints | 1 | Eng-lead | Adopt the 1440/1024/mobile three-tier |
| 4 | Lakera pricing recheck | 1 | Founder | Re-scan in 7d |
| 5 | Kylie Robison role at Wired | 1 | Founder | Defer 90d |
| 6 | Crystal identity back-port to §28.9 | 1 | Designer | Ship this week |
| **7** | **Observer $9 in the ladder** | **3** | **Founder — CALL NEEDED** | **Ship — highest leverage of all open items** |
| **8** | **B2B-first vs prosumer-first** | **3** | **Founder — CALL NEEDED** | **B2B-first (segment order 2>1>3)** |
| 9 | §40.4 amendment inlined into §36.8 | 1 | Founder | Ship this week |
| 10 | 2D Crystal-facet brand mark | 2 | Designer + founder | Commission in Phase 1 |
| 11 | MyClaw partnership | 3 | Founder | Open channel Phase 2 (after audit lands) |
| 12 | OpenClaw Foundation relationship | 4 | Founder | Open channel Phase 1 |
| 13 | Gmail-only MVP vs Observer-first | 3 | Founder | Both — Observer Phase 0, Gmail Phase 4 |
| 14 | Art. 22 HITL queue scope | 3 | Legal + founder | Minimal queue by end Phase 1 |
| 15 | Second engineer hire | 5 | Founder | Hire before pre-seed close |

### 8.2 The two calls that cascade

**Item 7 (Observer $9)** cascades into pricing-page copy, landing headlines, Phase 0 scope (hosted audit infra), and the Free→paid funnel math. **Call needed this week.**

**Item 8 (B2B-first segment order)** cascades into the pitch-deck narrative, the hiring plan (design-partner outreach vs. creator seeding), and the §31.5 rewrite. **Call needed this week.**

Recommended resolutions for both: **yes, ship.** §37 sims converged on these independently across four buyer personas and one angel simulation.

---

## 9. Glossary + onboarding

### 9.1 Glossary — internal / external / marketing

| Internal code | External UI | Marketing copy |
|---|---|---|
| `soul.*` | Persona | "your agent's identity" |
| `skills.*` | Skills | "what your agent can do" |
| `executor.*` | Runtime | "the agentic loop" (usually hidden) |
| `father.*` | Guardian | "the safety kernel" / "keeps your agent from breaking your machine" |
| `father-core` | Guardian-core | (internal only; OS-service term) |
| `tribot-watch` | Observer | "observability at $9" |
| `crystal` gem | Crystal | "the default" |
| `emerald` gem | Emerald | "for calm work" |
| `ruby` gem | Ruby | "for fast work" |
| `panic` | `/panic` | "instant kill-switch" |
| `panic-team` | `/freeze-team` | (Team tier only) |
| policy manifest | Skill scope | "what each skill is allowed to do" |
| audit chain | Audit log | "your receipts" |
| inbound classifier | inbound check | (not user-surfaced) |
| outbound filter | outbound check | (not user-surfaced) |

### 9.2 Seven-step onboarding for a new engineer

1. **Day 1 AM (30min):** §1.2 Guardian-verbs definition + §9.1 glossary.
2. **Day 1 PM (90min):** §2 product + §4 roadmap + §5 architecture.
3. **Day 2 AM (45min):** §4.2 multi-runtime + §5.4 runtime stance + §5.5 tradeoff.
4. **Day 2 PM (60min):** §37.5-§37.8 in the archive — market truth from sales simulations.
5. **Day 3 AM (45min):** §38 in the archive — implementation-vs-spec audit.
6. **Day 3 PM (30min):** §7 risk register + §8 decision log.
7. **Day 4:** Clone repo. Run `tribot-watch` locally. Trace one tool call through Guardian-core. Open a PR that adds one audit-log field.

Total: ~5 hours reading + 1 day onboarding code.

---

## 10. Five-slide investor deck

**S1 · Title** — TRIBOT: the Guardian kernel for OpenClaw · "Your agent won't break your machine." · Pre-seed $1.2M · GA 2026-11-15

**S2 · Problem (Dave's line)** — *We are a security company. The four primitives are how we organize the code; the product is a kernel that keeps your agent from breaking your machine.* · 3.2M MAU OpenClaw; 135K instances exposed; injection-class incidents monthly · Nothing sits in the tool-call path today.

**S3 · Product + proof** — Guardian: intercept, inspect, gate, record. Every tool call. Local. OSS core. · Trail of Bits audit lands 2026-10-01; published · Honest kill-criteria: if prosumer doesn't convert, B2B-first; if MCP fragments, OpenClaw-only.

**S4 · Go-to-market** — Observer $9 → Team $99 → Business $499. Segment order 2>1>3 · B2B2C wedge: "Protected by TRIBOT" badge for Jordan-class CTOs · Waitlist > 400 / week one = hire #2 + close pre-seed.

**S5 · Ask** — $1.2M pre-seed, $6M post · 11-month runway to GA + 30 design partners · Founder: 40 public OpenClaw skills, most-active ClawHub contributor · Reversible bets flagged; irreversible bets (Guardian architecture, OpenClaw-first GA) committed.

---

## 11. Reference pointers

This FINAL document supersedes `TRIBOT.md` for all build, hire, and pitch purposes. The archive preserves the research and the adversarial audits that got us here.

| Archive path | What it contains |
|---|---|
| `/archive/TRIBOT.md` | Full 42-section spec (preserved as history) |
| `/archive/visual-working-notes.md` | §1-§29 minus the survivors listed in §6 above |
| `/archive/35-36-resolution-history.md` | §35 adversarial audit + §36 per-resolution rationale |
| `/archive/32-full-findings.md` | 100 raw findings from the startup-team simulation |
| `/archive/meta/` | §21 research briefs + §22 craftsmanship rules |
| `C:\Users\ariel\Downloads\tribot-landing.html` | The landing-page implementation |

**Live files that stay canonical:**
- **`TRIBOT-FINAL.md`** (this file) — the operational spec
- **`tribot-landing.html`** — the shipping-ready UI skeleton
- GitHub repositories (TBD): `tribot/cli` (MIT), `tribot/skills-sdk` (Apache-2.0), `tribot/skills-registry` (MIT), `tribot/templates` (MIT), `tribot/executor-core` (closed), `tribot/father` (closed, audit-visible)

---

*If any downstream artifact (landing copy, pitch deck, hiring rubric, investor email) disagrees with `TRIBOT-FINAL.md`, this file wins. Founder review and sign-off required before any section here changes. Next scheduled review: 2026-06-17 (the §4.3 coherence gate).*
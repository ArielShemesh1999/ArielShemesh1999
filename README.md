**I build AI systems and the products that carry them** — an autonomous agent that runs the same way on every major model, and Hebrew right-to-left software shipped end to end: storefronts, editors, a PDF workspace, a lead pipeline that signs what it stores.

Independent, in Israel. Everything below is live, and every number on this page is generated from a run rather than typed.

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/stats-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/stats-light.svg" />
    <img alt="Contributions, public repositories and stars" src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/stats-dark.svg" width="100%" />
  </picture>
</div>

---

## How I build agents

Most of my AI work lives in **[fabius](https://github.com/ArielShemesh1999/fabius)** — one autonomous agent, fifteen zero-overlap skills, running the same way on Anthropic, OpenAI, Google, Mistral and Groq. The agent is the easy half. The apparatus around it is the work.

<table>
<tr>
<td width="33%" valign="top">

### Measured, not asserted

Every benchmark task is answered three ways — the bare model, a *"be concise"* control, and the shipped stance verbatim — then scored by two blind judges that are never told the model or the arm.

Across four Claude tiers the output cut is **20–35% on every model**, and on every capable tier the agent beats the bare model *and* the control. The one regression is printed in the table rather than dropped: it is the empirical case for routing by model tier.

**[Benchmarks ↗](https://github.com/ArielShemesh1999/fabius/blob/main/BENCHMARKS.md)** · [Eval harness ↗](https://github.com/ArielShemesh1999/fabius/tree/main/evals)

</td>
<td width="33%" valign="top">

### Proven, not claimed

Every release is sealed: a SHA-256 Merkle root over each skill contract, an Ed25519-signed git tag, and an OpenTimestamps proof anchoring the commit into Bitcoin.

`bash provenance/verify.sh` recomputes all of it offline, with no trusted third party. The document also states what each mechanism **does not** prove — the section most provenance pages leave out.

**[Provenance ↗](https://github.com/ArielShemesh1999/fabius/blob/main/PROVENANCE.md)**

</td>
<td width="34%" valign="top">

### Contracted, not prompted

Behaviour is a file, not a prompt — a routing core, an identity contract, and fifteen skill contracts the agent loads verbatim.

The same frontmatter contract is read by Claude Code, Codex and grok-build, so one folder is discoverable across three harnesses. A zero-dependency Node runtime carries the same rules offline under 75 tests.

**[Architecture ↗](https://github.com/ArielShemesh1999/fabius/blob/main/ARCHITECTURE.md)** · [Identity ↗](https://github.com/ArielShemesh1999/fabius/blob/main/IDENTITY.md)

</td>
</tr>
</table>

---

## Selected work

<table>
<tr>
<td width="50%" valign="top">

<a href="https://averya.co.il"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/averya.webp?v=1" alt="Averya" width="100%" /></a>

### [Averya](https://averya.co.il)

**AI specification and implementation for businesses**

My agency. Twenty-three Hebrew RTL pages that sell the actual work — site builds, CRM, automations, agents and GEO — with matched depth on every service page, a Gemini chat agent that captures a lead inside the conversation, and an HMAC-signed lead pipeline on Cloudflare Workers, D1 and Resend.

`HTML` `CSS` `JavaScript` `GSAP` `Cloudflare Workers` `D1` `Gemini`

**[Live site ↗](https://averya.co.il)**

</td>
<td width="50%" valign="top">

<a href="https://fabius-landing.vercel.app"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/fabius.webp?v=1" alt="fabius" width="100%" /></a>

### [fabius](https://fabius-landing.vercel.app)

**The autonomous agent that runs on every major model**

Fifteen coordinated, zero-overlap skills under one stance — scout wide, strike narrow. A 22-rule decision core, an IDENTITY contract and the FBS benchmark, running the same way on Anthropic, OpenAI, Google, Mistral and Groq. Version 2.3.1, cryptographically sealed, and installable by anyone:

`/plugin marketplace add ArielShemesh1999/fabius`

`Claude Plugin` `Markdown` `Node.js` `Public repo`

**[Live site ↗](https://fabius-landing.vercel.app)** · [Source ↗](https://github.com/ArielShemesh1999/fabius)

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://click-pdf.vercel.app"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/click-pdf.webp?v=1" alt="Click PDF" width="100%" /></a>

### [Click PDF](https://click-pdf.vercel.app)

**A Hebrew PDF workspace that never uploads your file**

Sign, stamp, merge, compress and edit — the whole flow runs in the browser, so no document ever reaches a server. Carries a verifiable SEAL that binds a file to a hash anyone can re-check, behind Turnstile and a Cloudflare Worker edge.

`HTML` `CSS` `JavaScript` `Cloudflare Workers` `Turnstile`

**[Live site ↗](https://click-pdf.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://editor-beta-ruby.vercel.app"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/sculio.webp?v=1" alt="Sculio" width="100%" /></a>

### [Sculio](https://editor-beta-ruby.vercel.app)

**Browser-only visual HTML editor**

Design a landing page visually and export clean HTML — nothing to install. Seventy brand templates and an AI builder that writes in 142 distinct design-system voices, while a zero-styling guardrail keeps your layout intact. RTL-aware and fully client-side.

`HTML` `CSS` `JavaScript` `Cloudflare Workers` `Resend`

**[Live site ↗](https://editor-beta-ruby.vercel.app)**

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://cryptools-brown.vercel.app"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/cryptools.webp?v=1" alt="Cryptools" width="100%" /></a>

### [Cryptools](https://cryptools-brown.vercel.app)

**42 privacy-first developer tools**

Hash, encrypt, sign, derive, generate and convert — from HMAC and Argon2id to Shamir secret sharing, PASETO and post-quantum ML-KEM/ML-DSA. Every byte is processed in your own browser: nothing is uploaded, nothing is logged, and it keeps working offline.

`JavaScript` `Web Crypto API` `100% client-side`

**[Live site ↗](https://cryptools-brown.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://arielshemeshweb.vercel.app"><img src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/main/assets/work/portfolio.webp?v=1" alt="Personal portfolio" width="100%" /></a>

### [Personal Portfolio](https://arielshemeshweb.vercel.app)

**Eleven case studies, each with a live demo**

A no-build Hebrew RTL site on a light Liquid Glass canvas. Every case study opens both a written study and the working product it describes, alongside long-form writing on AI and agents, an HMAC-gated Cloudflare lead pipeline and a matching light-glass AI assistant.

`HTML` `CSS` `JavaScript` `GSAP` `Cloudflare Workers`

**[Live site ↗](https://arielshemeshweb.vercel.app)**

</td>
</tr>
</table>

<div align="center">

**[Explore all repositories ↗](https://github.com/ArielShemesh1999?tab=repositories)**

</div>

---

## How I work

**Behaviour is a file, not a prompt.** The agent's stance, its routing rules and its fifteen skill contracts are versioned documents it loads verbatim. A prompt you cannot diff is a prompt you cannot fix.

**Nothing ships on "looks right".** A change is checked against the running system, not the source — headless browser, real URL, console and network asserted. Code reading is fine for *fixing* and not for *concluding*.

**Claims carry receipts, including the ones that hurt.** The benchmark is blind-judged with a control arm, and it prints the one model that regressed. Releases are sealed with a Merkle root, a signed tag and a Bitcoin-anchored timestamp. Three versions of the provenance paper were wrong, and the corrections are in the paper rather than behind it.

**Every artifact is written twice.** Once by the author, once by a reviewer whose only job is to disprove it. On the last pass over these repositories that reviewer pulled 63 unsupported claims — including some the source notes themselves had wrong.

---

## Contribution graph

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/output/github-snake-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/output/github-snake.svg" />
    <img alt="A snake eating my GitHub contribution graph" src="https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/output/github-snake.svg" width="100%" />
  </picture>
</div>

---

## Connect

<div align="center">

**[Portfolio ↗](https://arielshemeshweb.vercel.app)** · **[Averya ↗](https://averya.co.il)**

<br>

<sub>Every image on this page — the live stat bar, the project cards and the snake — is generated and served from this repository. No third-party README services.</sub>

</div>

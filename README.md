**I build AI systems and the products that carry them.** One set of agent rules that runs above the model you already use, plus products shipped end to end — most of them Hebrew-first: business systems, a visual HTML editor, a private PDF workspace, 42 browser tools and signed lead pipelines.

Independent, in Israel. Everything below is live, and every number on this page is measured, not guessed.

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/shear559/shear559/main/assets/stats-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/shear559/shear559/main/assets/stats-light.svg" />
    <img alt="Contributions, public repositories and active days, with the last 30 days" src="https://raw.githubusercontent.com/shear559/shear559/main/assets/stats-dark.svg" width="100%" />
  </picture>
</div>

---

## How I build agents

Most of my AI work lives in **[fabius](https://github.com/shear559/fabius)** — a plugin, not a platform: 22 routing rules and 15 non-overlapping skills, loaded above whatever model you already run — Claude, GPT, Gemini, Mistral, Grok and the rest. The agent is the easy half. The apparatus around it is the work.

<table>
<tr>
<td width="33%" valign="top">

### Measured, not asserted

Each task is answered by the bare model, a *"be concise"* control and the plugin's rules, then blind-scored. The four-panel benchmark keeps its controls, regressions and limits beside the wins.

**[Benchmarks ↗](https://github.com/shear559/fabius/blob/main/BENCHMARKS.md)** · [Eval harness ↗](https://github.com/shear559/fabius/tree/main/evals)

</td>
<td width="33%" valign="top">

### Proven, not claimed

Each release carries a SHA-256 Merkle root over the skill contracts, an Ed25519-signed tag and an OpenTimestamps Bitcoin anchor. Pending is reported as pending; `verify.sh` recomputes the evidence offline.

**[Provenance ↗](https://github.com/shear559/fabius/blob/main/PROVENANCE.md)**

</td>
<td width="34%" valign="top">

### Contracted, not prompted

Behaviour is a versioned routing core, an identity contract and 15 skill contracts. Adapters serve Claude Code, Codex and Grok Build; a zero-dependency suite checks the contracts, links and routing rules.

**[Architecture ↗](https://github.com/shear559/fabius/blob/main/ARCHITECTURE.md)** · [Identity ↗](https://github.com/shear559/fabius/blob/main/IDENTITY.md)

</td>
</tr>
</table>

---

## Selected work

<table>
<tr>
<td width="50%" valign="top">

<a href="https://averya.co.il"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/averya.webp?v=3" alt="Averya" width="100%" /></a>

### [Averya](https://averya.co.il)

**AI specification and implementation for businesses**

My agency. A 23-page Hebrew RTL system for websites, CRM, automation, agents and GEO. Its homepage turns 28 concrete offers into one guided product story; a Gemini agent qualifies the lead in the conversation, then an HMAC-signed Cloudflare pipeline stores and routes it.

`JavaScript` `GSAP` `Cloudflare Workers` `Gemini`

**[Live site ↗](https://averya.co.il)**

</td>
<td width="50%" valign="top">

<a href="https://fabius-landing.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/fabius.webp?v=3" alt="fabius" width="100%" /></a>

### [fabius](https://fabius-landing.vercel.app)

**A plugin, not a platform — one set of rules above every model**

One stance — scout wide, strike narrow — as 15 non-overlapping skills and 22 routing rules that install into Claude Code, Codex or Grok Build and run on the model you already use. Version 2.7.1, sealed and reproducibly checked before release.

`Claude Plugin` `Markdown` `Node.js`

**[Live site ↗](https://fabius-landing.vercel.app)** · [Source ↗](https://github.com/shear559/fabius)

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

<a href="https://click-pdf.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/click-pdf.webp?v=4" alt="Click PDF" width="100%" /></a>

### [Click PDF](https://click-pdf.vercel.app)

**A private, mobile-first Hebrew PDF workspace**

Sign, stamp, merge, compress and edit in a responsive workspace — the document operations run locally in the browser. A separate verifiable SEAL flow binds a file to a hash anyone can re-check, protected at the edge by Turnstile and a Cloudflare Worker.

`JavaScript` `Cloudflare Workers` `Turnstile`

**[Live site ↗](https://click-pdf.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://editor-beta-ruby.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/sculio.webp?v=3" alt="Sculio" width="100%" /></a>

### [Sculio](https://editor-beta-ruby.vercel.app)

**Visual HTML editor with clean source underneath**

Design a landing page visually and export clean HTML — nothing to install. Start from 70 brand templates or use Mix mode to fuse three systems into one direction; the editor stays RTL-aware while account authority and publishing run through Cloudflare.

`JavaScript` `Cloudflare Workers` `Resend`

**[Live site ↗](https://editor-beta-ruby.vercel.app)**

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

<a href="https://cryptools-brown.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/cryptools.webp?v=3" alt="CryptoTools" width="100%" /></a>

### [CryptoTools](https://cryptools-brown.vercel.app)

**42 privacy-first developer tools**

Nine groups for hashing, encryption, signatures, key derivation, generation and conversion — from HMAC and Argon2id to Shamir secret sharing, PASETO and post-quantum ML-KEM/ML-DSA. Computation stays in the browser. Only two explicit lookups leave the page, DNS-over-HTTPS and a k-anonymity Have I Been Pwned check, and only when triggered.

`JavaScript` `Web Crypto API` `No backend`

**[Live site ↗](https://cryptools-brown.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://arielshemeshweb.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/portfolio.webp?v=3" alt="Personal portfolio" width="100%" /></a>

### [Personal Portfolio](https://arielshemeshweb.vercel.app)

**11 case studies, each with a live demo**

A no-build Hebrew RTL site with dark landing surfaces and quiet reading pages behind them. Each selected case study opens both the written work and the running product; a filterable project index, long-form writing, an on-site AI assistant and an HMAC-gated Cloudflare lead pipeline complete the system.

`JavaScript` `Cloudflare Workers`

**[Live site ↗](https://arielshemeshweb.vercel.app)**

</td>
</tr>
</table>

---

## How I work

**A prompt you cannot diff is a prompt you cannot fix.** Stance, routing and skills are versioned documents an agent loads verbatim, so a change in behaviour is a diff, a review and a tag — never an edit in a chat window.

**Nothing ships on "looks right".** A change is checked against the running system, not the source — headless browser, real URL, console and network asserted. Code reading is fine for *fixing* and not for *concluding*.

**Claims carry receipts, including the ones that hurt.** Benchmarks keep regressions visible, release seals distinguish pending anchors from confirmed ones, and research corrections stay in the record rather than disappearing behind the next version.

---

## Research

**[A trustless anchor for document provenance ↗](https://github.com/shear559/seal-provenance)**

A signature proves *who*. It does not prove *when* — and in the generative-AI era, *when* is the field that decides whether a document is evidence or a fabrication. A 63-page position and architecture paper on sealing files so their provenance survives adversaries, transcoding, hash breaks and decades of time.

It makes exactly three claims — a trustless timestamp anchor whose anti-backdating bound terminates in Bitcoin, a verifiable soft-binding resolution registry built in the Certificate-Transparency pattern, and salted, renewable seals that survive a hash-function break — and is explicit about what it does not claim: hard and soft binding of *what*, *who* and *when* is C2PA and JPEG Trust's, and an earlier draft claimed it as novel before review established it was already an ISO standard.

The published reference package regenerates every figure in the paper — 15/15 tests against a registry contract with no owner and no upgrade path, a 17-vector conformance suite with real ML-DSA-65, and the benchmarks — so nothing has to be taken on faith.

`Solidity` `EIP-712` `OpenTimestamps` `Certificate Transparency` `ML-DSA-65`

---

## Contribution graph

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/shear559/shear559/output/github-snake-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/shear559/shear559/output/github-snake.svg" />
    <img alt="A snake eating my GitHub contribution graph" src="https://raw.githubusercontent.com/shear559/shear559/output/github-snake.svg" width="100%" />
  </picture>
</div>

---

## Connect

<div align="center">

**[Work with me ↗](https://averya.co.il/contact.html)** · [Portfolio ↗](https://arielshemeshweb.vercel.app) · [All repositories ↗](https://github.com/shear559?tab=repositories)

<sub>Stat bar, cards and snake are generated and served from this repository — no third-party README services.</sub>

</div>

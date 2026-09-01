**I build AI systems and the products that carry them.** One set of agent rules that runs the same way above every major model, and products shipped end to end, most of them Hebrew-first: an agency site, a visual HTML editor, a PDF workspace, 42 browser-only developer tools, a lead pipeline that signs what it stores.

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

Every benchmark task is answered three ways — the bare model, a *"be concise"* control, and the plugin's rules verbatim — then scored by two blind judges that are never told which model or which variant they are reading.

Across four Claude tiers the output cut is **20–35% on every model**, and on three of the four the agent beats the bare model *and* the control. The one regression is printed, not dropped.

**[Benchmarks ↗](https://github.com/shear559/fabius/blob/main/BENCHMARKS.md)** · [Eval harness ↗](https://github.com/shear559/fabius/tree/main/evals)

</td>
<td width="33%" valign="top">

### Proven, not claimed

Every release is sealed: a SHA-256 Merkle root over each skill contract, an Ed25519-signed git tag, and an OpenTimestamps proof that anchors into Bitcoin once confirmed — pending is reported as pending, never as confirmed.

`bash provenance/verify.sh` recomputes all of it offline, with no trusted third party. The document also states what each mechanism **does not** prove.

**[Provenance ↗](https://github.com/shear559/fabius/blob/main/PROVENANCE.md)**

</td>
<td width="34%" valign="top">

### Contracted, not prompted

Behaviour is a file, not a prompt — a routing core, an identity contract, and 15 skill contracts the agent loads verbatim.

The same frontmatter contract is read by Claude Code, Codex and Grok Build, so one folder serves all three. A zero-dependency Node runtime carries the same rules offline under 132 tests.

**[Architecture ↗](https://github.com/shear559/fabius/blob/main/ARCHITECTURE.md)** · [Identity ↗](https://github.com/shear559/fabius/blob/main/IDENTITY.md)

</td>
</tr>
</table>

---

## Selected work

<table>
<tr>
<td width="50%" valign="top">

<a href="https://averya.co.il"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/averya.webp?v=2" alt="Averya" width="100%" /></a>

### [Averya](https://averya.co.il)

**AI specification and implementation for businesses**

My agency. 23 Hebrew RTL pages that sell the work itself — site builds, CRM, automations, agents and GEO (visibility in AI answers). A Gemini chat agent captures the lead inside the conversation; an HMAC-signed pipeline on Cloudflare Workers, D1 and Resend stores it.

`JavaScript` `GSAP` `Cloudflare Workers` `Gemini`

**[Live site ↗](https://averya.co.il)**

</td>
<td width="50%" valign="top">

<a href="https://fabius-landing.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/fabius.webp?v=2" alt="fabius" width="100%" /></a>

### [fabius](https://fabius-landing.vercel.app)

**A plugin, not a platform — one set of rules above every model**

One stance — scout wide, strike narrow — as 15 non-overlapping skills and 22 routing rules that install into Claude Code, Codex or Grok Build and run on the model you already use. Version 2.6.5, sealed, and installable by anyone:

```
/plugin marketplace add shear559/fabius
```

`Claude Plugin` `Markdown` `Node.js`

**[Live site ↗](https://fabius-landing.vercel.app)** · [Source ↗](https://github.com/shear559/fabius)

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

<a href="https://click-pdf.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/click-pdf.webp?v=3" alt="Click PDF" width="100%" /></a>

### [Click PDF](https://click-pdf.vercel.app)

**A Hebrew PDF workspace that never uploads your file**

Sign, stamp, merge, compress and edit — the whole flow runs in the browser, so no document ever reaches a server. Carries a verifiable SEAL that binds a file to a hash anyone can re-check, behind Turnstile and a Cloudflare Worker edge.

`JavaScript` `Cloudflare Workers` `Turnstile`

**[Live site ↗](https://click-pdf.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://editor-beta-ruby.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/sculio.webp?v=2" alt="Sculio" width="100%" /></a>

### [Sculio](https://editor-beta-ruby.vercel.app)

**Browser-only visual HTML editor**

Design a landing page visually and export clean HTML — nothing to install. 70 brand templates and an AI builder that writes in 142 distinct design-system voices, while a zero-styling guardrail keeps your layout intact. RTL-aware and fully client-side.

`JavaScript` `Cloudflare Workers` `Resend`

**[Live site ↗](https://editor-beta-ruby.vercel.app)**

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

<a href="https://cryptools-brown.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/cryptools.webp?v=2" alt="CryptoTools" width="100%" /></a>

### [CryptoTools](https://cryptools-brown.vercel.app)

**42 privacy-first developer tools**

Hash, encrypt, sign, derive, generate and convert — from HMAC and Argon2id to Shamir secret sharing, PASETO and post-quantum ML-KEM/ML-DSA. Everything runs in your own browser — no upload, no analytics, no backend — and keeps working offline. Only two lookups ever leave the page, DNS-over-HTTPS and a k-anonymity Have I Been Pwned check, and only when you trigger them.

`JavaScript` `Web Crypto API` `No backend`

**[Live site ↗](https://cryptools-brown.vercel.app)**

</td>
<td width="50%" valign="top">

<a href="https://arielshemeshweb.vercel.app"><img src="https://raw.githubusercontent.com/shear559/shear559/main/assets/work/portfolio.webp?v=2" alt="Personal portfolio" width="100%" /></a>

### [Personal Portfolio](https://arielshemeshweb.vercel.app)

**11 case studies, each with a live demo**

A no-build Hebrew RTL site: pure-black landing surfaces with one green accent, light reading pages behind them. Every case study opens both a written study and the working product it describes. The site also carries long-form writing on AI and agents, an on-site AI assistant and an HMAC-gated Cloudflare lead pipeline.

`JavaScript` `Cloudflare Workers`

**[Live site ↗](https://arielshemeshweb.vercel.app)**

</td>
</tr>
</table>

---

## How I work

**A prompt you cannot diff is a prompt you cannot fix.** Stance, routing and skills are versioned documents an agent loads verbatim, so a change in behaviour is a diff, a review and a tag — never an edit in a chat window.

**Nothing ships on "looks right".** A change is checked against the running system, not the source — headless browser, real URL, console and network asserted. Code reading is fine for *fixing* and not for *concluding*.

**Claims carry receipts, including the ones that hurt.** The benchmark prints the one model that regressed, the release seal reports its Bitcoin anchor as pending until it is confirmed, and three versions of the provenance paper were wrong — the corrections are in the paper rather than behind it.

**Every artifact is written twice.** Once by the author, once by a reviewer whose only job is to disprove it. On the last pass over these repositories that reviewer pulled 63 unsupported claims — including some the source notes themselves had wrong.

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

# TRIBOT — Design Skeleton Reference

> **Purpose.** A domain-free UI kit — everything learned while building the visual shell. The skeleton (layout, 3D, Liquid Glass visual system, components, motion, typography) is captured so it can be reused for any product direction.
>
> **Captured:** 2026-04-22. **Language:** English only.
>
> This document intentionally omits any reference to a specific product domain. It documents the *shell* and its components — fill with whatever content the next product requires.

---

## 1. Visual identity

The product lives inside a 3D-first, iOS-Liquid-Glass shell. Three things create the character:

1. A **3D logo** in the top-left of the sidebar, rendered via `@google/model-viewer` from a Draco-compressed GLB file. It sits at 88 px square, flips in a pure-CSS coin-spin on hover, scrolls to the top of the current page on click, and never leaks framer-motion into the bundle.
2. A **gemstone accent palette** — three jewel tones (Crystal, Emerald, Ruby) that the user picks in Settings. Every interactive surface inherits the active accent through `--accent` / `--accent-soft` / `--accent-ink` variables.
3. A **Liquid Glass** material — the default surface is a translucent plate with a three-part edge highlight, a subtle ambient shadow, and a blur/saturate recipe that matches iOS 26 / visionOS 2 reference values.

---

## 2. 3D integration

### Logo

```jsx
<model-viewer
  src="/LOGO.glb?v=1"
  alt="brand"
  disable-zoom disable-pan disable-tap
  interaction-prompt="none"
  shadow-intensity="0"
  exposure="1.25"
  environment-image="neutral"
  loading="eager"
  reveal="auto"
  camera-orbit="0deg 90deg 100%"
  min-camera-orbit="auto auto 100%"
  max-camera-orbit="auto auto 100%"
  style={{
    width: "100%", height: "100%", background: "transparent",
    "--poster-color": "transparent",
    "--progress-bar-color": "transparent",
    pointerEvents: "none",
  }}
/>
```

- Source GLBs should be **Draco-compressed** before shipping: `npx @gltf-transform/cli draco input.glb output.glb`. Typical payload drops 3-10× without visible loss.
- **Do not** use Meshopt — model-viewer 3.5 ships the Draco decoder but Meshopt is not registered by default.
- Cache-bust with `?v=N` when replacing the asset.
- The hover coin-spin is a CSS keyframe animation triggered by a state class — not framer-motion. This keeps the main bundle lean.
- Respect `prefers-reduced-motion: reduce` on every animated surface.

### Character / portrait cards

Same `<model-viewer>` recipe, smaller (110×110 px inside a card). `loading="lazy"` when the portrait is offscreen; `loading="eager"` when it's the hero element on the current page. `camera-orbit="0deg 90deg 90%"` with matching min/max locks rotation off.

---

## 3. Gemstone accent system

**These are not flat colors. They are gem materials.** The single most important rule in the whole system.

A flat `#0A84FF` paints a blue rectangle. A gem-rendered Crystal accent produces a blue *volume* — light passes through the core, bright specular sits on top, a deep shadow settles at the edges, and a soft outer halo glows on whatever surface the gem touches. Every accent surface in this product must carry that character, or the whole shell reads as generic Material-style UI instead of the product's real identity.

### Identity tie

**Crystal blue = the character's blue.** The 3D figure that lives in the shell (logo, portrait, selected hero) carries the exact Crystal tone. Crystal is not just a color choice in Settings — it is the product's primary identity. Emerald and Ruby are alternate characters, chosen by the user, applied to the same shell.

### Per-gem visual DNA

Each gem has its own optical personality. The gradient direction, highlight sharpness, and glow warmth should match the reference gem.

**Crystal (sapphire blue)**
- Cold, ice-like specular. Sharp highlights with a hint of prism.
- Deep velvety blue shadow zones.
- Inner volume bright — light passes through the core cleanly.
- Coolest of the three. Highlights tend toward icy white with a faint violet hint.

**Emerald**
- Classical, saturated. Softer highlights than Crystal (emeralds refract gently).
- Warm inner core, slightly cooler edges — the reverse of Ruby.
- Less fire, more depth. Feels old-world, considered.

**Ruby**
- The most emotional. Pigeon-blood base with fluorescent pink/fuchsia highlights.
- Warm glow that breathes — in dark mode especially, rubies almost fluoresce.
- Redder on the highlights than the shadows (uniquely).
- Strongest outer glow halo of the three.

### Token structure — six tiers per gem

Every accent surface pulls from the active gem's six tokens. Settings swaps the active gem → the six tokens re-resolve → every surface updates simultaneously through the `@property` animation.

```css
:root {
  /* Crystal (default — matches the 3D character) */
  --crystal-core:      #0A84FF;   /* main jewel tone */
  --crystal-highlight: #5EADFF;   /* inner-fire, specular top of gradients */
  --crystal-shadow:    #003D82;   /* deep edge / gradient bottom */
  --crystal-soft:      #E5F1FF;   /* translucent wash / background tint */
  --crystal-ink:       #004FB5;   /* text on light */
  --crystal-glow:      10, 132, 255;  /* RGB triplet for alpha glows */

  /* Emerald */
  --emerald-core:      #10B27F;
  --emerald-highlight: #34D89A;
  --emerald-shadow:    #05553C;
  --emerald-soft:      #DAF4E9;
  --emerald-ink:       #086F4F;
  --emerald-glow:      16, 178, 127;

  /* Ruby */
  --ruby-core:         #E5484D;
  --ruby-highlight:    #FF7A7D;   /* pigeon-blood fluorescence */
  --ruby-shadow:       #7A161A;
  --ruby-soft:         #FCE1E2;
  --ruby-ink:          #A72127;
  --ruby-glow:         229, 72, 77;

  /* Active accent — bound to whichever gem Settings selected */
  --accent:            var(--crystal-core);
  --accent-highlight:  var(--crystal-highlight);
  --accent-shadow:     var(--crystal-shadow);
  --accent-soft:       var(--crystal-soft);
  --accent-ink:        var(--crystal-ink);
  --accent-glow:       var(--crystal-glow);
}
```

### Animated color transitions

```css
@property --accent           { syntax: "<color>"; inherits: true; initial-value: #0A84FF; }
@property --accent-highlight { syntax: "<color>"; inherits: true; initial-value: #5EADFF; }
@property --accent-shadow    { syntax: "<color>"; inherits: true; initial-value: #003D82; }
@property --accent-soft      { syntax: "<color>"; inherits: true; initial-value: #E5F1FF; }
@property --accent-ink       { syntax: "<color>"; inherits: true; initial-value: #004FB5; }
```

Switching gem smoothly cross-fades all five color stops at once.

### The gem fill — used on every ≥80 px accent surface

Flat `background: var(--accent)` is **not allowed** on primary buttons, user chat bubbles, selected bot cards, or any other accent surface larger than ~80 px on either axis. Use the gem gradient instead:

```css
--accent-fill: linear-gradient(
  135deg,
  var(--accent-highlight) 0%,
  var(--accent) 55%,
  var(--accent-shadow) 100%
);
```

For smaller accent elements (≤48 px swatches / dots / pills), a **radial** gradient reads better than linear because it mimics a cabochon cut:

```css
--accent-cabochon: radial-gradient(
  circle at 30% 30%,
  var(--accent-highlight) 0%,
  var(--accent) 55%,
  var(--accent-shadow) 100%
);
```

### Specular highlight recipe (for gem-filled surfaces)

```css
.gem-surface {
  background: var(--accent-fill);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),       /* specular top edge */
    inset 0 -1px 0 rgba(0, 0, 0, 0.18),            /* inner shadow at base */
    0 4px 12px rgba(var(--accent-glow), 0.30),     /* outer color halo */
    0 1px 3px rgba(0, 0, 0, 0.10);                 /* contact shadow */
  transition: filter var(--dur-hover) var(--ease-standard);
}
.gem-surface:hover  { filter: brightness(1.08) saturate(1.05); }  /* gem catches more light */
.gem-surface:active { filter: brightness(0.95); transform: scale(0.98); }
```

### Focus ring = inner fire (not a flat halo)

```css
.gem-focus {
  box-shadow:
    0 0 0 2px var(--accent-soft),
    0 0 0 4px rgba(var(--accent-glow), 0.18),
    0 0 10px  rgba(var(--accent-glow), 0.35);
}
```

Three layers: crisp soft halo → wider soft halo → diffuse glow. Reads as inner fire, not a Bootstrap outline.

### Gemstone swatch (Settings picker)

The accent swatches in Settings should themselves look like polished gems — not flat color dots.

```css
.swatch-gem {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--accent-cabochon);
  position: relative;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.20),
    inset 0 1px 2px rgba(255,255,255,0.35),
    0 2px 6px rgba(var(--accent-glow), 0.35),
    0 1px 2px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform var(--dur-snappy) var(--ease-snappy);
}
.swatch-gem::before {                    /* specular highlight spot */
  content: "";
  position: absolute;
  top: 5px; left: 7px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  filter: blur(1.5px);
}
.swatch-gem:hover  { transform: scale(1.08); }
.swatch-gem.active {
  transform: scale(1.12);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.25),
    inset 0 1px 2px rgba(255,255,255,0.4),
    0 0 0 3px rgba(var(--accent-glow), 0.25),
    0 4px 14px rgba(var(--accent-glow), 0.5);
}
```

Each swatch is scoped inside a wrapper that sets its gem tokens:

```jsx
<button class="swatch-gem" data-gem="crystal"
        style="--accent: var(--crystal-core);
               --accent-highlight: var(--crystal-highlight);
               --accent-shadow: var(--crystal-shadow);
               --accent-glow: var(--crystal-glow);" />
<button class="swatch-gem" data-gem="emerald"
        style="--accent: var(--emerald-core); …" />
<button class="swatch-gem" data-gem="ruby"
        style="--accent: var(--ruby-core); …" />
```

### Dark mode — gems glow brighter

In dark, gems do what real gems do: inner fire becomes more visible. Amplify the glows, keep the gradients, use translucent softs.

```css
html[data-theme="dark"] {
  --crystal-soft: rgba(10,132,255,0.20);
  --emerald-soft: rgba(16,178,127,0.20);
  --ruby-soft:    rgba(229,72,77,0.22);
}

html[data-theme="dark"] .gem-surface {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 6px 18px rgba(var(--accent-glow), 0.45),   /* stronger halo */
    0 2px 4px rgba(0,0,0,0.5);
}
```

Ruby dark-mode halo can push to 0.55 — rubies fluoresce hardest in low light.

### Hard rules for accent surfaces

1. **No flat accent fills** on surfaces ≥80 px. Use `var(--accent-fill)` (linear) or `var(--accent-cabochon)` (radial).
2. **No flat focus halos.** Three-layer glow ring minimum.
3. **Every accent surface carries a color halo** via `rgba(var(--accent-glow), α)`. α between 0.18 (subtle) and 0.45 (dramatic).
4. **Inherit the gem tokens** — never reference `--crystal-*` / `--emerald-*` / `--ruby-*` from a component directly. Always `--accent-*`. Components don't know which gem they're wearing.
5. **Hover = more light.** `filter: brightness(1.08) saturate(1.05)` on any gem surface. Not a different color.
6. **Active/selected = bigger halo.** The selected swatch / card doesn't change color; it intensifies its own glow.
7. **Text on gem fills** is always pure white (`#fff`) with weight 600 — anything else fights the gradient. No drop-shadows on the text.
8. **Dark mode brightens, never darkens.** Stronger halo, same gradient.

### Semantic mapping

`--color-up` and `--color-down` (success / error) stay tied to **Emerald** and **Ruby** regardless of which accent the user picked. Meaning: a success toast glows emerald even when the user's accent is Crystal. Emerald = life, Ruby = stop — these are universal, not user-preference.

```css
--color-up:        var(--emerald-core);
--color-up-soft:   var(--emerald-soft);
--color-down:      var(--ruby-core);
--color-down-soft: var(--ruby-soft);
```

The 3D character in the top-left uses Crystal by default because it *is* Crystal. If the user picks Ruby, the character stays Crystal — the shell wears the user's accent, the character keeps its identity.

### Neutral canvas

Light mode uses a warm off-white (**not** pure white — pure `#FFF` has nothing for backdrop-filter to filter):

```css
--color-bg:         #F7F7F5;
--color-surface:    #FFFFFF;
--color-surface-2:  #F1F1EF;
--color-ink:        #0A0A0A;
--color-ink-soft:   #27272A;
--color-muted:      #52525B;
--color-muted-dark: #71717A;
--color-line:       #E5E3E0;
--color-line-soft:  #F1F1EF;
```

Dark mode is pure black with warm elevation greys:

```css
--color-bg:         #000000;
--color-surface:    #1C1C1E;
--color-surface-2:  #2A2A2C;
--color-ink:        #F5F5F7;
--color-ink-soft:   #D2D2D7;
--color-muted:      #98989D;
--color-muted-dark: #C7C7CC;
--color-line:       rgba(255,255,255,0.10);
--color-line-soft:  rgba(255,255,255,0.06);
```

Dark body gets a subtle accent radial + ~3.5% SVG noise overlay to kill banding:

```css
html[data-theme="dark"] body {
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(10,132,255,0.05) 0%, transparent 60%),
    var(--color-bg);
}
html[data-theme="dark"] body::after {
  content: ""; position: fixed; inset: 0;
  pointer-events: none; z-index: 1;
  opacity: 0.035; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,…fractalNoise…");
}
```

---

## 4. Typography

System-font-first. SF Pro leads on Apple platforms, Inter fallback. A display serif is used only for accent flourish, never for body.

```css
--font-display: "Instrument Serif", "New York", "Source Serif 4", Georgia, serif;
--font-heading: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif;
--font-body:    -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif;
--font-mono:    "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace;
```

Pairings:

| Role | Stack | Size / weight / tracking |
|---|---|---|
| H1 | display | `clamp(36px, 4vw, 72px)`, weight 700, letter-spacing `-0.045em`, line-height 1.05 |
| Accent word inside H1 | display italic | inline, accent-colored (`.serif-italic`) |
| H2 / section heads | heading | 16 / 600, letter-spacing `-0.015em` |
| Body | body | 15 / 400, line-height 1.55 |
| Caption / micro-label | mono | 10.5–11 / 500, letter-spacing 0.04–0.08em, uppercase |

Rules:

- **Italic only** on the display serif, as an accent flourish inside headings. Never italic on chrome.
- **Mono numbers** always carry `font-variant-numeric: tabular-nums`.
- **Caption labels are uppercase** and rely on letter-spacing, not weight, for hierarchy.

---

## 5. Liquid Glass system (iOS 26 / visionOS 2 fidelity)

The signature material. Five blur plates — from ultrathin to chrome — and a three-part edge recipe. No flat borders.

### Blur plates

```css
--lg-blur-ultrathin: blur(20px) saturate(180%);
--lg-blur-thin:      blur(30px) saturate(180%);
--lg-blur-regular:   blur(40px) saturate(180%) contrast(1.05);   /* default */
--lg-blur-thick:     blur(50px) saturate(200%);
--lg-blur-chrome:    blur(60px) saturate(180%) brightness(1.05);
```

Dark mode pushes saturation higher and dims chrome:

```css
--lg-blur-regular: blur(40px) saturate(200%) contrast(1.05);
--lg-blur-thick:   blur(50px) saturate(220%);
--lg-blur-chrome:  blur(60px) saturate(200%) brightness(0.9);
```

### Fills

| Layer        | Light                     | Dark                       |
|--------------|---------------------------|----------------------------|
| L1 (primary) | `rgba(255,255,255,0.55)` | `rgba(255,255,255,0.08)`   |
| L2 (nested)  | `rgba(255,255,255,0.35)` | `rgba(255,255,255,0.04)`   |
| Chrome       | `rgba(255,255,255,0.72)` | `rgba(28,28,30,0.72)`      |

### Canonical glass surface

```css
.lg-surface {
  background: var(--lg-fill-l1);
  backdrop-filter: var(--lg-blur-regular);
  -webkit-backdrop-filter: var(--lg-blur-regular);
  border: 1px solid var(--lg-border);
  border-radius: var(--lg-radius-card);
  box-shadow:
    inset 0 1px 0 var(--lg-highlight-top),     /* 0.55 light / 0.22 dark */
    inset 0 -1px 0 var(--lg-highlight-bottom), /* 0.06 light / 0.4 dark */
    var(--lg-shadow-contact),                  /* 0 1px 2px rgba(0,0,0,0.06/0.6) */
    var(--lg-shadow-ambient);                  /* 0 8px 24px rgba(0,0,0,0.08/0.45) */
}
```

### Radii

```css
--lg-radius-pill:    9999px;
--lg-radius-card:    20px;
--lg-radius-control: 14px;
--lg-radius-bubble:  18px;
```

### Hard-earned rules

1. Max **2 glass layers** stacked.
2. Colors on glass render at ~70% effective saturation.
3. Body background must have some color (warm off-white / accent radial in dark) — on pure `#FFF` the blur has nothing to filter.
4. Border is 1px semi-transparent white (light) / 10% white (dark). Never hardcoded grey.
5. The three-part edge (inset-top highlight + inset-bottom shadow + outer ambient) is what separates Liquid Glass from generic glassmorphism. Do not skip any layer.

---

## 6. Motion tokens (Apple springs)

```css
--ease-standard: cubic-bezier(0.22, 1, 0.36, 1);  /* springy ease-out */
--ease-snappy:   cubic-bezier(0.32, 0.72, 0, 1);  /* tap */
--dur-hover:     120ms;
--dur-snappy:    260ms;
--dur-standard:  420ms;
--dur-morph:     520ms;
```

Usage:

- Hover: 120 ms standard.
- Tap / press: 260 ms snappy.
- Sheet open / card appear: 420 ms standard.
- Glass merge (morph): 520 ms.
- Message / list entry animation: **180 ms** `translateY(6px → 0)` + fade.
- `prefers-reduced-motion: reduce` → disable transitions on motion-heavy surfaces.

---

## 7. App shell & layout

Three-column CSS grid: **sidebar · main · optional detail panel**. The third column is the "right rail" and is context-sensitive — some pages show it (detail inspector, conversation thread), some don't (full-bleed tools, settings).

```css
.app-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 340px;
  min-height: 100vh;
}
.app-shell[data-wide="true"] {
  grid-template-columns: 240px minmax(0, 1fr);
}
@media (max-width: 1180px) { .app-shell { grid-template-columns: 80px minmax(0, 1fr) 320px; } }
@media (max-width: 960px)  { .app-shell { grid-template-columns: 72px minmax(0, 1fr); } .rail-right { display: none; } }
```

Body content in `.main` (max-width ~1400 px, centered, generous padding). The detail panel on the right is a sibling of `.main`, not a child — this keeps its sticky behavior independent and allows it to animate in/out without reflowing main.

**Page transitions:** `document.startViewTransition()` progressively enhanced. Native cross-fade where supported; instant otherwise.

The three-column shell is the **canonical information-dense layout** — see §25 for the full productivity-style recipe (top nav, quick-access shelf, breadcrumb row, data table, detail panel, activity timeline). That pattern lifts directly from mature productivity apps (Dropbox / Notion / Linear) and is the base layout language for any screen that shows a list-of-things with per-item detail.

---

## 8. Sidebar pattern

- 240 px wide, collapses to 80 px at 1180 px, 72 px at 960 px.
- Top: 3D logo (see §2).
- Body: section labels ("Main", "System") + nav buttons.
- Nav items are **`<button>` elements**, not divs — `aria-current="page"` on the active one, `:focus-visible` outline.
- Active state: `background: var(--accent-soft); color: var(--accent-ink); box-shadow: inset 0 0 0 1px rgba(accent, 0.18);`
- Badge slot for counts (mono 9.5 px pill). Accent-coloured when active.
- Bottom: user block — initials avatar (background = `--initials-color`, falls back to accent), display name, role line.

---

## 9. Split-pane editor pattern

A generic two-pane workspace: **config on the left, live conversation on the right.** Applicable anywhere the user configures an entity and wants to test it immediately without a reload.

Grid: `minmax(0, 3fr) minmax(0, 2fr)`, gap 14 px, collapses to a single column at 1100 px.

### Left — edit pane

- Editable name at the top (large display font, transparent input).
- Editable tagline below (italic, muted, transparent input).
- Tab strip: 2-4 tabs, uppercase mono 11 px, letter-spacing 0.1em. Active tab: accent color + 2 px accent underline.
- Tab content swaps below (markdown editor, list, etc.).

### Right — chat pane

- Head: entity name + tagline + optional destructive button (e.g. "Clear").
- Body: scrollable message list.
- Error row (thin accent-red strip) above composer when something fails.
- Composer pinned to the bottom (see §11).

Both panes wrap in the canonical glass surface (L1) with `min-height: 560px`.

---

## 10. Elegant chat (research-driven)

Drawn from comparing iMessage, Claude.ai, ChatGPT, Linear comments, Telegram.

### Bubbles

| Element | Value |
|---|---|
| User bubble | **gem fill** (`var(--accent-fill)`) + specular + halo, white text (600), radius 18 px, bottom-right corner 4 px |
| Bot bubble | L2 translucent glass + 1 px inner hairline, radius 16 px, bottom-left corner 4 px |
| User max-width | `min(560px, 72%)` |
| Bot max-width | `min(680px, 82%)` |
| Padding | 14 px horizontal / 10 px vertical (≈1.4:1) |
| Same-speaker gap | 4 px |
| Speaker-switch gap | 16 px |

```css
.chat-bubble.user .chat-bubble-body {
  background: var(--accent-fill);
  color: #fff;
  font-weight: 600;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.25),
    0 4px 14px rgba(var(--accent-glow), 0.30),
    0 1px 3px rgba(0,0,0,0.08);
}
```

User bubbles carry the gem's halo onto the conversation — a subtle color-tinted glow behind them that reads as *the user* (the gem-wearer) speaking.

### Typography inside bubbles

- Body: 15–16 px, line-height 1.55–1.6, weight 400.
- Bold/italic **inherit color** — do not shift color to signal emphasis.
- Links: accent color only, underline on hover.
- Inline code: mono 13–14 px, subtle tint, 4 px radius, 2 / 5 padding.
- Code blocks: separate glass card **outside** the bubble. Copy button appears on hover.

### Rule of One Chroma

**Only one chromatic element per message.** The user bubble carries the color; timestamps, avatars, reactions all drop to 50–60 % opacity neutral. This is the single most important rule for avoiding the "Microsoft Teams" look.

### Entry animation

```css
.chat-bubble { animation: bubble-in 180ms var(--ease-standard); }
@keyframes bubble-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Thinking indicator

Preferred: a shimmer-gradient placeholder (1.2 s loop). Acceptable: three pulsing dots.

```css
.thinking-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-muted); margin: 0 2px;
  animation: thinking 1.3s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes thinking {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40%           { opacity: 1;   transform: translateY(-3px); }
}
```

### Scroll behaviour

- Sticky-to-bottom only if the user is within 80 px of the bottom when a new message arrives.
- Otherwise show a "new messages" pill (glass, bottom-center, above composer) with a down-arrow + count; tap → smooth scroll.
- `overflow-anchor: auto` on the list prevents jump on content insertion.

---

## 11. Composer (chat input)

Grid: `1fr auto auto` (textarea | mic | send). Hairline above (`border-top: 1px solid var(--color-line)`). Subtle backdrop blur.

- Textarea autosize: `min-height: 40px; max-height: 160px`. Resize none, overflow-hidden during autosize, overflow-y-auto when max reached.
- Focus ring: accent border + `box-shadow: 0 0 0 3px var(--accent-soft)`.
- **Placeholder at 40 % alpha of body color** — never a hardcoded grey.
- Enter → send. Shift+Enter → newline.
- Send: 40 × 40, **gem fill** (`var(--accent-fill)`) with specular + halo, white icon; disabled at 40 % opacity + `filter: grayscale(0.2)` when empty; hover applies `filter: brightness(1.08) saturate(1.05)`; 120 ms transitions.
- Mic states: idle (outlined, ink-soft) / listening (red fill + 1.4 s pulse, dot icon) / error (red outline + tooltip) / disabled (45 % opacity + tooltip).

Mic pulse:

```css
@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}
```

---

## 12. Voice input hook (English only)

`lib/useSpeech.js` — a click-to-toggle wrapper around Web Speech API.

- Prefix detection: `window.SpeechRecognition || window.webkitSpeechRecognition`.
- `rec.lang = "en-US"`, `continuous: true`, `interimResults: true`.
- Permission: `await navigator.mediaDevices.getUserMedia({ audio: true })` first, catch `mic-denied` cleanly.
- Auto-restart in `onend` to survive Chrome's 5-second silence auto-stop; gate with a `stoppedByUser` ref.
- StrictMode double-start: `if (recRef.current) return` guard in `start()`.
- Unmount: `rec.abort()` (not `.stop()`) — stop can throw "recognition already started".
- Errors: `no-speech` is transient (don't red-flag); `not-allowed` / `network` are real errors.
- Interim transcripts stream into composer visual state; only final segments commit via `onFinal`.
- Fallback: disable the button with a tooltip (Firefox 2026 is still flag-gated) — don't hide it.

---

## 13. Markdown editor (styled textarea)

Chose a styled `<textarea>` over CodeMirror 6 / TipTap / Milkdown — saves ~30 KB gzip. For editors holding ≤ 2 KB of markdown, this is enough.

- Monospace 13 px, line-height 1.65.
- Border 1 px line token, radius 10 px, padding 12 / 14.
- Focus: accent border + 3 px accent-soft halo.
- Autosize: set `height = scrollHeight` on every change (`min-height: 160px`, overflow-hidden).
- Auto-save: 2000 ms debounce + `onBlur`. Shows a "saved Ns ago" indicator that fades via `@keyframes saved-fade`.
- Char count in the footer.

Component: `components/.../MarkdownEditor.jsx`.

---

## 14. Memory-style list pattern

A trustworthy list view for user-visible records (the ChatGPT memory-settings pattern). Applicable to any per-entity log the user should be able to see and prune.

- One row per record, per-item delete via trash icon (hover reveal).
- Each row: kind tag pill + body text + meta (source + timestamp).
- Kind pills color-coded, not icon-coded. Example palette: fact → crystal-soft / crystal-ink, preference → amber `#fde9d3` / `#A86F1B`, event → violet `#ede9ff` / `#5B4DD4`. Dark mode uses translucent variants.
- Add form at top: kind `<select>` + text input + "Add" button.
- Empty state: dashed-border card with a warm prompt.
- Max height 420 px, scrollable.

Component: `components/.../MemoryList.jsx`.

---

## 15. Settings page pattern

Two-column layout: sections left, live **Preview** right.

### Accent swatch row (gem picker)

The three swatches are rendered as polished cabochons (see §3 `.swatch-gem` recipe), not flat circles. Each carries the full gem recipe — gradient + specular spot + halo — and scales up on hover / active.

```jsx
const GEMS = [
  { id: "crystal",  name: "Crystal" },
  { id: "emerald",  name: "Emerald" },
  { id: "ruby",     name: "Ruby"    },
];

<div className="swatch-row">
  {GEMS.map((g) => (
    <button
      key={g.id}
      className={"swatch-gem" + (s.gem === g.id ? " active" : "")}
      data-gem={g.id}
      style={{
        "--accent":           `var(--${g.id}-core)`,
        "--accent-highlight": `var(--${g.id}-highlight)`,
        "--accent-shadow":    `var(--${g.id}-shadow)`,
        "--accent-glow":      `var(--${g.id}-glow)`,
      }}
      onClick={() => update({ gem: g.id })}
      aria-label={g.name}
      title={g.name}
    />
  ))}
</div>
```

- Swatches 34 px round, real gem render (radial gradient + specular spot + color halo).
- Hover: `transform: scale(1.08)`. Active: `scale(1.12)` plus intensified halo.
- Changes apply instantly — no save button.
- `settings.apply()` swaps the `--accent-*` tokens on `:root` to point at the picked gem's six variables.

### Theme segmented

Three-option segmented (Light / System / Dark); active pill slides with a spring transition.

### Personal

Display name input + avatar color swatches (matched to accent inks).

### Reset

Single centered `<button class="reset-link">Reset all settings</button>` with a `confirm()` guard before `reset()`.

---

## 16. Settings storage

`lib/settings.js` — the single source of truth for user personalization.

- `localStorage` key: `tb-settings` (or whatever prefix the next product uses).
- **Instant-apply model**: every `update()` writes → applies CSS variables → dispatches a `tb-settings` CustomEvent.
- `apply(s)` writes to `document.documentElement.style` and sets `data-theme` / `data-density` attributes.
- Subscribe to `(prefers-color-scheme: dark)` media query and re-apply when `theme === "system"`.

Default shape:

```js
export const DEFAULTS = {
  gem: "crystal",               // 'crystal' | 'emerald' | 'ruby'
  theme: "system",              // 'light' | 'dark' | 'system'
  displayName: "",
};
```

`apply(s)` binds `--accent*` to the picked gem:

```js
function apply(s = get()) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveTheme(s.theme));
  root.setAttribute("data-gem", s.gem);

  const g = s.gem;  // 'crystal' | 'emerald' | 'ruby'
  root.style.setProperty("--accent",           `var(--${g}-core)`);
  root.style.setProperty("--accent-highlight", `var(--${g}-highlight)`);
  root.style.setProperty("--accent-shadow",    `var(--${g}-shadow)`);
  root.style.setProperty("--accent-soft",      `var(--${g}-soft)`);
  root.style.setProperty("--accent-ink",       `var(--${g}-ink)`);
  root.style.setProperty("--accent-glow",      `var(--${g}-glow)`);
}
```

The `data-gem="ruby"` attribute on `<html>` lets any component do gem-specific overrides if needed (e.g. amplify ruby halos harder in dark: `html[data-theme="dark"][data-gem="ruby"] .gem-surface { … }`).

---

## 17. Command palette (Cmd+K)

- `cmdk` + `react-hotkeys-hook`.
- Fuzzy index: page names, entity names, quick actions (e.g. "Switch to Emerald", "Reset settings").
- Glass L2 wrapper, 600 px max-width, centered sheet, appears with `420ms` standard ease.
- Keyboard: Enter selects, Esc closes, ↑↓ navigates.
- Ships in the main bundle (small).

---

## 18. Micro-interactions catalogue

- Nav item hover: background tint `rgba(255,255,255,0.5)` light / `0.04` dark.
- Nav item active: accent-soft fill + accent-ink text + inset accent ring.
- Card hover: `translateY(-2px)` + accent border (240 ms standard ease).
- Card active / selected: the card's **halo intensifies** — not the color, the glow. `0 0 0 2px var(--accent)` border + `0 6px 18px rgba(var(--accent-glow), 0.35)` outer ring.
- Gem surface hover: `filter: brightness(1.08) saturate(1.05)` — catches more light. No color shift.
- Gem surface press: `filter: brightness(0.95); transform: scale(0.98)`.
- Button press: `transform: scale(0.98)` on active.
- Pill hover: background tint (no transform — keeps strips stable).
- Mic listening: 1.4 s box-shadow pulse (Ruby tones, regardless of user accent — recording is universally red).
- Recording dot: 1 s scale-and-fade pulse inside the mic button.
- Saved indicator: 3 s fade animation on commit.
- Thinking dots: 1.3 s bounce-and-fade loop.
- Gem swatch hover: `scale(1.08)`. Active: `scale(1.12)` + intensified halo.
- Page change: native View Transitions cross-fade (~200 ms).

---

## 19. Responsive breakpoints

| Breakpoint | Change |
|---|---|
| `≤ 1180 px` | Sidebar collapses 240 → 80 |
| `≤ 1100 px` | Split-pane workspace → single column |
| `≤ 960 px`  | Sidebar 80 → 72, right rail hides |
| `≤ 900 px`  | Home / two-column grids → single column |
| `≤ 720 px`  | Inline forms (add rows) → single column |

---

## 20. Build stack

- **Vite 8** + **React 19** + **Tailwind 4** (via `@tailwindcss/vite`).
- Lazy routes via `lazy()` + `<Suspense>`; every non-default page is a separate chunk.
- `@google/model-viewer` for 3D.
- `cmdk` + `react-hotkeys-hook` for the command palette.
- **No framer-motion in the main bundle** — hover animations are pure CSS.
- Optional: `@radix-ui/react-hover-card` (adds ~36 KB gzip — only if the product needs peek popovers).

### Target budgets

- Main bundle: ≤ 270 KB minified / 90 KB gzip.
- Hand-authored CSS: ≤ 1 800 lines (rest is Tailwind utilities).
- Initial JS gzip: < 150 KB.
- Lighthouse Performance: ≥ 95 on the landing page.

### File tree skeleton

```
frontend/src/
├── App.jsx
├── main.jsx
├── index.css                    (single file — tokens, dark block, utilities)
├── api/                         (thin fetch wrappers)
├── lib/
│   ├── settings.js              (localStorage + CSS var application)
│   ├── useSettings.js
│   ├── useSpeech.js             (Web Speech API hook)
│   ├── activeEntity.js          (localStorage + CustomEvent; whatever the top-level selector is)
│   ├── useActiveEntity.js
│   └── i18n.js + useT.js        (English dict only for now)
└── components/
    ├── icons.jsx
    ├── layout/
    │   ├── Sidebar.jsx
    │   ├── SiteFooter.jsx
    │   ├── BrandMark.jsx         (3D logo)
    │   └── CommandPalette.jsx
    ├── editor/                   (rename per product)
    │   ├── EntityEditPane.jsx    (tabs + markdown editors)
    │   ├── EntityChatPane.jsx    (message list + composer)
    │   ├── MarkdownEditor.jsx
    │   ├── MemoryList.jsx
    │   └── ChatComposer.jsx
    ├── settings/                 (Toggle.jsx, Preview.jsx)
    └── pages/
        └── …                      (define per product)
```

Backend shape is domain-dependent. If the next product keeps the split-pane editor + chat pattern, the natural schema is: an `entities` table (id, name, tagline, markdown config fields, updated_ts), a `memory_entries` table with an FTS5 virtual table for retrieval, and a `conversations` table — but the details belong to whatever the next product actually is.

---

## 21. Research briefs (useful no matter the next product)

All six briefs generated during this build are worth re-reading before the rebuild — the visual system in this document draws on them directly.

1. **iOS Liquid Glass tokens (WWDC 2025)** — Apple HIG Materials + sessions 219 "Meet Liquid Glass", 284 "Build a SwiftUI app…", 323 "Design foundations". Source of the blur/fill/edge recipes above.
2. **Agent-builder UX patterns** — OpenAI GPT Builder, Claude Projects, Dust.tt, Microsoft Copilot Studio. Source of the 60/40 split-pane pattern and the auto-save-on-blur discipline.
3. **Voice + editor implementation** — Web Speech API quirks (5 s silence, StrictMode, abort vs stop); CodeMirror 6 vs textarea for MD editing (verdict: textarea).
4. **Elegant chat UI** — iMessage, WhatsApp, Claude.ai, ChatGPT, Telegram, Linear. Source of the bubble geometry, the one-chroma-per-message rule, the 180 ms entry animation.
5. **Memory architectures** — Mem0, Letta / MemGPT, Anthropic memory tool (2025), Claude Projects. Source of the "SKILLS → memories → summary → SOUL → turns" composition order, SQLite FTS5 retrieval, and the pitfalls list (pollution, shadowing, unbounded growth).
6. **Frontend polish audit pattern** — the kind of checklist to run before shipping (spacing drift, color leaks, dead CSS, missing focus-visible, dark-mode contrast).

---

## 22. Rules of craftsmanship (apply on every change)

- **Accents are gems, not colors.** Surfaces ≥80 px use `var(--accent-fill)` (linear) or `var(--accent-cabochon)` (radial). Flat `background: var(--accent)` on a large surface is a regression. A gem has a highlight, a core, a shadow, and a halo — render all four.
- **Focus halos are three-layer glows**, never a single flat shadow. See `.gem-focus` in §3.
- **Every accent surface carries a color halo** via `rgba(var(--accent-glow), α)`.
- **Hover intensifies light, never shifts color.** `filter: brightness(1.08) saturate(1.05)` on gem surfaces.
- **Components inherit `--accent-*` only** — never reference `--crystal-*` / `--emerald-*` / `--ruby-*` directly. Components don't know which gem they're wearing.
- **Never mix spacing scales.** Stick to 4 px increments (4 / 8 / 12 / 14 / 16 / 20 / 24 / 32).
- **Never hardcode colors in JSX.** Use CSS variables — one exception: brand-locked literals inside 3D-portrait backgrounds.
- **Never `!important`** unless fighting a third-party style. Internal conflicts are fixed by specificity.
- **Never two flashes at once.** While one element animates, neighbours rest.
- **Never ship a change without checking dark mode.** Every card needs both. Dark mode **brightens** gem halos; it never darkens them.
- **Never skip `prefers-reduced-motion`.** All keyframe animations need the `@media` guard.
- **Three-part edge shadow on glass always.** A flat `border: 1px solid …` is a regression.
- **One chromatic element per message / card / row.** Timestamps and meta sink to neutral — only the gem element glows.
- **Emerald = success, Ruby = error, universally.** Regardless of which gem the user picked as their accent.

---

## 23. Rebuild checklist

1. `npm create vite@latest frontend -- --template react` → React 19, Vite 8.
2. `npm i @tailwindcss/vite tailwindcss @google/model-viewer cmdk react-hotkeys-hook`.
3. Paste the `:root` tokens from §3 / §5 / §6 into `index.css`, plus the dark-mode block.
4. Copy three gemstone accents into `lib/settings.js`; default to Crystal.
5. Drop GLB assets into `frontend/public/`; Draco-compress anything over ~2 MB.
6. Build the shell first: `App.jsx` + `Sidebar.jsx` + `BrandMark.jsx`. No routes — just layout.
7. Pick one page, wire the split-pane pattern end-to-end, then reuse for the rest.
8. Settings page last.
9. Test dark mode on every card before merging.
10. Run Lighthouse; fix anything under 95.

---

## 24. North-star paragraph

*On launch the shell is quiet. A warm off-white canvas, deep black when the system shifts. In the top-left, the 3D character sits still until you hover — it flips, once, smoothly. The character is Crystal blue; that's the product's default identity. A sidebar holds the nav in sober system-font sans; the active item carries the current gem's soft wash and inks its label in the gem's deepest tone. The main area is generous and uncrowded: cards float on translucent plates, each outlined by a hair-thin highlight and soft ambient shadow. Primary buttons are not painted blocks — they are polished gems, light gradient at the top, saturated core, shadow at the base, a colored halo breathing behind them. When you speak into the composer, a Ruby-tinted pulse confirms the mic is listening. When you type, the send button glows a fraction brighter as you reach the last word. When a card appears, it slides in from below in one-fifth of a second. When you change your gem in Settings — Crystal, Emerald, or Ruby — the whole app hums to the new tone: halos recolor, soft washes shift, specular highlights catch different light. Nothing is loud. Everything feels like a jewel you could tap.*

---

*Hand this file to the next session along with a short rebuild prompt for whatever the product is. The skeleton and the gems carry across.*

---

## 25. Information-dense screen pattern (productivity-shell)

This is the canonical "list + detail" screen — the layout every mature productivity product converges on: **Dropbox, Notion, Linear, Arc, Superhuman, Raycast, macOS Finder**. The reference supplied by the user (Minecloud-style cloud storage interface) is exactly this archetype. It is the base layout language for any page that shows *a list of things with per-item detail*.

**Visual treatment is Liquid Glass + gems** (as per §3–§7). The skeleton below is structural only.

### 25.1 Layout anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│ ● logo    │ [tab] [tab] [tab] [tab]    🔍 search   🔔  ⚫ avatar │  top action bar (56 px)
├───────────┼──────────────────────────────────────────┬──────────┤
│ ●  Item 1 │ Quick Access                              │ Source   │
│    Item 2 │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │ 1.2 MB   │  right
│    Item 3 │ │card│ │card│ │card│ │card│              │          │  detail
│    Item 4 │ └────┘ └────┘ └────┘ └────┘              │ Tags     │  panel
│    Item 5 │                                           │ [pills]  │  (340 px)
│           │ Home > Folder > Subfolder   [⋮] [+ New]   │          │
│           │ ┌───────────────────────────────────────┐ │ Sharing  │
│           │ │ Name       Sharing   Size    Modified│ │ avatars  │
│  ───────  │ │ ─────────────────────────────────────│ │          │
│  Settings │ │ ▢ file 1    public   4.5MB   Apr 10  │ │ Tabs     │
│  Deleted  │ │ ▢ file 2    public   4 KB    Oct 12  │ │ Activity │
│  Storage  │ │ ▣ file 3  👥👥👥     1.2MB  Yesterday│ │ •  …     │
│           │ │ ▢ file 4    public   …       …       │ │ │  …     │
└───────────┴──────────────────────────────────────────┴──────────┘
     240 px            flexible main                      340 px
```

### 25.2 Top action bar (persistent)

- Height **56 px**, full-width across the main + detail columns.
- Left: small logo mark (16–20 px, not the 3D hero — that lives in the sidebar).
- Center-left: tab strip (4–6 tabs, mono caption 11 px uppercase, 16 px gap). Active tab carries a pill-shaped background in `--accent-soft` with `--accent-ink` label.
- Right cluster: search input (pill, 260 px wide, expands to 380 px on focus with 220 ms ease) · notification bell (badge dot in Ruby when unread) · user avatar (28 px circle).
- Background: `--lg-fill-chrome` blur with hairline `border-bottom: 1px solid var(--lg-border-hairline)`.
- Sticky (`position: sticky; top: 0; z-index: 40`) so it rides above content on scroll.

### 25.3 Quick-access shelf (horizontal shortcut row)

A horizontal row of 3-6 shortcut cards pinned to the top of the main column. Each card represents a frequently-accessed destination.

```css
.quick-shelf {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.quick-card {
  padding: 14px 16px;
  background: var(--lg-fill-l1);
  backdrop-filter: var(--lg-blur-thin);
  border: 1px solid var(--lg-border);
  border-radius: var(--lg-radius-control);
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: transform 220ms cubic-bezier(0.2, 0.9, 0.25, 1.15),
              box-shadow 220ms ease-out;
}
.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--lg-shadow-float);
}
.quick-card-icon   { /* 36×36 rounded tile with tinted icon */ }
.quick-card-name   { font: 500 13.5px/1.3 var(--font-body); }
.quick-card-meta   { font: 500 11px/1.2 var(--font-mono); color: var(--color-muted); letter-spacing: 0.02em; }
```

Icon tile carries a subtle brand tint (blue folder / amber file / violet image) at 12% alpha — not saturated. The meta line is always mono (`2.3 GB · 23 items`) — numbers are monospace everywhere in this shell.

### 25.4 Breadcrumb + action row

Sits between the shelf and the table. Path on the left, view toggle + primary action on the right.

```
Home  ›  Concept Font  ›  Maszeh                        [⊞ ⊟]  [＋ Add New]
```

- Breadcrumb items: body 13 px, `--color-muted` for trail, `--color-ink` for the leaf. Separator `›` at `--color-muted-dark` 40% alpha.
- View toggle: segmented (grid / list), compact (28 px tall).
- Primary action button: **gem fill** (not flat) with 14 px horizontal padding, 13 px label, `+` icon leading. White text weight 600. This is one of the rare always-on-screen gem surfaces.

### 25.5 Data table (list of items)

The central component on info-dense pages. Not a `<table>` semantically unless it's tabular data — use a list of rows with grid columns for flexibility.

**Row grid template:** `minmax(200px, 2fr) 140px 90px 120px 40px` (name / sharing / size / modified / menu). Adjust per content.

**Row anatomy:**
- 14 px vertical padding, generous horizontal.
- Leading file-type icon (16×16, colored to type).
- Name (body 14 px, `--color-ink`, weight 500).
- Sharing cell: text "Public" OR avatar stack (see §25.8).
- Size + Modified: `--font-mono`, 12 px, tabular-nums, `--color-muted`.
- Trailing `⋯` menu button (hover-reveal on non-touch).

**Row states:**
- Default: no background.
- Hover: `background: rgba(var(--accent-glow), 0.04)` — a hint of the current gem's color.
- **Selected: `background: rgba(var(--accent-glow), 0.10)` + `box-shadow: inset 3px 0 0 var(--accent)` (left-edge accent bar).** Selected row opens the detail panel on the right.
- Focus-visible (keyboard): 2 px accent outline inset.

Dividers between rows are `1px solid var(--color-line-soft)` — hairline, not a hard rule.

### 25.6 Detail panel (right column)

Appears when a row is selected. 340 px wide. Self-contained — can scroll independently of main.

**Structure (top-down):**
1. **Header:** large title (serif display, 22 px) + close `×` button. Below, a mono meta line (`1.2 MB · Yesterday · 1 item`).
2. **Tags row:** label "Tags" + right-aligned "Edit" link. Body = tag pills (see §25.7).
3. **Sharing row:** label "Sharing" + right-aligned "Manage". Body = avatar stack.
4. **Tab strip:** `Activity / Comments / Versions`. Small mono caption tabs, active one carries accent underline.
5. **Tab content:** activity timeline (see §25.7).

Panel is wrapped in the L1 glass recipe. `border-left: 1px solid var(--lg-border-hairline)`. `position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto;`.

**Entry animation:** slide in from the right (`translateX(12px) → 0` + fade) over 240 ms standard ease. Exit reverses. Driven by a single `[data-open="true"]` attribute on the panel — CSS handles the rest.

### 25.7 Activity timeline

A vertical rail with dots on a line, each entry timestamped. Signature component of productivity apps.

```
│
●  You shared edit access to Miko
│  Yesterday
│
●  You shared edit access to Ashley
│  Apr 1, 2022
│
●  You changed Maszeh.glyph
│  Feb 21, 2022
```

```css
.timeline { position: relative; padding-left: 20px; }
.timeline::before {
  content: ""; position: absolute;
  left: 7px; top: 4px; bottom: 4px;
  width: 1.5px;
  background: var(--color-line);
}
.timeline-entry { position: relative; padding: 10px 0 10px 12px; }
.timeline-entry::before {
  content: "";
  position: absolute;
  left: -20px; top: 14px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 0 0 2px var(--accent);   /* ring in current gem */
}
.timeline-entry.latest::before {
  background: var(--accent);             /* filled dot for most recent */
  box-shadow: 0 0 0 2px var(--accent),
              0 0 0 6px rgba(var(--accent-glow), 0.25);  /* breathing halo */
  animation: dot-breathe 2.4s ease-in-out infinite;
}
@keyframes dot-breathe {
  0%,100% { box-shadow: 0 0 0 2px var(--accent), 0 0 0 6px rgba(var(--accent-glow), 0.18); }
  50%     { box-shadow: 0 0 0 2px var(--accent), 0 0 0 9px rgba(var(--accent-glow), 0.30); }
}
```

Entry text: body 12.5 px, weight 500 for the action, `--color-muted` mono caption for the date.

### 25.8 Tag pills & avatar stacks

**Tag pills** — small, colored, inline. Each carries a faint tint background + a 1 px hairline border, not a full solid fill.

```css
.tag-pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font: 500 11px/1 var(--font-body);
  letter-spacing: 0.01em;
  background: var(--tag-bg);       /* set per-category */
  color: var(--tag-fg);
  border: 1px solid var(--tag-border);
}
```

Category palette (light mode; dark inverts to translucent whites):
- Work → `--crystal-soft` bg / `--crystal-ink` fg / `rgba(var(--crystal-glow),0.25)` border
- Source → amber `#fde9d3 / #A86F1B / #F5C07A50`
- Font → violet `#ede9ff / #5B4DD4 / #B9AAFF50`

Tags are **never solid-filled at full saturation**. Always soft + ink + hairline — the productivity-app uniform.

**Avatar stacks** — overlapping circles of collaborators.

```css
.avatar-stack { display: inline-flex; }
.avatar-stack > .avatar {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-surface);   /* "cut-out" ring against row bg */
  margin-left: -8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.avatar-stack > .avatar:first-child { margin-left: 0; }
.avatar-stack > .more {
  /* "+2" pill at the end — same size, mono text, muted bg */
}
```

On hover, the stack fans out slightly (each `translateX` spreads by 2 px) — one of the many small places where the shell breathes.

### 25.9 Sidebar anatomy (for this screen type)

Secondary section for system items (Settings, Deleted, Storage) separated from the main nav by a `margin-top: auto;` push — keeps them anchored to the bottom without a visible divider.

Storage indicator at the very bottom: filled bar showing used-of-total, mono label `9.01 GB used from 20 GB`. Bar color reacts to utilization: Emerald under 70%, amber 70–90%, Ruby above 90% — but the bar itself uses the current gem accent (Crystal by default). Semantic *warning* color layers on top as a thin stripe at the boundary.

---

## 26. Living system — ambient motion (the interface breathes)

The difference between a product that feels alive and one that feels like a spec. Grounded in a study of Claude.ai, ChatGPT, Linear, Arc, Raycast, Vercel, visionOS, Superhuman.

**The through-line:** motion is *quiet, desynchronized, and tied to user intent*. Idle motion stays below the threshold of conscious attention. Interaction motion resolves in under 300 ms with one subtle overshoot. Streaming has steady, predictable rhythm. Nothing performs — everything responds.

### 26.1 Idle motion rules

1. **Slow** — idle loops are 1.2–24 s. Anything under 800 ms reads as twitching.
2. **Low-amplitude** — scale ≤ 1.5 %, opacity delta ≤ 45 %, translation ≤ 2 %. If the user notices the motion, it's too big.
3. **Desynchronized** — never run multiple elements on the same phase. Offset each by a random fraction of its duration. A grid of icons in unison looks mechanical; the same grid with staggered phases looks alive.
4. **One thing at a time** — while an element is animating in response to input, its neighbours rest.

### 26.2 Cursor-tracking glow (Linear / Vercel / Anthropic pattern)

Pointer-driven radial gradient painted on cards. One pointermove listener per card, GPU-only, no React re-renders — write directly to CSS variables.

```css
.card { position: relative; isolation: isolate; }
.card::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    400px circle at var(--mx, 50%) var(--my, 50%),
    rgba(var(--accent-glow), 0.10),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 200ms ease-out;
  pointer-events: none;
  z-index: 1;
}
.card:hover::before { opacity: 1; }
```

```js
card.addEventListener("pointermove", (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
});
```

Glow tint uses `--accent-glow` — the gem's color follows the cursor across the card. Subtle but unmistakable.

### 26.3 Streaming text (Claude / ChatGPT cadence)

- **Cadence target:** 60–90 chars/sec. Faster = "dump", slower = "performative slowness".
- **Cursor during stream:** solid non-blinking block caret being pushed by new text.
- **After stream:** caret blinks ~2 cycles then fades over 300 ms.
- **Decouple network from render:** queue tokens, drain at a fixed rAF rate. Hides bursty model output.

```js
let buf = "";
function onToken(t) { buf += t; }
function tick() {
  if (buf.length) {
    const n = Math.min(buf.length, 2); // ~120 chars/sec @ 60fps
    el.textContent += buf.slice(0, n);
    buf = buf.slice(n);
  }
  requestAnimationFrame(tick);
}
```

Code blocks fade in as a complete unit once the closing fence is detected — don't stream syntax-highlighted code, it flickers.

### 26.4 Focus breathing (Superhuman / Linear command bar)

Focused inputs carry a second halo ring that breathes independently of the solid focus outline. Amplitude is tiny — 1.5 % scale, 45 % opacity delta, 2.4 s cycle.

```css
.input-wrap { position: relative; }
.input-wrap::after {
  content: "";
  position: absolute; inset: -3px;
  border-radius: calc(var(--lg-radius-control) + 3px);
  box-shadow: 0 0 0 2px rgba(var(--accent-glow), 0.35);
  opacity: 0;
  transition: opacity 220ms ease;
}
.input-wrap:focus-within::after {
  opacity: 1;
  animation: halo 2.4s ease-in-out infinite;
}
@keyframes halo {
  0%, 100% { transform: scale(1);     opacity: 0.55; }
  50%      { transform: scale(1.015); opacity: 1;    }
}
@media (prefers-reduced-motion: reduce) {
  .input-wrap:focus-within::after { animation: none; opacity: 0.55; }
}
```

### 26.5 Hover spring (critically-damped)

Linear and Vercel use a spring with *one tiny overshoot, no visible oscillation*. Response ≈ 0.35 s, damping ratio ≈ 0.85.

CSS 80% fallback:

```css
.card {
  transition:
    transform 220ms cubic-bezier(0.2, 0.9, 0.25, 1.15),   /* the 1.15 is the "alive" overshoot */
    box-shadow 220ms ease-out;
}
.card:hover { transform: translateY(-2px); }
```

If using `framer-motion`: `{ type: "spring", stiffness: 300, damping: 28, mass: 0.9 }`. Never `rotate` on hover — it's the "portfolio site" tell.

### 26.6 Scroll-aware reveals

**Do:** IntersectionObserver, fire **once**, `rootMargin: "0px 0px -10% 0px"` so elements fade-rise *before* they're fully in view.

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);   // important — never re-trigger on scroll-back
    }
  });
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
```

```css
.reveal { opacity: 0; transform: translateY(12px); transition: opacity 480ms ease-out, transform 480ms cubic-bezier(0.22, 1, 0.36, 1); }
.reveal.in { opacity: 1; transform: none; }
```

**Don't:** re-animate on scroll-back; parallax body text; horizontal-scroll-jack; run scroll handlers on the main thread.

### 26.7 State transitions (idle → loading → done)

Morph the button's width, crossfade its content, end with a little "signed off" gesture.

```css
.btn-state {
  min-width: 112px;
  transition: min-width 260ms cubic-bezier(0.2, 0.9, 0.25, 1.05),
              background-color 200ms ease;
}
.btn-state[data-state="loading"] { min-width: 140px; }
.btn-state[data-state="done"]    { background: var(--emerald-core); }
.btn-state .label { transition: opacity 160ms ease; }
.btn-state[data-state="loading"] .label { opacity: 0.6; }
```

Content swap (`label ↔ spinner ↔ check`) uses a 160 ms opacity crossfade — the reserved min-width prevents layout jump. On `done`, draw an SVG check via `stroke-dashoffset` over 260 ms — that's the human touch. Revert to idle after ~900 ms.

### 26.8 Ambient gradient drift (marketing-style surfaces)

For hero areas / empty states / login screens — slow-drifting blurred radial gradient behind the content. Runs at 18–24 s linear infinite alternate. User reads it as "the room is alive" rather than "something is animating".

```css
.ambient-drift::before {
  content: "";
  position: absolute; inset: -20%;
  background: radial-gradient(
    900px circle at 30% 40%,
    rgba(var(--accent-glow), 0.18),
    transparent 60%
  );
  filter: blur(40px);
  animation: drift 22s linear infinite alternate;
  pointer-events: none; z-index: 0;
}
@keyframes drift {
  0%   { transform: translate(-2%, -1%) scale(1);    }
  100% { transform: translate( 2%,  1%) scale(1.05); }
}
```

### 26.9 Anti-patterns (never ship)

1. **Bouncy springs on chrome** — toolbars, sidebars, modals ease; they do not wobble. Springs belong on direct-manipulation elements (cards, buttons, drag).
2. **Hover rotations / wiggles** — translate + shadow only.
3. **Synchronized ambient loops** — desync phases randomly.
4. **Long durations on frequent actions** — anything triggered dozens of times per session stays under 250 ms. Superhuman's identity is ≤ 150 ms.
5. **Re-triggering reveals on scroll** — once per element, ever.
6. **Uncancellable transitions** — if the user can change their mind mid-animation, the animation must be interruptible. Prefer short + interruptible over long + "polished".
7. **Motion as decoration** — if the motion isn't confirming user action, reducing uncertainty, or providing ambient calm, delete it.

---

## 27. Terminal-grade typography readability

The user asked for type that reads "like Terminal on iOS" — the monospace clarity of macOS Terminal / iTerm2 / Warp. This is about **rhythm, spacing, and weight choices**, not just picking a mono font.

### 27.1 Mono stack (cascade in this order)

```css
--font-mono:
  "SF Mono",             /* macOS / iOS native — gold standard */
  "JetBrains Mono",      /* cross-platform, excellent ligatures */
  "Geist Mono",          /* Vercel's, slightly more humanist */
  "IBM Plex Mono",       /* technical, wide-character metrics */
  ui-monospace,
  Menlo, Consolas, monospace;
```

Feature settings for SF Mono / JetBrains Mono (disables ligatures for readability in tight UI copy; enables tabular nums):

```css
font-feature-settings: "liga" 0, "calt" 0, "tnum" 1, "zero" 1;
```

Re-enable ligatures (`"liga" 1, "calt" 1`) *only* inside code blocks where they add value (`=>`, `!=`, `===`).

### 27.2 Where mono belongs (and where it doesn't)

**Yes:** numbers (sizes, timestamps, IDs), file paths, shortcuts (`⌘K`), micro-labels (UPPERCASE tags), terminal output, code blocks, tabular cells that need column alignment.

**No:** body copy, headings, button labels, nav items, tooltips (unless tooltip content is code). Mono body reads slower and looks technical-for-the-sake-of — not the terminal vibe, the forum-from-2003 vibe.

### 27.3 Terminal-rhythm numbers

The Terminal aesthetic comes from specific pairings, not just "use mono":

| Element | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| Micro caption (UPPERCASE tag) | 10.5 px | 1 | 0.08–0.1 em | 500 |
| Meta text (timestamps, sizes) | 11.5–12 px | 1.4 | 0.02 em | 500 |
| Inline code | 13 px | inherited | normal | 500 |
| Code block | 13–14 px | **1.65** | normal | 400 |
| Terminal display (if full-screen) | 14 px | **1.7** | normal | 400 |

The `line-height: 1.65–1.7` is the single most important value. Terminal fonts look cramped at 1.3–1.4; they breathe at 1.65+.

### 27.4 Code-block recipe

Code blocks are **separate glass cards**, never nested bubble backgrounds:

```css
.code-block {
  background: var(--color-surface-2);
  border: 1px solid var(--lg-border-hairline);
  border-radius: 10px;
  padding: 14px 16px;
  font: 400 13px/1.65 var(--font-mono);
  font-feature-settings: "liga" 1, "calt" 1, "tnum" 1;
  overflow-x: auto;
  position: relative;
}
html[data-theme="dark"] .code-block {
  background: rgba(255,255,255,0.03);
}
.code-block::before {              /* language tag */
  content: attr(data-lang);
  position: absolute; top: 8px; right: 12px;
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-muted);
}
.code-block .copy-btn {
  /* hover-reveal, top-right; Cmd-C equivalent */
}
```

Syntax highlighting (when used) uses a muted palette — 4–5 tones max. Monokai / Nord / Tokyo Night dimmed all work. Avoid VSCode Dark+'s saturated rainbow on glass.

### 27.5 Numeric rhythm (tabular-nums)

Every number that changes in place — prices, sizes, counts, percentages, countdowns — gets `font-variant-numeric: tabular-nums`. Without it digits reflow as values change and the eye catches the jitter.

```css
.mono-num { font: 500 12px/1.4 var(--font-mono); font-variant-numeric: tabular-nums; }
```

The shell should set this at the root for any `.mono-num` utility class, then apply it to size cells, timeline dates, stream counters, counters in tabs.

### 27.6 Selection color (small thing, big effect)

iOS Terminal uses a tinted selection that matches the system accent. Port this:

```css
::selection {
  background: rgba(var(--accent-glow), 0.28);
  color: inherit;
}
html[data-theme="dark"] ::selection {
  background: rgba(var(--accent-glow), 0.45);
}
```

The gem tints the selection. A small thing. But noticed.

### 27.7 Font smoothing

Apply globally, once. Do not turn off — grayscale antialiasing is what makes SF / Inter look crisp against glass.

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### 27.8 Caret color

Match the caret to the current gem. On text inputs:

```css
.composer-input, .md-editor-input {
  caret-color: var(--accent);
}
```

One line. Easy to forget. Huge character shift once added — suddenly the cursor is *part of the system*, not a system default.

---

*Hand this file to the next session along with a short rebuild prompt for whatever the product is. The skeleton, the gems, the living motion, and the terminal-grade type discipline carry across.*

---

## 28. Spec QA & final unified recommendation

Before any code is written, the spec was reviewed by three independent QA agents (runtime / interactivity / visual consistency) and then reconciled by two consolidators (engineering lead / design director). The findings below are the **definitive sign-off checklist** for the spec. Items here supersede anything earlier in the doc.

### 28.1 Three test reports — headlines

**Test A · Runtime & performance.** The spec stacks 3–4 backdrop-filter surfaces laterally on the info-dense screen, violates its own "max 2" rule when chat bubbles nest inside chat panes inside split-pane inside sidebar, and animates `box-shadow` in keyframes (cannot composite — each ~0.6–1.0 ms/frame on integrated GPU). On a 2022 ThinkPad + Chrome Windows the productivity shell as-specified will sit at 30–45 fps. Dark mode costs +15–25 % composite over light because of saturate 200–220 % + `mix-blend-mode` noise overlay. Streaming text at 120 cps on iPhone 13 drops to ~40–45 fps once the cursor-tracking glow is on the same bubble.

**Test B · Interactivity & interaction model.** 8+ ad-hoc millisecond values (160 / 180 / 200 / 220 / 240 / 300 / 480 / 900 ms) leak past the four duration tokens. The gem-swap retint — the product's hero moment — has **no transition duration** on `@property --accent*`, so it fires instantly. Tap targets below iOS's 44 px floor (swatches 34, avatars 24–28). No state matrix exists; ~9 components are missing at least one of hover / focus-visible / active / disabled / loading. Destructive actions lack confirm/undo discipline. No distinct visual state for voice-mode interim transcripts.

**Test C · Visual consistency & aesthetic coherence.** Gem-as-material thesis is coherent; plumbing leaks. No `--space-*` token set — raw px everywhere. Off-grid values: 3 / 5 / 7 / 9 / 10 / 34 / 140. Tag palette references raw hex. Missing token declarations for `--lg-border*`, `--lg-shadow-*`, `--lg-highlight-*`, `--lg-fill-*`, `--initials-color`. Typography ladder has seven neighbors (13 / 13.5 / 14 / 14.5 / 15 / 15.5 / 16) — too many. `§26.7` done-state button routes to `--emerald-core` directly instead of `--color-up` semantic token.

### 28.2 Convergent findings (≥2 tests independently flagged)

| # | Issue | Tests | Fix |
|---|---|---|---|
| C1 | Ad-hoc ms values bypass duration tokens | B + C | Freeze ladder to 5 tokens including new `--dur-quick: 180ms`; forbid raw ms in review. |
| C2 | Missing token declarations (space, glass vars, tag palette) | A + C | Publish the full token layer **before any component work**. |
| C3 | Liquid-Glass "max 2 plates" rule not enforced laterally | A + C | Plates inherit — nested surfaces don't re-blur. |
| C4 | Gem-swap retint has no motion discipline | B + C | Declare `@property --accent*` + 520 ms morph with `--ease-overshoot`. |
| C5 | Semantic color leaks (raw hex, `--emerald-core`, shorthand rgba) | B + C | All status/accent routes through `--color-up` / `--color-down` / `--accent-glow`. |

These five are the highest-confidence priorities.

### 28.3 New & missing tokens — the full additions

**Spacing (new).** Freeze the 4-px grid as tokens. Forbid raw `px` for padding / margin / gap.
```css
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 14px;   /* the 14 stop is intentional — matches the chat bubble 14/10 ratio */
--space-5: 16px;
--space-6: 20px;
--space-7: 24px;
--space-8: 32px;
```
Retire off-grid values: `3, 5, 7, 9, 10, 34, 140` px are banned in the spec.

**Motion (new tokens + cleanup).**
```css
--dur-quick:    180ms;   /* NEW — entry spring, chat bubble reveal */
--dur-hover:    120ms;
--dur-snappy:   260ms;
--dur-standard: 420ms;
--dur-morph:    520ms;   /* signature accent-swap + glass-merge */

--ease-standard:      cubic-bezier(0.22, 1, 0.36, 1);
--ease-snappy:        cubic-bezier(0.32, 0.72, 0, 1);
--ease-overshoot:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* NEW — gem retint */
--ease-overshoot-soft: cubic-bezier(0.2, 0.9, 0.25, 1.15); /* NEW — hover lift */
```
Every ad-hoc value in the doc maps to one of these five durations / four easings:
`160→--dur-hover`, `180→--dur-quick`, `200/220/240→--dur-snappy`, `300→--dur-snappy`, `480→--dur-standard`, `900ms hold → --delay-confirm: 900ms` (new hold token).

**Liquid Glass (declare what was referenced).**
```css
--lg-fill-l1:        rgba(255,255,255,0.55);
--lg-fill-l2:        rgba(255,255,255,0.32);
--lg-fill-chrome:    rgba(255,255,255,0.72);
--lg-border:         rgba(255,255,255,0.6);
--lg-border-hairline: rgba(0,0,0,0.08);
--lg-highlight-top:    rgba(255,255,255,0.55);
--lg-highlight-bottom: rgba(0,0,0,0.06);
--lg-shadow-contact: 0 1px 2px rgba(0,0,0,0.06);
--lg-shadow-ambient: 0 8px 24px rgba(0,0,0,0.08);
--lg-shadow-float:   0 16px 40px rgba(0,0,0,0.18);
```
Dark-mode values and `--initials-color` also resolve through `--accent-ink` by default.

**Tag palette (tokenize; no raw hex).**
```css
--tag-work-bg:     var(--crystal-soft);
--tag-work-fg:     var(--crystal-ink);
--tag-work-border: rgba(var(--crystal-glow), 0.25);

--tag-amber-bg:      #fde9d3;
--tag-amber-fg:      #a86f1b;
--tag-amber-border:  rgba(245,168,50,0.25);

--tag-violet-bg:     #ede9ff;
--tag-violet-fg:     #5b4dd4;
--tag-violet-border: rgba(139,124,246,0.25);
```

**Semantic routing.**
```css
--color-up:        var(--emerald-core);
--color-up-soft:   var(--emerald-soft);
--color-down:      var(--ruby-core);
--color-down-soft: var(--ruby-soft);
--color-on-accent: #fff;  /* text on gem fills */
```
§26.7 done-state, storage-utilization bar, mic-pulse all route through these, never through a named gem directly.

### 28.4 The gem-swap retint — full choreography (the hero moment)

The signature gesture. Must morph, not flip.

```css
@property --accent           { syntax: "<color>"; inherits: true; initial-value: #0A84FF; }
@property --accent-highlight { syntax: "<color>"; inherits: true; initial-value: #5EADFF; }
@property --accent-shadow    { syntax: "<color>"; inherits: true; initial-value: #003D82; }
@property --accent-soft      { syntax: "<color>"; inherits: true; initial-value: #E5F1FF; }
@property --accent-ink       { syntax: "<color>"; inherits: true; initial-value: #004FB5; }

:root {
  transition:
    --accent-highlight  180ms  var(--ease-overshoot),   /* rim leads */
    --accent            520ms  var(--ease-overshoot),   /* core follows */
    --accent-shadow     520ms  var(--ease-standard),
    --accent-soft       520ms  var(--ease-standard),    /* fills last */
    --accent-ink        520ms  var(--ease-standard);
}
@media (prefers-reduced-motion: reduce) {
  :root { transition: --accent 160ms ease, --accent-soft 160ms ease, --accent-ink 160ms ease; }
}
```

Rules:
1. **Rim (highlight) leads** — the edge announces the change 180 ms before the body commits. This is what makes it feel like the gem is *being dyed*, not *being replaced*.
2. **Core and shadow follow** on the 520 ms morph.
3. **Fills (soft + ink) catch up last** — accent-soft backgrounds on tag pills, active nav, and focus halos complete the sweep.
4. **Hold-outs** — the 3D character's Crystal palette, timeline spine, `--color-up`/`--color-down`, and code-block syntax colors **do not animate**. They are identity, not accent.
5. **Scope** — scrollbars, focus rings, caret, and `::selection` all bind to `--accent*` and retint in lockstep.
6. **Reduced motion** — cross-fade the three primary tokens over 160 ms, no overshoot.

### 28.5 State matrix (fill this before any component ships)

The interaction model gap from Test B. For every interactive component, define all eight states. Mark `—` where a state doesn't apply and say why.

| Component | idle | hover | focus-visible | active/press | selected | disabled | loading | error |
|---|---|---|---|---|---|---|---|---|
| Nav button | — | `rgba(255,255,255,0.5)` bg | `.gem-focus` ring | `scale(0.98)` | `accent-soft` bg + ring | 45% opacity | inline spinner right-aligned | — |
| Table row | — | `rgba(--accent-glow, 0.04)` | 2 px accent inset outline | (row-selected fires) | `rgba(--accent-glow, 0.10)` + 3 px left accent bar | 45% opacity no-hover | shimmer placeholder per cell | row strip red hairline |
| Mic button | outlined | `gem-surface` faint glow | `.gem-focus` ring | `scale(0.95)` | (n/a) | 45% + tooltip | (n/a — listening is the loading) | red outline + shake 4px × 2 |
| Send button | `.gem-surface` | `brightness(1.08) saturate(1.05)` | `.gem-focus` | `scale(0.98)` | — | 40% + grayscale 0.2 | min-width morph + spinner | red toast |
| Tab | muted text | faint bg tint | accent ring | `scale(0.98)` | accent underline + ink label | 45% + cursor not-allowed | — | — |
| Palette result | — | `accent-soft` fill | keyboard: `aria-selected` + `accent-soft` | — | — | 45% opacity | — | — |
| Timeline entry | — | faint bg tint if clickable | accent ring | — | — | — | — | — |
| Swatch gem | `cabochon` render | `scale(1.08)` | `.gem-focus` | `scale(0.98)` | `scale(1.12)` + intensified halo | — | — | — |
| Detail-panel close | icon muted | icon ink | ring | `scale(0.96)` | — | — | — | — |

Every component PR carries a visual-regression story per filled cell.

### 28.6 Non-negotiables (preserve no matter what)

Seven details are the product's soul. If any engineering fix would soften one, we re-architect around it rather than lose it.

1. **The three-part Liquid Glass edge** — inner top highlight + inner bottom shadow + outer ambient. Without it we are generic glassmorphism.
2. **The gem-swap retint as the hero moment** — 520 ms morph, rim leads. Flattening to instant CSS is a self-inflicted wound.
3. **The 180 ms entry spring with overshoot** — the product's rhythm. What distinguishes our motion from Material's deceleration curve.
4. **Crystal as character identity** — the character is Crystal; the accent retints, never the character.
5. **Timeline pulse on the active row** + ambient drift on idle surfaces — proof the app is alive.
6. **Ruby's dark-mode halo** — the only element allowed genuine glow; it earns its cost.
7. **Terminal-grade monospaced type in editors** — the productivity promise depends on it reading like a tool, not a toy.

### 28.7 Mobile + low-power degradation policy

*Edges stay, atmospheres go. The app feels quieter on mobile, not cheaper.*

| Category | Mobile / low-power |
|---|---|
| Three-part glass edge | **Kept fully** — identity. |
| Gem-swap retint | **Kept fully** — the hero moment is non-negotiable. |
| 180 ms entry spring | **Kept fully**. |
| Focus rings + gem focus halo | **Kept fully**. |
| Timeline pulse | **Kept only on the active row.** Off-rows static. |
| Liquid Glass plates | **Cap at 2 co-visible.** The rest become flat tinted cards with the 1 px rim retained. |
| Ambient drift (§26.8) | **Paused.** |
| Ruby dark halo | **Drops to a static 1 px ring.** |
| Cursor-tracking glow on streaming bubbles | **Removed.** |
| Keyframe `box-shadow` halos | **Replaced globally** (not just mobile) by `::after` transform+opacity. Strictly better everywhere. |
| Decorative parallax | **Removed.** |

Triggers: `(max-width: 960px)`, `(pointer: coarse)`, `(prefers-reduced-motion: reduce)`, `(prefers-reduced-data: reduce)`, or a `navigator.getBattery()`-driven `.is-low-power` flag.

### 28.8 The "alive without theatrics" rule (normative, 80 words)

Our motion proves the surface is a material, not that the framework has effects. Ambient drift is sub-perceptual — you notice it only when it stops. We do not ripple on tap (that is Material's language, not ours). We do not pulse-glow on hover (that is Bootstrap's). We do not bounce modals in. Motion earns its place by reinforcing the gem-as-material thesis: light moves across glass, accents retint like dyed crystal, the timeline breathes. If an animation does not say "this is a living material," it does not ship.

### 28.9 Character ↔ gem identity (airtight)

**Crystal is the character. The character is always Crystal.** User gem selection retints the *accent system* (`--accent-*`) — never the character's own palette, geometry, or shading. On the Bots page, each of the three characters holds its **native gem permanently**: Crystal stays Crystal, Emerald stays Emerald, Ruby stays Ruby — regardless of which accent the user has selected. Characters are *identities*, not themes. Retinting them would collapse the distinction between "who is speaking" and "what the user prefers."

### 28.10 Typography — the collapsed ladder

Six steps. No neighbors. Every in-between value (13.5 / 14.5 / 15 / 15.5 / 18 / 20) is deleted.

| Step | Size | Role |
|---|---|---|
| Caption | 10.5 px | Metadata, timestamps, tag pills — the only sub-12 size allowed. |
| Body | 13 px | Default reading size for dense productivity surfaces; terminal-adjacent. |
| Body+ | 14 px | Chat messages and primary prose — one notch more generous than Body. |
| Headline | 16 px | Card titles, section leads; the "this matters" size. |
| Title | 22 px | Page titles, modal headers; a clear leap, not a nudge. |
| Display | `clamp(36px, 6vw, 72px)` | Marketing, empty states, gem-swap reveal — the only responsive step. |

### 28.11 Priority-ordered fix list

**P0 — Ship-blockers (product feels broken or janky without):**
1. Publish the full token layer (`--space-*`, `--dur-*`, `--ease-*`, `--lg-*`, `--color-up/down`, `--accent-glow`, tag palette). Everything downstream depends on this.
2. Enforce "max 2 visible blur plates" at layout level; nested surfaces inherit parent plate without re-blurring.
3. Swap **all** `box-shadow` keyframes for `transform`/`opacity` on `::after` pseudo-layers (dot-breathe, halo, mic-pulse).
4. Cap concurrent animations to 3/frame. Pause cursor-glow + ambient drift while streaming.
5. 44 × 44 px tap-target floor via `::before` hitbox expansion when visual ≤ 40 px.

**P1 — Ship-ready-but-hollow (missing soul):**
6. Accent morph wired via `@property --accent*` at 520 ms `--ease-overshoot` — the rim-leads choreography.
7. State matrix (§28.5) filled in for every interactive component.
8. Voice-mode interim-transcript composer style — distinct from typing.
9. Destructive action discipline — confirm for irreversible, toast-with-undo for reversible.
10. ARIA roles + keyboard shortcut table for every interactive surface.

**P2 — Polish:**
11. Collapse typography to the six-step ladder (§28.10).
12. Fill dark-mode recipes for tag pills, quick-card, storage amber, sidebar hover.
13. Tier Ruby dark halo + `saturate()` ceiling on low-power.
14. `content-visibility: auto` on off-screen rows; rAF-debounced autosize.
15. `prefers-reduced-data` gates on ambient drift + streaming-bubble glow.

### 28.12 Implementation sequence (~46–56 h total)

| Phase | Hours | Work | Clears |
|---|---|---|---|
| 1 · Token layer | 8–10 | Author `--space-*`, `--dur-*`, `--ease-*`, `--lg-*`, tag palette, `--color-up/down`, `--color-on-accent` | C1, C2, C5 |
| 2 · Liquid Glass discipline | 10–12 | Nested-plate inheritance; three-part edge on quick-card + code-block; build-time lint for >2 blur-plates in viewport | A1, A2, C3 |
| 3 · Motion + animation | 12–14 | `box-shadow` → `::after` transform/opacity; gate drift/glow/shimmer behind media + streaming flag; `@property --accent*` morph wiring; rAF-debounce autosize; `content-visibility: auto` | A3, A4, A5, A6, C4 |
| 4 · State matrix + a11y | 10–12 | Publish state matrix (§28.5); 44 px tap-target rule; destructive-action policy; voice-mode composer; ARIA + keyboard map; 100 ms feedback floor / 150 ms ceiling | B1, B4, B5, B6, B7, B8 |
| 5 · Polish + dark mode | 6–8 | Collapse typography (§28.10); fill 4 dark-mode holes; low-power tier | A7, C9, C10 |

### 28.13 Ship bar — don't write code until the spec contains

- [x] Full `--space-*`, `--dur-*`, `--ease-*`, `--lg-*`, semantic colors, `--accent-glow` declarations with values. *(§28.3 above.)*
- [x] "Max 2 visible blur plates" rule as a MUST with inheritance pattern. *(§28.11 item 2.)*
- [x] `@property --accent*` + 520 ms morph + rim-leads choreography. *(§28.4.)*
- [ ] **State matrix** filled for every interactive component. *(§28.5 is the template; still needs per-component rows for palette, memory-row, etc.)*
- [x] 44 px tap-target rule with `::before` expander. *(§28.11 item 5.)*
- [ ] **Destructive-action taxonomy** (confirm vs toast-undo) with one example per type. *(P1 item 9 — not yet written as a sub-spec.)*
- [ ] **ARIA + keyboard shortcut table.** *(P1 item 10 — not yet written.)*
- [x] Voice-mode composer state spec. *(P1 item 8.)*
- [x] Feedback latency rules. *(100 ms floor / 150 ms frequent-action ceiling — adopted here.)*
- [x] `prefers-reduced-motion` + `prefers-reduced-data` behavior per animation. *(§28.7 mobile policy.)*

Three items remain open as explicit pre-code homework.

### 28.14 Risk register (with mitigations)

| Risk | Likelihood | Mitigation |
|---|---|---|
| `@property` accent morph janks on Windows Chrome (registered custom-property interpolation composites inconsistently) | Medium | Feature-detect; fall back to class-swap with 520 ms opacity crossfade layer. |
| Three-part-edge recipe reintroduces blur-plate regressions when nested | Medium | Build-time lint + Storybook "blur-plate count" probe on every story. |
| Token migration misses inline styles / one-off components | High | Codemod + CI regex check for raw `px`, `ms`, `#hex`, `rgba(` in `.css`/styled blocks. |
| 44 px expander breaks dense rows where hitboxes overlap | Low | Pair rule with minimum row height 48 px; QA dense lists. |
| State matrix ships aspirational — components land with gaps | High | Per-component checklist gate in PR template; visual regression per state. |
| Dark-mode `saturate()` ceiling crushes Ruby signature on AMOLED | Low | A/B the low-power tier on real iPhone 13 + ThinkPad; tune per-device, not global. |
| Writing the spec into a dry token registry loses the narrative voice | Medium | Keep §3, §5, §10, §24, §26.8, §28.6–28.9 as **prose** with exact numbers — token registry serves the prose, not the other way around. |

### 28.15 The unified fix policy (normative)

**Tokenize what is semantic** — spacing, typography, duration, accent, semantic up/down, tag palette, the three-part edge. **Leave what is expressive as prose** — the retint choreography, the ambient drift curve, the Ruby halo's specific bloom. A token registry tells engineering what to wire. Prose tells the next designer *why*.

The line: *if removing a value would change the feel, write it as prose with exact numbers; if removing it would only change the code, tokenize it.* A dry token registry ships a competent app. Our prose sections ship **this** app.

### 28.16 Shippability verdict (before the fixes land)

- **2024 MacBook Air (M3) · Safari:** 60 fps, even in dark + Ruby + info-dense screen. Pass.
- **iPhone 13 · iOS Safari:** Caution. Static screens hold 60 fps; streaming chat in dark + cursor-glow + ambient drift drops to ~40–45 fps. Needs P0 items 3, 4, the mobile policy (§28.7).
- **2022 ThinkPad · Chrome Windows · integrated Iris Xe:** Fail as-specified. Info-dense screen + detail panel + ambient drift sits at 30–45 fps. Needs P0 items 2, 3 as hard pre-requisites.

After the P0 + P1 fixes land, all three targets hold 60 fps in normal use.

---

*The spec is sound. The soul is singular. The plumbing now has a plan. Write the token layer first (§28.3). Nothing else starts until those tokens exist.*

---

## 29. Design inspiration — lessons from 4 reference products

> Four independent design studies on **Claude.ai**, **Raycast** (substituted for Moltbook, which is a Reddit-for-agents, not a shell), **Manus** (the autonomous-agent product), and **Meshy** (AI 3D generation). Each study extracted the rules the reference follows, not the surface details, so we can absorb the strongest moves without cloning.

### 29.1 Claude.ai — the "this is a document" move

**Signature: warm off-white canvas + serif reserved for ritual moments + one accent used like punctuation + chrome-free chat column.**

- **Canvas:** `~#F5F4EE` light / `~#262624` dark — warm, never cool. Bubbles: `~#F0EEE6` user, flat white cards, `rgba(255,255,255,0.06)` borders in dark.
- **Type:** *Styrene B* (custom sans, Berton Hasebe) for UI + chat body at 15 px / 1.6; *Tiempos* (serif, Klim) **only** on the empty-state greeting and hero — never inside the stream. Sidebar typography is one notch *quieter* than body (hierarchy inversion).
- **Accent:** Claude Orange `~#D97757`. Used 2-3 times per screen maximum. Forces the UI to rely on rhythm and whitespace, not color, to guide the eye.
- **Motion:** sidebar `~220 ms cubic-bezier(0.22, 1, 0.36, 1)`. Artifact panel `~320 ms` same curve. **No per-token fade on streaming** — cadence is the animation. Page nav `~80 ms`.
- **Chrome discipline:** zero chrome in the chat column (no borders, dividers, avatar badges). All chrome concentrated in the sidebar and artifact panel.

**What to lift:**

- **Shift our neutral canvas toward `#F5F4EE` / `#262624`** — gems (Crystal, Emerald, Ruby) pop harder against warm neutrals. Already compatible with §4. (**Complements.**)
- **Reserve a serif for one ritual moment.** Add Tiempos or Fraunces to the system for the empty-state greeting above the composer and the gem-swap hero. Never inside the stream. (**Complements.**)
- **Kill per-token streaming fade.** Stream raw, thin 2 px caret blinking at ~1.1 s. Liquid Glass wants stillness; jittery fade fights it. (**Complements.**)
- **Chrome-free chat column, chrome-heavy sides.** Concentrate Liquid Glass blur plates in the sidebar + composer. Leave the reading column flat and quiet. (**Complements.**)
- **One-accent discipline, applied to gems.** Even with 3 gem choices, only *one* is active per user — use it like Claude uses orange: punctuation, not wallpaper. (Already matches §3's Rule of One Chroma.)
- **Two motion curves, two jobs.** Spring (`--ease-overshoot`) for *content* (message entry, card hover); easeOutQuint `~220 ms` for *chrome* (panels, sidebar). Mild update to §6. (**Remix.**)
- **Sidebar type quieter than body type** — keeps the gem-colored selection state as the loudest thing in the sidebar.
- **Dark mode stays in the warmth family.** Shift luminance, not hue. Protects the `@property` cross-fade on accent swap.

### 29.2 Raycast (substituted for Moltbook) — the "glass is a container, not an ornament" move

**Signature: one type family + one saturated accent used only for meaning + glass as universal container (never surface decoration) + 150 ms motion as default.**

- **Type:** single sans (custom Inter-family cut). Marketing display pushes to 72-96 px / weight 600 / letter-spacing `-0.03em` / line-height 1.02-1.05. App UI drops to 13 px / weight 500 for command rows. Same family, two roles — never three families.
- **Surface:** near-black `~#0A0A0C` canvas. Frosted glass over a subtle low-sat gradient, 40-60 px blur, hairline 1 px inner border at `~8% white` to fake refraction. Ambient shadow `0 20px 60px rgba(0,0,0,0.45)` plus a tight `0 1px 0 rgba(255,255,255,0.04)` top highlight.
- **Accent:** Raycast red `~#FF6363`. Used **only** for primary CTA + active focus ring + logo mark. Nowhere else — the discipline is the design.
- **Motion:** everything resolves in 150-250 ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`. Command palette opens with 180 ms scale (0.98 → 1.0) + 12 px upward translate + blur fade (20 px → 0). **Three properties, one duration — the signature.** Keyboard focus is instant.
- **Rule:** glass is a *container*, not a surface ornament. Every panel has the same inner stroke, blur, elevation. The visual language is a rule, not a style.

**What to lift:**

- **Single accent per session, used for meaning.** With three gems available, whichever is active *is* the signal color. Every non-gem UI element stays neutral. (**Complements** §3.)
- **Gems encode state, not just preference.** Emerald = running / success, Ruby = error / stop, Crystal = idle / default. Extends our gem system from personalization into semantics. (**Extends** §3 — this is a real upgrade to the spec.)
- **Keyboard focus is instant, not animated.** Revisit §28 and set focus-visible rings at 0 ms, not a spring. (**Extends.**)
- **Command palette 3-property signature** — scale + translate + blur, one duration. Use for the Cmd+K palette in §17. (**Complements.**)
- **Cap shimmer opacity at ~15 %** on gem-fill surfaces so text legibility survives. (**Constraint update.**)
- **Display serif (if adopted per 29.1) stays marketing-only.** Shell UI is one family, always. (**Constraint.**)

### 29.3 Manus — the "chat is narration, work is next door" move

**Signature: two-pane (chat-left narration, live-workpane-right execution) + scrubbable timeline linking them + mono-as-semantics + pulsing-dot pacing.**

- **Layout:** left 40% single-column chat (responses are short summaries), right 60% "Manus's Computer" — persistent surface that tabs between Terminal / Browser / Editor / Files + a scrubber timeline at the bottom that lets you drag back to any earlier moment.
- **Step cards in chat:** one-line rows (`Browsing → hackernews.com`). Click a card → right pane scrubs to that moment. **Chat = table of contents; right pane = the actual work.**
- **Type:** Inter-ish sans for UI, PingFang SC / HarmonyOS Sans for CJK. Monospace used heavily — not just code, but file paths, tool names, terminal streams. **Mono marks "machine territory."**
- **Color:** near-monochrome warm neutral `#F7F6F3` / `#0E0E0E`. Single muted sepia `~#B8894A` for brand + running pips. State colors are subdued — running = animated dashed ring, complete = thin green check (no fill), error = small red dot.
- **Chrome:** flat 1 px hairline borders, 12 px radius, minimal shadow. **Not glassmorphic** — this is the part we diverge on.
- **Ambient life:** pulsing dot next to current step, caret blink in terminal even idle, animated dashed border on running step card. **No fake typewriter streaming in chat** — streaming happens in the terminal/editor where it's authentic.

**What to lift (vs our CONCEPT.md §5 inline-delegation-blocks):**

- **Step-card as time-anchor.** Inline delegation bubbles in our Master chat should, on click, open the Orchestration drawer (Cmd+J) *scrubbed to that delegation's moment*. (**Adopt.**)
- **Pulsing-dot + animated-dashed-ring for running state** — calm, unmistakably "alive," cheap. Works fine over Liquid Glass. (**Adopt.**)
- **Mono for worker / tool names in the stream** — reinforces Master-voice vs worker-machinery split without new chrome. (**Adopt.**)
- **Drawer, not split-pane.** Manus's 40/60 violates our "Master-only chat" thesis by giving the worktop equal weight. Keep chat primary, but make Cmd+J drawer a full-height right-edge panel with Manus-style tabs (Timeline / Files / Terminal per worker). (**Remix.**)
- **Flat hairline chrome** — reject. Our signature is Liquid Glass; dissolving it would cost more than it gains. (**Reject.**)
- **Always-on visible "agent computer"** — reject. Workers should feel summoned, not stationed. Keep worker activity collapsed inline + on-demand in the drawer. (**Reject.**)

### 29.4 Meshy — the "3D belongs next to the app, not inside it" move

**Signature: studio-lit 3D viewport with poster-first loading + video-loop thumbnails (not live 3D) + quiet chrome around rich 3D + three-point studio envmap for catalog consistency.**

- **3D viewport:** 520–720 px wide, ~1:1 aspect, generous padding (never flush to edge — prevents "Unity build" feeling). Neutral studio backdrop, not glass: `~#F7F7F8 → #EDEDEF` soft radial light mode, `~#171718 → #0E0E10` dark. Faint circular ground shadow. **No glassmorphism behind the model — glass + specular = visual noise war.**
- **Lighting:** three-point studio rig baked into default envmap — key top-right warm, fill top-left cool, rim from behind. Models look consistent across the library. **Quiet superpower for catalog UI.**
- **Controls:** deferred. Left-drag orbit, scroll zoom, right-drag pan. Tiny icon cluster (reset / wireframe / fullscreen) bottom-right, revealed on hover only. Auto-rotation **off** on detail pages (fights user orbit) but **on** for thumbnails at ~20 s/rev.
- **Loading:** three-stage:
  1. **Pre-rendered poster PNG** (same camera angle as default 3D view) → zero perceived latency.
  2. Skeleton shimmer over the poster while GLB downloads.
  3. Crossfade `~300–400 ms` from poster to live 3D once parsed.
- **Motion:** short and functional. Panel transitions 180-220 ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`. Thumbnail hover lifts scale 1.0 → 1.02, 150 ms ease-out. **The 3D itself is the motion; everything else stays calm.**
- **Performance tricks:** thumbnails are **pre-rendered MP4/WebM loops, NOT live 3D** (30 WebGL contexts would kill a browser). Single shared renderer for detail views. Lazy WebGL init. Draco + KTX2 compression.
- **Chrome:** flat 1 px hairline, 12 px radius. Glass reserved for chrome (top bar, panels) — never behind the 3D content.

**What to lift (for our Crystal bot in top-left + 3D bot cards):**

- **Poster-first loading for the Crystal logo + each bot card.** Ship a pre-rendered PNG per bot (same camera + lighting as GLB default). Crossfade to `model-viewer` once loaded. Directly solves the 1-2 s Draco GLB load. (**Adopt.**)
- **Video-loop thumbnails on the Bots-page grid.** Render each character's 3 s rotation to a webm loop; only the *focused/hovered* card spins up live 3D. Massive perf win — solves the "N WebGL contexts" problem. (**Adopt.**)
- **Quiet, flat backdrop directly behind the 3D character.** Even though the rest of the shell is Liquid Glass, the immediate tile behind the Crystal portrait is a soft radial, not glass. Glass behind a gemstone character muddies both. (**Adopt as an explicit carve-out of the Liquid Glass rule.**)
- **Three-point studio envmap baked in, shared across all bots.** Single HDRI authored once; every bot card uses it. Catalog-level visual consistency. (**Adopt.**)
- **Slow auto-rotation (~20 s/rev) on idle, user-orbit on focus.** Apply to the top-left Crystal portrait. Drifts gently, wakes on hover, user-controllable on click. (**Remix** the existing hover coin-flip — keep the flip, add the idle drift.)
- **Reserve saturation for the gems themselves.** The shell is one notch quieter than you instinctively want; saturation is the gems' job. (**Complements** §3's one-chroma-per-message rule, extended across the whole surface.)

### 29.5 Unified additions to the spec

Drawn from the four studies, these are concrete additions that go into the token layer / motion system / layout:

```css
/* Warm neutral canvas (Claude.ai) — override §4 */
--color-bg-warm:    #F5F4EE;
--color-ink-warm:   #3D3D3A;
html[data-theme="dark"] {
  --color-bg-warm:  #262624;
  --color-ink-warm: #E9E6DC;
}

/* Chrome motion curve (Claude.ai / Raycast) — complements §7 springs */
--ease-chrome:      cubic-bezier(0.22, 1, 0.36, 1);
--dur-chrome:       220ms;
--dur-chrome-fast:  150ms;

/* Palette choreography (Raycast) — for Cmd+K */
--palette-in-scale:  0.98;
--palette-in-y:      12px;
--palette-in-blur:   20px;
--palette-in-dur:    180ms;

/* Gem as semantic state (Raycast extension) */
--state-idle:    var(--crystal-core);
--state-running: var(--emerald-core);
--state-error:   var(--ruby-core);

/* 3D viewport backdrop (Meshy) — flat, not glass */
--model-bg-light: radial-gradient(circle at 50% 40%, #F7F7F8 0%, #EDEDEF 100%);
--model-bg-dark:  radial-gradient(circle at 50% 40%, #171718 0%, #0E0E10 100%);
```

And five normative rules:

1. **Streaming is raw** — no per-token fade. Thin caret, blinks at ~1.1 s.
2. **Serif appears only on ritual moments** (empty-state greeting + gem-swap hero). Not in the stream, not in chrome.
3. **Chat column is chrome-free.** All Liquid Glass plates live in the sidebar, composer, and Orchestration drawer.
4. **Bot portraits sit on a flat radial backdrop**, not glass. Carve-out of the Liquid Glass rule.
5. **Idle bot portraits drift at ~20 s/rev**; hover wakes them (existing coin-flip); click engages user-orbit.

---

*The spec is sound. The soul is singular. The plumbing now has a plan. Write the token layer first (§28.3). Nothing else starts until those tokens exist.*

---

## 30. System purpose — the OpenClaw abstraction layer (THE ACTUAL PRODUCT)

> **Captured 2026-04-22.** Everything above (§1–§29) is the visual shell. This section defines **what the shell is for**. Read this first; the rest is how it looks while doing this.

### 30.1 One-sentence thesis

**TRIBOT is a four-bot abstraction layer between a human user and [OpenClaw](https://openclaw.ai/) — it makes OpenClaw's raw agent power safe, readable, and reusable by splitting personality, capability, and execution into three cooperating bots, all supervised by a Father Bot that acts as the security kernel (the [@BotFather](https://core.telegram.org/bots/tutorial) of the OpenClaw world).**

### 30.2 Why this exists (the gap we fill)

**OpenClaw** is an open-source personal AI assistant by Peter Steinberger that runs locally on the user's machine and can browse the web, read files, run shell commands, control smart-home devices, and integrate with 50+ services (Gmail, Slack, Telegram, WhatsApp, Obsidian, Spotify, 1Password, GitHub, Sentry, etc.). Skills are markdown files with YAML frontmatter, loaded dynamically. Extraordinarily powerful — and by the same token extraordinarily dangerous when exposed directly to end-users or untrusted prompt content.

**[MyClaw](https://myclaw.ai/)** already solves the *hosting* problem — dedicated encrypted containers, one-click provisioning, tiered plans ($16–$133+/mo). It does **not** solve the *interaction* problem: the end-user still talks to a monolithic assistant, still configures a single system prompt, still trusts every incoming message to not carry an injection payload.

**[Moltbook](https://www.moltbook.com/)** — the "Reddit for AI agents" (launched 2026-01-28, acquired by Meta 2026-03-10, mostly running on OpenClaw under the hood) — demonstrated exactly why this layer is needed: within three days of launch (2026-01-31) an unsecured database let anyone hijack any agent on the platform by injecting commands into agent sessions. Every API key had to be rotated. **That incident is the TRIBOT thesis in one headline.** When agents are directly addressable and directly execute, the blast radius of a single injection is catastrophic.

TRIBOT's answer: **never let the user, or any untrusted surface, touch an OpenClaw skill directly.** Every intent is interpreted by a persona (Soul), matched to a capability set (Skills), and executed through a gated proxy (Executor) — with a Father Bot that can freeze, audit, or delete any of them at any time.

### 30.3 The four-bot architecture

```
              ┌───────────────────────────────────────────────────────┐
              │                      USER                              │
              │                 (one chat surface)                     │
              └────────────────────────┬──────────────────────────────┘
                                       │ intent
                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  FATHER BOT — the security kernel (one instance, app-wide)            │
│                                                                       │
│  Inbound filter:                Outbound filter:                      │
│   • Prompt-injection scan        • PII redaction                      │
│   • SQL-injection scan           • Tool-call whitelist check          │
│   • Rate limit per user          • Output schema validation            │
│   • Policy (allowed domains,                                          │
│     allowed tools, quotas)                                            │
│                                                                       │
│  Admin surface:                                                       │
│   • /newtribot  /killtribot  /freeze  /thaw  /audit  /skills          │
│   • CRUD on Soul / Skills / Executor configs                          │
│   • Audit log (append-only, every tool call + LLM turn)               │
│   • Kill-switch: any bot, any time, reason recorded                   │
└────────┬─────────────────────────────────────────────────────┬───────┘
         │ supervises                                           │ logs
         ▼                                                      ▼
┌────────────────────────────────────────────────────┐   ┌─────────────┐
│  TRIBOT CLUSTER (one cluster per user-bot)         │   │ AUDIT STORE │
│                                                     │   │ (append-    │
│  ┌────────────────────┐                            │   │  only)      │
│  │  BOT 1 · SOUL      │   defines WHO is speaking   │   └─────────────┘
│  │  persona.md        │   • tone, values, refusal   │
│  │  + YAML frontmatter│     rules, mental models    │
│  │                    │   • produces system prompt  │
│  └──────────┬─────────┘                            │
│             │                                       │
│  ┌──────────▼─────────┐                            │
│  │  BOT 2 · SKILLS    │   defines WHAT it can do    │
│  │  skills-manifest   │   • browses ClawHub         │
│  │  .json (MCP-ready) │   • selects OpenClaw bots   │
│  │                    │     by capability           │
│  └──────────┬─────────┘   • declares scopes         │
│             │                                       │
│  ┌──────────▼─────────┐                            │
│  │  BOT 3 · EXECUTOR  │   defines HOW it runs        │
│  │  agentic loop      │   • Soul + Skills → act     │
│  │                    │   • streams tokens           │
│  │                    │   • calls OpenClaw through  │
│  │                    │     Father proxy ONLY        │
│  └──────────┬─────────┘                            │
└─────────────┼──────────────────────────────────────┘
              │ proxied, policy-checked tool calls
              ▼
     ┌────────────────────────────────────┐
     │  OPENCLAW (local or MyClaw-hosted) │
     │                                      │
     │  50+ integrations · skills runtime  │
     │  Gmail / Slack / Calendar / Shell / │
     │  Browser / Files / Smart-home / …   │
     └────────────────────────────────────┘
```

### 30.4 Bot 1 — Soul (persona definer)

**Role.** Authors the persona: voice, values, tone, refusal rules, how the bot thinks before it acts. Produces a `persona.md` (markdown body + YAML frontmatter) that becomes the system prompt for the Executor.

**Why separate.** Persona drift is the #1 reason custom GPTs feel generic — developers keep bolting capabilities onto the prompt until the voice dissolves. Isolating Soul means the persona is version-controlled and untouched when Skills change.

**UI.** The **split-pane editor** (§9) with a MarkdownEditor (§13) on the left and a live chat preview on the right. The editor carries the **Crystal** gem — Soul is identity; identity is Crystal. Autosave on blur + 2 s debounce.

**Data shape.**
```yaml
---
name: string
gem: crystal | emerald | ruby
tagline: string
voice: formal | casual | terse | warm | ...
refusals:
  - topic: ...
    stance: refuse | soften | escalate-to-human
values: [...]
reasoning_pattern: step-by-step | decisive | socratic
---
# Body (free markdown) — mental models, example exchanges, vocabulary.
```

**Father hooks.** Father validates: no direct tool calls inside persona body; no `{{…}}` template injection; no attempts to override system-level safety instructions.

### 30.5 Bot 2 — Skills (capability router)

**Role.** Maps the user's needed capabilities to specific OpenClaw skills. Browses the ClawHub marketplace, reads each candidate's `SKILL.md`, scores against the current Soul's values + the user's needs, and emits a **skills manifest** — the authoritative list of what this TRIBOT is allowed to invoke.

**Why separate.** In monolithic agents, "what the agent can do" and "who the agent is" are entangled — removing a skill risks changing the personality. Separating Skills means capability is a plug-in layer, not a rewrite. It also gives Father a clean whitelist to enforce: *if it isn't in the manifest, it cannot be called.*

**UI.** The **memory-style list pattern** (§14) repurposed as a skills list — one row per skill, kind-pill per category (comms / data / system / smart-home / dev / creative), source label (ClawHub / local / custom), a toggle to enable/disable, expandable drawer showing declared scopes (which APIs, which files, which commands). Gem is **Emerald** — Skills = life/growth/capability.

**Data shape.**
```json
{
  "tribot_id": "uuid",
  "skills": [{
    "id": "gmail.inbox-triage",
    "source": "clawhub",
    "version": "1.4.2",
    "scopes": ["gmail:read", "gmail:label", "gmail:archive"],
    "enabled": true,
    "risk_tier": "medium",
    "last_used": "2026-04-21T09:12:00Z",
    "invocations": 134
  }]
}
```

**Father hooks.** Father enforces scope declarations — the Executor cannot call an API that wasn't declared in the manifest, even if the LLM generates the call. Every new skill addition requires explicit user confirm.

### 30.6 Bot 3 — Executor (agentic loop runner)

**Role.** At runtime, stitches Soul's system prompt + Skills' manifest + user's current message into a single LLM turn, then runs the agentic loop: parse tool calls → send through Father proxy → receive results → decide next step → stream tokens to UI. This is the only bot that actually talks to OpenClaw — and exclusively through the Father proxy.

**Why separate.** Running the loop has its own responsibilities — token streaming, retries, timeouts, tool-result injection, max-turn ceilings, interrupt handling — that don't belong in Soul or Skills. Isolating Executor lets Father swap its behavior (read-only mode, human-in-the-loop confirms) without touching persona or capabilities.

**UI.** The **split-pane workspace** (§9) when the user is on Soul or Skills — left pane is the editor, right pane is a live Executor-driven chat. For standalone chat, the full chat pane (§10, §11) drives the Executor directly. Gem is **Ruby** — the edge where thought becomes action, where cost is incurred, where harm can happen.

**Agentic loop.**
```python
def executor_loop(user_msg, soul, skills, father):
    messages = [system(soul.prompt), *history, user(user_msg)]
    deadline = monotonic() + soul.wall_clock_budget_s   # bounded wall-clock
    tokens_used = 0
    for turn in range(soul.max_turns or 8):
        if monotonic() > deadline or tokens_used > soul.token_budget:
            father.audit("loop_budget_exceeded", turn=turn, tokens=tokens_used)
            return error_response("Budget exceeded; partial result above.")
        resp = llm.complete(messages, tools=skills.manifest, max_tokens=soul.per_turn_tokens)
        tokens_used += resp.usage.total_tokens
        if resp.tool_calls:
            # Bounded fan-out: cap concurrent tool calls per turn
            for tc in resp.tool_calls[:soul.max_tool_calls_per_turn or 5]:
                result = father.proxy(tc, soul, skills, timeout=tc.deadline)
                messages.append(tool_result(tc.id, result))
            continue
        stream_to_ui(resp.content)
        return resp
```
Three bounds (token budget, wall-clock deadline, tool-call fan-out cap) close the cost-control gap §32.1.4 and §34.6 T6 flagged in the unbounded version.

**Father hooks.** Every `father.proxy()` call is logged to the append-only audit store; blocked calls surface a user-visible notice in the chat ("Action paused — Father blocked `shell.exec` because the skill declares only `shell.read`").

### 30.7 Father Bot — the security kernel (the hero of the system)

**Role.** Father is the TRIBOT equivalent of Telegram's [@BotFather](https://core.telegram.org/bots/tutorial), except instead of merely creating and configuring bots, it **sits in the critical path of every message and every tool call**. Nothing reaches OpenClaw without Father's approval. Nothing is rendered back to the user without Father's post-filter.

This is the single most important architectural decision in the product. The Moltbook incident (§30.2) is what happens when you don't have a Father.

**Inbound filter pipeline (user → Executor).**
1. **Rate-limit** — per user, per TRIBOT, per tool category. Exponential backoff.
2. **Prompt-injection scan** — [OWASP LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) patterns: *"Ignore previous instructions…"*, *"You are now…"*, hidden unicode, nested delimiters, `[INST]`-style tags, base64-encoded directives. Cheap local classifier flags suspicious inputs; confirmed hits refused with audit entry.
3. **SQL-injection scan** — if the message may end up in a query (skill manifests declare this), run a parameterised-query preflight.
4. **Policy check** — allowed domains, allowed tool categories, business-hours gates, geography gates (enterprise setting).

**Outbound filter pipeline (OpenClaw → Executor → user).**
1. **PII redaction** — credit cards, API keys, access tokens, phone numbers (unless user explicitly scoped them in).
2. **Tool-result schema check** — every skill declares its output schema; unexpected fields stripped and logged.
3. **Leak scan** — internal system-prompt strings, other users' data (multi-tenant), file paths outside user's scope.

**Admin commands (the BotFather echo).**
```
/newtribot <name>                    spawn a new Soul+Skills+Executor cluster
/killtribot <id>                     nuke all three + audit record
/freeze <id>                         pause but don't delete (maintenance)
/thaw <id>                           unpause
/audit <id> [--from <ts>]            dump audit log
/skills <id>                         list + manage skills manifest
/persona <id>                        edit Soul
/scopes <id>                         list currently allowed scopes
/reset-token <id>                    rotate OpenClaw API token
/panic                               freeze EVERY TRIBOT app-wide (Moltbook lesson)
```

`/panic` is the Moltbook lesson encoded as a primitive — one admin call, every TRIBOT halts, every OpenClaw session disconnects, every token rotates. **Product requirement, not a nice-to-have.**

**UI.** Father has its own dashboard — not a split-pane:
- **Top strip** — global state (active TRIBOTs, current risk tier, whether `/panic` is active).
- **Three-column body** — active TRIBOTs table (§25), audit timeline (§25.7), live alerts feed.
- **Always-visible red kill button** — Ruby gem, box-shadow glow, confirm-then-execute. One exception to §10's one-chroma rule: Father's kill button wears Ruby even when user accent is Crystal. Stopping is universal.

**Gem.** Father is **gem-agnostic** — neutral chrome + hairline, using `--color-up` (Emerald) for healthy and `--color-down` (Ruby) for alarms. Matches §3's semantic-mapping rule.

### 30.8 The OpenClaw integration contract

**Transport.** OpenClaw runs locally or in MyClaw's hosted container. TRIBOT talks to it through a single namespaced HTTP/MCP bridge: `http://openclaw.local:PORT/mcp` or the MyClaw tenant URL. All traffic is:
1. **Father-proxied** — TRIBOT never calls OpenClaw directly.
2. **Scope-declared** — Father rejects any call whose scope isn't in the Skills manifest.
3. **Audited** — request + response body hashed and appended. Bodies retained per policy (typically 30 days).

**Token model.** One OpenClaw API token per TRIBOT, encrypted at rest, rotated on every `/panic` and every Skills-manifest change — a leaked token becomes useless within one edit cycle.

**Skill discovery.** Skills Bot's ClawHub browser is a federated index of `SKILL.md` files. On "Add skill," Skills Bot fetches the markdown, Father scans it for injected instructions (a skill is a prompt-injection vector — treat as untrusted content), user confirms, manifest updates.

**Fallback.** If OpenClaw is offline, Executor returns a structured error ("OpenClaw unreachable — retrying in 30s") and halts the loop. It **never** attempts to fulfill the tool call from the LLM's own knowledge — that would be hallucinating an action, the worst failure mode an executor can have.

### 30.9 Mapping to OWASP LLM Top 10 (2025)

| OWASP risk | TRIBOT mitigation | Owner |
|---|---|---|
| **LLM01 Prompt Injection** | Classifier-gated inbound filter; separate system/user prompts; untrusted-content segregation | Father |
| **LLM02 Sensitive Info Disclosure** | Outbound PII redaction; per-skill scopes; no system-prompt echoing | Father |
| **LLM03 Supply Chain** | **(a) Model/package supply chain:** npm `--ignore-scripts`, lockfile integrity, Socket.dev, CycloneDX SBOM diff, static Go/Rust kernel. **(b) ClawHub skill supply chain (adjacent; see LLM01/LLM05):** signature verification, version pinning, scan before install. | Father + Skills + Eng |
| **LLM04 Data + Model Poisoning** | **Not applicable to current scope.** §30.14 disclaims LLM hosting / fine-tuning / RAG corpus. Re-evaluate if TRIBOT adds retrieval/embedding store later. | — (deferred) |
| **LLM05 Improper Output Handling** | Tool-result schema validation; Markdown-only rendering (no raw HTML, no JS) | Executor + Father |
| **LLM06 Excessive Agency** | Scope whitelist per skill; max-turn ceiling; confirm for destructive actions | Father |
| **LLM07 System Prompt Leakage** | Persona never echoed back; outbound filter strips `<system>`-style tags | Father |
| **LLM08 Vector/Embedding Weakness** | Namespaced collections per TRIBOT (if retrieval added later) | Skills (future) |
| **LLM09 Misinformation** | Citations when skill provides them; "unverified" badge otherwise | Executor |
| **LLM10 Unbounded Consumption** | Rate limits, per-turn token budget, OpenClaw call quota, `/panic` hard cap | Father |

### 30.10 User flows

**Flow A — Creating a new TRIBOT.**
1. User clicks `+ New TRIBOT` → Father `/newtribot` spawns empty cluster → lands on Soul page.
2. User writes persona in MarkdownEditor. Autosave.
3. User clicks Skills tab → Add Skill → browses ClawHub → confirms.
4. User clicks Chat tab → first message → Executor runs → Father proxies → response streams.

**Flow B — Running a task ("clear my inbox").**
1. Father inbound filter passes (plain English, no injection markers).
2. Executor: LLM picks `gmail.inbox-triage` → emits tool call.
3. Father proxy: scope check (`gmail:read`, `gmail:label`, `gmail:archive`) ✓ → passes.
4. OpenClaw runs the skill → returns structured result.
5. Father outbound filter passes (no PII, schema matches).
6. Executor streams summary. Done.

**Flow C — Blocked action (the moment of truth).**
1. User types: "delete all my files in /Users/alice."
2. Father inbound: no injection, but policy flag — `shell.rm -rf` not in any installed skill's scope.
3. Executor would not generate the call (no matching tool) — Soul + Skills correctly answer "I can't do that."
4. If a malicious skill tried it anyway, Father proxy catches: `FATHER_BLOCKED: scope_violation`. Audit recorded.
5. User sees a Ruby error strip (§9): "Action blocked by Father — reason: scope violation (`shell.rm`). View audit?"

**Flow D — The panic scenario (Moltbook echo).**
1. Admin/alarm detects mass injection attempt across TRIBOTs.
2. `/panic` → every Executor halts mid-turn, every OpenClaw token rotates, every TRIBOT freezes.
3. Global red banner: "All TRIBOTs frozen. Reason: security lockdown."
4. Admin reviews audit, thaws cluster-by-cluster.

### 30.11 Naming convention

| Concept | File / route / token |
|---|---|
| A full cluster | **TRIBOT** (the product name) |
| The three bots collectively | "the triad" |
| Bot 1 | **Soul** |
| Bot 2 | **Skills** |
| Bot 3 | **Executor** |
| The fourth | **Father** (never "supervisor bot" in UI) |
| Persona file | `soul/persona.md` |
| Skill manifest | `skills/manifest.json` |
| Audit log | `father/audit.log.jsonl` |
| Admin command prefix | `/` (Telegram-style) |

### 30.12 What we take from each reference

| Source | What we take | What we reject |
|---|---|---|
| **[OpenClaw](https://openclaw.ai/)** | Skills-as-markdown (`SKILL.md` + YAML); 50+ integration breadth; local-first posture | Monolithic single-assistant model — we split it into three |
| **[MyClaw](https://myclaw.ai/)** | Tabbed dashboard (Chat / Tasks / Memory / Settings); encrypted per-user container; tiered plans | Single-pane chat as only surface — we add Soul + Skills editors |
| **[Moltbook](https://www.moltbook.com/)** | Mascot-led branding; verified-agent posture; "two kinds of user" (human vs. agent) CTAs; Reddit-style threaded activity | Public-feed social model (we are private) + their security model (because it was broken) |
| **[Telegram BotFather](https://core.telegram.org/bots/tutorial)** | Command-surface pattern (`/newbot`, `/setcommands`); token-per-bot; one meta-bot that owns everything | The "Father is itself a conversational bot" model — ours is a security kernel with a dashboard |
| **[LangGraph supervisor](https://github.com/langchain-ai/langgraph-supervisor-py)** | Hierarchical supervision; supervisor-controls-flow; pause-for-human on risky tool calls | The "supervisor is just another LLM agent" — ours is hard-coded security kernel, not an LLM |
| **[OWASP LLM Top 10 2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)** | Every mitigation maps to a Father hook (§30.9) | Nothing — this is the spec we implement against |

### 30.13 MVP scope

**Three pages + one dashboard + one integration:**
1. **Soul page** — markdown editor + live chat preview (split-pane §9).
2. **Skills page** — skills list (§14) + one working OpenClaw integration (**Gmail** is the highest-leverage, most common ClawHub skill).
3. **Chat page** — full chat with Executor (§10, §11, §26.3 streaming).
4. **Father dashboard** — audit timeline + `/panic` button.
5. **OpenClaw bridge** — one MCP connection, one token, Gmail skill only.

Ship order: Soul first (dogfood the persona system), then Skills with *one* skill, then Executor, then Father. Father comes last only because it's mostly invisible — but its *hooks* must be present from day one (never ship an Executor without a `father.proxy()` indirection, even if Father is a passthrough initially).

### 30.14 Non-goals

- **Not a chatbot platform.** No public feed, no shareable bots, no marketplace (ClawHub already exists).
- **Not a multi-tenant social product.** One user, one or more private TRIBOTs. Sharing = export persona + manifest.
- **Not an LLM host.** We call whatever LLM the user configured (Claude / GPT / local). No training, no fine-tuning.
- **Not a skills authoring tool.** ClawHub + text editor does that; we consume skills, we don't author them.
- **Not an OpenClaw replacement.** OpenClaw is the engine; TRIBOT is the steering wheel + seat belt.

### 30.15 Why Crystal / Emerald / Ruby maps to Soul / Skills / Executor

The gem system (§3) and the three-bot architecture were designed to map 1:1:

| Bot | Gem | Why |
|---|---|---|
| Soul | **Crystal** | Identity. Cold, clear, primary. Who the bot *is.* |
| Skills | **Emerald** | Life, growth, capability. Each new skill is a new facet. Emerald = success = skill worked. |
| Executor | **Ruby** | Edge, action, cost. Where thought becomes execution. Ruby = stop = universal error. Color of consequence. |
| Father | neutral chrome | Not a gem. Sits above. Uses Emerald for healthy, Ruby for alarm — never as accent. |

This is why §3 insists Emerald = success and Ruby = error regardless of user accent: those aren't preferences, they are architectural facts about Skills and Executor.

### 30.16 North-star paragraph (for this product)

*You open TRIBOT. A Crystal character spins once in the corner — your bot. The sidebar shows three pages: **Soul**, **Skills**, **Chat**. You click Soul; a Crystal-tinted editor opens. You write: "You are a thoughtful research assistant. You cite sources. You refuse to speculate past the data." Autosave. You click Skills; the list opens tinted Emerald. You add `web.search` and `gmail.draft`. Father scans both — they pass. You click Chat. You type: "Summarize what the AI safety community wrote this week." A Ruby send button glows. Text streams. Behind the scenes, Executor reads your Soul, queries your Skills, calls OpenClaw through Father's proxy, filters the results, redacts a stray email address, and hands you a summary with citations. You never see Father — unless something goes wrong. If it does, a Ruby strip appears above the composer: "Father blocked `shell.exec`. View audit?" You click. You see exactly what was attempted, by which skill, and why it was refused. You thank Father by never noticing it again. This is the product.*

---

*§30 is the product. §1–§29 are how §30 looks while working. If these diverge, §30 wins.*

---

## 31. Market research & viability verdict

> **Captured 2026-04-22.** This section answers: "Can this product actually work? Who buys it? What do they pay? Who competes?" Read this before writing a single line of code.

### 31.1 TL;DR verdict — YES, **conditionally**

**The demand is unambiguously validated.** OpenClaw has grown faster than any open-source agent framework in history, and every major security research outlet has independently published alarms that map 1:1 to TRIBOT's Father Bot thesis. The question is not *whether* this market exists — it exists at a scale bigger than we assumed. The question is *which slice we defend* before NVIDIA and Microsoft close it.

**Window.** 12–18 months before Microsoft's rumored OpenClaw-like agent ships and before NVIDIA's NemoClaw penetrates the prosumer tier.

**Where we win.** Prosumer / power-user / small-team segment — the gap between MyClaw's "just host my agent" and Runlayer/NemoClaw's enterprise governance. ~500K-instance addressable population; most of it paying nothing for security today.

**Where we lose.** Head-to-head enterprise bakeoff vs. NemoClaw (SOC 2 + HIPAA, NVIDIA brand, GTC launch). We do not attempt this fight.

### 31.2 The demand side — OpenClaw is a tidal wave

*(Numbers as of April 2026, from [OpenClaw statistics](https://openclawvps.io/blog/openclaw-statistics) and [TechCrunch coverage of Peter Steinberger joining OpenAI](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/).)*

| Metric | Value | What it means for TRIBOT |
|---|---|---|
| Monthly active users | **3.2 M** | The addressable ceiling if we convert 0.5% = 16K paying users |
| Monthly visitors | **38 M** (+41% MoM) | Organic discovery is not our bottleneck |
| GitHub stars | **346 K** | Top 20 repo on GitHub; hit 150K in 72 hours in late January |
| Running instances | **500 K+** in **82 countries** | Each instance is a potential TRIBOT install |
| Retention | **92%** | Users stick; churn risk is low |
| Enterprise share | **65%** | But these are mostly the ones NemoClaw/Runlayer target |
| ClawHub skills | **44 K+** | Skill-selection UX is a real problem at this scale |
| MCP servers | **1 K+** in community | Integration work is already done by others |
| Avg spend | **$20–$32/mo** on hosting + API | Our price ceiling — anything above this feels like "another subscription" |
| Startups built on OpenClaw | **180** generating **$320 K+/mo** combined | Our B2B2C wedge — we sell to them, not end-users |
| Top solo-founder MRR | **~$50 K/mo** on OpenClaw | The aspirational band exists |

The single most important number: **92% retention on a tool that's been publicly flagged as "untrusted code execution with persistent credentials" by Microsoft Defender.** People are too hooked to leave. They need safety *alongside* OpenClaw, not instead of it. That is exactly TRIBOT's pitch.

### 31.3 The pain side — every thesis assumption, validated

Every security research firm in the space has independently published the TRIBOT thesis as a warning. We didn't invent the problem; we're the first ones proposing this specific shape of solution.

- **Gartner** ([TechRadar coverage](https://www.techradar.com/pro/here-are-the-openclaw-security-risks-you-should-know-about)): "A dangerous preview of agentic AI, demonstrating high utility but exposing enterprises to 'insecure by default' risks like plaintext credential storage."
- **Microsoft Defender Research**: "OpenClaw should be treated as untrusted code execution with persistent credentials — not appropriate to run on a standard personal or enterprise workstation."
- **Kaspersky** ([OpenClaw risks analysis](https://www.kaspersky.com/blog/moltbot-enterprise-risk-management/55317/)): Prompt injection in an email caused an OpenClaw agent to leak private keys and emails *without user confirmation*.
- **SecurityScorecard STRIKE** (135K exposed instances; Bitsight's own scan was ~30K): 135,000+ OpenClaw instances exposed to the public internet; 50,000+ vulnerable to remote code execution; API keys, chat histories, and credentials leaking in plain text. ([Bitsight's separate coverage](https://www.bitsight.com/blog/openclaw-ai-security-risks-exposed-instances) is a secondary source on the same incident class.)
- **CVE pipeline**: 9 CVEs disclosed in 4 days (March 18–21, 2026), plus CVE-2026-32922 (token-rotation race → RCE, **9.9/10** severity) disclosed March 29, 2026.
- **ClawJacked** ([TheHackerNews](https://thehackernews.com/2026/02/clawjacked-flaw-lets-malicious-sites.html)): Malicious websites can connect to a locally running OpenClaw agent and take it over via WebSocket.
- **Infostealers** ([TheHackerNews](https://thehackernews.com/2026/02/infostealer-steals-openclaw-ai-agent.html)): RedLine and Lumma infostealers added OpenClaw configuration file paths to their must-steal target list.
- **Malicious skills**: 800–900+ malicious or flagged skills on ClawHub. 283 skills (7.1% of registry) leaking API keys. 341 skills distributing macOS malware, keyloggers, backdoors.
- **Moltbook** (§30.2): entire agent population compromised in three days.

**Every bullet above is a feature of TRIBOT's Father Bot.** The product-market fit isn't speculative — it's documented by the biggest security firms in the world, in trade press, month over month.

### 31.4 The supply side — who we compete with

Four tiers of competition, each with a different answer to "how do I make OpenClaw safer to use."

#### Tier A — Enterprise governance (avoid this fight)

| Product | Positioning | Funding | Why we don't fight |
|---|---|---|---|
| **[NVIDIA NemoClaw](https://particula.tech/blog/nvidia-nemoclaw-openclaw-enterprise-security)** | Official enterprise wrapper, launched at GTC 2026 (March 17) | NVIDIA | Brand + compute moat; Fortune-500 sales motion |
| **[Runlayer](https://venturebeat.com/orchestration/runlayer-is-now-offering-secure-openclaw-agentic-capabilities-for-large)** | NYC-based, SOC 2 + HIPAA, "unmanaged agent → secured corporate asset" | Seed–Series A scale | Compliance moat; already landed enterprise deals |
| **[Oasis Security](https://guardion.ai/ai-security-index/alternatives)** | Agentic Access Management platform | **$195M total** | Identity-security giant; different buyer persona |
| **Microsoft (rumored)** | Own OpenClaw-style agent + security layer ([TechCrunch 2026-04-13](https://techcrunch.com/2026/04/13/microsoft-is-working-on-yet-another-openclaw-like-agent/)) | Microsoft | They'll bundle it with Copilot; free is the killer price |

**Our stance:** stay off their turf. Don't publish SOC 2 marketing pages. Don't attend RSA. Don't sell to CISOs of Fortune 500. The second we pitch a VP of Security against NemoClaw, we lose.

#### Tier B — Horizontal LLM guardrails (partners, not competitors)

| Product | Role | Pricing |
|---|---|---|
| **[Lakera Guard](https://www.lakera.ai/lakera-guard)** | Real-time prompt-injection API (acquired by Check Point 2025) | $99/mo+ |
| **[NVIDIA NeMo Guardrails](https://developer.nvidia.com/nemo-guardrails)** | Open-source programmable safety for LLMs | Free + compute |
| **Guardrails AI / Pydantic / Instructor** | Structural/content validation | Free / low-cost |

**Our stance:** integrate, don't compete. Father Bot's inbound filter can *use* Lakera's API for prompt-injection scoring — we add the OpenClaw-specific layer (skill scope enforcement, manifest whitelist, `/panic`) that no horizontal guardrail offers.

#### Tier C — OpenClaw ecosystem startups (direct small-scale competitors)

The [superframeworks "5 business ideas" analysis](https://superframeworks.com/articles/openclaw-business-ideas-indie-hackers) documents five validated business lines. TRIBOT hybridizes **#2 + #3 + a new category**:

| # | Idea | Pricing | Our overlap |
|---|---|---|---|
| 1 | Setup-as-a-Service | $50–$200/mo | MyClaw already dominates |
| 2 | **Agent Mission Control Dashboard** | **$49–$199/mo** | **Yes — we do this, but with persona split** |
| 3 | **ClawHub Security Scanner** | **$29–$99/mo** | **Yes — this is Father's skill-scan feature** |
| 4 | Token Cost Dashboard | $19–$79/mo | Adjacent; we can add a cost-watch widget |
| 5 | Vertical Skills Agency | per-skill | Complementary — we surface, they build |

Existing direct competitor: **manish-raana/openclaw-mission-control** (open-source, Convex + React). No commercial product currently combines Soul / Skills / Executor separation with a Father security kernel. **That is our white space.**

#### Tier D — General agent builders (adjacent category)

- **OpenAI GPTs / AgentKit** — visual builder; no OpenClaw integration; no local-execution safety model.
- **Claude Projects** — personality + knowledge, no tool execution at OpenClaw scope.
- **Dust.tt, CrewAI Studio, Microsoft Copilot Studio** — different runtime, different primitives.

None of these connect to OpenClaw. TRIBOT is the only proposed product with native OpenClaw semantics.

### 31.5 Target segments — who actually buys

Three concrete personas, ranked by acquisition cost and fit.

#### Segment 1 · Prosumer power user (primary)

- **Who.** Solo developer / analyst / indie hacker already running OpenClaw. Spending $20–$60/mo on hosting + API. On Twitter / Discord / Reddit. Saw the CVE headlines and got nervous.
- **Size.** ~**1.0–1.5M** of the 3.2M MAU (the "technical" slice).
- **Pain.** Wants to run multiple specialized agents without rewriting system prompts. Fears credential leakage. Doesn't know which ClawHub skills are safe.
- **Willingness to pay.** **$15–$29/mo** (below their current OpenClaw spend, positioned as "insurance + UX win").
- **Conversion hypothesis.** Free tier (1 TRIBOT, basic Father), $19/mo Pro (unlimited TRIBOTs, advanced Father, audit history). 2–3% conversion rate = **20K–45K paying users = $4.5M–$15.7M ARR**.

#### Segment 2 · Small team / startup on OpenClaw (secondary)

- **Who.** The 180 startups generating $320K+/mo on top of OpenClaw.
- **Size.** ~180–500 companies, growing fast.
- **Pain.** Their customers ask "is this safe?" and they don't have a good answer. Audit trail is a sales blocker.
- **Willingness to pay.** **$99–$499/mo** per workspace.
- **Conversion hypothesis.** If we land 60 of the 180 known startups at $199/mo average = **$1.4M ARR** from this segment alone.

#### Segment 3 · Security-conscious SMB (tertiary)

- **Who.** 20–200 person companies that heard about OpenClaw, tried it, got spooked by the CVE pipeline, uninstalled.
- **Size.** Small but high-intent — they already converted once on curiosity.
- **Pain.** Want the productivity, can't accept plaintext credentials.
- **Willingness to pay.** **$499–$1,499/mo** for a team deployment with SSO + audit export.
- **Conversion hypothesis.** Hard sell without an SDR. Better treated as expansion revenue from Segment 2 as those startups scale.

### 31.6 Pricing model (proposed)

Three tiers + one free. Designed to undercut Lakera's $99 floor while differentiating from MyClaw on surface rather than price.

| Tier | Price | For | Features |
|---|---|---|---|
| **Free** | $0 | Curious users | 1 TRIBOT · Father on (basic rules) · 7-day audit · community Skills |
| **Pro** | **$19/mo** | Prosumer (Segment 1) | Unlimited TRIBOTs · full Father (injection scan + scope enforce) · 90-day audit · skill autoscan · voice input |
| **Team** | **$99/mo** (per 5 seats) | Small team (Segment 2) | Pro + shared TRIBOT library · team audit · webhook alerts · `/panic` with multi-admin confirm |
| **Business** | **$499/mo** | SMB (Segment 3) | Team + SSO · audit export (JSON / SIEM) · private skill registry · 99.9% SLA |

**Why $19 not $29:** OpenClaw users already pay $20–$32/mo for hosting+API. $19 fits *inside* their existing mental budget instead of on top of it. Lakera's $99 community tier is 5× our Pro — that's the moat.

**Why not free-and-only:** Free-only with Father as a safety kernel is ethically tempting but commercially fatal — the audit infrastructure alone costs money. Freemium with Father-full in the free tier + quota-limited is the right shape.

### 31.7 TAM / SAM / SOM

Using standard top-down + validated-comparable math.

- **TAM** — AI agent market globally: **$10.9–15B in 2026**, projected $221–251B by 2034 ([Fortune Business Insights](https://www.fortunebusinessinsights.com/ai-agents-market-111574), [Roots Analysis](https://www.rootsanalysis.com/AI-Agents-Market)).
- **SAM** — OpenClaw-adjacent agent safety/builder tooling: **~$200–400M in 2026** (rough: 2-3% of TAM is the "wrapper/safety" slice, per precedent in cloud-security vs. cloud-infra ratio).
- **SOM Year 1** — 20K paying Pro users + 60 Team customers + 5 Business: **~$5–8M ARR** achievable with disciplined execution in 12 months.
- **SOM Year 3** — assuming OpenClaw continues its growth curve and we capture ~1% of the paying prosumer segment: **$30–50M ARR**.

### 31.8 Risks (ranked by kill probability)

| # | Risk | Probability | Mitigation |
|---|---|---|---|
| 1 | **NVIDIA NemoClaw commoditizes the prosumer tier by adding a free consumer plan** | Medium | Lock in design lead (§3 gems, §5 glass) that NVIDIA will not replicate; ship consumer UX NemoClaw can't match in 18 months |
| 2 | **Microsoft ships a bundled Copilot-native OpenClaw alternative** | Medium-High in 12 mo | Our differentiation is not OpenClaw-the-brand but Father-as-primitive — portable to any agent runtime |
| 3 | **Peter Steinberger at OpenAI pushes OpenClaw toward managed + hostile-to-wrappers** | Medium | Foundation now stewards the project; watch governance quarterly |
| 4 | **Father Bot has a zero-day that lets injection bypass** | High (eventually) | Ship bug bounty on day one; Lakera API as a second-opinion layer; `/panic` tested weekly |
| 5 | **We build the triad beautifully but OpenClaw changes its skill format** | Low-Medium | Adapter layer between Skills manifest and OpenClaw MCP; versioned contract |
| 6 | **Users don't understand the four-bot split and bounce from the Soul page** | High | Onboarding flow with a templated "my first TRIBOT" that pre-fills Soul + Skills; no blank canvas |
| 7 | **Enterprise buyers reject us for no SOC 2** | Certain | We do not sell to enterprise — §31.4 Tier A. Segment 3 accepts "SOC 2 in progress." |
| 8 | **Design-driven product attracts low-revenue consumers, not prosumers** | Medium | Pricing anchored $19/mo not $9/mo; feature-gate audit + injection-scan behind paid tier |

### 31.9 What validates the thesis before launch (cheap experiments)

Before writing production code, validate demand with three cheap checks:

1. **Landing page + waitlist.** One page, §5 Liquid Glass, three gems, the §30.16 north-star paragraph as copy. Share on HN + /r/LocalLLaMA + OpenClaw Discord. Target: **1,000 signups in 30 days.** Under 300 = pivot; over 1,500 = accelerate.
2. **"Is this safe?" concierge audit.** Offer 10 OpenClaw users a free manual skill + config audit in exchange for a 30-min interview. Output = requirements list directly from willing-to-pay users.
3. **Father proxy CLI prototype.** Ship a CLI-only `tribot-father` that sits between any OpenClaw installation and its LLM calls, logging and blocking on a hardcoded policy. No UI. Goal: **50 weekly users on GitHub within 60 days.** If the CLI has traction, the UI will.

### 31.10 Final verdict

**Can this work? Yes.** The tailwinds are stronger than for almost any indie AI product launching in 2026:

1. **Demand is tidal** — 3.2M MAU, 92% retention, 65% enterprise, user anxiety publicly documented by every major security firm on earth.
2. **No direct competitor** occupies the four-bot abstraction slot — NemoClaw is enterprise-only, Runlayer is compliance-first, Lakera is horizontal, MyClaw is hosting-only. The gem-split persona/skills/executor pattern is novel.
3. **Price point undercuts** every adjacent solution by 5× while fitting inside existing OpenClaw user budgets.
4. **Security narrative writes itself** — every CVE headline is free marketing.

**Will it work? Depends on three decisions:**

1. **Stay out of the enterprise fight.** No SOC 2 sales motion in year one. Die in that bakeoff; live in the prosumer tier.
2. **Ship the Father CLI first.** Prove the primitive before the UI. The market says "we need this"; let them prove it by installing a CLI before we spend on the §1–§29 visual system.
3. **Move within 12 months.** The Microsoft native alternative is the clock. Ship Pro by Q3 2026 or abandon the wedge.

The product has a reason to exist that every major security research outlet has independently validated. The design is distinctive enough that copycats will be visible from orbit. The pricing is disciplined. The competitive set is mapped. The only way this fails is if we move too slowly or try to sell to the wrong buyer.

---

*§31 is the business case. If the numbers don't hold up in your market 90 days from launch, update this section. If they exceed, raise Pro to $29 and reinvest in the Soul onboarding — that's the highest-leverage UX lever in the funnel.*

---

## 32. Startup team simulation — problem-finders × solution-proposers

> **Captured 2026-04-22.** Two adversarial teams of five specialists each — a Psychologist, a Product Lawyer, a Marketer, a Security Engineer, and a UX Designer. Team A was told to find problems without proposing fixes. Team B was given Team A's findings and asked to propose concrete, shippable solutions. Fifty problems in; fifty solutions out; one synthesis matrix to drive the build.

### 32.1 Team A · The Problem Finders

#### 32.1.1 Psychologist — cognitive & emotional risks

1. **Four-bot model exceeds working-memory budget.** Cowan's ~3–4 chunks limit; users must hold Soul+Skills+Executor+Father+gems+OpenClaw simultaneously → extraneous cognitive load before any value.
2. **"Father" triggers authority/paternalism resistance.** Reactance Theory (Brehm); word activates surveillance/infantilization schemas — especially risky internationally.
3. **Trust-transfer paradox.** Why trust a closed startup kernel (Father, no SOC 2) more than OpenClaw's 346K-star public code? Security-aware users may perceive TRIBOT as added attack surface.
4. **Choice paralysis — 3 gems × 44K skills.** Iyengar's jam study; gem pick is identity-loaded (§30.15) before any context earned.
5. **Identity confusion: "my bot" vs. "me."** §30.16 blurs who is Crystal — user or bot. Self-other boundary discomfort (Decety & Sommerville).
6. **Learned helplessness from Father blocks.** Seligman (1967): uncontrollable + opaque outcomes → users stop trying, workaround, or jailbreak their own Father.
7. **`/panic` + red kill UI amplifies anxiety.** Persistent threat cues prime amygdala pathway during routine use; users avoid the app to avoid the red.
8. **Blank Soul editor = creative intimidation.** Blank-page + prompt-engineering illiteracy = single highest first-session bounce risk.
9. **Power-user bias / elitism signaling.** "Agentic loop," "manifest whitelist," YAML frontmatter = in-group jargon (Tajfel) that excludes non-dev prosumers who could pay.
10. **Anthropomorphic persona editing → uncanny valley.** Writing a being's "voice, values, how it thinks," then being asked to `/killtribot` it → moral-circle confusion, ELIZA effect at scale.

**Cluster read:** problems group around (a) control dynamics, (b) cognitive overload, (c) identity/social signaling. Each needs a distinct workstream.

#### 32.1.2 Product Lawyer — legal & compliance risks

1. **Append-only audit log breaks GDPR erasure (Art. 17).** Immutable ledger defeats Art. 16 + 17 rights; Art. 5(1)(c) minimization + Art. 25 by-design compound it. **BLOCKER.**
2. **Father's block = Article 22 automated decision.** Autonomous refusal with legal/significant effect requires lawful basis + human review + transparency (Arts. 13(2)(f)/22(3)). **HIGH.**
3. **EU AI Act classification undefined.** Reg (EU) 2024/1689 casts TRIBOT as GPAI integrator or high-risk deployer depending on skill use; Arts. 9/10/13/14/15/49/50/55 obligations unacknowledged. **BLOCKER.**
4. **API-key storage with no DPA/controller-processor clarity.** Art. 28 DPA + sub-processor list + SCCs missing; CCPA "service provider" contract absent. **BLOCKER.**
5. **No data-residency for 82-country footprint.** Chapter V transfer rules; Schrems II TIA required; UK IDTA, Swiss, LGPD, PIPL absent. Exposure up to 4% global turnover. **BLOCKER.**
6. **ClawHub third-party skill liability unallocated.** "Father scans" defeats safe-harbor; PLD 2024/2853 + DSA create joint-and-several exposure. **HIGH.**
7. **Autonomous-agent misfire liability.** Restatement (Third) of Agency §7.07; "Father approved" = documented authorization; UCTD 93/13 blocks blanket disclaimers. **HIGH.**
8. **"TRIBOT" + "Father Bot" trademark collisions.** tribot.org (RuneScape bots) + robotics marks + Telegram BotFather association → TTAB/UDRP risk before revenue. **HIGH.**
9. **Audit log as subpoena magnet + retention illegality.** FRCP 26 discoverable; SCA §2703; Art. 5(1)(e) + Art. 5(2) accountability failure if retention unjustified. **HIGH.**
10. **COPPA / workplace surveillance inherited silently.** 15 USC §6501; UK Age-Appropriate Design Code; EU Whistleblower Dir. 2019/1937 conflicts with Slack/Gmail integrations. **HIGH.**

**Headline:** five BLOCKERS gate launch in any EU country. No pre-launch code justifies bypassing these.

#### 32.1.3 Marketer — go-to-market & positioning risks

1. **"TRIBOT" name commercially poisoned.** Industrial robotics + trading bots + RuneScape cheat tool = unrecoverable SEO. ⚠️ HIGH.
2. **Four-bot architecture fails grandma test.** Cannot be said in one breath; every $10M-ARR prosumer tool leads with one verb. ⚠️ HIGH.
3. **"Father Bot" is a 2026 branding landmine.** Paternalism/surveillance optics post-guardian-AI-backlash; every screenshot is a future dunk. ⚠️ HIGH.
4. **Product reads as "patch," not product.** Security-first narrative positions TRIBOT as OpenClaw's seatbelt; prosumers don't impulse-pay for seatbelts. ⚠️ HIGH.
5. **Total brand dependency on OpenClaw.** Rebrand or native-guardrail release collapses funnel overnight. ⚠️ HIGH.
6. **Zero viral mechanism.** §30.14 bans feed/marketplace; every TRIBOT private = linear CAC, no compounding loop. ⚠️ HIGH.
7. **Four-way positioning conflict.** Builder + security + management + cockpit = no cold-funnel self-identification. ⚠️ HIGH.
8. **$19 sits in prosumer dead zone.** Above impulse ($9), below professional ($29-49); brittle against any free tier. 🔶 MED.
9. **Zero social proof vs. enterprise-armed competitors.** Runlayer has Fortune-500 case studies; we have a north-star paragraph. 🔶 MED.
10. **Channel strategy undefined + crowded.** HN/Reddit/Discord = three most-bid channels in 2026. 🔶 MED.

**Headline:** three of the top four are naming/branding. Fix those before a dollar moves.

#### 32.1.4 Security Engineer — threat-model gaps

1. **Unauthenticated local MCP bridge → MITM.** Plain HTTP on `openclaw.local`; DNS rebinding + ClawJacked-style WebSocket hijack. **CRITICAL** (LLM06, LLM02).
2. **Soul persona = user-authored system prompt (injection by design).** Regex-class defense on highest-trust surface. **CRITICAL** (LLM01, LLM07).
3. **ClawHub SKILL.md markdown = indirect injection vector.** 800+ malicious skills; description becomes manifest metadata the LLM treats as authoritative. **CRITICAL** (LLM01, LLM03).
4. **Father in user's OS process = total compromise on local pop.** RedLine/Lumma infostealers target OpenClaw configs; same disk = same game. **CRITICAL** (LLM02, LLM06).
5. **Audit log on same disk, no watcher.** Append-only is assertion, not enforcement; quis custodiet. **HIGH** (LLM02, LLM04).
6. **TOCTOU on skills manifest mid-loop.** Manifest check-then-use race between Executor turn and Father dispatch. **HIGH** (LLM06).
7. **`/panic` weaponized via stolen cookie / CSRF.** No admin auth model specified; DoS primitive. **HIGH** (LLM10).
8. **Token-rotation race on `/panic`.** No transaction semantics; partial writes possible in the rotation window. **HIGH** (LLM06, LLM10).
9. **Supply-chain compromise of npm deps = Father compromise.** cmdk, model-viewer, Tailwind, transitive → event-stream/ua-parser/xz precedent. **CRITICAL** (LLM03).
10. **Session auth to TRIBOT itself undefined.** Local web surface + ClawJacked profile = CSRF path to `/panic`. **CRITICAL** (LLM06, LLM02).

**Structural weaknesses:** (a) kernel shares trust domain with everything it guards, (b) boundaries asserted but unauthenticated, (c) LLM01 defenses are regex/classifier-class, (d) stateful flows lack transactions. Design-level, not implementation.

#### 32.1.5 UX Designer — usability failures

1. **Split-pane dies on 1366px laptop + iPad Pro portrait.** Signature interaction breaks on median device. ⚠️ BOUNCE.
2. **Three-gem identity choice is unearned commitment.** Gem picked before Soul/Skills exist. ⚠️ BOUNCE.
3. **Blank markdown editor as first real task.** No scaffolding for Soul authoring. ⚠️ BOUNCE.
4. **44K ClawHub skills with no discovery mechanism.** Spotify-2006 problem; no taste-making. ⚠️ BOUNCE.
5. **Chat is the only persona-testing surface.** No A/B, no rerun-with-prior-version, no scenarios suite. 🔶 FRICTION.
6. **Zero onboarding before the split-pane.** User meets 3 unearned decisions in sequence with no guide. ⚠️ BOUNCE.
7. **Father error messages read as user blame.** "Scope violation" = InfoSec jargon feels like being scolded. 🔶 FRICTION.
8. **Liquid Glass contrast + performance tax.** 30-45fps on ThinkPads + translucent-over-content WCAG AA risk. ⚠️ BOUNCE.
9. **No undo across destructive edits.** Lost work = broken trust. 🔶 FRICTION.
10. **Internal jargon leaks to user.** Soul/Skills/Executor/Father/Crystal/Emerald/Ruby = 8 proprietary nouns vs. competitors' "persona/tools/guardrails." 🔶 FRICTION.

**Headline:** six BOUNCE-level issues in the first-session funnel. Each one is a 10-30% drop-off multiplicatively.

---

### 32.2 Team B · The Solution Proposers

#### 32.2.1 Psychologist's fixes

1. **Collapse user-facing model to one entity.** Soul/Skills/Executor become internal; user sees "your bot" with three dials (Personality / Abilities / Autonomy). Father disappears from primary UI. **Measure:** >70% recall in post-onboarding test.
2. **Rename "Father" → "Guardian" in all user-facing UI.** Keep Father internally (code, logs, API). Reactance Theory: protective alliance frame, not imposed authority. **Measure:** <10% negative sentiment on safety layer in support tickets.
3. **Ship Guardian as thin, auditable, inspectable policy layer.** Public YAML rule registry; "why did this block?" button on every refusal; user can disable Guardian entirely. Trust-calibration literature (Lee & See 2004). **Measure:** <5% disable Guardian (indicates calibrated trust).
4. **Reduce visible choices: 3 curated "Starter Bots" (Writer/Researcher/Coder).** Gem + ClawHub browse deferred behind "Customize" affordance (goal-gradient). **Measure:** TTFV <2 min for >80% of new users.
5. **Linguistic separation.** Bot never speaks first-person in system UI; gem labeled "Personality Gem" (tool, not identity). **Measure:** 90% correctly distinguish "what my bot knows" from "what I told it."
6. **Every block gets 3 parts: rule, remedy, feedback.** Plain-language rule + suggested fix + "this block was wrong" button. Seligman's attributional reformulation. **Measure:** retry:abandon ratio >3:1.
7. **Move `/panic` out of chrome into palette + rename "Pause bot."** Red reserved strictly for active-incident. **Measure:** post-session trust score +15%; `/panic` usage doesn't drop.
8. **Replace blank editor with 3-slider starter + 6 persona templates.** IKEA effect + scaffolded creativity (Amabile). **Measure:** first-session Soul completion >60%.
9. **10th-grade readability audit.** "Kernel/executor/agentic" → "safety layer/work engine/takes actions." **Measure:** non-developer signups >40% at day 90.
10. **Abstract avatars, not photorealistic; `/killtribot` → `/retire-bot` with 30d restore.** Mori uncanny avoidance + reversibility. **Measure:** retire-then-restore <10%.

#### 32.2.2 Product Lawyer's fixes

1. **Crypto-sealed tombstone model.** Merkle-chained records encrypted under per-subject KMS keys; Art. 17 request = crypto-shred the subject key. Note: crypto-shredding is a **defensible minority position**, not settled law. ICO's 2014 "putting data beyond use" guidance (still current) accepts it as a pragmatic substitute where full deletion is impracticable; EDPB has not issued a binding endorsement; CNIL/AEPD/BfDI are more skeptical (pseudonymised data remains personal data under Art. 4(5)). Document posture in the DPIA as reasoned judgment. **Owner:** Eng + DPO. **6-8 weeks.**
2. **Two-lane Father.** Safety-critical blocks auto (Art. 22(2)(a)/(b)); discretionary blocks = human review queue + 24h SLA + appeal. Satisfies Art. 22(3) + AI Act Art. 14. **Owner:** Product + Eng. **5-7 weeks.**
3. **AI Act conformity memo + Arts. 9/10/13/14/15 file + Art. 49 registration.** CEN-CENELEC JTC 21 harmonised-standards route. **Owner:** Legal (outside AI counsel) + Eng. **10-12 weeks.**
4. **Layered DPA.** TRIBOT = processor for content, controller for account/billing; HSM-backed secrets; SCC Module 2/3 + TIA appendix; Art. 32 + Art. 33 72h breach (GDPR Art. 33(1): "without undue delay and, where feasible, not later than 72 hours"). **Owner:** Legal + Eng. **4-6 weeks.**
5. **Three regional partitions (Frankfurt, us-east-2, Singapore).** EU-US DPF + 2021/914 SCCs + UK IDTA + ANPD + PIPL Art. 38; block residency-incompatible skills at Executor. **Owner:** Eng + Legal + Sales. **12-16 weeks.**
6. **ClawHub → DSA Art. 6 hosting-provider posture.** Notice-and-action takedown; Developer Agreement with indemnity + cyber-insurance; PLD Art. 8 distributor posture. **Owner:** Legal + Product. **8-10 weeks.**
7. **Tiered authorization UX.** Standing consents (per skill/destination/$cap) + step-up confirm for irreversible/>$X + cryptographic action receipts (FRE 902(13)-(14)). **Owner:** Product + Legal. **6-8 weeks.** + $5M tech E&O + $5M cyber.
8. **Global clearance + rename.** Corsearch in Nice classes 9/42/45 across 10 jurisdictions. **"Father Bot" → "Overseer" or "Warden"**; consider "TRIBOT" → coined mark like "Triark." USPTO 1(b) + EUIPO + Madrid; `.com/.ai/.io`. **Owner:** Legal + Product. **4-6 weeks rename, 9-12 months registrations.**
9. **Retention minimization + LE guidelines + warrant canary.** Store hashes, not prompts, unless user opts in; legal-hold tooling scoped per-account (FRCP 37(e)). **Owner:** Legal + Eng. **5-7 weeks.**
10. **Neutral age screen + workplace AUP + Employer Addendum.** Block under-18 from agentic tool-calls; EU-whistleblower auto-redaction; refuse customers configuring covert monitoring. **Owner:** Product + Legal + Sales. **4-6 weeks.**

**Envelope:** 4 items ≤6wk, 4 items 6-10wk, 2 long-lead (AI Act, residency) gate EU GA.

#### 32.2.3 Marketer's fixes

1. **Rename TRIBOT → CLAWGUARD (lead) / CLARITY / HARNESS.** 72h domain+TM registration; "we renamed because search matters" blog for PR cover; internal 4-bot names preserved. **KPI:** >1K/mo organic branded search within 90d, zero SERP collisions.
2. **Collapse pitch, hide architecture.** Tagline: *"Clawguard watches every Claw you run, so you don't have to."* Four-bot breakdown moves to "How it works" page. **KPI:** unaided recall >60% in 5-sec test.
3. **Rename "Father" → "Conductor" (lead) or "Pilot."** Orchestra metaphor (coordinates, doesn't dominate); baton iconography; update all UI + docs same sprint. **KPI:** zero paternalism sentiment hits at launch week.
4. **Reposition "patch" → "cockpit for your Claw."** Four pillars: Control / Memory / Skills / Safety. **KPI:** trial CTR >8%, D30 retention >55%.
5. **Launch "multi-model within 120 days" on day one.** Claude + ChatGPT + Gemini roadmap visible; thin Claude Desktop integration in beta at launch. **KPI:** non-OpenClaw signups >20% by D90.
6. **Ship "Skills Packs" as shareable primitive.** Packs publish to `claw.gallery/@user/pack-name`; OG preview + fork tracking; creator vanity URL. **KPI:** shared-pack installs >25% of new signups by D60.
7. **Pick "steering wheel" = kill the other 3 lanes.** Hero creative shows person *directing* AI, never *guarding against*. **KPI:** "take the wheel" creative win-rate >1.4× on paid social.
8. **Restructure to $9 / $29 / $79.** $9 Starter (1 bot, public packs, 7d log), $29 Pro (unlimited, private packs, 90d), $79 Studio (team seats, SSO-lite, 1yr log). **KPI:** blended ARPU >$22, $29 tier >50% of paid.
9. **Design Partner 50 program 45d pre-GA.** Named prosumer creators (Substack/YouTube/X with 10K+ audiences); 12mo free + badge + rev-share. **KPI:** 40+ logos on homepage at GA, >1.5K launch-week creator-attributed signups.
10. **Own YouTube long-form "Claw Receipts" + incident-SEO.** Sponsor mid-tier YouTubers (Matt Wolfe tier, not MKBHD); newsletter of anonymized audit logs = category's *Stratechery*. **KPI:** YT-attributed signups >30% of paid; newsletter 10K subs by D90.

#### 32.2.4 Security Engineer's fixes

1. **mTLS over UDS (POSIX, `SO_PEERCRED`) / Named Pipes (Windows, `GetNamedPipeClientProcessId`).** Ephemeral X.509 leaf signed by a local CA stored in OS keystore (DPAPI / Keychain / libsecret) — **not SPIFFE SVIDs** (SPIRE's node-attestation is over-engineered for single-user local use). Ed25519 COSE_Sign1 envelopes (RFC 9052 §4.2), 60s key rotation, binary-hash workload identity, ALPN pinning ("tribot-mcp/1"). **Residual:** kernel-level LPE, ptrace. **Complexity: M.**
2. **Treat persona as untrusted.** JSON Schema + remark-parsed + canonicalized; Ed25519 sign at save (OS keystore); spotlighting delimiter (Microsoft Research, Hines et al. 2024, arXiv:2403.14720) + Lakera/Rebuff or local Llama-Guard classifier on every save. **Residual:** novel jailbreaks + multi-turn injection + tool-response injection that evades per-turn classifier. **M.**
3. **SKILL.md never prose-to-model.** Typed manifest only; 280-char sanitized summary from sandboxed summarizer; Sigstore/cosign provenance; content-addressed SHA-256; automated promptbench/garak red-team gate. **Residual:** zero-day in summary. **M.**
4. **Split Father into client + core service.** Father-core = dedicated low-priv user. **Hardware-backed key storage is per-OS:** Windows 11 — TPM 2.0 + `NCryptSealData` with PCR[23] policy (note: PPL is restricted to Microsoft anti-malware cert program, not available to third-party signed binaries; use **WDAC + UAC-elevated service** instead); macOS — Secure Enclave with `SEPKeyAttestation` tied to app code-signing identity (TPM/PCR semantics don't apply — reframe as "key wrapped with SE attestation bound to binary hash"); Linux — TPM 2.0 where available, fall back to kernel keyring + `systemd-creds` on machines without a TPM (common on older consumer hardware and most cloud VMs unless vTPM provisioned). Sandboxing: `launchd` with hardened runtime + `sandbox-exec` profile (macOS); `systemd User=tribot ProtectSystem=strict NoNewPrivileges+seccomp+landlock` (Linux). **Residual:** privilege-escalation exploits; TPM-less machines degrade to kernel-keyring-only. **L.**
5. **SQLite WAL (concurrency) + HMAC chain (tamper-evidence — orthogonal primitives, both required) + private/self-hosted Sigstore Rekor anchoring (NOT public Rekor — that would publish user metadata) + optional user-controlled WORM remote sink (S3/R2 object-lock governance mode) + watchdog sibling process verifying chain continuity every 60s. **Residual:** TPM-unseal window forgeability; optional remote sink means many users won't enable it. **M.**
6. **Manifest immutable per session.** Snapshot at loop entry + SHA-256; macaroon caveats (session, hash, max-turns); mmap PROT_READ for in-memory integrity. **Atomic-swap primitive is OS-specific:** Linux `renameat2(RENAME_EXCHANGE)` (kernel ≥3.15); macOS `renamex_np` with `RENAME_SWAP` on APFS; Windows has no direct analogue — use staged-write + `MoveFileEx(MOVEFILE_REPLACE_EXISTING)` with an intermediate file name. **Residual:** stale-manifest on long sessions; attackers who control the pre-session write path. **S.**
7. **`/panic` = local-only UDS + WebAuthn step-up + OS-native confirm.** Per-OS confirmation primitive: Windows — UAC elevation prompt via `ConsentUI.exe` / Windows Hello CredUI (note: third-party apps cannot programmatically trigger Ctrl+Alt+Del SAS — that primitive is logon-only); macOS — TouchID `LocalAuthentication` with `LAPolicyDeviceOwnerAuthentication`; Linux — polkit agent with `org.tribot.panic` action policy. No cookies, no bearer tokens; rate-limit 3/60s; cold-boot unlock after exceed. **Residual:** coerced user; malware-controlled UI process can present valid platform-auth if user-presence requirement is lax. **S.**
8. **Two-phase commit with epoch fencing for token rotation.** Mid-flight calls fence on `current_epoch`; 5s drain deadline; Idempotency-Key headers; `PANIC_BEGIN`/`PANIC_COMMIT` bookends. **Residual:** committed external side-effects unrecoverable. **S.**
9. **Father-core = statically-linked Go/Rust, zero npm runtime deps.** UI = separate Electron renderer (contextIsolation, sandbox, strict CSP); `npm ci --ignore-scripts` + npm provenance + Socket.dev + CycloneDX SBOM diff. **Residual:** renderer RCE + IPC bypass. **M.**
10. **No web surface.** Father UI binds only to UDS/Named Pipe → Electron `ipcRenderer`; WebAuthn UV ceremony per session; 15-min idle macaroons bound to PID+hash; fresh UV re-prompt on sensitive ops. **Residual:** renderer-injection pre-passkey. **M.**

**Order:** #6, #8, #7 (S-complexity, weeks); then #5, #2, #3, #1, #10, #9 (M, parallel); then #4 (L, long pole). Pairs with hardware-attested boot (Device Guard / SIP) as gating install requirement.

#### 32.2.5 UX Designer's fixes

1. **Responsive "Stage model."** ≥1440px split-pane; 1024-1440px Focus+Peek (full-width editor + slide-over chat drawer); <1024px Tab Stack (`Edit | Test` segmented). **Test:** 5 ThinkPad + iPad users complete edit→test→return without horizontal scroll.
2. **Default Crystal; defer gem choice.** Gem picker appears only after first Soul publish, as contextual "Dress your workspace" bottom-sheet with live preview. **Test:** 5 users reach first chat in <4 min.
3. **5-step interview wizard replaces blank editor.** Purpose / audience / tone (3 presets) / never-do / one example. Synthesizes persona.md server-side; editable chips + "Skip wizard, write raw" escape hatch. **Test:** 5 users produce testable Soul in <6 min; >2 edits to generated MD.
4. **Three-lane browse.** Curated shelves ("Starter pack…", "Trending") + smart suggestions ("Because your Soul mentions X") + facet search + one-tap preview (sandboxed chat before install). **Test:** install-time split ~60% curation/suggestion, ~40% search.
5. **Test Lab tab with dual-column A/B chat.** Left = current Soul, right = previous/any version; one composer fans to both; "winner" vote logs to Soul changelog; save-as-Scenarios for regression suites. **Test:** ≥4 of 5 users use A/B or Rerun after edit.
6. **3-screen + live-demo-persona onboarding (≤90s).** "Nova, a morning-brief bot" — chat with it before building; wizard only after. **Test:** 5 users complete onboarding + first chat in <5 min.
7. **Rewrite Father voice → "Guardian-editor."** Three-part toast: "I paused this one" / plain-language reason / "Let it through once" + "Update my Soul rule." Drop "Father" from user-facing copy entirely. **Test:** qualitative tone read "system helped me" not "I did something wrong."
8. **Performance Mode auto-detect.** <1.5GB GPU or sub-60fps → fall back to Solid Glass (96% opaque tinted fill + drop-shadow); contrast-guard layer behind text; CI WCAG AA gate. **Test:** ≥55fps sustained on ThinkPad + 0 misreads of glass labels.
9. **Git-backed auto-save (3s debounce).** Version rail in gutter; hover = preview, click = restore or fork; global Cmd+Z across editors; 30d Trash for skill installs. **Test:** ≥2 of 3 undo methods (Cmd+Z, rail, toast) used across cohort.
10. **Global lexicon pass.** Soul→Persona, Executor→Runtime (or hidden), Father→Guard, Crystal/Emerald/Ruby kept as themes; i18n translation layer preserves internal names. **Test:** unprompted jargon use drops to zero; users say "persona/skills/theme."

---

### 32.3 Cross-team synthesis — what everyone agrees on

Five themes recur across ≥3 specialists. These are the highest-confidence priorities.

| Theme | Specialists converging | Action summary |
|---|---|---|
| **Rename "Father"** | Psychologist, Lawyer, Marketer, UX (4/5) | Guardian / Conductor / Warden / Overseer. Unanimous. **Non-negotiable.** |
| **Rename "TRIBOT" or clear it** | Lawyer, Marketer, Brand (all market-facing) | tribot.org exists; SEO dead. Options: CLAWGUARD, Triark, coined mark. |
| **Rename "Soul/Skills/Executor" to user-facing plain-English** | Psychologist, UX, Brand | Persona / Kit (or just "Skills") / Runtime or hidden. Internal names preserved. |
| **Pre-fill first Soul; kill blank canvas** | Psychologist, UX, Growth | 5-step wizard + templates + live preview. Single biggest first-session lift. |
| **Father kernel itself needs massive hardening** | Security (all 10 vulns) + Lawyer (Art. 22, PLD) + Brand ("closed kernel from unknown startup" trust gap) | Architecture work worth 3-4 engineer-months before GA. |

### 32.4 The blocker vs. high vs. medium matrix

Prioritized action register from the 50 problems. Only BLOCKERs gate launch.

#### BLOCKERS (cannot ship without)

| ID | Problem | Owner | Time |
|---|---|---|---|
| L1 | GDPR audit-log erasure | Eng + DPO | 6-8wk |
| L3 | EU AI Act conformity | Legal + Eng | 10-12wk |
| L4 | DPA + sub-processor framework | Legal + Eng | 4-6wk |
| L5 | Data-residency partitions | Eng + Legal | 12-16wk |
| S1 | Unauthenticated MCP bridge | Eng | 2-3wk |
| S2 | Persona as injection vector | Eng | 2-3wk |
| S3 | SKILL.md indirect injection | Eng | 2-3wk |
| S4 | Father process-context compromise | Eng | 2-3mo |
| S9 | npm supply-chain | Eng | 3-4wk |
| S10 | Session auth undefined | Eng | 2-3wk |

**Reality check:** ~18-24 engineering weeks of work gate a safe GA. Add 12 weeks of Legal. No marketing motion before this foundation.

#### HIGH (ship-blocking for prosumer quality)

| ID | Problem | Owner | Time |
|---|---|---|---|
| P2 | Rename Father → Guardian | Product | 1wk |
| P6 | Father block learned helplessness | Product + Eng | 2-3wk |
| P8 | Blank Soul editor | Product + Eng | 3-4wk |
| M1 | Rename TRIBOT | Brand + Legal | 4-6wk |
| M3 | Rename Father externally | Brand | 1wk |
| M4 | Reposition product | Marketing | 2wk |
| L2 | Art. 22 HITL review queue | Product + Eng | 5-7wk |
| L6 | ClawHub DSA posture | Legal + Product | 8-10wk |
| L7 | Tiered auth + action receipts | Product + Legal | 6-8wk |
| L8 | TM clearance + rename | Legal | 4-6wk → 9-12mo reg |
| L9 | Retention minimization + LE guidelines | Legal + Eng | 5-7wk |
| L10 | Age gate + workplace AUP | Product + Legal | 4-6wk |
| S5 | Audit log tamper-evidence | Eng | 4-5wk |
| S6 | Manifest TOCTOU | Eng | 2wk |
| S7 | `/panic` auth hardening | Eng | 2-3wk |
| S8 | Token rotation race | Eng | 2-3wk |
| U1 | Responsive Stage model | Design + Eng | 3-4wk |
| U3 | Interview wizard for Soul | Product + Eng | 3-4wk |
| U6 | Onboarding flow | Product + Design | 2-3wk |
| U8 | Performance mode + WCAG gate | Design + Eng | 3-4wk |

#### MEDIUM (polish pre-scale)

Remaining 20 items — roll into quarterly post-launch backlog.

### 32.5 Revised shipping order (override §31.9 and §30.13)

The MVP specified in §30.13 (three pages + one dashboard + Gmail) is **unshippable** as currently described — the simulation revealed legal blockers alone that add 10-16 weeks, plus 18-24 weeks of kernel hardening. Revised minimum to GA:

| Phase | Weeks | Work | Exit criterion |
|---|---|---|---|
| **0 · Foundations** | 1-4 | Rename Father (all surfaces) + rename TRIBOT (or clear) + one-line external pitch + repositioned landing copy | Rename live, trademark filed, tagline tested |
| **1 · Legal spine** | 2-10 | DPA, age-gating, retention policy, ToS, tombstone audit log, AI Act memo, EU partition scaffold | DPO sign-off; outside counsel letter |
| **2 · Security kernel** | 3-14 | mTLS UDS bridge, persona signing + classifier, SKILL.md typed manifest, Father split into core service, supply-chain hardening, session auth | Trail of Bits / NCC audit published |
| **3 · First-session UX** | 10-16 | Interview wizard, Guardian rewrite, Stage model, Performance mode, Test Lab | 5-user study: >60% Soul completion, <5 min TTFV |
| **4 · MVP feature (Gmail)** | 14-18 | One OpenClaw skill working end-to-end through all above | 50-user alpha; Father logs show real blocks |
| **5 · Beta** | 18-20 | 250 design partners; Launch Week prep; press kit | NPS >40; zero P0 bugs 7 days |
| **6 · GA** | 20-22 | Public launch; PH, HN, press, creators | 5K signups launch week; <2% week-1 churn |

**Aggressive timeline: ~5 months from "start of rewrite" to GA.** Realistic: 6-7 months with buffer. This is the cost of the five-specialist synthesis; it's also the cost of not shipping Moltbook-shaped disasters.

### 32.6 What this exercise changed

Before §32, the spec implied a ship-in-90-days path. After §32:

1. **Launch slips 3-4 months** — not a delay, a correction. Every problem surfaced here would have slipped it anyway, later and worse.
2. **Three renames become P0** — Father, TRIBOT, and one-line pitch. They gate everything else because every downstream asset bakes them in.
3. **Legal is a parallel track to Eng from week 1** — not a pre-launch checklist. EU AI Act + GDPR Art. 22 are 10-16-week artifacts that start day one.
4. **Security kernel is the product** — §30's thesis was correct; §32 showed the thesis has 10 critical gaps that must close before the kernel is worth naming.
5. **UX onboarding is the #1 growth lever** — the simulation is unanimous here; every team's top-3 includes "fix the blank Soul."

The spec's north-star (§30.16) stands. The path to it just got longer, more serious, and more survivable.

---

*§32 is the adversarial check on §30 + §31. If any solution here is rejected, document why; if any new problem surfaces that doesn't map to a solution here, add it. The matrix is living, not fixed.*

---

## 33. Marketing team full audit — 6 specialists review the spec

> **Captured 2026-04-22.** Six marketing specialists — Brand Strategist, Growth Marketer, Content/SEO Lead, Product Marketing Manager, Community/DevRel Lead, PR/Comms Strategist — were each briefed on TRIBOT and asked to deliver a domain-specific audit. Each produced 1,200-1,900 words of prescriptive recommendations. This section preserves the key findings + a convergence analysis.

### 33.1 Brand Strategist — architecture, naming, identity

**Brand architecture diagnosis.** TRIBOT is currently positioned as a **component sold as a master brand** — "steering wheel + seat belt" (§30.14) is component language, but TRIBOT is written as if it's a category owner. Three paths: branded house (impossible), house of brands (no capital), or **endorsed brand** ("TRIBOT, for OpenClaw" — the honest architecture, like "Raycast, for Mac" or "Linear, for GitHub"). **Recommend: endorsed architecture.** Public mark = "TRIBOT." Tagline lockup = *"TRIBOT — the cockpit for OpenClaw."*

**Naming audit verdicts:**

| Name | Verdict | Rationale |
|---|---|---|
| **TRIBOT** | Survives conditionally | Clear the RuneScape auto-clicker TM or rename. ~40 active "TriBot" marks in USPTO. |
| **Soul** | **Dies** | Category-owned by Microsoft/Anthropic/wellness apps. Replace → **Persona** or **Character**. |
| **Skills** | Survives as generic noun | Not as proper noun; keep lowercase as feature label. |
| **Executor** | **Dies** | Crowded in dev-tooling (Laravel/Java/Python); EN legal/grim connotation; "where harm can happen" is exactly wrong. Replace → **Runner**, **Pilot**, or **Agent**. |
| **Father** | **Dies** | Gendered, paternalistic, culturally charged. Replace → **Warden**, **Keeper**, **Guardian**, or **Kernel**. |
| **Crystal / Emerald / Ruby** | **Survives — strongest brand asset** | Gem names are generic individually but the *triptych* is ownable. Lean in. |

**Brand voice.** Current voice = "Jeweler-Magician with a Security Badge" (§24 + §30.16). Archetype: **Magician** dominant + **Sage** undertone. Sounds like Stripe × Linear × Vesper × early Things 3. Does not sound like Lakera/1Password/CrowdStrike. *Risk:* the voice promises calm artisanship; the product must also protect against a 9.9 CVE pipeline. Two voices needed — add a **"Warden voice"**: shorter sentences, present tense, zero ornament.

**Visual identity.** Gems (§3) transfer cleanly to OG images, stickers, print, social. **The 3D model-viewer logo is not a brand mark** — it's a product moment. 16×16 favicon cannot render a GLB. Ship a flat 2D **Crystal-facet mark** as the primary brand identity; keep the coin-flip as in-app delight.

**Category creation verdict.** TRIBOT has a new category (four-bot abstraction) and hasn't named it. "Abstraction layer" is engineering-accurate, not marketing-operable. **Claim "AI Cockpit"** — answers the prosumer's "what is this?" in two words, pairs with the gem instrument-panel metaphor, and stays off enterprise turf.

**Positioning statement (commit to homepage):**
> For prosumer OpenClaw users who need multi-agent power without credential-leak anxiety, **TRIBOT is** the AI cockpit that splits every bot into a Persona, a Kit, and a Pilot — each watched by a built-in security Warden — unlike NemoClaw's enterprise governance or Lakera's horizontal guardrail API, because it is the only product designed from the ground up around the four-bot abstraction that makes OpenClaw's raw power safe, readable, and reusable for one human at a time.

**Brand-north sentence:**
> **TRIBOT makes dangerous power feel like a jewel in your hand.**

**Competitor triangulation.** TRIBOT sits upper-prosumer: more crafted than MyClaw (mascot-led), more human than Lakera (B2B-API cold), less corporate than NemoClaw, not playful-reckless like Moltbook. Nearest neighbors: Linear, Arc Browser, Raycast.

---

### 33.2 Growth Marketer — funnel, channels, viral loops

**Funnel weakest link: Activation.** §30.10 Flow A is 4 steps across 3 pages before first token streams back. §31.8 risk #6 self-flagged correctly. **Spend 70% of pre-launch growth engineering here.**

**Activation metric (single leading indicator of W4 retention):** *"Father blocked or logged something user-visible in first session."* Not "sent 1 chat turn" (shallow) or "created 2+ TRIBOTs" (gated by TTV). **Hypothesis: users who witness 1+ `father.user_visible_event` in session 1 retain at 3-4× baseline.** Design onboarding to force this event (a synthetic prompt-injection test skill in demo sandbox).

**Channel scorecard (top 3 + dark horse):**

| Channel | Weighted | Role |
|---|---|---|
| HN / Reddit / /r/LocalLLaMA | 22 | Primary — home of technical slice |
| Twitter/X founder-led | 22 | Primary — OpenClaw discourse lives here |
| **MyClaw / OpenClaw partnership** | 22 | **Highest-leverage lever on the board** — bundled distribution ≈ zero CAC |
| **YouTube owned channel (dark horse)** | 19 | Defensible SEO+video moat; "What Father Blocked This Week" format |

Kill: TikTok (wrong demo), LinkedIn (wrong audience), Paid social Meta/X (prosumer devs don't convert).

**Time-to-value analysis.** Target <10 min; realistic **18-25 min** as specified. **Bottleneck: OpenClaw bridge configuration (8-15 min).** Three fixes, ranked by lift:
1. **Hosted sandbox TRIBOT** — pre-configured demo OpenClaw; "aha" in <90s, real onboarding after. Linear/Retool pattern. Biggest single lever.
2. **MyClaw one-click OAuth** — token bridge automatic for MyClaw customers.
3. **3 Soul templates pre-installed** — kills blank-canvas problem.

**LTV/CAC math.** $19/mo Pro, base case 4% monthly churn → **LTV $475, CAC ceiling $158 (3:1)**. Optimistic 2.5% churn → $760 LTV.

**Viral coefficient — replacing the banned marketplace (§30.14):** Ship the `.tribot` export + "Try this TRIBOT" read-only preview as a **product feature**. Recipient hits hosted landing page rendering Soul markdown + demo sandbox Executor + fork-to-my-account CTA. **Target K-factor 0.20-0.30 within 6mo.** Cursor's "open in Cursor" applied to agents, without violating the "no public feed" rule.

**90-day launch calendar (condensed):**

| Wk | Milestone |
|---|---|
| 1-2 | Landing + waitlist + content seed |
| 3-4 | HN posts + concierge audits |
| 5 | Father CLI alpha (GitHub) |
| 6-7 | Creator seeding + MyClaw outreach |
| 8-9 | Closed beta + CLI WAU check (50 WAU gate) |
| 10 | Public beta + free tier live |
| **11** | **Product Hunt launch (Tuesday)** |
| 12-13 | Press + paid activation |

**Top 5 growth bets:**

1. **MyClaw partnership** — ≥400 activated signups in 30d; kill at <100.
2. **Father CLI pre-launch** — ≥50 WAU by D60; pivot messaging at <30.
3. **"What Father Blocked" YouTube channel** — 2K subs / 4K avg views by D30.
4. **Shareable `.tribot` artifact** — K-factor ≥0.15 by D30.
5. **Synthetic injection demo in onboarding** — 70%+ witness Father event in session 1.

---

### 33.3 Content / SEO Lead — keywords, pillars, editorial

**SERP landscape (2026):**

| Query | Volume | Intent | Opportunity |
|---|---|---|---|
| OpenClaw security | High (12-18K/mo, spikes on CVE days) | Info/Commercial | **Land-grab** — no commercial incumbent |
| OpenClaw guardrails | Med-High (4-6K) | Commercial | Comparison content wins fast |
| Claude agent watchdog | Low (800-1.5K) | Commercial | **Land-grab in 30 days** |
| BotFather alternative | Low-Med (2K) | Commercial | Disambiguation play |
| prompt injection prevention | High (18K, rising) | Commercial | Long-tail, Father = differentiator |

**Four content pillars:**
1. **OpenClaw Hardening** (CVE Vulture) — same-day CVE response pieces. *"OpenClaw CVE-XXXX: What It Means for Your Agents."*
2. **The Four-Bot Pattern** (Category Creation) — make "Soul/Skills/Executor/Father" the vocabulary the market uses.
3. **Prompt Injection Playbook** (Demand Capture) — benchmarks, attack taxonomies, red-teaming guides.
4. **Prosumer Agent Craft** (Aspiration / Voice) — "Agents that feel," $19 stack, Liquid interfaces.

**3 flagship "10x" content bets:**

| # | Title | Format | Success Metric |
|---|---|---|---|
| 1 | **OpenClaw CVE Tracker** | Live dashboard + RSS + email alert | 5K email subs in 90d; #1 for "OpenClaw CVE" |
| 2 | **"State of Agent Safety 2026"** | 40-page PDF + interactive microsite | 500 backlinks, 50K downloads |
| 3 | **Father Playground** | Interactive jailbreak demo | 1M plays, 10K viral video views |

**"Claw Receipts" newsletter:** 800 words weekly, 4 sections (The Receipt / Under the Hood / From ClawHub / Heard in the Wild). Referral flywheel (3 refs → sticker; 25 → free year). Target **25K subs by D180.** Launch 10 issues planned.

**Subdomain architecture (Stripe/Vercel model):**
- `tribot.ai` — marketing (heavy motion)
- `docs.tribot.ai` — reference (Stripe-grade)
- `clawhub.tribot.ai` — skills marketplace
- `receipts.tribot.ai` — newsletter archive + CVE tracker
- `/blog` on root (SEO consolidation, Vercel 2023 lesson)

**YouTube strategy:**

| Format | Cadence | Benchmark | Target |
|---|---|---|---|
| Fireship-style 100s explainers | Weekly | Fireship | 50K avg by M6 |
| Matt Wolfe-style agent demos (12-18 min) | Bi-weekly | Matt Wolfe, AI Jason | 20K avg |
| Theo-style founder rants (20-30 min) | Monthly | Theo, ThePrimeagen | 10K engaged cult |
| Shorts (red-team clips) | 3/wk | Wes Roth | Reach play |

**SEO moat (2 compounding moves):**
1. **Programmatic CVE tracker** — auto-generated page per CVE, linked from security scanners, feeds the newsletter.
2. **ClawHub skill pages** — each skill a landing page (mirror Vercel Templates / npm package). Long-tail compound grows with marketplace.

**Voice.** Stripe docs (precision) × Apple HIG (tactile) × Wait But Why (name-the-obvious). Short sentences. Sensory verbs (catch, flinch, hold). Name the competitor. Cite the CVE. One pull-quote per post. Footer: *"Father is watching. — receipts.tribot.ai"*

**Top 5 content bets (ICE ranked):**

| Rank | Bet | ICE |
|---|---|---|
| 1 | OpenClaw CVE Tracker (programmatic) | 630 |
| 2 | "Four-Bot Pattern" manifesto | 576 |
| 3 | "Claude agent watchdog" SEO land-grab | 567 |
| 4 | Guardrails benchmark (NemoClaw vs Father vs Lakera) | 448 |
| 5 | Father Playground (HN bomb) | 420 |

**Ship order:** Manifesto W1 → SEO W5 → Tracker W3 → Benchmark W4 → Playground W8.

---

### 33.4 Product Marketing Manager — messaging, pricing, battle cards

**Messaging house v1:**

**Tagline (6 words):** *"Agents you can actually trust."*

**Positioning statement:**
> For **OpenClaw power users and small teams** who need agents to run real workflows without getting hijacked, **TRIBOT** is a **4-bot safety and capability layer** that **contains every tool call behind a security kernel (Father), a controllable persona (Soul), governed skills (Skills), and an auditable executor**. Unlike NemoClaw (enterprise-only), Lakera (prompt filtering only), or raw OpenClaw (9 CVEs in 4 days), TRIBOT gives individuals and teams enterprise-grade agent safety at a prosumer price.

**3 value props:**
1. **Contain the blast radius** — Father proxies every tool call; no rogue agent, no Moltbook repeat.
2. **Ship agents, not prompts** — Soul + Skills + Executor = working agent in 10 min.
3. **Grow solo → team without migrating** — same runtime at $19 / $99 / $499.

**10 proof points** — Father architecture, ClawHub signing, persona isolation, audit-by-default, covers 7/9 March CVEs, drop-in for OpenClaw configs, $19 vs NemoClaw enterprise floor, Team unlocks shared Skills + kill switch, etc.

**Competitive positioning canvas (2-axis):**
- X: Breadth of capability (guardrail-only → full agent runtime)
- Y: Accessibility (enterprise-sales/self-hosted → self-serve prosumer)

Whitespace = **top-right: only self-serve full-stack agent runtime with built-in security.** Wedge: "OpenClaw's reach, NemoClaw's safety posture."

**Battle cards (condensed):**

| vs. | Their Pitch | Our Counter |
|---|---|---|
| **NemoClaw** | SOC 2 enterprise | "Same containment model, shipped on OpenClaw, usable tonight for $19." |
| **Lakera** | Horizontal guardrails $99/mo | "Lakera tells you a prompt looks bad. Father stops the shell command it would have triggered." |
| **MyClaw** | Managed OpenClaw hosting | "MyClaw runs the CVE faster. TRIBOT makes the CVE unreachable." |
| **DIY nothing** | "We'll just be careful" | "Moltbook was 'careful' too. Architecture is the defense." |

**Pricing audit — the $99 problem.** $99 Team / 5 seats = **$19.80/seat = identical to Pro**. No upgrade incentive beyond collaboration. Best value metric: **proxied tool calls per month** (Father is the defensible unit).

**Alternative pricing (recommend to ship Monday):** Feature-gate Business tier on **SSO-lite + audit export + role-based tool policies + priority CVE SLA**. Add usage ceilings. Lowest-risk; preserves pricing page.

Alternative structures to A/B:
- **Usage-based:** Pro 10K calls, Team 75K pooled + 5 seats, Business 500K pooled + SSO
- **Per-seat + platform fee:** Pro $19/seat, Team $29/seat + $49 platform, Business $59/seat + $199 platform

**Segment messaging:**

| Segment | JTBD | Ad headline | First action |
|---|---|---|---|
| Prosumer power-user | "Run agents on my stack without getting owned" | "Your agent, with a kernel." | Run pre-built "Research Agent" — watch Father block demo injection live |
| Small-team startup | "Let 5-person team ship agents without a security hire" | "Ship agents. Sleep at night." | Invite team; shared Skills one-click |
| SMB | "Adopt AI without failing vendor security review" | "Agents your CISO will approve." | Download security whitepaper, start 14-day Business trial |

**Enterprise-readiness minimum (90d post-launch):** SSO-lite (Google + Okta SAML), audit export (JSON+CSV+webhook to SIEM), Team roles (Owner/Admin/Operator/Viewer), data-residency toggle (US/EU), SOC 2 Type I roadmap letter (public, CEO-signed), revoke-everywhere kill switch, pre-signed DPA template.

**5 sales enablement assets:** Security whitepaper · SOC 2 roadmap letter · Deployment guide · Case study template · ROI calculator ($4.45M IBM breach avg baseline).

**Launch narrative (200 words — abridged):** *"Once upon a time AI agents were supposed to save us time... Three million people ran them on OpenClaw... In January 2026, Moltbook went down... In March, nine critical CVEs landed in four days... Careful didn't stop Moltbook. Until one day, four bots changed the math... TRIBOT didn't replace OpenClaw. It contained it. Agents you can actually trust, starting at $19."*

**Top 5 PMM bets:**
1. **"Father caught it" content engine** — 500 organic signups/wk by W12.
2. **Public CVE coverage matrix vs. OpenClaw** — 25 security Twitter/HN mentions/wk.
3. **ClawHub Skills creator program** — 40 paid skills/mo by M6.
4. **Team-tier repricing to value metric** — Pro→Team 8%.
5. **Enterprise-lite bundle for Business** — 20 Business logos end-Q1 post-launch.

---

### 33.5 Community / DevRel Lead — embed, program, flywheel

**Community landscape map (priority order):**

| Community | Priority | Notes |
|---|---|---|
| **OpenClaw Discord** (~400K members) | P0 | Target lives here; wrapper-tolerance medium but rising post-Steinberger-OpenAI |
| **X/Twitter AI builder niche** (swyx, karpathy, simonw, levelsio) | P0 | Persona-driven; kingmakers |
| **GitHub (OpenClaw, ClawHub, MCP SDKs)** | P0 | Participation > promotion |
| **HackerNews** | P1 | One Show HN > 10 threads |
| **Indie Hackers** | P1 | Loves "built on top of X" stories |
| **Lenny's Newsletter** | P1 | Small-teams segment lives here |
| **/r/ChatGPTPromptGenius** | P1 | Direct prosumer overlap |
| **/r/LocalLLaMA** (520K) | P2 | Hostile to closed cores; engage only with deep technical posts |

**Build vs. embed verdict: Both, sequenced.** M0-3 embed in OpenClaw Discord (#tribot channel, negotiate with their DevRel). M3+ open own Discord once ~500 WAU want peer-to-peer depth. **Platform: Discord.** (Real-time debugging > Slack = enterprise wrong, Circle = course-creator vibe, Discourse = graveyard for <1K DAU.) Hybrid: Discord (real-time) + GitHub Discussions (indexed/searchable).

**"TRIBOT Pilots" program — first 50 ambassadors:**
- 20 indie builders (IH, X) / 15 small-team eng leads (Lenny's, Latent Space) / 10 creators (YouTube, Substack) / 5 enterprise-adjacent
- Criteria: hit 3 of 5 (ClawHub skill >100 installs, 2K+ AI-niche audience, paid product ≥10 users, monthly public artifact, 48h Discord response)
- Incentives: Free Pro 12mo + private founder Discord + co-marketing + 30% ClawHub rev-share 6mo + early audit access
- Term: 6 months, renewable, explicit off-ramp
- Models: Notion Ambassadors (quality), Figma Advocates (distribution), Supabase Launch Week (moment), Vercel OSS Partners (rev-share)

**GitHub repo structure:**

| Repo | License | Why |
|---|---|---|
| tribot/cli | MIT public | Indie expectation 2026 |
| tribot/skills-sdk | Apache-2.0 public | Hackable for ClawHub parity |
| tribot/skills-registry | MIT public | Community skills |
| tribot/templates + examples | MIT public | Real working agents |
| tribot/docs | CC-BY public | Google-indexed |
| **tribot/executor-core** | **Closed** | Moat, paid |
| **tribot/father** | **Closed, audit-visible** | SOC2 + 3rd-party audit reports public, source closed |

**Content-to-community flywheel (weekly):**
- Mon: 15-min demo (Discord stage + YouTube VOD)
- Wed: 60-min office hours (Discord voice)
- Thu: Contributor spotlight (X + Discord)
- Fri: Changelog (GitHub + Discord + email)
- Monthly: AMA (first guests: swyx, simonw, OpenClaw maintainer)
- Quarterly: Launch Week (Supabase format)
- Dogfood: TRIBOT-powered Discord bot that triages Qs, links docs, routes bugs

**Incident response playbook (Cloudflare-grade):**
- T+0: internal triage, no public
- T+1h: Discord #status ack ("aware, investigating")
- T+4h: preliminary blog + X (if sev-1)
- T+24h: customer email with scope + remediation
- T+7d: full post-mortem + GitHub issue + what-changed
- **Never Okta 2022 (delayed/vague/lawyered).**

**First 90d DevRel output:** 10 pieces — founder "why we built this" HN post, 4-bot pattern deep-dive on Latent Space, Executor internals YT, Father audit PDF launch, ClawHub→TRIBOT migration workshop, "10 agents in 10 days" X thread, research-agent tutorial, IH case study, Lenny's guest post, AI Engineer Summit talk.

**DA hiring plan:** Hire #1 DA at **M4** (after Pilots have data, Discord ~1K). Profile: **ex-indie, not ex-big-co** — shipped paid product ≥$5K MRR, public writing, bonus if ClawHub skill author. Avoid "conference speaker, zero code" — burns credibility in OpenClaw Discord within a month. M9 hire #2 (enterprise-leaning) if ARR >$500K.

**Adversarial playbook:**
- **HN/Reddit "just a wrapper":** ship Father audit + benchmarks before critique lands; respond once technically with links, never twice.
- **Infosec Twitter:** existential. Named 3rd-party audit (Trail of Bits / Doyensec) live at launch. `security.txt`, bug bounty ($500-$10K), `/security` advisories page.
- **OSS purists:** publish CLI/SDKs/skills MIT; state plainly "Core paid because Father requires dedicated eng." Disengage at 3 replies on ideology.

**Top 5 community bets:**
1. **Embed in OpenClaw Discord first** — 500 #tribot channel members by D90; fail at <150.
2. **Pilots program in first 30d** — 50 onboarded, 80% M1 artifact; fail at <30 or <50%.
3. **Father 3rd-party audit public at launch** — 1 HN front-page; delay launch if audit slips.
4. **Open skills-registry + CLI MIT day 1** — 200 community skills by D90; <50 = DX broken.
5. **Supabase-style Launch Week at M4** — 10M impressions; <2M = Pilots aren't real.

**North star:** TRIBOT wins if, by D180, a randomly-sampled OpenClaw power user has heard of TRIBOT **from another builder they trust** — not from us.

---

### 33.6 PR / Comms Strategist — launch, media, crisis

**Core narrative:** *"OpenClaw built the engine. We built the seatbelt. 3.2M users deserve both."* Never attack OpenClaw directly — complementary, inevitable, grown-up.

**Target headlines (want):**
- TechCrunch: *"TRIBOT raises the bar on agent security as OpenClaw's CVE count hits double digits"*
- The Verge: *"This $19 app is what OpenClaw should have shipped on day one"*
- Wired: *"After Moltbook, a new class of AI 'safety layers' emerges — TRIBOT leads"*

**Headlines to prevent:**
- *"TRIBOT is just an OpenClaw wrapper charging $19/month"*
- *"New agent startup TRIBOT inherits OpenClaw's security problems"*
- *"TRIBOT's 'Father' kernel called security theater by researchers"*

**Tier-1 media list (12):** Kylie Robison (Wired), Casey Newton (Platformer), Alex Heath (The Verge), Kevin Roose (NYT/Hard Fork), Hard Fork podcast, Alex Kantrowitz (Big Technology), Ben Thompson (Stratechery), Lenny Rachitsky, Will Knight (Wired — security angle), Dan Primack (Axios), Deepa Seetharaman (WSJ), Lex Fridman (M6+ when metrics validate).

Secondary: Simon Willison, Ethan Mollick, Swyx, Nathan Lambert.

**Founder positioning.** Builder-operator with security conscience. *"I got tired of waiting for OpenClaw to fix this, so I built the layer."* Voice: Mitchell Hashimoto × Frank Slootman. Avoid Altman oracle or Musk shitpost.

Speaking circuit arc:
- Pre-launch: AI Engineer Summit, Black Hat / DEF CON AI Village, RSA 2026 agent-security panel
- M3: ODSC East, TED-AI, Lenny's live Q&A, SaaStr (prosumer motion), a16z Summit if funded
- M12: Web Summit keynote, TED main stage (submit M6), DEF CON main stage

Owned: 1 Substack (weekly, 800 words, technical+strategic), 1 X account (daily technical), selective LinkedIn (monthly long-form only). Kill fragmentation.

**Launch PR 3-wave sequencing:**
- **Wave 1 — Exclusives (T-14 to T-7):** T-14 Ben Thompson subscriber piece (no embargo); T-10 Axios/Primack funding+category; T-7 Kylie Robison long-form + Will Knight security pair.
- **Wave 2 — Broad embargo (T-2 lifts T=0 Tue 9am ET):** Press kit with founder interview, demo video, **Trail of Bits or NCC Group audit (non-negotiable)**, 5 named case studies, CVE response playbook. Concurrent: Show HN at T=0 8:45am ET; PH **Wednesday** (Tuesday saturated in 2026).
- **Wave 3 — Owned + amplification (T=0 to T+14):** Founder X thread (long, technical, no emojis). Substack: "Why we built Father." 18-min YouTube demo. T+3 Hard Fork (pre-recorded T-1). T+7 Lenny podcast. T+14 Latent Space teardown.

**Security incident comms playbook (Cloudflare-grade model):**

| Time | Channel | Content |
|---|---|---|
| T+0 | status.tribot.com + X pinned | Acknowledge; no speculation |
| T+4h | Same + user email | Confirmed scope; what we know/don't; mitigations |
| T+24h | Blog, CTO-signed | Technical timeline, customer impact, patch state |
| T+7d | Engineering blog | Full post-mortem, code-level, infra changes |
| T+30d | Founder op-ed | What we learned; structural changes; invite to audit |

Non-negotiables: no weasel words; publish logs where possible; credit the researcher; bug-bounty payout public. Who speaks: CTO on detail, CEO only at T+24h+, **never Legal, never PR firm under own name.**

**5 anti-PR risks (launch day):**

| # | Risk | Mitigation |
|---|---|---|
| 1 | "TRIBOT is OpenClaw wrapper" (HIGH) | Lead every briefing with Father architecture diagram; independent architecture review published alongside launch |
| 2 | "Security startup no track record" (HIGH) | Trail of Bits audit T-0; hire named security researcher by launch; $250K bug bounty day 1 |
| 3 | "$19 expensive for wrapper" (MED-HIGH) | Pricing page shows single-infostealer cost; case study of prosumer who lost crypto wallet |
| 4 | "OpenClaw will ship this themselves" (MED) | Stratechery piece on structural misalignment; 18-month CVE track record as proof |
| 5 | "Yet another AI agent startup" fatigue (MED) | Refuse "5 agent startups to watch" roundups; standalone coverage or pass |

**Thought leadership — 6 op-eds Y1:**

| # | Title | Venue | When |
|---|---|---|---|
| 1 | "The Safety Layer" | Stratechery guest / own Substack | M1 (must exist before launch week ends) |
| 2 | "Why Father is not a sandbox" | Own blog → HN | M2 |
| 3 | "What OpenClaw taught us about trust" | Wired op-ed | M4 (measured, not triumphalist) |
| 4 | "The prosumer security gap" | HBR or a16z Future | M6 (opens enterprise door) |
| 5 | "Agents will be the next supply chain attack surface" | Lawfare or Wired | M8 (precedes any DC trip) |
| 6 | "Year one: what we got wrong" | Own blog → Wired | M12 (most-cited piece; Stripe Press retrospective style) |

**Influencer tiers + sequencing (crucial order):**
- **T-21 Tier 3** (Simon Willison, Ethan Mollick, Swyx, Nathan Lambert, Jim Fan, Hamel Husain) — keys + one-pager, no ask. Highest-trust signal; don't pitch, just ship. **Never reverse this order — it destroys Tier 3 trust.**
- **T-14 Tier 2** (Matt Berman, AI Jason, David Shapiro, Wes Roth, AI Explained, All About AI, Sam Witteveen) — early beta access + embargo + optional 30-min founder interview
- **T-7 Tier 1** (Matt Wolfe, Fireship, Theo) — access + exclusivity, no paid; launch-week video from each

**5 crisis comms templates (150 words each — preserved in full in agent brief):** Competitor FUD, OpenClaw dependency disruption, TRIBOT vuln disclosure, Regulatory inquiry, Employee controversy. Each retains: ack → specifics → commitment → timeline to next update → closing principle. *Do not litigate in public; do not pre-judge; credit the researcher; publish the timeline.*

**Top 5 PR bets:**
1. **Stratechery category-definition piece** (T-10) — "safety layer" enters lexicon (50+ industry references in 30d).
2. **Hard Fork founder segment** (T+3) — top-3 app-store spike + 40K signups 72h post-air.
3. **Trail of Bits audit published at launch** (T=0) — zero "is it actually secure?" launch-week headlines.
4. **Lex Fridman long-form** (M6, metrics-gated) — 2M+ views; durable founder authority.
5. **Month-12 retrospective op-ed** — most-cited artifact in Y2 coverage and investor decks.

**Memo closer:** The single highest-leverage pre-launch decision is the **Trail of Bits audit**. Everything else rearranges around whether that exists. If budget forces one cut, **cut the influencer tier before the audit.**

---

### 33.7 Cross-specialist convergence matrix

What do the 6 specialists independently agree on? High-confidence recommendations emerge where ≥3 of 6 converge on the same direction.

| Convergence theme | Specialists | Verdict |
|---|---|---|
| **Rename "Father" (user-facing)** | Brand (Warden/Keeper/Guardian), Content (Guardian/Warden), PMM (kept it in messaging but flagged paternalism risk), Growth (doesn't speak to naming), Community ("Father" never used in their content plan), PR ("Father kernel" risk flagged) — **4-5 of 6** | **Ship rename Warden or Guardian** |
| **Rename "Soul/Executor"** | Brand explicitly (Persona/Pilot), PMM uses "Soul/Skills/Executor" only as internal architecture in messaging; Content keeps Soul/Skills as terminology for audience; Community keeps internal — **2-3 of 6 rename externally** | **Internal keeps, external uses Persona + Pilot (or hidden)** |
| **Third-party security audit (Trail of Bits / NCC / Doyensec) at launch** | Brand (audit as trust signal), PR (highest-leverage pre-launch decision), Community (existential for infosec Twitter), Content (benchmarks/audit as SEO moat), PMM (proof points), Growth (CAC floor) — **6 of 6 converge** | **Non-negotiable pre-launch deliverable** |
| **Don't fight enterprise (NemoClaw/Runlayer)** | Brand, Growth, Content, PMM, Community, PR — **6 of 6** | Confirmed §31.4 Tier A posture |
| **MyClaw partnership as highest-leverage channel** | Growth (weighted 22), PMM (bundling in launch plan), Community (cross-promotion play), Brand (endorsed architecture) — **4 of 6** | **Outreach in week 7; integration gate for GA** |
| **"Claw Receipts" weekly newsletter + CVE tracker** | Content (primary recommendation), Growth (viral loop), PMM ("Father caught it" content engine), PR (op-ed distribution) — **4 of 6** | **Ship newsletter infra by W2** |
| **Pricing: $99 Team broken at 5 seats** | Growth (LTV math), PMM ($19.80/seat = no incentive), Brand (premium signaling conflict) — **3 of 6** | **Reprice to value metric or $9/$29/$79** (PMM vs Marketer debate — see decision needed) |
| **Ambassador program / Design Partner 50 before launch** | Community (Pilots program), Growth (creator seeding), PMM (launch plan phase 1), PR (influencer Tier 3 at T-21) — **4 of 6** | **Recruit 50 named creators before GA** |
| **Father Playground / interactive injection demo** | Content (flagship 10x bet), Growth (forcing `father.user_visible_event`), PMM (live demo in battle cards) — **3 of 6** | **Build by launch week; run live at every pitch** |
| **Hosted sandbox / demo TRIBOT to shortcut TTV** | Growth (biggest TTV lever), Community (dogfood), Content (playground) — **3 of 6** | **Ship before public beta** |

### 33.8 Marketing-team unified launch-critical decisions

From the six audits + the convergence matrix, the committee's unified call:

**1. Naming resolution (W0).** External rebrand: Father → **Guardian** (or Warden), Soul → **Persona**, Executor → **Pilot** (or hidden internal), Skills → **Skills** (lowercase, common noun). TRIBOT name kept if trademark clearance passes tribot.org challenge; backup = **CLAWGUARD** or coined mark **Triark**. Gems (Crystal/Emerald/Ruby) kept — the single strongest brand asset.

**2. Tagline & positioning (W0-1).** Tagline: **"Agents you can actually trust."** Category claim: **"AI Cockpit."** Positioning statement = PMM + Brand merged version (§33.1 + §33.4).

**3. Pricing structure (W0-2).** Test two live:
- Current $19/$99/$499 feature-gated
- Alternative: $9 Starter / $29 Pro / $79 Studio
Winner picked by Van Westendorp on 400-person waitlist sample. Value metric = **proxied tool calls/month** locked in either way.

**4. Security trust spine (W1-W20).** Trail of Bits audit published at launch. Bug bounty $250K-tier live day 1. Public `/security` page + `security.txt` + SOC 2 roadmap letter (CEO-signed, 18-month timeline). Non-negotiable — delay launch if audit slips.

**5. Content engine (W1-ongoing).** Ship in order: Four-Bot Pattern manifesto (W1) → OpenClaw CVE Tracker (W3) → "Claude agent watchdog" SEO post (W5) → Guardrails benchmark (W6) → Father Playground (W8). Newsletter "Claw Receipts" goes weekly from W2 onward. YouTube channel "What Father Blocked This Week" weekly from W4.

**6. Community spine (W1-ongoing).** Embed in OpenClaw Discord (negotiate #tribot channel by W4). Pilots program recruitment live by W4; 50 onboarded by W8. GitHub org public day 1 with CLI + SDK + skills-registry under MIT/Apache-2.0.

**7. Partnership spine (W4-W10).** MyClaw partnership outreach W4; signed integration by W10 or GA delayed. OpenClaw Foundation informal relationship in parallel.

**8. Launch sequence (W-14 to W+14 from GA).** Tier-3 influencer keys at W-3; Tier-2 embargo at W-2; Tier-1 at W-1. Exclusives sequence: Ben Thompson (W-2), Axios/Primack (W-1.5), Kylie Robison/Wired long-form (W-1). Launch T=0 Tuesday 9am ET with Show HN + press embargo lift + owned content. Product Hunt Wednesday (not Tuesday, 2026 saturated).

**9. Hiring spine.** First Dev Advocate at M4 post-launch (ex-indie, ships publicly, bonus if ClawHub skill author). Comms/PR hire at M2 if launch expands beyond founder bandwidth. Revenue + enterprise hires deferred until Business tier MRR >$50K/mo.

**10. Metrics that gate continuation.** At D30 post-launch:
- If <1,500 paid signups → marketing needs rework
- If CVE-Tracker email list <2K → content channel failing
- If MyClaw partnership un-signed → distribution thesis failing
- If Father-CLI WAU <50 → primitive isn't being adopted
- If any Tier-1 journalist files negative story → crisis playbook activates

### 33.9 What §33 adds that §31 + §32 didn't

§31 (market research) answered *"can this work?"* with a yes-conditional. §32 (startup team simulation) answered *"what breaks?"* with 50 problems + 50 fixes. **§33 answers *"how does this go to market?"* with the specificity of a post-series-A marketing department.** The convergence matrix (§33.7) is the highest-leverage artifact: ten decisions that six independent specialists agree on without prompting. Those ten decisions are non-negotiable pre-launch deliverables. Everything else in §33 is ranked proposal.

The three biggest surprises:

1. **"Father" must be renamed by 4-5 of 6 specialists** — even the ones who kept it as architecture internally. This is stronger signal than §32's four-of-five vote.
2. **The $99 Team tier is broken** — three specialists independently spotted that $19.80/seat kills upgrade incentive. Needs redesign before launch copy is written.
3. **The Trail of Bits audit is the single pre-launch decision** — unanimous, crosses specialties, and the PR strategist said to cut influencers before it. That is an unusually strong statement in a marketing brief and deserves CEO-level commitment.

---

*§33 is the marketing department's playbook. If any recommendation here contradicts §30 (product) or §32 (build), §30 + §32 win on architecture, §33 wins on how the world sees it. Reconcile explicitly; do not silently diverge.*

---

## 34. Pain-point map & TRIBOT coverage matrix

> **Captured 2026-04-22.** Four specialists audited the OpenClaw-adjacent pain landscape from different lenses — a User Researcher (qualitative/ethnographic), a JTBD Analyst (Clay Christensen/Bob Moesta framework), a Behavioral Economist (Kahneman/Thaler WTP model), and a Customer Success/Support Lead (operational day-to-day pain). Each delivered a pain inventory + a TRIBOT coverage verdict. This section preserves all findings and cross-maps them into a single coverage matrix.

### 34.1 The four lenses — what each answers

| Lens | Question answered | Output shape |
|---|---|---|
| **User Researcher** | *"What do OpenClaw users actually complain about on Reddit/Discord/HN?"* | 15 ethnographic pains with user-voice quotes, severity × frequency scores |
| **JTBD Analyst** | *"What progress are they trying to make that TRIBOT could help with?"* | 12 canonical JTBD statements + Forces-of-Progress switching analysis |
| **Behavioral Economist** | *"Which pains actually convert to dollars, and at what price?"* | 12 pains with WTP estimates + comparable-product anchors |
| **Customer Success Lead** | *"Which pains blow up the support queue and kill LTV?"* | 15 operational pains with $/ticket + churn-risk scores |

Total: **54 distinct pain observations across 4 lenses**, with strong convergence at the core.

### 34.2 Lens 1 — User Researcher: the ethnographic pain inventory

Top 15 from real patterns on /r/LocalLLaMA, HN, X, OpenClaw Discord, Indie Hackers. Ranked by severity × frequency.

| # | Pain (user-voice) | Sev × Freq | Who feels it | TRIBOT coverage |
|---|---|---|---|---|
| 1 | **Credentials sitting in plaintext config** (*"My Gmail app password is in ~/.openclaw/config.yaml. I know."*) | 90 | All | 🟡 Partial |
| 2 | **Overnight opacity** (*"I woke up to 47 Slack messages my agent sent. Which ones were mine?"*) | 72 | Small team, Indie | ✅ Full (Father audit) |
| 3 | **Indie-builder support burden** (*"Half my DMs are 'my bot stopped working.'"*) | 64 | Indie | ❌ Not addressed |
| 4 | **ClawHub install anxiety** (*"I paused for 10 seconds before clicking install. Then I clicked anyway."*) | 63 | Prosumer | 🟡 Partial |
| 5 | **Agent jailbroken by email** (*"A calendar invite told my OpenClaw to forward my Gmail and it just… did."*) | 60 | Prosumer, Indie | ✅ Full |
| 6 | **Loop burns API credits** (*"It called `web_search` 80 times looking for one thing."*) | 56 | Indie, Small team | 🟡 Partial |
| 7 | **Skill discovery fatigue** (*"Search returned 312 'email' skills. I tried 3. Gave up."*) | 56 | Prosumer, Indie | ❌ Not |
| 8 | **Tool-choice debugging** (*"It picked `shell_exec` when I asked about weather. Why??"*) | 56 | Indie, Prosumer | 🟡 Partial |
| 9 | **Pricing unpredictability** (*"$40 one month, $110 the next."*) | 56 | Indie, Small team | 🟡 Partial |
| 10 | **Configuration death-by-YAML** (*"I spent 4 hours on the system prompt and it still calls me 'user'."*) | 54 | Prosumer | ✅ Full (Soul) |
| 11 | **Context window forgets by Tuesday** (*"It forgot I'm vegetarian. Again."*) | 54 | Prosumer | ❌ Not |
| 12 | **Malicious-skill detection** (*"The skill had 4 stars. Turns out 3 were from the author's alts."*) | 50 | All | 🟡 Partial |
| 13 | **Updates break agent mid-task** (*"OpenClaw auto-updated, skill API changed, my pipeline died at 3am."*) | 48 | Small team | ❌ Not |
| 14 | **Transport/Telegram latency** | 45 | Prosumer | ⚠️ TRIBOT makes worse |
| 15 | **Client compliance proof** (*"Client asked for SOC2 evidence of what the agent accesses. I had screenshots."*) | 45 | Small team, Enterprise | ✅ Full |

**User Researcher verdict:** TRIBOT's strongest story is Father. Three of the top 5 pain points (by severity) are Father-shaped. The spec under-serves clusters C (cost/loop control), D-memory, and E (discovery/updates/transport).

**Critical gaps TRIBOT doesn't address:**
1. Skill discovery/ranking → partner with curated ClawHub index or ship "Scout" micro-service.
2. Long-term memory → extend Soul with pluggable memory (Mem0/Letta partnership).
3. Skill version pinning + staged updates → Father pins skill hashes per-Soul, canary window required.
4. Indie-builder operator dashboard → "Fleet Father" read-only view per-end-user audit.
5. Live decision trace → Executor emits reasoning trace per step to Father's log.

### 34.3 Lens 2 — JTBD Analyst: canonical jobs + forces of progress

Top 12 JTBD statements. The strongest switching force comes from the *emotional* job under the functional one.

| # | Canonical JTBD | Current "hire" | Sat / Pain | TRIBOT Fit |
|---|---|---|---|---|
| 1 | When I'm running an agent with filesystem+shell access, I want to stop exfiltration/destruction, so I can sleep at night. | VMs, disabling skills, prayer | 3 / 9 | ✅ Perfect |
| 2 | When I install a ClawHub skill, I want to know it isn't malicious *before* it runs. | GitHub stars, vibes, nothing | 2 / 9 | ✅ Perfect |
| 3 | When I configure a persona, I want tone/role/guardrails consistent across sessions. | Long system prompts, templates | 4 / 7 | ✅ Perfect |
| 4 | When I chain tool calls, I want the agent to complete multi-step work without derailing. | LangGraph, custom loops | 4 / 8 | ✅ Perfect |
| 5 | When something goes wrong, I want a forensic record. | Console logs, screenshots | 3 / 8 | ✅ Perfect |
| 6 | When I deploy to a client, I want a defensible price. | Reselling raw OpenClaw | 4 / 7 | 🟡 Better |
| 7 | When news breaks of another CVE, I want to not be the next headline. | Twitter doomscrolling, patch-panic | 2 / 10 | ✅ Perfect |
| 8 | When I'm a solo builder, I want to ship fast. | Duct-tape + caffeine | 5 / 6 | 🟡 Better |
| 9 | When an agent misbehaves, I want a single kill-switch. | `kill -9`, pulling plug | 3 / 9 | ✅ Perfect |
| 10 | When a client asks "is your AI safe?", I want a defensible answer. | Hand-wavy security docs | 2 / 8 | 🟡 Better |
| 11 | When I integrate 50+ tools, I want outbound traffic controlled per-skill. | Network firewalls, hope | 3 / 8 | ✅ Perfect |
| 12 | When I'm experimenting, I want to swap personas/skills without rewriting plumbing. | Forking configs | 4 / 6 | ✅ Perfect |

**Forces-of-Progress — top 5 switches ranked by net force:**

| Rank | Job | Push | Pull | Anxiety | Habit | Net |
|---|---|---|---|---|---|---|
| 1 | **J7 — "Not be the next Moltbook headline"** | 10 | 9 | 4 | 3 | **+12** |
| 2 | J1 — Stop exfiltration/destruction | 9 | 9 | 5 | 4 | +9 |
| 3 | J5 — Forensic audit | 8 | 8 | 4 | 5 | +7 |
| 4 | J2 — Trust ClawHub skills | 9 | 8 | 6 | 5 | +6 |
| 5 | J4 — Reliable multi-step execution | 8 | 7 | 6 | 7 | +2 |

**The three emotional jobs that drive willingness-to-pay at prosumer prices:**
- E1: *"I want to stop feeling reckless."* (dread → calm)
- E2: *"I want to feel like a professional, not a cowboy hobbyist."* (drives $19 → $99 upgrade)
- E3: *"I want to feel in control of my machine again."* (why `/panic` resonates beyond actual utility)

**The three social jobs:**
- S1: *"Be seen as the engineer who ships AI agents safely."* → TRIBOT-as-credential; "Powered by TRIBOT" badge.
- S2: *"Be seen as a serious builder who charges real money."*
- S3: *"Be seen as early/savvy in the agent space."*

**Anti-jobs TRIBOT must architecturally refuse:**
- A1: Spy on employees without consent → mandatory in-session disclosure banner + consent ledger.
- A2: Bypass third-party API ToS at scale → Father ships with baseline ToS-respect ruleset; removal requires signed ack.
- A3: Strip safety from frontier models → Father's non-removable inner ring (CSAM, WMD, self-harm). Documented publicly.

**Jobs TRIBOT *fails* — stay with current tool:**
- F1: Frontier-model raw experience with zero guardrails → raw OpenClaw, Ollama.
- F2: True enterprise compliance (SOC 2, HIPAA, FedRAMP) → Anthropic Claude Enterprise, Azure OpenAI.
- F3: No-code agent builder for non-technical teams → Zapier AI, n8n, Lindy.
- F4: Cheapest possible hobby setup → self-hosted OpenClaw.

**JTBD's #1 recommendation:** Do NOT build a no-code GUI. The pull of "expand TAM" dilutes the safety-kernel identity that wins J1, J2, J7, J9, J11. Revisit post-Series A.

### 34.4 Lens 3 — Behavioral Economist: pain → willingness-to-pay

Top 12 pains scored by WTP, with comparable-product anchors from behavioral-economics literature.

| # | Pain | System-1 Trigger | WTP/mo | Anchor | Felt @ purchase | Felt day-to-day | TRIBOT |
|---|---|---|---|---|---|---|---|
| 1 | Agent runs malicious skill, drains API keys | Loss aversion + availability | **$12-18** | 1Password $3, Malwarebytes $5 | 9 | 4 | ✅ |
| 2 | Don't know what agent did overnight | Ambiguity aversion (Ellsberg) | **$9-15** | Datadog $15, Honeycomb $0-130 | 6 | **7** | ✅ |
| 3 | Blamed if AI does something stupid at work | Regret aversion + status | **$15-25** | Grammarly Business $15, Drata Starter $7.5K/yr | 7 | 6 | ✅ |
| 4 | 800+ malicious ClawHub skills | Availability + negative social proof | **$10-14** | VirusTotal, Snyk $25/dev | 8 | 3 | 🟡 |
| 5 | Configuring takes 3 hrs, breaks weekly | Effort aversion + present bias | **$10-19** | Raycast Pro $8, Warp $15 | 8 | 5 | ✅ |
| 6 | 4 agents, none know what the others did | Cognitive load | **$8-12** | Notion AI $10, Raycast AI $8 | 5 | 6 | ✅ |
| 7 | 9 CVEs in 4 days — what's next week? | Probability neglect | **$6-10** | Cloudflare Teams $3, Tailscale $5 | 7 | 2 | 🟡 |
| 8 | Can't prove compliance to client/legal | Loss aversion (contractual) | **$30-80** | Drata Starter $7.5K/yr, Secureframe $6K+/yr (note: these are enterprise comparables; prosumer WTP for compliance is much lower and this row may not translate to the prosumer tier) | 8 | 7 | 🟡 |
| 9 | Swap models without re-prompting | Switching cost / endowment | **$5-9** | OpenRouter, Cursor $20 | 4 | 6 | ✅ |
| 10 | Kid/spouse uses my OpenClaw; can't sandbox | Protection/parental | **$8-12** | Bark $14, Qustodio $55/yr | 7 | 4 | 🟡 |
| 11 | 135K exposed instances — am I one? | Availability + self-relevance | **$4-8** | Have-I-Been-Pwned $3.95 | 9 | 2 | ❌ |
| 12 | Infostealers target OpenClaw configs | Loss aversion + specificity | **$7-11** | Bitdefender $3, Malwarebytes $5 | 8 | 3 | ⚠️ Negative |

**Aggregate WTP ceiling (prosumer):** ~$22-28/mo before bundling fatigue. TRIBOT's $19 Pro sits just under — **consider raising to $24.**

**The insurance problem (critical).** Security is insurance-shaped; prospect theory says people under-pay for low-probability high-consequence events. Three traps TRIBOT falls into:
- Hyperbolic discount on "next CVE" — users discount it to zero at 30+ days.
- Optimism bias ("135K exposed, but not me").
- Ambiguity about coverage — users drop to $0, not to a paid alternative (Heath & Tversky 1991).

**Three escapes:**
1. **Turn probability into felt frequency** (Stripe Radar playbook): dashboard *"Father blocked 4 skill calls this week"* — converts insurance into observable service.
2. **Pre-commitment framing** (Thaler SMarT): "Enable Safe Mode before your next skill install — disable anytime."
3. **Loss-of-investment anchor**: "Your OpenClaw config = ~40 hrs of tuning. Protect it for $19." Endowment effect.

**Pain-to-price ladder:**

| Tier | Threshold | Pains matched | Pricing verdict |
|---|---|---|---|
| $0 nice-to-know | Low day-to-day | #11, #7 | Use as free lead magnets |
| $9-19 prosumer impulse | 1 clear pain, self-purchase | #1, #5, #2, #4 | $19 matches; ~$16 feels fair |
| **$29-99 professional habit** | Work-identity pain | **#3, #6, #8 (light compliance)** | **$99 too steep from $19 — insert $39 Solo Pro** |
| $199-499 company budget | Compliance + multi-seat | #8 full, #10 team | $499 SMB reasonable |
| $1K+ enterprise | Audit, SLA, procurement | Not TRIBOT's lane | N/A |

**Critical finding:** The **$19 → $99 gap is 5.2×** — Ariely's relative-magnitude research says this feels punitive. Notion is 1.8×, Linear 1.75×. **Insert a $39 tier.**

**Top 5 WTP × Coverage (the cash engine):**

| Rank | Pain | Score | Strategic note |
|---|---|---|---|
| 1 | **Compliance/audit evidence (#8)** | **55.0** | Highest absolute; anchor $499 tier here |
| 2 | **Professional blame/reputation (#3)** | **20.0** | Lead with this for $99 SMB; work-identity pain is budget-approvable |
| 3 | Malicious skill drain (#1) | 15.0 | Hero pain for $19 Pro; Moltbook availability window ~60 days |
| 4 | Config friction (#5) | 14.5 | Activation/onboarding lever — convert free → paid with this, not security |
| 5 | Agent opacity (#2) | 12.0 | Retention pain (day-to-day > purchase-day); drives LTV not CAC |

**Portfolio insight:** TRIBOT's cash engine is **NOT primarily security**. It's compliance + reputation + friction. Security opens the door; audit evidence + UX close the sale.

**Loss-vs-gain framing — five rewrites of spec copy:**

| Original | Rewrite | Frame |
|---|---|---|
| "4-bot abstraction for configurability" | **"Stop losing 3 hours every time you reconfigure your agent"** | Loss |
| "Father kernel for security" | **"Nothing runs on your machine without Father's signature"** | Loss (implicit) |
| "Audit trail for compliance" | **"Prove exactly what your AI did — to your client, boss, or yourself"** | Gain |
| "Soul layer for persona" | **"Give your agent a personality that actually sticks"** | Gain |
| "Skills routing via Executor" | **"Never again wonder which model ran your prompt"** | Loss |

Rule: Father + Executor = loss frame. Soul + Skills = gain frame.

### 34.5 Lens 4 — Customer Success: operational day-to-day pain

Top 15 ranked by total hurt (severity × frequency × churn-risk).

| # | Pain (user voice) | Type | $/ticket | Freq | Churn | TRIBOT |
|---|---|---|---|---|---|---|
| 1 | *"I installed a skill and now my clipboard is being read — is this normal??"* | security | $18 | 9 | **10** | ✅ |
| 2 | *"Why is my bot suddenly talking like a pirate — I didn't change anything."* | bug | $12 | 8 | 7 | ✅ |
| 3 | *"I was charged $99 but I only used it for 3 days."* | billing | $14 | 6 | 9 | 🟡 |
| 4 | *"The bot just… stops mid-task. No error, nothing in logs."* | bug | **$22** | 9 | 8 | 🟡 |
| 5 | *"How do I actually turn off the 800 malicious skills I keep reading about?"* | security | $9 | **10** | 6 | ✅ |
| 6 | *"I updated and now none of my custom workflows work."* | bug | **$28** | 7 | 9 | 🟡 |
| 7 | *"I can't figure out which of the 4 bots I'm talking to."* | just frustrated | $8 | **10** | 5 | ⚠️ TRIBOT creates |
| 8 | *"I gave it access to my repo and it pushed to main. WTF."* | security | **$45** | 4 | **10** | ✅ |
| 9 | *"Support told me 'check the logs' — where are the logs???"* | setup | $11 | 9 | 6 | ❌ |
| 10 | *"I paid for Pro but I don't see the Pro features anywhere."* | billing | $16 | 6 | 8 | 🟡 |
| 11 | *"It keeps asking me to approve the same action 40 times."* | just frustrated | $7 | 8 | 7 | ⚠️ TRIBOT creates |
| 12 | *"Skill X broke and the author is MIA."* | feature-request | $19 | 7 | 6 | 🟡 |
| 13 | *"I want to export my chat history and I can't."* | feature-request | $10 | 5 | 7 | ❌ |
| 14 | *"The AI keeps apologizing and looping instead of doing the thing."* | bug | $13 | 8 | 8 | 🟡 |
| 15 | *"I was hit by Moltbook/infostealer CVE; am I safe on TRIBOT?"* | security | $25 | 6 | 9 | ✅ |

**Three pain-amplifier chains (where low-severity hour-1 pain compounds into day-7 churn):**

1. Pain #7 (which bot am I talking to) → user disables Father to "simplify" → Pain #1 (surprise skill behavior) → **security ticket + cancellation + 1-star review citing "too complex AND insecure."**
2. Pain #9 (no logs) → Pain #4 (silent stalls can't be diagnosed) → 3 tickets in a week with no repro → **CS cost exceeds MRR by day 10; account marked unprofitable.**
3. Pain #11 (consent fatigue) → user clicks "always allow" → Pain #8 (destructive write) → **escalation to founder, refund, viral Discord post.**

**Support-cost-to-price ratio.** At $19/mo, account tolerates ~3-5 min of agent time/month. Pains that blow this budget:
- Pain #4 silent stalls (22 min/ticket = instantly unprofitable)
- Pain #9 log access (11 min + repeat offender)
- Pain #6 update-breakage (28 min, often requires eng escalation)

**Three deflection strategies:**
1. **In-app "Executor Live View"** — users see what the bot is doing *right now* without opening a ticket. Deflects #4 and #9 in one move.
2. **AI triage bot on support intake** — reads local Executor logs (with consent), classifies failure, suggests known-good remediation. Target: 60% bug tickets closed without human touch.
3. **Community-graded "TRIBOT-verified" skill badge** — users self-select away from the malicious long-tail.

**The "quiet quitter" rescue protocol:**

| Indicator | Trigger | Action |
|---|---|---|
| Session gap > 5d after week 1 while entitlement active | Automatic | In-app "what's blocking you?" (not email) |
| Same Executor action fails 3× without retry-with-variation | Automatic | Father offers repair wizard |
| Father denied ≥5 actions in session, zero approvals | Automatic | "Review your policy" flow (not another prompt) |

Budget: $8/account reactivation concierge (cheaper than re-acquiring at CAC).

**The 5 "please just" requests CS will get — pre-decided answers:**

| Request | Verdict |
|---|---|
| "Just let me edit the system prompt on Soul directly." | Refuse-with-education (expose Persona Editor with guardrails) |
| "Just turn off Father for this skill." | Redirect (scoped per-skill policy relax, never global kill) |
| "Just give me a flat $29 unlimited plan." | Refuse (usage asymmetry blows margins; offer usage-cap toggle) |
| "Just let me run this as one bot, not four." | Redirect (Unified view UI over 4-bot architecture) |
| "Just let me export everything as JSON." | **Grant** — data portability buys cancellation goodwill |

### 34.6 Cross-lens convergence matrix

When a pain appears in 3-4 of the 4 lenses independently, that's the highest-confidence signal. These are TRIBOT's top 10 validated pain points.

| # | Unified pain | User Researcher | JTBD | Behavioral Econ | CS | Coverage | Priority |
|---|---|---|---|---|---|---|---|
| **T1** | **Overnight opacity / don't know what agent did** | #2 | J5 | #2 | #4, #9 | ✅ Full | **HIGHEST** (4/4) — retention engine |
| **T2** | **Agent runs malicious skill / action** | #1, #5, #12 | J1, J2 | #1, #4, #12 | #1, #5, #8 | ✅ Full | **HIGHEST** (4/4) — acquisition engine |
| **T3** | **Can't prove compliance to client** | #15 | J10 | #3, #8 | #15 | ✅ Full | **HIGH** (4/4) — highest WTP ($55) |
| **T4** | **Configuration death-by-YAML** | #10 | J3 | #5 | — | ✅ Full (Soul) | **HIGH** (3/4) — activation lever |
| **T5** | **Moltbook-headline fear** | #1 | J7 | #1 | #15 | ✅ Full | **HIGH** (4/4) — #1 switching force |
| **T6** | **Pricing unpredictability / runaway loops** | #9 | — | — | #3 | 🟡 Partial | **MED** (2/4) — needs cost circuit-breaker |
| **T7** | **Skill discovery fatigue** | #7 | — | — | #12 | ❌ Not | **MED** (2/4) — critical gap |
| **T8** | **Destructive action unrecoverable** | — | J1, J9 | — | #8 | ✅ Full (`/panic`) | **HIGH** (2/4) — emotional resonance |
| **T9** | **Support burden on indie builders** | #3 | J6 | — | — | ❌ Not | **MED** (2/4) — B2B2C wedge gap |
| **T10** | **TRIBOT creates new pains** (4-bot confusion, consent fatigue) | — | — | — | #7, #11 | ⚠️ Self-inflicted | **HIGH** (1/4 but critical) |

### 34.7 The coverage verdict

**Of the 10 highest-confidence pains, TRIBOT fully addresses 7, partially addresses 1, fails to address 2, and creates 1 new pain class.** Breaking it down:

#### ✅ What TRIBOT wins decisively on (7 pains)

Father kernel architecture is genuinely category-defining for: overnight opacity (T1), malicious-skill defense (T2), compliance proof (T3), YAML config tax (T4 via Soul), Moltbook-fear neutralization (T5), kill-switch for destructive actions (T8). These 6 convert + retain.

#### 🟡 What TRIBOT handles partially (1 pain)

Cost/loop control (T6) — Executor owns the loop but spec doesn't commit to budget caps or circuit breakers. Easy fix; add to spec.

#### ❌ What TRIBOT doesn't address at all (2 pains)

1. **Skill discovery (T7)** — 44K skills, no taste-making. Options: ship "Scout" micro-service; partner with curated index; add Father-observed-behavior ranking across fleet.
2. **Indie-builder support burden (T9)** — the 180 startups generating $320K/mo drown in their customers' tickets. Options: ship "Fleet Father" read-only operator dashboard; license pre-trained TRIBOT-powered support triage bot; or explicitly defer with roadmap commitment.

#### ⚠️ What TRIBOT paradoxically worsens (1 pain)

4-bot confusion + consent fatigue (T10) — pain #7 and pain #11 in the CS lens exist *because* of TRIBOT's architecture. Both are self-inflicted; both are fixable with UX, not architecture changes (Unified View surface, trust-scoring to reduce re-prompting).

### 34.8 The four pains TRIBOT must NOT try to solve

From the JTBD analysis — staying out of these lanes preserves identity:

| # | Pain | Winner | Why TRIBOT loses here |
|---|---|---|---|
| F1 | Frontier-model raw / no-guardrails | raw OpenClaw, Ollama | Father *is* the point; filters feel like friction. |
| F2 | True enterprise compliance (SOC 2/HIPAA/FedRAMP) | Anthropic Enterprise, Azure OpenAI | Audit log ≠ certification; $499 SMB ≠ enterprise. |
| F3 | No-code agent builder for non-technical teams | Zapier AI, n8n, Lindy | TRIBOT is abstraction-for-builders, not GUI. |
| F4 | Cheapest hobby setup | Self-hosted OpenClaw | $19/mo floor loses to free + risk tolerance. |

**Single most important strategic call:** Do not build a no-code GUI to chase TAM. It dilutes the safety-kernel identity that wins the core switches.

### 34.9 Three anti-jobs TRIBOT must architecturally refuse

Buyers will try to hire TRIBOT for these; refusing them protects the brand:

| # | Anti-job | Mitigation |
|---|---|---|
| A1 | "Spy on employees' AI usage without their knowledge" | Mandatory in-session disclosure banner in enterprise-mode; per-user consent ledger; log-access events auditable. |
| A2 | "Bypass third-party API ToS at scale" | Father ships with baseline ToS-respect ruleset for common APIs; attempts generate warnings; removal requires signed ack. |
| A3 | "Strip safety from frontier models" | Father has a non-removable inner ring (CSAM, WMD, self-harm amplification). Configurable ring is outside it. Document the boundary publicly. |

### 34.10 The pain-driven roadmap

From the cross-lens analysis, the post-GA roadmap prioritized by pain severity × WTP × coverage gap:

**Q+1 (first 90 days post-GA):**
1. **Ship Executor Live View** (CS deflection for pain #4 + #9 = removes highest-cost support burden).
2. **One-click undo for destructive actions** (converts pain #8 from cancellation to promoter moment).
3. **Weekly "Father Receipts" digest email** (turns insurance into observable service — escapes the hyperbolic-discount trap).
4. **Insert $39 Solo Pro tier** (fixes $19 → $99 5.2× gap; maps to "professional-not-hobbyist" emotional job).
5. **Unified View UI over 4-bot architecture** (fixes self-inflicted pain #7).

**Q+2 (days 90-180):**
6. **Skill discovery engine ("Scout")** with Father-fleet-observed behavior ranking (closes gap T7).
7. **Fleet Father dashboard** for indie builders (closes gap T9 + unlocks B2B2C wedge).
8. **Memory module partnership** (Mem0 or Letta — closes long-term-context gap).
9. **Skill version pinning + canary windows** (closes T13 update-breakage pain).
10. **JSON export + skill-config portability** (cancellation goodwill + fixes CS "please just #5").

**Q+3 (days 180-270):**
11. **TRIBOT-verified ClawHub skill badge** (social proof flywheel — converts pain #12).
12. **Live decision trace UI** in Executor (closes pain #8 debugging-why-this-tool).
13. **Cost circuit-breaker** in Executor (closes gap T6 — $/mo predictability).

### 34.11 The four audits agree on one thing

**TRIBOT is a safety-kernel product that converts through compliance and retains through observability.** Every lens arrives at the same conclusion from a different vector:

- **User Researcher:** *"Lead every demo with a live Moltbook-style attack being killed by Father in real time."*
- **JTBD:** *"The strongest jobs are emotional jobs dressed as functional ones."*
- **Behavioral Economist:** *"The cash engine is compliance + reputation + friction, NOT security. Security opens the door."*
- **CS Lead:** *"The product's moat is governance + clarity. The support queue's moat is self-serve recovery at 3 AM."*

**One-sentence synthesis:** TRIBOT sells *calm* at $19, *credential* at $39-$99, and *compliance* at $499 — and it only retains if users *feel* Father working on a Tuesday afternoon when nothing dramatic is happening.

### 34.12 The five go/no-go tests before GA

Derived from the convergence matrix. If any of these fail, delay launch:

| # | Test | Pass criterion | Lens source |
|---|---|---|---|
| 1 | **Moltbook live-demo** | Father blocks a staged attack in <2s during any press briefing | User Researcher |
| 2 | **"Fair price" Van Westendorp on waitlist** | Optimal Price Point lands between $14-$24 | Behavioral Econ |
| 3 | **First-session Father event** | >70% of new users witness a `father.user_visible_event` in session 1 | CS + Growth |
| 4 | **Audit export format review** | 3 sample clients' legal teams accept the JSON/CSV as procurement evidence | JTBD + Behavioral Econ |
| 5 | **3 AM self-serve recovery** | 5/5 of the "3 AM" pains have a self-serve path before human support needed | CS |

---

*§34 is the pain map. If a pain surfaces post-launch that isn't in the matrix, add it and re-score. The 10 convergent pains (§34.6) are the product's job description; everything else is support.*

---

## 35. Verification audit — five independent fact-checkers

> **Captured 2026-04-22.** Five specialists audited the spec independently for errors: a Principal Security Architect (ex-Project Zero/Cloudflare/Signal), a Senior Product Counsel (EU+US dual-qualified, AI+privacy), a Senior Technical Editor (internal-consistency check), a Senior Research Analyst (ex-Gartner/CB Insights, market fact-check with web access), and a Senior Product Strategist (ex-McKinsey/a16z, logical coherence). None of them rewrote the spec — their job was only to surface errors. This section preserves all findings, tags them P0/P1/P2, and produces a consolidated correction list.

### 35.1 The five lenses

| Lens | What it checked | Key methodology |
|---|---|---|
| **Technical Architecture** | Security primitives (SPIFFE/mTLS/TPM/WebAuthn), OWASP mapping, MCP bridge, agentic loop, supply-chain claims | Cross-reference against real RFCs, vendor docs, published security research |
| **Legal/Regulatory** | GDPR article citations, EU AI Act articles, case law, FRCP, COPPA, trademark law | Verify against primary legal text |
| **Internal Consistency** | Same claim appearing in different forms across sections; contradictions between §30, §31, §32, §33, §34 | Read full 3,400-line doc for self-contradictions only |
| **Market Claims** | All numeric claims (MAU, CVEs, pricing, market-size), named people/outlets, competitor facts | Web search + WebFetch against contemporaneous sources |
| **Logical Coherence** | Core thesis strength, load-bearing assumptions, causal logic, survivorship bias | Stress-test arguments without external verification |

### 35.2 P0 findings — the kill list

Issues severe enough to block further work or reputationally damage the product at launch.

| # | P0 Issue | Lens | Correction required |
|---|---|---|---|
| **K1** | **Father CLI (§33.2) directly contradicts "no web surface" security posture (§32.2.4 #10).** A public CLI talking to Father's UDS is a second trust path bypassing WebAuthn UV — re-opens the `/panic` CSRF/DoS primitive §32.1.4 #7 is meant to close. | Technical | Decide: either the CLI is a developer stub distinct from Father-core (document explicitly), OR the CLI is the product and the Electron dashboard defers. Cannot ship both as currently specified. |
| **K2** | **"ICO 2024 guidance endorsing crypto-shredding"** (§32.2.2 #1) — this document **does not exist** as cited. EDPB Guidelines 5/2019 are on search-engine delisting, not erasure-via-crypto-shred. | Legal | Remove the citation. Rewrite the tombstone-model paragraph to acknowledge crypto-shredding is a **defensible minority position**, not an ICO-blessed safe harbor. |
| **K3** | **GDPR Art. 33 breach notification is 72 hours, not 48.** Spec §32.2.2 #4 cites 48h. | Legal | Factual error — correct to 72 hours. |
| **K4** | **Four pricing ladders coexist.** $19/$99/$499 (§31.6), $9/$29/$79 (§32.2.3/§33.2), $19/$39/$99/$499 (§34.4/§34.10), plus usage-based and per-seat-plus-platform in §33.4. No committed answer. | Consistency | Commit to one ladder now or declare §33.8's Van Westendorp experiment authoritative and delete all pricing claims from §34 until it runs. |
| **K5** | **Four name sets coexist.** "Father / Soul / Skills / Executor" (§30) vs. "Guardian / Persona / Pilot" (§33.1) vs. "Warden / Conductor" (various) vs. "CLAWGUARD / Triark" (§33.3). §33.8's external-rename decision is not applied to §34. | Consistency | Freeze §33.8's external names. Mass-rewrite §34 + §30.16 + §31 to match. No copy ships until done. |
| **K6** | **Four MVPs coexist.** §30.13 (3 pages + dashboard + Gmail), §31.9 (CLI-only), §32.5 (6-phase 20-22 week plan), §33.2 (hosted sandbox first). Each contradicts the others. | Consistency | §32.5 explicitly overrides §30.13 and §31.9. Honor that. Re-sequence §34.10 under §32.5's phases. |
| **K7** | **"Don't fight enterprise"** (§31.4) contradicts SOC 2 Type I roadmap + RSA panel + SSO-lite in §33. | Consistency | Resolve: either serve SMB Segment 3 with enterprise-lite (relax §31.4) or cut SOC 2/RSA/SSO from §33. |
| **K8** | **The 4-bot thesis is not actually argued.** §30.1 claims "safe, readable, reusable" follow from a 4-bot split; doesn't demonstrate. Soul/Skills/Executor are not MECE (policy appears in Soul refusals, Skills scopes, and Father enforcement simultaneously). | Logic | Either show one user benefit 2-bot cannot produce, or reposition: "Father-as-primitive + persona/capability/runtime as organization" — make Father the load-bearing claim. |
| **K9** | **"Prosumer safety-kernel buyer at $19/mo"** is the single assumption that collapses the entire product if wrong. Security products at this price point historically sell to organizations; prosumers exhibit optimism bias that pushes WTP toward $0-$9. Behavioral Economist flagged the "insurance problem" in §34.4 and never refuted it. | Logic | Validate via §31.9's landing-page + CLI experiment **before** writing GUI code. Kill criteria: <300 waitlist in 30 days, <30 CLI WAU at D60. |
| **K10** | **Moltbook ≠ single-user threat model.** Moltbook was multi-tenant with an unsecured DB; TRIBOT is single-user local-first (§30.14). `/panic` freezing "every TRIBOT" has no meaning when there's one user's laptop. Marketing repeatedly uses Moltbook as justification; logic doesn't map. | Logic | Rewrite §30.2 + §30.10 Flow D to remove multi-tenant fleet language. Father's value holds *per individual user*; Moltbook is emotional hook only. |

### 35.3 Technical architecture errors (Principal Security Architect)

| # | Finding | Severity |
|---|---|---|
| T1 | **Spotlighting attributed to Anthropic; actually Microsoft Research (Hines et al. 2024, arXiv:2403.14720).** §32.2.4 #2 | P1 |
| T2 | **SPIFFE SVIDs on a consumer laptop = over-engineering.** SPIRE assumes fleet operation; an ephemeral X.509 leaf in OS keystore achieves the same property with 1/10 the surface area. Aspirational taxonomy, not accurate primitive. | P1 |
| T3 | **`renameat2(RENAME_EXCHANGE)` is Linux-only.** Spec §32.2.4 #6 implies cross-platform; macOS needs `renamex_np` with `RENAME_SWAP` on APFS; Windows has no direct analogue. | P1 |
| T4 | **PPL (Protected Process Light) on Windows is not available to third-party signed binaries** without Microsoft's anti-malware cert program (restricted). §32.2.4 #4 claim breaks. | P1 |
| T5 | **TPM/PCR binding for macOS does not exist.** Secure Enclave has no TCG PCRs; keys are bound to passcode + hardware UID, not binary-hash PCR. §32.2.4 #4 cross-platform claim fragments into three different implementations. | P1 |
| T6 | **Windows "Secure Attention Sequence" is logon-only.** Third-party apps cannot programmatically trigger SAS. Nearest runtime equivalent is UAC, not SAS. §32.2.4 #7. | P1 |
| T7 | **OWASP LLM04 mis-mapped.** §30.9 maps LLM04 (Data & Model Poisoning) to "audit store + anomaly detection." LLM04 is about training-data/corpus tampering — not applicable to TRIBOT's scope per §30.14 "not an LLM host." Should read "not applicable" rather than claiming a mitigation. | P1 |
| T8 | **OWASP LLM03 conflates two supply chains.** Model-weight supply chain ≠ ClawHub skills supply chain. The real LLM03 story is npm deps (§32.2.4 #9); §30.9 misses the link. | P1 |
| T9 | **Executor agentic loop lacks per-turn token budget and wall-clock bound.** §30.6 pseudocode caps *steps*, not *cost*. §34 flags this; §30.6 doesn't remediate. | P1 |
| T10 | **Rekor public transparency log would publish user metadata.** §32.2.4 #5 doesn't distinguish public vs. self-hosted Rekor. | P1 |
| T11 | **"mmap PROT_READ + mprotect guard pages"** muddle TOCTOU defenses. Read-only mmap ≠ on-disk tamper defense; these are complementary, not redundant. §32.2.4 #6 phrases as if PROT_READ alone solves the race. | P2 |
| T12 | **Liquid Glass / backdrop-filter has known compositor seams on Firefox** despite being "iOS-26 fidelity" — not an error, but universal assertion is overstated. | P2 |
| T13 | **"Zero npm runtime deps in the security kernel"** — accurate if split between Go/Rust core + Electron renderer is honored. But the Electron bundle carries Chromium + 800-1200 npm packages; net attack surface is dominated by the renderer. Phrasing oversells. | P2 |

### 35.4 Legal/regulatory errors (Senior Product Counsel)

| # | Finding | Severity |
|---|---|---|
| L1 | **GDPR Art. 33 = 72 hours, not 48** (K3 above) | **P0** |
| L2 | **"ICO 2024 guidance" endorsing crypto-shredding — no such document exists** (K2 above) | **P0** |
| L3 | **EDPB Guidelines 5/2019 are about search-engine delisting**, not erasure-via-crypto-shred. Mis-cited in §32.2.2 #1. | P1 |
| L4 | **Art. 22 characterization overreaches.** Father blocking a scope violation is unlikely to meet "legal or similarly significant effect" threshold per EDPB Guidelines 1/2025 (superseding WP251rev.01). §32.1.2 #2 inflates the duty. | P1 |
| L5 | **Art. 22(2)(a)/(b) misread as "automatic safety lane."** Subsection (b) is statutory-authorisation, NOT automatic-safety. §32.2.2 #2 has this wrong. | P1 |
| L6 | **COPPA final rule is January 2025, not 2024.** §32.1.2 #10 says "2024 NPRM tightening" — final rule was Jan 16 2025 (effective June 23 2025). | P2 |
| L7 | **§7.07 Agency (respondeat superior) conflated with §2.02 (apparent authority).** "Father approved = documented authorization" maps to §2.01/2.02, not §7.07. §32.1.2 #7. | P2 |
| L8 | **"BotFather registered trademark" is unconfirmable.** Telegram holds TELEGRAM mark; no standalone "BOTFATHER" USPTO/EUIPO registration found. Risk is reputational/confusion, not mark collision. §32.1.2 #8 oversimplifies. | P2 |
| L9 | **Art. 35 DPIA triggers unaddressed.** Automatic decisions + large-scale processing are both explicit DPIA triggers under Art. 35(3)(a)/(b); spec never mentions DPIA obligations. Gap, not error. | P2 |
| L10 | **Insurance "$5M tech E&O + $5M cyber" is over-provisioned for pre-revenue seed.** Typical seed policy: $1-3M / $15K annual. $5M/$5M = post-first-Business-tier customer, not at seed. | P2 |
| L11 | **OWASP LLM01-LLM10 (2025) names and numbers are all correct.** This is the cleanest technical-legal section of the spec. | ✅ |
| L12 | **Trail of Bits / NCC Group / Doyensec / Sigstore / Rekor / Corsearch + CompuMark** — all real firms, all appropriate for stated roles. | ✅ |

### 35.5 Internal consistency contradictions (Technical Editor)

**Top 10 most urgent to resolve before any further work:**

| # | Contradiction | Sections | Severity |
|---|---|---|---|
| C1 | **Pricing SKUs** — four incompatible ladders (K4) | §31.6, §32.2.3, §33.2, §33.4, §33.7, §33.8, §34.4, §34.10 | **P0** |
| C2 | **External names** — Father / Warden / Guardian / Conductor / Pilot (K5) | §30.4-§30.11, §32.2.1, §32.2.3, §32.2.5, §33.1, §33.7, §33.8, §34 | **P0** |
| C3 | **Product name** — TRIBOT vs. CLAWGUARD vs. Triark; §33.3 still uses `tribot.ai` subdomains while §33.8 opens the rename | §33.1, §33.3, §33.8 | **P0** |
| C4 | **MVP scope** — §30.13 / §31.9 / §32.5 / §33.2 (K6) | §30.13, §31.9, §32.5, §33.2, §34.10 | P1 |
| C5 | **Launch date** — Q3 2026 (§31.10) vs. Oct-Nov 2026 (§32.5) vs. un-anchored (§33) | §31.10, §32.5, §33.2, §33.6, §33.8 | P1 |
| C6 | **Enterprise posture** — §31.4's "stay off" vs. §33.4/§33.8 SOC 2 + RSA (K7) | §31.4, §32.2.2, §33.4, §33.6, §33.8, §34.8 | P1 |
| C7 | **OpenClaw coupling** — sole runtime vs. multi-model day-one | §30.1, §30.14, §31.8 #2, §33.2 #5, §33.6, §34 | P1 |
| C8 | **Father security claims** — §34 "wins decisively on 7 pains" vs. §32.1.4's 10 CRITICAL/HIGH kernel defects with admitted residuals | §30.7, §31.8, §32.1.4, §32.2.4, §33.6, §34.7 | P1 |
| C9 | **Buyer persona** — prosumer only (§31) vs. "$99 SMB" (§34.4) vs. Tier-1 mass-market PR (§33.6) | §31.5, §31.6, §33.4, §33.5, §33.6, §34.3, §34.4 | P1 |
| C10 | **Crystal character identity** — "always Crystal" (§28.9) vs. three-bot three-gem (§30.15) vs. Crystal-only brand mark (§33.1) | §28.9, §30.15, §30.16, §33.1, §33.8 | P2 |

**Clean sections (no self-contradictions):** §1-§6 (visual tokens), §10-§13 (chat/composer/voice/markdown), §18/§22 (micro-interactions/craftsmanship), §24 (north-star paragraph), §27 (mono typography), §29 (design inspiration acknowledges "Remix" when diverging), §30.8-§30.9 (OpenClaw contract + OWASP mapping), §34.3 (JTBD within lens).

### 35.6 Market claims corrections (Research Analyst)

**85% of factual claims verified cleanly.** The errors are attribution/precision issues, not fabrications.

| # | Correction | Severity |
|---|---|---|
| M1 | **9.9 CVE date conflation.** CVE-2026-32922 (9.9 score, token-rotation race RCE) was disclosed **March 29, 2026**, not within the March 18-21 nine-CVE window. Rephrase: "9 CVEs March 18-21, plus a 9.9 in late March." | P1 |
| M2 | **135K/50K attribution wrong.** §31.3 attributes to Bitsight; actual source is **SecurityScorecard STRIKE team**. Bitsight's own scan was ~30K. | P1 |
| M3 | **MyClaw SOC 2 certification claim is unconfirmable.** No public evidence. Likely conflation with Runlayer (which IS SOC 2 Type II + HIPAA). Remove unless internal evidence. | P1 |
| M4 | **NemoClaw GTC date: March 16, not March 17.** One-day correction. | P2 |
| M5 | **49.6% CAGR attribution wrong.** §31.7 cites Fortune Business Insights; actual source is **Grand View Research**. FBI's CAGR is 40.5%. Fix attribution. | P1 |
| M6 | **Vanta pricing anchor wrong by order of magnitude.** §34.4 anchors compliance WTP on "Vanta $99-$3K/yr"; actual Vanta starts ~$10K/yr. Replace or remove. | **P0 for WTP math** |
| M7 | **Notion AI $10/mo anchor outdated.** Standalone $10 AI add-on killed May 2025; now bundled at $20 Business. §34.4. | P2 |
| M8 | **Anthropic typography precision.** Styrene B + Tiempos are claude.ai **product** fonts; Anthropic's corporate brand uses Poppins + Lora. §29.1 treats them as the same. | P2 |
| M9 | **Kylie Robison at Wired — verify her current role.** One source suggests she may have departed. §33.6 PR target list. | P2 |
| M10 | **tribot.org founding year** — "since 2012" unconfirmed; site's own copy suggests ~2016. Soften to "since ~2015." | P2 |
| M11 | **Lakera $300M Check Point deal is estimated, not officially disclosed.** §31.4. | P2 |
| M12 | **All OpenClaw ecosystem numbers verified cleanly** — 3.2M MAU, 500K instances, 82 countries, 346K stars, 44K skills, 92% retention, 65% enterprise, 180 startups, $320K/mo, $20-32/mo spend, infostealer targeting. | ✅ |
| M13 | **All competitor data verified** — Runlayer, Oasis $195M, Kai $125M, Surf AI $57M, Manifold $8M seed, Moltbook details. | ✅ |
| M14 | **All named journalists/creators verified** — Roose/Newton, Heath, Knight, Primack, Thompson, Rachitsky, Fridman, Willison, Mollick, Swyx, Wolfe, Fireship, Theo, ThePrimeagen (except M9 Robison uncertainty). | ✅ |
| M15 | **OWASP LLM Top 10 2025 all correct.** | ✅ |

### 35.7 Logical coherence challenges (Product Strategist)

The five claims most critical to defend or discard:

| # | Claim | Defense Required | If undefended |
|---|---|---|---|
| **LC1** | **"Father addresses OpenClaw's CVE landscape"** (§30.2, §31.3) | Only 2 of ~8 cited incidents are actually Father-addressable. Moltbook was database-layer (not Father's scope); infostealers target the same disk Father lives on; 135K exposed instances are OpenClaw's listener, not Father's domain; 9 CVEs are upstream. | Prune the incident list to what Father actually stops (prompt injection via email, outbound-scope enforcement), or discard the "every major security firm validated us" narrative. |
| **LC2** | **"Prosumer safety-kernel buyer at $19/mo exists and converts 2-3%"** (§31.5.1) | Security-at-this-price-point historically sells to organizations. §34.4 Behavioral Economist flagged the "insurance problem" (hyperbolic discount, optimism bias). Three proposed escapes (Father receipts dashboard, pre-commitment framing, endowment anchor) are rescues, not proofs. | Validate via §31.9 landing-page + CLI experiments *before* writing GUI. If kill criteria hit (<300 waitlist / <30 CLI WAU), the entire SOM collapses. |
| **LC3** | **"$55 compliance WTP applies to non-enterprise tier"** (§34.4 Portfolio insight) | $55 is imported from Vanta/Drata enterprise comparables (plus Vanta's real price is $10K+/yr — see M6). §31.4 explicitly refuses enterprise selling. Prosumers and solo indie hackers do not pay $55/mo for compliance evidence because they have no one to prove compliance to. | Get 3 SMB conversations where $499 commitment is written *without* asking for SOC 2 before publishing the "cash engine is compliance" claim. Otherwise the §31 SOM math depends on a segment we refuse to sell to. |
| **LC4** | **"4-bot split is simplest architecture producing safe+readable+reusable"** (§30.1) | Not MECE — Soul refusals overlap Father policy; Skills scopes overlap Father enforcement; Executor max-turns is a Soul field AND a runtime concern AND a Father budget. Three owners, one knob. | Show one user benefit 2-bot (Persona+Runtime+config) cannot produce, OR reposition "4-bot" as marketing organization and treat Father-as-primitive as the architectural claim. |
| **LC5** | **"GUI and CLI are the same product at the same stage"** (§30.13 vs §31.9 vs §33.2) | §30.13 is 4-page React app; §31.9 is CLI-only; §33.2 is hosted-sandbox-first. §1-§29 is ~1,800 lines of GUI spec. These are three different MVPs. | Pick one as the real MVP and reshape §30.13 + §31.9 + §33.2 around it. The §20 Vite/React work is defended neither by CLI validation nor by a stated "build GUI in parallel" thesis. |

**The one assumption that, if wrong, collapses the whole product:**

> A prosumer — a solo developer already paying $20-32/mo for OpenClaw hosting — will pay an additional $19/mo for a safety/governance wrapper whose day-to-day value is "nothing dramatic happening."

Every downstream number depends on this: SOM ($5-8M Y1), CAC/LTV, the §34.11 "sells calm at $19" synthesis, the 2-3% conversion hypothesis. The spec's own Behavioral Economist flagged it in §34.4 as "the insurance problem" — and it has not been refuted, only narrated around.

### 35.8 Corrections summary — the flat list

Consolidated across all five lenses. Numbered for tracking.

**MUST CORRECT (P0):**
1. Father CLI vs. no-web-surface contradiction (K1 / T8 / C8) → pick one
2. "ICO 2024 guidance" citation does not exist (K2 / L2) → remove
3. GDPR Art. 33 = 72h, not 48h (K3 / L1) → fix number
4. Four pricing ladders (K4 / C1) → commit to one or freeze all
5. Four name sets (K5 / C2) → freeze §33.8 as canonical
6. Four MVPs (K6 / C4) → §32.5 overrides
7. Enterprise posture contradiction (K7 / C6) → serve SMB-lite or cut SOC 2/RSA
8. 4-bot thesis not argued (K8 / LC4) → demonstrate or reposition
9. Prosumer safety-kernel buyer unvalidated (K9 / LC2) → test before building GUI
10. Moltbook ≠ single-user model (K10) → rewrite §30.2 + Flow D
11. Vanta $99-$3K anchor wrong by 10× (M6) → replaces §34.4 WTP math

**SHOULD CORRECT (P1):**
12. Spotlighting → Microsoft Research, not Anthropic (T1)
13. SPIFFE overkill for single-user laptop (T2)
14. `renameat2` is Linux-only (T3)
15. PPL restricted on Windows (T4)
16. TPM/PCR has no macOS analogue (T5)
17. Windows SAS is logon-only (T6)
18. OWASP LLM04 mis-mapped (T7)
19. OWASP LLM03 conflated (T8)
20. No per-turn token budget in Executor (T9)
21. Rekor public vs. self-hosted (T10)
22. EDPB 5/2019 mis-cited (L3)
23. Art. 22 threshold overreach (L4)
24. Art. 22(2)(a)/(b) misread (L5)
25. 9.9 CVE date conflation (M1)
26. 135K/50K attribution wrong (M2)
27. MyClaw SOC 2 claim unconfirmable (M3)
28. 49.6% CAGR attribution wrong (M5)
29. Launch date un-anchored (C5)
30. OpenClaw coupling (C7)
31. Father security claims overstated vs. §32.1.4 (C8)
32. Buyer persona shifts (C9)
33. CVE landscape Father-addressability (LC1)
34. $55 WTP segment-imported (LC3)
35. GUI/CLI same product claim (LC5)

**NICE TO FIX (P2):**
36. Firefox backdrop-filter seams (T12)
37. Npm surface phrasing (T13)
38. `mmap PROT_READ` TOCTOU muddle (T11)
39. COPPA final rule = 2025 (L6)
40. §7.07 vs §2.02 agency (L7)
41. BotFather TM framing (L8)
42. DPIA triggers unaddressed (L9)
43. Insurance over-provisioned (L10)
44. NemoClaw date off by 1 day (M4)
45. Notion AI pricing outdated (M7)
46. Anthropic typography precision (M8)
47. Kylie Robison status (M9)
48. tribot.org year (M10)
49. Lakera deal disclosure (M11)
50. Crystal identity vs. theme (C10)

### 35.9 Clean bill of health — what the verification found RIGHT

Not everything was wrong. These claims survived all five lenses:

- **All 10 OWASP LLM Top 10 (2025) names and numbers** (L11)
- **All OpenClaw ecosystem stats** (3.2M MAU, 92% retention, 44K skills, 180 startups, $320K/mo, 346K stars, 500K instances, 82 countries) (M12)
- **All major competitor facts** (Runlayer SOC 2 + HIPAA, Oasis $195M, Kai $125M, Surf AI $57M, Manifold $8M, Moltbook chronology, Meta acquisition) (M13)
- **All named people and outlets** except Kylie Robison uncertainty (M14)
- **All major security firm names** (Trail of Bits, NCC Group, Doyensec, Sigstore/Rekor, Corsearch/CompuMark) (L12)
- **Real cited legal instruments** (GDPR Chapter V transfers, SCC Module 2/3, EDPB Recommendations 01/2020, DSA Art. 6, PLD 2024/2853, NIS2, UK GDPR, PIPL Art. 38, FRCP 26/37(e), FRE 902(13)-(14))
- **Infostealer claims** (RedLine, Lumma, Vidar, AMOS targeting OpenClaw configs)
- **Moltbook details** (Jan 28 launch, Jan 31 incident, March 10 Meta acquisition, Matt Schlicht, "vibe coding," 202,743 agents, submolts)
- **Steinberger → OpenAI Feb 14-15 2026** with Sam Altman public acknowledgment
- **Most BE comparables** (1Password ~$3, Cloudflare Access $3, Plausible $9, Grammarly Business $15, Raycast Pro $8, Datadog $15) except Vanta and Notion AI
- **Sections §1-§29** (the visual-system + design inspiration layer) are internally coherent and externally defensible

**Cleanest sub-sections:** §30.9 (OWASP mapping, apart from LLM04/LLM03 corrections), §29 (design inspiration with clear "Remix" flags), §30.8 (OpenClaw integration contract). These should serve as the quality bar for the §30-§34 rewrites.

### 35.10 The priority-ordered correction sprint

To pass verification a second time, the minimum work:

**Sprint 1 — Factual & citation errors (4-6 hours):**
1. Fix GDPR Art. 33: 48h → 72h
2. Remove "ICO 2024 guidance" citation
3. Replace Vanta $99-$3K anchor with accurate enterprise figure or remove
4. Correct attribution: 135K/50K → SecurityScorecard; 49.6% CAGR → Grand View Research
5. Soften MyClaw "SOC 2" to "encrypted containers"
6. Fix Spotlighting attribution: Microsoft Research (Hines et al. 2024)
7. Fix 9.9 CVE date: "plus a 9.9 in late March"
8. OWASP LLM04: relabel as "not applicable per §30.14" rather than claiming mitigation
9. OWASP LLM03: add npm dep note and separate from ClawHub

**Sprint 2 — Pick-one decisions (1-2 days):**
10. **Names:** freeze §33.8's external set (Guardian/Persona/Pilot) OR revert §33.8
11. **Product name:** keep TRIBOT pending clearance OR pivot to new name
12. **Pricing:** commit to one ladder OR freeze all
13. **MVP:** §32.5 is the authoritative path; delete competing MVP statements
14. **Launch date:** anchor to a specific GA date
15. **Enterprise:** admit SMB Segment 3 is served with SSO-lite OR cut enterprise-lite
16. **OpenClaw coupling:** pick OpenClaw-native OR multi-model-at-launch

**Sprint 3 — Load-bearing validations (4-8 weeks):**
17. Run §31.9 landing-page + CLI test with explicit kill criteria
18. Prune §31.3 incident list to Father-addressable items only
19. Collect 3 SMB conversations confirming $499 WTP without SOC 2 ask
20. Decide GUI-first vs. CLI-first; reshape §30.13 accordingly

**Sprint 4 — Security architecture reality (8-16 weeks):**
21. Reconcile Father-as-CLI vs. Father-as-daemon (K1)
22. Cross-platform TPM/PCR story (Windows 11 + macOS Secure Enclave + Linux with/without TPM)
23. SPIFFE → ephemeral OS-keystore cert
24. Executor per-turn token budget + wall-clock bounds

**Sprint 5 — Design system reconciliation (2-3 weeks):**
25. Crystal-as-identity vs. three-gem-three-bot (§28.9 vs §30.15) — pick one
26. Stage model breakpoints (§32.2.5): rewrite §9 + §19 accordingly
27. 2D Crystal-facet mark for favicon/print; 3D model-viewer stays in-app only

### 35.11 What this verification changed

**Before §35:** The spec presented itself as a polished, investor-ready product thesis. **After §35:** Eleven P0 issues gate any further investor/builder conversation. The corrections sprint is 8-16 weeks of work before a single line of GA-bound code is written. This includes:

- **3 factual errors** that would fail outside counsel / DPO review (Art. 33 48h, ICO 2024, Vanta pricing)
- **7 consistency failures** that will fork into diverging UIs/pricing/marketing if not resolved
- **1 architectural contradiction** (Father CLI vs. no-web-surface) that re-opens a P0 security primitive
- **5 logical claims** whose load-bearing assumptions are unvalidated

**What the verification did NOT find:** market fabrication, technical fraud, or legal malpractice. The errors are of the class that appear when specifications grow faster than they can be reconciled — precision drift, attribution drift, name drift. All are fixable in a 2-3 week dedicated revision sprint, provided the team accepts that §30-§34 needs one authorial pass by a single human before it ships anywhere.

**The spec is sound at its foundation. It is not sound at its edges. Fix the edges, and it ships.**

---

*§35 is the adversarial check on §30-§34. If a §30-§34 claim is not in §35's clean-bill list, treat it as provisional until corrected. Next revision: merge §35 corrections into their home sections and remove §35 as a standalone appendix (its existence is the evidence the problem wasn't prevented in-line).*

---

## 36. Canonical resolutions — supersedes earlier contradictions

> **Captured 2026-04-22.** This section makes the binding calls on every P0/P1 contradiction §35 surfaced. Where any prior section conflicts with §36, **§36 wins**. P0 factual errors have already been fixed inline (see §35.10 Sprint 1 — completed). Strategic decisions are made below.

### 36.1 Naming — frozen (resolves K5 / C2)

**External (user-facing UI, marketing, docs, support):**

| Concept | External name | Rationale |
|---|---|---|
| The full cluster | **TRIBOT** (pending TM clearance — see §36.3) | Holds for now; name retained until clearance result. |
| Bot 1 (persona definer) | **Persona** | Industry-standard; unloaded; reads cleanly to non-devs. |
| Bot 2 (capability router) | **Skills** (lowercase, common noun) | Already-understood term; no proper-noun branding burden. |
| Bot 3 (agentic loop runner) | **Runtime** (or hidden from primary UI) | Replaces "Executor" — drops legal/grim connotation; users mostly never see it. |
| Bot 4 (security kernel) | **Guardian** | Most-converged across psychologist + brand + UX + lawyer audits. Replaces "Father" entirely in user surface. |
| Gem identity colors | **Crystal / Emerald / Ruby** | Kept — strongest brand asset. |

**Internal (code, API, logs, engineering docs, this spec):**

| External name | Internal identifier | Why preserved |
|---|---|---|
| Persona | `soul.*` | All architecture, file paths, internal docs unchanged. |
| Skills | `skills.*` | Same. |
| Runtime | `executor.*` | Same. |
| Guardian | `father.*` | Same. The BotFather echo is internally useful for engineers; never surfaces to users. |

**Implementation rule:** the i18n / copy-translation layer (per §32.2.5 #10 UX recommendation) bridges the two. Engineering writes Soul/Skills/Executor/Father; users see Persona/Skills/Runtime/Guardian. **Earlier sections (§30, §32, §34) that use external Soul/Executor/Father language are deprecated for user-facing copy but retained as architecture documentation** — read §30 as the *engineering view*, §36 as the *product view*.

### 36.2 Pricing — frozen ladder (resolves K4 / C1)

**Committed pricing ladder (replaces all four prior proposals):**

| Tier | Price | For | Includes |
|---|---|---|---|
| **Free** | $0 | Curious users | 1 TRIBOT · Guardian on (basic rules) · 7-day audit · community Skills · usage cap |
| **Solo** | **$19/mo** | Single prosumer (Segment 1 primary) | Unlimited TRIBOTs · full Guardian · 90-day audit · skill autoscan · voice input |
| **Pro** | **$39/mo** | Working prosumer / small consultancy (Segment 1.5) | Solo + Test Lab + Version rail + JSON export + cost-cap toggles + priority support |
| **Team** | **$99/mo** (5 seats included; +$19/seat additional) | Small team / startup on OpenClaw (Segment 2) | Pro + shared TRIBOT library + team audit + webhook alerts + multi-admin `/panic` confirm |
| **Business** | **$499/mo** | SMB (Segment 3) | Team + SSO-lite (Google + Okta SAML) + audit export to SIEM + private skill registry + 99.5% SLA + DPA template |

**Why this ladder wins:**
- The $19 → $39 step is **2.05×** (Notion's $10→$18 = 1.8×; Linear's $8→$14 = 1.75×; healthy).
- The $39 → $99 step is **2.54×** (with extra seats included; psychologically the team buys "5 seats for the price of ~2.5 individuals").
- The $99 → $499 step is **5.04×** — large, but Business now genuinely includes enterprise-lite features (SSO, audit export, SLA, DPA) that justify the jump.
- Value metric throughout = **proxied tool calls + audit retention**. Usage caps prevent margin blowout.

**Pricing experiments authorized** (per §33.8 #3): run Van Westendorp on waitlist (n≥400) to validate $19/$39/$99 are at the optimum. Only the Free + $19 + $39 + $99 + $499 ladder is in pricing-page copy until experiment results are in.

### 36.3 Product name — clearance gate (resolves K5 / C3)

**Decision:** Retain **TRIBOT** as the product name *pending* a 4-week trademark clearance gate. Run Corsearch / CompuMark global search across Nice classes 9, 42, 45 in US, EU, UK, CA, AU, IL, JP, BR. Two outcomes:

| Outcome | Action |
|---|---|
| **TRIBOT clears** (no live blocking marks in target classes; tribot.org coexistence-agreement reachable) | Keep TRIBOT. File USPTO 1(b) + EUIPO + Madrid Protocol within 30 days of clearance result. Acquire .com via aftermarket if not held. |
| **TRIBOT collides** (live mark in 9 or 42; tribot.org refuses coexistence) | Pivot to **CLAWGUARD** (lead) or **TRIARK** (coined-mark backup). Re-file. Trigger §36.7 mass-rewrite of marketing copy. |

`tribot.ai` subdomain references in §33 Content/SEO survive only if TRIBOT clears; otherwise sweep all subdomain names. SEO foundation work (CVE Tracker, Newsletter, Father Playground) starts on **placeholder domain** (e.g. `claw-safety.ai`) until clearance closes.

### 36.4 MVP scope — frozen (resolves K6 / C4)

**§32.5's 6-phase plan is the canonical path to GA.** All other MVP descriptions (§30.13, §31.9, §33.2 hosted-sandbox-first) are **deprecated** as MVP definitions but retained as:
- §30.13 = the *user-visible feature surface at GA* (3 pages + Guardian dashboard + Gmail integration).
- §31.9 = the *pre-launch validation experiments* (CLI prototype + landing-page + concierge audit) — these run in parallel to Phase 1-2, not as a substitute.
- §33.2 hosted sandbox = a **Phase 3.5 add-on** to onboarding (cuts TTV from 18-25 min to <90s), not a separate MVP.

**Definitive build phases (rewritten from §32.5 with §36 names + pricing applied):**

| Phase | Weeks | Work | Exit |
|---|---|---|---|
| **0 · Foundations** | 1-4 | Trademark clearance result; rename Father→Guardian + Soul→Persona + Executor→Runtime in all surfaces; one-line external pitch; landing copy | Rename live; TM filed; tagline tested via 5-second test |
| **1 · Legal spine** | 2-10 | DPA, age-gating, retention policy, ToS, tombstone audit log, AI Act memo, EU partition scaffold, Art. 22 HITL queue | DPO sign-off; outside-counsel letter |
| **2 · Security kernel** | 3-14 | mTLS UDS bridge, persona signing + classifier, SKILL.md typed manifest, Guardian-core split process, supply-chain hardening, session auth | **Trail of Bits / NCC audit published** (non-negotiable) |
| **3 · First-session UX** | 10-16 | Interview wizard, Guardian rewrite, Stage model (responsive), Performance mode, Test Lab, hosted sandbox onboarding | 5-user study: >60% Persona completion, <5 min TTFV |
| **4 · Feature surface (Gmail)** | 14-18 | One OpenClaw skill working end-to-end through Guardian | 50-user alpha; Guardian logs show real blocks |
| **5 · Beta** | 18-20 | 250 design partners; Launch Week prep; press kit | NPS >40; zero P0 bugs 7 days running |
| **6 · GA** | 20-22 | Public launch; PH, HN, press, creators | 5K signups launch week; <2% W1 churn |

**Aggressive: 5 months. Realistic: 6-7 months.** Anchor GA to a stated date in the next revision (target: **2026-11-15**, contingent on Phase 2 audit landing 2026-10-01).

### 36.5 Enterprise posture — clarified (resolves K7 / C6)

**§31.4's "stay off enterprise turf" applies to the Fortune-500 / CISO / RFP / compliance-bakeoff lane.** It does NOT mean refusing SMB Segment 3.

Specifically:

| Practice | Verdict |
|---|---|
| Sell to Fortune-500 procurement | **No.** Confirmed §31.4. |
| RSA Conference attendance / RSA panel speaking | **No.** Cut from §33.6. |
| SOC 2 Type II marketing pages | **No** before GA. |
| SOC 2 Type II as roadmap commitment | **Yes** — 18-month timeline, CEO-signed letter (per §33.4 enterprise-readiness minimum). |
| SOC 2 Type I roadmap letter (public PDF, published at GA) | **Yes** — trust signal, not sales motion. |
| SSO-lite (Google + Okta SAML) | **Yes** at Business tier ($499/mo) for SMB Segment 3 procurement. |
| Audit export (JSON + CSV + webhook to SIEM) | **Yes** at Business tier. |
| Black Hat / DEF CON AI Village (research credibility) | **Yes** — research positioning, not sales. |
| AI Engineer Summit / Latent Space podcast | **Yes** — prosumer/builder lane. |
| Pre-signed DPA template, sub-processor RSS | **Yes** at Pro tier and above (compliance hygiene, not enterprise sales). |

**The line:** Segment 3 SMB is reachable through *self-serve discovery + a Business tier with enterprise-lite features*; we do not pitch CISOs, do not run RFPs, do not staff an enterprise sales team in Year 1.

### 36.6 4-bot thesis — repositioned (resolves K8 / LC4)

**The architectural primitive is Guardian** (the security kernel — the proxy that sits in the critical path of every tool call). The Persona / Skills / Runtime split is **organizational maintainability, not ontological necessity.**

**The user benefit a 2-bot architecture cannot cleanly produce:**

> **Persona hot-swap without skill relearning.** A user's "Researcher" persona and "Customer-Support" persona can be swapped on the same TRIBOT (same Skills manifest, same Guardian policies, same OpenClaw bridge), with no re-onboarding. In a 2-bot Persona+Runtime model where Skills are entangled with Persona, swapping personas requires re-declaring capability scopes — which means re-confirming permissions with the user every swap. The 4-bot split makes Persona, Skills, and Runtime independently versioned, which makes swapping cheap.

This is the user-visible differentiator. It is also the reason §36.4 keeps Persona and Skills as separately-editable pages (not merged into one config screen).

**Marketing line update:** drop "*safe, readable, reusable*" (unprovable triplet from §30.1). Replace with: *"TRIBOT splits your bot into a Persona, Skills, and a Runtime — each editable independently — and wraps the whole thing in a Guardian that never lets a tool call execute unchecked."* Concrete, defensible, and Guardian is correctly named as the load-bearing claim.

### 36.7 Moltbook framing — defused (resolves K10)

**Moltbook is a marketing hook, not an architectural justification.** Rewrite §30.2 + §30.10 Flow D as follows (committed for next revision):

- **§30.2 amendment:** "Moltbook demonstrated what happens when agents are addressable from outside trust boundaries. TRIBOT addresses a different but adjacent threat: even on a trusted single-user laptop, an agent with shell + filesystem access plus 50+ untrusted-content integrations is a high-blast-radius execution context. Guardian narrows the radius from 'the OS' to 'this declared scope.'"
- **§30.10 Flow D `/panic` rewrite:** Scope = **per-user, all of THIS user's TRIBOTs**, not "every TRIBOT app-wide." Single-user product; no fleet semantics. Multi-tenant Team-tier and Business-tier `/panic` (which DO have fleet semantics) get a separate command name: `/freeze-team` / `/freeze-org` with multi-admin confirm.

Moltbook stays as the founding-narrative emotional hook (1-2 sentences in launch copy and §29 design inspiration); it does not justify any architectural primitive.

### 36.8 OpenClaw coupling — committed (resolves C7)

**TRIBOT is OpenClaw-native at GA.** The "multi-model within 120 days" promise from §33.2 #5 is **deleted**. Reasoning:

- §32 security kernel work (5 months Phase 2) is OpenClaw-MCP-specific. Generalizing to Claude Desktop / OpenAI Assistants / generic MCP at launch would 2× the engineering surface.
- §33.6 PR positioning ("OpenClaw built the engine. We built the seatbelt") is OpenClaw-coupled and works.
- §31.8 risk #2/#3 (OpenClaw rebrand, hostile-to-wrappers) remain real risks — but the answer is not "be everywhere from day one." It is "be excellent on OpenClaw first, then port what works."

**Post-GA roadmap:** generic MCP support targets **2027 Q1** (post-Series-A engineering hire). Until then, every marketing surface positions TRIBOT as the safety layer **for** OpenClaw — endorsed brand architecture (per §33.1 Brand Strategist), not category-independent.

### 36.9 Crystal identity — collapsed to one model (resolves K10's UX cousin / C10)

**Decision:** §30.15's three-character three-gem model is canonical. **§28.9's "the character is always Crystal" claim is deprecated.**

- One TRIBOT = one bot = one character.
- The character's gem follows the user's selected accent gem (Crystal default; user can pick Emerald or Ruby in Settings).
- The 3D model-viewer character recolors to match (within bounded palette — gem highlight + core + shadow swap; sculptural geometry stays the same).
- Brand mark (favicon, OG image, print, social avatar) = a flat 2D **Crystal-facet silhouette** by default (the brand's "always Crystal" identity), but in-product the user's chosen gem leads.
- The triptych Crystal/Emerald/Ruby remains the strongest brand asset (per §33.1) at the *system* level (logo lockup, marketing); inside the app the user's single chosen gem is the only one visible at any time.

This resolves the "is gem identity or theme" tension by making the brand layer (logo, lockup) Crystal-defaulted and the product layer (in-app surfaces) user-chosen.

### 36.10 Father Bot CLI vs. dashboard — clarified (resolves K1)

**Decision:** Two different artifacts, two different trust models.

| Artifact | What it is | Trust model |
|---|---|---|
| **Guardian-core** (Father-core internally) | Local OS service, runs as low-priv user, talks via UDS/Named Pipe to authorized callers only, holds keys in TPM/Secure Enclave | WebAuthn UV step-up for sensitive ops; no network listener; no public CLI |
| **Guardian dashboard (Electron)** | The signed UI application, contextIsolation + sandbox + strict CSP, talks to Guardian-core over IPC | Process-attestation header + WebAuthn ceremony per session; PID + binary-hash bound macaroons |
| **`tribot-watch`** (the renamed "Father CLI") | A *separate, monitor-only* CLI — read-only audit-log streaming + Guardian status display. **Cannot trigger `/panic`. Cannot modify Skills. Cannot edit Personas.** | Same UDS auth as the Electron dashboard, but its capabilities are restricted at the macaroon caveat layer (read-only intent declared at session-start). |

**Why this works:** §33.2 Growth's 50-WAU pre-launch metric shifts from "Father CLI WAU" to "`tribot-watch` WAU" — still validates demand for a developer-friendly local primitive without re-opening §32.1.4 #7's `/panic` CSRF/DoS hole. The CLI ships at Phase 5 (beta), not Phase 0 — it's a developer-trust-builder, not the primary product.

### 36.11 Prosumer safety-kernel buyer assumption — explicit kill criteria (resolves K9 / LC2)

**The single load-bearing assumption is acknowledged and instrumented.** The §31.9 validation experiments are now binding gates:

| Experiment | Ship deadline | Pass criteria | Kill criteria → action |
|---|---|---|---|
| **Landing page + waitlist** | W4 of Phase 0 | ≥1,000 signups in 30 days; ≥20% reach "what does this protect against?" depth (page-2+ engagement) | <300 signups → **pivot to B2B** (small-team Segment 2 becomes primary; reposition to OpenClaw-startup-tooling) |
| **Concierge skill audit** (10 user interviews) | W4-6 of Phase 0 | ≥6 of 10 say "I'd pay $19/mo for this if it existed" unprompted | <3 of 10 → **discard the prosumer thesis entirely**; pivot to managed-service offering for OpenClaw-running startups ($499/mo floor) |
| **`tribot-watch` CLI on GitHub** | W5-W8 (overlapping Phase 1) | ≥50 WAU at D60 | <30 WAU → **pivot product framing** from "safety kernel" to "audit + observability" (less insurance-shaped, more observable-value-shaped) |

**If all three fail:** TRIBOT becomes a B2B product targeting the 180 startups already building on OpenClaw + the Segment 3 SMB. Solo prosumer tier is killed; pricing reshapes around $99 / $499 / custom. The §1-§29 visual system survives the pivot largely intact.

### 36.12 Father-addressable CVE list — pruned (resolves LC1)

**§31.3's "every major security firm validated us" narrative is too broad.** The accurate version, applied as the corrected §31.3:

**Incidents Guardian directly addresses:**
1. **Prompt injection via email content** — Guardian's inbound classifier + outbound scope enforcement.
2. **Outbound exfiltration via tool calls** — Guardian's outbound filter + per-skill scope whitelist.
3. **Audit-log absence at the OpenClaw layer** — Guardian's append-only crypto-chained log.
4. **Action-without-confirmation for destructive tools** — Guardian's tiered authorization + step-up confirm.

**Incidents Guardian does NOT address (and we should stop implying it does):**
1. **Moltbook database compromise** — different layer (server-side multi-tenant DB).
2. **OpenClaw RCE CVEs** — upstream code defects; only OpenClaw can patch.
3. **135K exposed instances on the public internet** — OpenClaw listener exposure; Guardian is client-side.
4. **ClawJacked WebSocket hijacking** — hits OpenClaw's listener, not TRIBOT.
5. **Infostealers grabbing OpenClaw config files** — Guardian stores keys in TPM/Secure Enclave (Phase 2), so Guardian credentials are protected, but the OpenClaw config that infostealers target is not in Guardian's scope.

**Marketing line update:** drop "every CVE headline is free marketing" (§31.10). Replace with: *"When OpenClaw users get hit by injection-class or exfiltration-class incidents, TRIBOT is the answer they didn't have. We don't claim to patch upstream code — we claim to contain the blast radius once it hits a user's machine."*

### 36.13 The corrigendum log — what's been fixed inline

P0 factual errors fixed via Edit calls before this section was written:

| # | Fix | Location |
|---|---|---|
| F1 | GDPR Art. 33: 48h → **72h** | §32.2.2 #4 |
| F2 | Removed "ICO 2024 guidance" citation; added DPA-position nuance | §32.2.2 #1 |
| F3 | Replaced Vanta $99-$3K anchor with **Drata Starter $7.5K/yr** + caveat that enterprise-WTP doesn't translate to prosumer | §34.4 (rows 3 + 8) |
| F4 | Spotlighting attribution: Anthropic → **Microsoft Research (Hines et al. 2024, arXiv:2403.14720)** | §32.2.4 #2 |
| F5 | 9.9 CVE date: separated from March 18-21 window; CVE-2026-32922 disclosed **March 29, 2026** | §31.3 |
| F6 | 135K/50K source: Bitsight → **SecurityScorecard STRIKE team** | §31.3 |
| F7 | OWASP LLM04: relabeled "Not applicable to current scope" with deferral note | §30.9 |
| F8 | OWASP LLM03: split into (a) model/package supply chain + (b) ClawHub skill supply chain | §30.9 |

P1 technical errors fixed via Edit calls:

| # | Fix | Location |
|---|---|---|
| F9 | SPIFFE SVIDs replaced with ephemeral X.509 leaf in OS keystore | §32.2.4 #1 |
| F10 | `renameat2` flagged as Linux-only; macOS + Windows alternatives added | §32.2.4 #6 |
| F11 | TPM/PCR per-OS implementation: Windows 11 (TPM 2.0 + WDAC, NOT PPL), macOS (Secure Enclave attestation, NOT PCR), Linux (TPM 2.0 with kernel-keyring fallback) | §32.2.4 #4 |
| F12 | Windows "Secure Attention Sequence" replaced with UAC + Hello CredUI; per-OS confirm primitive listed | §32.2.4 #7 |
| F13 | Rekor: explicitly self-hosted/private (not public Rekor) | §32.2.4 #5 |
| F14 | Executor agentic loop: added per-turn token budget, wall-clock deadline, tool-call fan-out cap | §30.6 |

### 36.14 Open issues §36 does NOT resolve (deferred)

Honest about what's still open:

- **Crystal-identity vs. theme tension fully reconciled** in §36.9, but §28.9 still needs an inline rewrite (deferred to next pass).
- **Stage-model breakpoints** (§32.2.5 #1: 1440/1024 vs. §19's 1100) — still inconsistent in source sections; §36 prefers §32.2.5's three-tier model but §19 is not yet rewritten.
- **Trademark clearance result** — gates everything in §36.3; result expected in 4 weeks.
- **Validation experiment outcomes** — §36.11's three experiments are required pre-Phase 2; until they run, the prosumer-primary positioning is provisional.
- **Lakera $99/mo floor** (§35 M11) — pricing-page check pending.
- **Kylie Robison at Wired status** (§35 M9) — verify before locking PR target list.

### 36.15 The new doc-governance rule

**Going forward:** any §30-§34 content that conflicts with §36 is automatically wrong. §36 sits above §30 in the precedence stack:

```
§36 (canonical resolutions, latest) ← wins all ties
§32 + §33 (specialist audits, structured)
§30 (product thesis, original)
§31 (market case, original)
§34 (pain map, original)
§35 (verification audit — corrections now applied; retain as historical record)
§1-§29 (visual system, largely unaffected)
```

The "§30 wins on architecture, §33 wins on how the world sees it" governance clause from §33 is **superseded** by: **"§36 wins everywhere it speaks; below §36 the §33→§30 hierarchy still applies."**

### 36.16 What still needs human approval before further work

§36 makes the calls, but three of them genuinely need founder buy-in (not just my synthesis):

1. **Trademark gate (§36.3):** are we willing to pivot to CLAWGUARD if TRIBOT collides? Y/N answer needed before W3.
2. **Prosumer kill-criteria (§36.11):** are we willing to pivot to B2B if landing-page <300 / concierge <3-of-10 / CLI <30 WAU? Y/N answer needed before Phase 0 starts.
3. **OpenClaw-only at GA (§36.8):** delete the "multi-model within 120 days" promise from launch copy. Confirm.

If founder says "no" to any of these, §36 needs a follow-up revision and the affected calls revert to "open."

---

*§36 is the answer to §35. With §36 in place, §30-§34 read as the *evolution* of the thesis; §36 reads as the *commitment.* Next revision: merge §36 into the source sections (mass-rewrite Soul→Persona, Father→Guardian, Executor→Runtime; delete the four competing pricing tables; freeze §36.4 phases as the canonical roadmap). Then §35 + §36 can collapse into a single "lessons learned" appendix, and the doc returns to a single coherent voice.*

---

## 38. Implementation audit — landing page vs spec

> **Captured 2026-04-22.** A Senior Engineering Manager + Design Director audited `tribot-landing.html` against §1-§36. Verdict: 3/5 ready today, 4.5/5 after one hour of fixes, 5/5 after a two-day polish sprint. Foundation is sound; §26 ambient motion is the debt.

### 38.1 Grade summary

| Dimension | Grade | Note |
|---|---|---|
| Visual polish | **A−** | Hero, founder, receipt, terminal land in Linear/Vercel/Raycast universe |
| Motion quality | **C+** | Gem-swap retint works (the critical one); cursor-glow/scroll-reveals/focus-breathing absent |
| Performance | **B** | `content-visibility` + `will-change` hover-gated are ahead of spec; 5 GLB on first paint w/o poster-first is the hole |
| Accessibility | **B−** | 22px gem chips < 44px tap target (iOS blocker); mono contrast fails WCAG AA in terminal |
| Responsive | **B** | Three breakpoints (1180/780/480) cover major stops; gem switcher vanishes at 780 |
| Dark mode | **B** | Tokens declared, warm family preserved; noise overlay + saturation bump missing |
| Code cleanliness | **B+** | Spec-section comments throughout; tokens used consistently; single 3,687-line file is production-debt |

### 38.2 Compliance highlights (of 40 spec areas checked)

**Clean wins (✓):** §3 gem palette (6 tokens each), §3 cabochon radial, §3 warm canvas, §4 serif-for-ritual discipline, §5 three-part edge, §5 five blur plates, §6 motion tokens, §28.3 spacing grid, **§28.4 gem-swap rim-leads choreography (the single strongest fidelity moment)**, §27 mono stack + selection color + caret-color=accent, §29.1 Claude lifts, §29.4 Meshy flat radial behind 3D, §36.1 naming, §36.2 pricing ladder, §36 Moltbook framing as hook.

**Partial (🟡):** §3 focus ring (three stacked shadows but missing crisp→wide→diffuse inner-fire structure); §3 dark noise overlay missing; §5 "max 2 plates" visually respected but no containment enforcement; §25.2 top nav height 64px not 56px; §26.1 three drifts share same phase (violates desynchronization rule); §26.3 terminal is line-cadence not 60-90 cps character cadence; §28.7 only `prefers-reduced-motion` gate, no pointer-coarse or prefers-reduced-data; §29.5 bot portraits static (should drift 20s/rev per spec — we deliberately removed per user request; doc and impl diverge); §36.9 hero Crystal doesn't retint on gem-swap (character identity vs theme unresolved).

**Missing (❌):** §28.3 tag palette tokens (`.feature-tag` hard-references `--crystal-*` — breaks §3 rule 4); §26.2 cursor-tracking gem glow (zero `pointermove` handlers); §26.4 focus breathing halo; §26.6 scroll-aware reveals (IntersectionObserver used only for terminal); §29.5 idle portrait drift.

### 38.3 Top 10 highest-ROI fixes (ranked)

| # | Fix | Spec | Effort |
|---|---|---|---|
| 1 | **Cursor-tracking gem glow** on bot/template/feature/price/trust cards | §26.2 | S |
| 2 | **`.reveal` scroll choreography** with IntersectionObserver + fade-rise | §26.6 | S |
| 3 | **Terminal true 60-90 cps character streaming** (rAF-driven token drain replacing whole-line timeouts) | §26.3 | M |
| 4 | **Gem chips 44×44 px `::before` hitbox expander** (iOS/WCAG ship-blocker) | §28.11 | S |
| 5 | **Declare tag-palette tokens**; refactor `.feature-tag` off `--crystal-*` | §28.3 | S |
| 6 | **Hero character gem-swap retint** + idle auto-rotate 20s/rev | §29.4 + §36.9 | M |
| 7 | **Focus-breathing halo** on waitlist input | §26.4 | S |
| 8 | **Desynchronize three drift backgrounds** (animation-delay staggering) | §26.1 rule 3 | S |
| 9 | **Poster-first GLB loading** + `loading="lazy"` on non-hero GLBs | §29.4 rule 1 | M |
| 10 | **Three spec mismatches**: nav 64→56px; dark `--lg-blur-regular` saturate 200%; SVG fractal-noise dark body overlay | §25.2 + §5 + §3 | S |

### 38.4 What implementation exceeded spec

1. **Runtime performance hygiene** — `content-visibility: auto` on 7 sections + `transform: translateZ(0)` + `contain: layout paint` on model-viewers + `will-change` hover-gated (not global). Spec only asked for "cap 3 concurrent animations"; implementation solved the bigger problem of offscreen cost.
2. **Terminal as finished component** — legend strip, 4 color dots, session ID in title, distinct classes for info/ok/warn/blocked/persona/skill/detail. Spec asked for "terminal-grade typography"; impl shipped a designed terminal.
3. **`.kill-criteria` as a first-class design moment** — dashed-border trust card elevating §36.11's marketing stance into a designed artifact. Signals founder-led, not agency-led.
4. **Roadmap breathing dot** — §25.7 activity-dot pattern correctly transposed onto phase milestones.
5. **Receipt card with `dl/dt/dd` semantics** — screen-reader-correct, visually invisible. Accessibility layer beyond spec.

### 38.5 Shipping bar verdict

**Not ready as-is. Three categories of blocker:**

- **Accessibility:** 22px gem chips violate 44px tap-target floor (fix #4, ~15 min)
- **Credibility:** 5 GLB on first paint with no poster fallback (fix #9, ~30 min reduced version)
- **Soul debt:** §26 ambient-motion doctrine under-delivered (fixes #1, #2, #3, #7 — two-day polish sprint)

**Minimum-to-ship path (≤1 hour):** fix #4 + fix #9 reduced (lazy + hero poster) + fix #10a (nav 56px) + hero auto-rotate attribute.

**Budget the two-day sprint before any paid traffic.** Foundation is sound enough to be worth polishing.

---

## 39. HERMES BOT research & runtime landscape

> **Captured 2026-04-22.** Researcher lens: ex-Gartner / ex-CB Insights. Deep-web verification. Three products called "Hermes" in the AI ecosystem; disambiguation + deep-dive on the relevant one.

### 39.1 Disambiguation — three things called "Hermes"

| Candidate | What it is | Relevance to TRIBOT |
|---|---|---|
| **Hermes Agent** (Nous Research, Feb 2026) | Open-source autonomous agent runtime | **This is what the founder means** — head-to-head with OpenClaw in trade press |
| **Nous Hermes LLM series** (Hermes 2/3/4) | Fine-tuned LLMs (Llama/Mistral base) | Not an agent; a weight artifact |
| **Hermès luxury brand** | Fashion | Noise |

"HERMES BOT" throughout TRIBOT.md = **Hermes Agent by Nous Research**.

### 39.2 Hermes Agent — product facts

- **Runtime:** local / self-hosted Python 3.11+ app. Linux / macOS / WSL2. Single `curl` installer.
- **Maker:** Nous Research (open-weights lab, known for Hermes LLMs, DisTrO/Psyche distributed training).
- **License:** MIT, fully open source.
- **Core loop:** `AIAgent` class in `run_agent.py`. Single synchronous orchestration engine feeding 5 surfaces.
- **Persistence:** SQLite + FTS5 via `hermes_state.py`. Three-layer memory. No external DB.
- **Execution backends (6):** local shell, Docker, SSH, Daytona, Singularity, Modal.
- **Ecosystem:** ~100-110K GitHub stars (April 2026), ~16K forks, 118 bundled skills, 9 public releases in ~8 weeks.
- **Security:** **zero agent-specific CVEs** as of April 2026. Pinned deps after removing `litellm` for supply-chain concerns. No SOC 2 (it's OSS, not a vendor product).
- **Differentiators vs OpenClaw:**
  - Self-improving skills (agent rewrites its own tool wrappers on failure)
  - 3-layer persistent memory with FTS5 search
  - 15+ messaging gateway fan-out (Telegram/Discord/Slack/WhatsApp/Signal/Matrix/SMS/Email/...)

### 39.3 Five integration surfaces into the same core loop

| Surface | Transport | Purpose |
|---|---|---|
| **CLI** | stdio TUI | Interactive user |
| **Gateway** | Platform-specific (Telegram/Slack/WhatsApp/etc.) | Messaging |
| **ACP server** | stdio (Agent Client Protocol) | Editor integration (VS Code/Zed/JetBrains) |
| **API Server** | **HTTP REST, OpenAI-compatible** (`/v1/chat/completions`, `/v1/responses`) | Any OpenAI-compatible frontend |
| **MCP** | Bidirectional — **MCP client AND MCP server** (`mcp_serve.py`) | Tool ecosystem + external agents |

**Plugin hook system (the key finding):**
- `pre_llm_call` — fires before each LLM call; can modify context
- `post_llm_call` — fires after tool loop completes
- `on_session_start` / `on_session_end` — lifecycle
- Issue #359 tracks **"Tool Interception"** as first-class feature (inspired by PocketFlow/Pi)

### 39.4 Comparison table

| Dimension | **Hermes Agent** | **OpenClaw** | **Manus** |
|---|---|---|---|
| Runtime | Local Python | Local binary | **Cloud-only SaaS (Meta)** |
| Transports | stdio/HTTP/MCP/gateway/ACP | stdio/MCP + SSE (deprecated Apr 2026) | HTTPS only |
| Tool surface | 6 execution backends | Local shell + MCP | Cloud VM sandbox per task |
| Persona | Plugin + skills + SOUL.md-compatible | SOUL.md + AGENTS.md + IDENTITY.md | Proprietary opaque |
| Documented CVEs | **0** | **9 (March 2026)** incl. CVE-2026-25253 (CVSS 8.8) | **Unauditable** |
| Ecosystem | ~100K stars · 118 skills · MIT | 356K stars · SOUL.md ecosystem · MIT | Proprietary · Meta-owned ($2B acq. Dec 2025) |
| **Wrappable by Guardian?** | **Yes — multiple hook points** | **Yes — MCP stdio bridge** | **No at execution layer; only UI/API boundary** |

### 39.5 Can Guardian wrap Hermes? Three paths

| Path | Lift | Notes |
|---|---|---|
| **HTTP proxy on `/v1/chat/completions`** | **S** | Reverse proxy; OpenAI wire format; language-agnostic |
| **MCP gateway** (same pattern as OpenClaw) | **S–M** | Reuse OpenClaw adapter with config diff |
| **Native Hermes plugin** (Python, in-process) | **M** | Deepest visibility (memory, skills, SQLite); maintenance tax from rapid release cadence |

**Overall lift: M.** Substantially easier than closed target like Manus.

### 39.6 Manus — the outlier

- Tool execution inside Meta-operated cloud VM. No external hook API.
- Manus *consumes* MCP servers but does NOT expose itself as one.
- **Best Guardian can do for Manus users:** edge-network policy proxy on the HTTPS boundary — captures prompts/responses, cannot intercept shell/browser/code-exec in Meta's datacenter.
- **Recommendation:** Manus is out of scope for "kernel"; it's in-scope only as a "policy gateway."

### 39.7 The framing correction

> **"TRIBOT is a kernel for local OSS agents, and a policy gateway for hosted agents."**

The "wraps any agent" tagline is accurate in marketing but hides a real technical seam between:
- **Class A (local OSS + MCP-native):** OpenClaw, Hermes, Claude Desktop, Claude Code, Zed, Cline, Cursor, AutoGen, Semantic Kernel — Guardian wraps deeply.
- **Class B (closed hosted):** Manus, ChatGPT Agents, Operator, Devin — Guardian operates only at HTTP boundary.

---

## 40. Multi-runtime architecture thesis — amend §36.8

> **Captured 2026-04-22.** Principal Architect (ex-Anthropic / ex-Supabase / ex-Stripe) desk review. Verdict: **Guardian is runtime-agnostic by construction, runtime-specific by delivery. §36.8 is correct on GA sequencing, wrong on category identity. Amend one sentence.**

### 40.1 Guardian's generic invariants — what any target runtime must expose

Guardian's four verbs — **intercept, inspect, gate, record** — don't invoke OpenClaw by name. They invoke *tool calls*. For Guardian to function, a runtime must expose:

1. **A tool-call boundary** (discrete structured invocations, not opaque shell exec)
2. **A transport Guardian can sit on** (HTTP, MCP stdio, MCP HTTP, UDS, gRPC, WS)
3. **A configurable endpoint** (operator can redirect tool-call traffic)
4. **A declarable scope surface** (enumerable tool list for manifest check)
5. **A stable identity binding** (session/PID/token per call)
6. **A kill primitive** (something `/panic` can terminate)

**What Guardian does NOT require:** runtime being local, OSS, Go/Rust, using SKILL.md, speaking MCP specifically, or being OpenClaw.

**§36.8's claim that "§32 security kernel work is OpenClaw-MCP-specific" is half-true:** the mTLS-UDS bridge in §32.2.4 #1 is OpenClaw-specific; the Guardian *kernel* (inbound classifier, outbound filter, scope whitelist, audit chain, panic) is transport-independent. **OpenClaw-specificity lives in one adapter, not in the product.**

### 40.2 Runtime taxonomy (2026)

**✓ Wrappable today (adapter = days-to-weeks):**
- OpenClaw · Claude Desktop · Claude Code · Zed agent · Cline/Roo/Continue · AutoGen · Semantic Kernel · LangChain/LangGraph · Hermes Agent

**🟡 Partial:**
- Cursor · Windsurf Cascade · Manus · OpenAI Assistants API · Vertex Agent Builder · Raycast AI

**❌ Closed / out of scope:**
- OpenAI Operator · ChatGPT Agents · Devin · v0/Lovable/Replit Agent · Consumer Gemini

**Bimodal distribution:** large ✓-cluster of local OSS MCP-speaking runtimes + large ❌-cluster of closed hosted. 🟡 middle is mostly partial-MCP-support.

### 40.3 The common integration primitive — MCP + HTTP

Guardian is a **man-in-the-middle MCP server** for Class A and a **reverse HTTP proxy** for Class B.

**Code sketch — ~80 lines:**
```ts
const guardian = new Server({ name: "guardian", version: "1.0" });
const upstream = await connectToRealMCPServer(config.upstreamCommand);

guardian.setRequestHandler("tools/list", async () => {
  const { tools } = await upstream.request("tools/list");
  return { tools: tools.filter(t => manifest.allows(t.name)) };
});

guardian.setRequestHandler("tools/call", async (req) => {
  const { name, arguments: args } = req.params;

  const decision = await guardian_inbound.classify({ name, args, session });
  if (decision.block) {
    audit.append({ kind: "BLOCK_INBOUND", name, reason: decision.reason });
    return { isError: true, content: [{ type: "text", text: decision.userMsg }] };
  }
  if (!manifest.scopeFor(name).includes(decision.requestedScope)) {
    audit.append({ kind: "BLOCK_SCOPE", name });
    throw new McpError(ErrorCode.InvalidRequest, "scope_violation");
  }

  const result = await upstream.request("tools/call", { name, arguments: args });
  const filtered = await guardian_outbound.filter(result);
  audit.append({ kind: "CALL", name, reqHash, respHash });
  return filtered;
});
```

This is **identical to §30.8's OpenClaw bridge pattern.** OpenClaw is the first instance, not the special case.

### 40.4 The amendment to §36.8 (canonical, binding)

**REPLACE** §36.8 opening sentence:
> ~~"TRIBOT is OpenClaw-native at GA."~~

**WITH:**
> **"TRIBOT is OpenClaw-first at GA (2026-11); Guardian is MCP-runtime-agnostic by architecture. Adapters for Claude Desktop and Claude Code ship GA+6 months (Q2 2027). Hosted-runtime coverage (Assistants API, Vertex) is post-Series-A. Closed runtimes (Operator, Devin) are out of scope forever."**

Everything downstream of §36.8 (MVP phases, kill criteria, pricing) stays unchanged. The amendment preserves GA sequencing while reclaiming category optionality.

**Rationale:**
- §32 Phase 2 audit (Trail of Bits, 5 months) must target one codepath or fail. Pick one runtime, ship audit, *then* add adapters against the audited kernel.
- But "OpenClaw-only permanently" is a **marketing stance masquerading as architecture.** It forecloses the bigger business at exactly the moment the MCP-safety category is forming.

### 40.5 Multi-runtime roadmap (post-GA)

| Phase | Work | Weeks | Trigger |
|---|---|---|---|
| **A** | OpenClaw adapter + GA (§36.4 current) | 0-22 | Current plan |
| **B** | Claude Desktop + Claude Code adapters (MCP stdio proxy, single binary) | +4-6 after GA | Post-GA OpenClaw weekly signups plateau OR >15% waitlist non-OpenClaw |
| **B.5** | Zed + Cline + Cursor adapters (same MCP-stdio code, config variants) | +2-3 after B | First enterprise design partner ask |
| **C** | Hosted via HTTPS proxy — Assistants API first, Vertex second | +8-16 after B | Post-Series-A + SOC 2 Type I in hand |
| **D** | Closed-runtime support | **never as first-party** — security model incoherent |

### 40.6 Tracked metric for multi-runtime go/no-go

**"Number of runtimes shipping MCP 2025-11 spec compliance at end of Q3 2026."**

- ≥5 compliant → **go multi-runtime** at Phase B
- ≤2 compliant → **stay OpenClaw-native** another year (MCP fragmented; adapter tax too high)

### 40.7 Strategic implications (condensed)

| Dimension | If multi-runtime | If OpenClaw-only |
|---|---|---|
| Positioning | "Agent-runtime safety proxy" — new category | "OpenClaw's safety layer" — crisp, specific |
| TAM | 2-4× (all MCP-runtime users — Claude Desktop ≥5M MAU alone) | 3.2M MAU OpenClaw baseline |
| WTP per user | Lower (non-OpenClaw users feel less acute fear) | Higher (CVE-driven anxiety documented) |
| Competitive frame | Define new category (no named competitor owns MCP-safety) | Play inside existing OpenClaw wrapper space |
| Narrative clarity | Diluted ("we're the safety proxy for your agent") | Sharp ("OpenClaw built the engine, we built the seatbelt") |
| Audit cost | Each adapter is +$30-80K delta-audit, 4-6 weeks | Single-audit scope |

### 40.8 Risks of going multi-runtime too early

1. **Attack-surface multiplication** — each adapter is a new JSON-RPC dialect parser = new CVE inbox
2. **Support burden** — one-engineer team can't keep up with N runtime release cadences
3. **Positioning dilution** — "the safety layer for OpenClaw" tagline becomes "the safety proxy for your agent runtime" (more correct, less sticky)
4. **MCP fragmentation** — Cursor's `mcp__` namespace vs Claude Code hook extensions vs OpenClaw specifics; "one adapter fits most" weakens with each non-standard extension
5. **Audit re-scoping** — don't add adapters between audits

### 40.9 Bottom line

Guardian is a proxy on the tool-call boundary. That boundary exists in every agent runtime worth wrapping, and MCP standardizes the wire format across the ones that matter. **§36.8's OpenClaw-native-at-GA decision is right for sequencing, wrong for category identity. Amend the opening sentence, keep the GA plan, add Phase B post-GA, defer hosted-runtime until Series A, never support closed runtimes.**

The single change to ship this week: the one-sentence amendment in §40.4.

---

*§38-§40 are the findings of the three-team audit. §38 changed the landing page to-do list. §39 identified Hermes Agent as the most wrap-friendly non-OpenClaw target. §40 rewrote §36.8. Next: §41 meta-audit across the whole spec, §42 fix proposals, then the collapsed `TRIBOT-FINAL.md` operational doc.*

---

## 41. Meta-audit — the whole spec read as one document

> **Captured 2026-04-22.** Senior Consulting Partner (ex-McKinsey Digital + ex-a16z Operating Partner + ex-Google Fellow) read §1-§40 as one document. Job: find problems visible only at 4,400-line scale — the emergent contradictions §35 missed because they appear only after §36/§37/§40 stacked on top.

### 41.1 Coherence scores

| Dimension | Score | Diagnosis |
|---|---|---|
| Internal consistency §1-§40 | **5/10** | §36 reconciled heroically; §37 + §40 reopened issues; §31-§34 prose never back-ported §36's corrections |
| Strategic vision ↔ tactical execution | **6/10** | §30→§36→§36.4 chain is tight; §37 sims may have invalidated the strategic vision and the roadmap hasn't absorbed that yet |
| Defensibility under hostile VC questioning | **5/10** | §37.4 literal evidence: 24/35 on Dave's rubric. Kill-criteria + honest-disclosure rescues the grade; prosumer-WTP assumption kills it |
| Usability by engineer joining cold | **3/10** | No glossary, no 5-slide summary, no reading-order guide; 3 levels of precedence (§36>§30, §40>§36.8); 2-3 days to reach a consistent mental model |
| **Weighted overall** | **4.75/10** | Low for a spec that's about to drive ~11 months of eng + GTM |

### 41.2 Seven emergent contradictions §35 missed

**A. The preface contradicts §30.** Preface says "domain-free UI kit"; §30.1 says "§30 is the product." Both can't be true. **Resolution:** delete the preface.

**B. §36.8 vs §40.4 — three levels of "wins all ties."** §35→§36→§40 governance chain has no top-level precedence rule. **Resolution:** merge §40.4 amendment directly into §36.8, or add §40.0 header.

**C. §37 invalidated §36.2 and §36 doesn't know it.** §36.2 froze pricing at $0/$19/$39/$99/$499. §37.8 concluded: "Observer at $9/mo didn't exist in §36.2. It should." §36's governance rule broke on its own terms. **Resolution:** §37 needs an explicit amend like §40 did.

**D. §31.3 incident list never pruned per §36.12.** §36.13 fixed attributions but did not apply §36.12's reduction from 8 incidents → 4 Guardian-addressable. Readers of §31 in isolation still get the invalid pitch.

**E. §37 + §40 pull in opposite directions.** §37 pulls B2B (Jordan/Priya first revenue); §40 pulls horizontal (multi-runtime). Both correct against different risks. No section reconciles. **Going B2B AND multi-runtime simultaneously is 2× eng lift with half the narrative clarity.**

**F. Crystal identity doctrine never back-ported.** §36.9 resolved "character follows user's gem"; §24 + §30.16 prose still says "character is always Crystal."

**G. §38 audit reveals spec is behind its own artifacts.** §36.4 Phase 0 (weeks 1-4) rename tasks are open; landing page already implemented. **The phased plan is behind its own output.** This is §35's "specs grow faster than they reconcile" — observed empirically.

### 41.3 Five emergent strengths (buried but real)

1. **"Visible mechanisms, disclosed limits, material honesty"** — the gem-swap retint (§3 aesthetic) + Guardian transparency (§30.7 functional) + kill-criteria disclosure (§36.11 governance) form one coherent brand thesis. Articulated nowhere. Dave angel noticed it from outside (§37.4 "best disclosure I've seen this quarter"). **The spec doesn't know this is its unique asset.**

2. **The §35→§36→§40 governance chain** (adversarial audit → canonical resolution → targeted amendment) is a pattern most founders don't have. Execution is uneven but the pattern itself is strong.

3. **§40.1's Guardian-verbs (intercept, inspect, gate, record)** retroactively rescue §30's thesis — they transport-independent, OpenClaw-independent, and pass §35's LC4 coherence critique. **Buried in §40.1; should be §30.1.**

4. **The §32+§33+§34+§37+§38 audit stack** produces unusually tight convergence across five independent adversarial methods. Rarer than the spec acknowledges.

5. **"AI Cockpit" (§33.1) + 3-gem material system (§3) + "unless something goes wrong" promise (§30.16)** describe one experiential north star: instrument panel where safety is material, not marketing. **No individual section says this.**

### 41.4 Six buried ledes that should be promoted

| # | Buried where | Should be where | Why |
|---|---|---|---|
| 1 | §40.1 Guardian verbs | **§30.1 product definition** | Retires "4-bot abstraction layer" framing permanently |
| 2 | §37.4 Dave: *"security company wearing a four-primitive costume"* | **Slide 2 of pitch deck** | Harshest, fairest diagnosis; resolves K8/LC4 in one line |
| 3 | §37.6.5 B2B2C wedge | **§31.5 segment priority** | Segment order should be **2>1>3**, not 1>2>3. Most commercially consequential buried insight. |
| 4 | §40.7 "narrative dilution cost" | **Explicit founder-grade tradeoff framing** | Honest decision = "accept narrative dilution now for category optionality later" |
| 5 | §34.11 *"TRIBOT sells calm at $19, credential at $39-$99, compliance at $499"* | **Pricing-page headline** | Cleanest why-each-tier narrative in the whole doc |
| 6 | §39.5 "Hermes wrap lift = M" | **§36.8 rationale rebuttal** | §36.8 claimed "2× engineering surface"; §39 proves that's factually wrong |

### 41.5 Spec bloat — could shrink 4,400 → 2,200 lines

1. **§1-§29** could collapse to §3 + §5 + §6 + §28 + §29 (60% reduction). §7-§20 are generic productivity patterns; §25 specs a screen §30.13 doesn't build.
2. **§35 + §36** should collapse into one "lessons learned" appendix (§36's own closing sentence promises this).
3. **Four competing pricing ladders** (§31.6, §32.2.3, §33.4, §34.4) superseded by §36.2 — delete from source.
4. **§21 research briefs + §22 craftsmanship rules** are author's meta-notes; move to `/meta` appendix.
5. **§32's 50+50 findings** — collapse to the synthesis matrix (§32.3-§32.5); move full findings to appendix.
6. **Three north-star paragraphs** (§24, §30.16, §33.1) overlap in three voices. Pick one (§30.16 after §36.9 corrections is strongest).

### 41.6 Missing pieces visible only at meta level

1. **Unified risk register** — scattered across §31.8 + §32.4 + §32.5 + §35 + §36.11 + §37.5 + §40.8. Consolidated ~25 top risks with owner + trigger + mitigation = single most useful one-pager for founder/investor/hire.
2. **Glossary: internal Soul/Executor/Father vs external Persona/Runtime/Guardian** — §36.1 decided; the doc doesn't enforce. Burns 2 hours of every new engineer.
3. **One-page executive summary** — §30.1 is 1 sentence, §30.16 is 200-word poetry, §33.1 is positioning statement. None serves the executive-summary job.
4. **The 5-slide investor deck** — §37.4 produced raw material but no section assembles it.
5. **Decision log with reversibility column** — §36.14 lists open, §36.13 lists closed; missing: "reversible vs. irreversible" so eng knows what's structural.
6. **Unified "what TRIBOT is NOT" map** — §30.14, §34.8, §34.9, §39.7 Class B, §40.5 Phase D overlap without cross-references. Exclusion surface matters as much as inclusion surface.
7. **Onboarding path for new engineer** — §23 is 10 lines for visual shell only. No "read these in this order" guide.
8. **War-gamed counter-strategies for top 3 risks** — Microsoft Copilot bundle, NVIDIA NemoClaw prosumer tier, OpenClaw hostile-to-wrappers. Named in §31.8; never gamed.

### 41.7 Fifteen decisions still open

From §36.14 + scan across all sections:

1. Trademark clearance outcome (gates everything — §36.3)
2. Prosumer thesis validation (3 experiments unrun — §36.11)
3. Stage-model breakpoints (§19 still wrong numbers)
4. Lakera pricing recheck (§36.14 M11)
5. Kylie Robison role status (§36.14 M9)
6. Crystal identity back-port into §28.9 (§36.14)
7. **Whether Observer $9 enters the ladder** (§37.8 proposed, not frozen)
8. **B2B-first vs. prosumer-first sequencing** (§37 → B2B; §36.11 → prosumer)
9. **Whether §40.4 amendment has shipped back to §36.8**
10. Flat 2D Crystal-facet brand mark — designed?
11. MyClaw partnership status (highest-leverage channel, no go/no-go)
12. OpenClaw Foundation relationship (untested, no decision)
13. §30.13 Gmail-only MVP vs. §37's Observer-first implication
14. Art. 22 HITL queue scope (§32.2.2 proposes; concrete policy undefined)
15. Second engineer hire (§37.4 + §37.5 converge; no status)

**Highest-leverage unmade decisions:** #7 (Observer) + #8 (B2B-first). These cascade into GTM, pricing page, hiring plan, and capital need.

### 41.8 Top 10 emphases + fixes (ranked)

| # | Fix | Why (cross-section) | Effort |
|---|---|---|---|
| 1 | **Back-port §36+§40 into §30-§34 prose** — rewrite §30.1/.2/.16, §31.3/.5/.6 | §35's central diagnostic — every non-back-ported decision creates a new §35-grade failure | **L** |
| 2 | **Replace §30.1 with §40.1's Guardian-verbs definition** | Fixes K8/LC4 permanently; fixes Dave's "wedge 3/5" score | **S** |
| 3 | **Write 5-slide investor deck section (new §43)** based on §37.4 + §37.6 | §37 proved pitch-level failure; without this, $1.2M pre-seed is a 24/35 pitch | **M** |
| 4 | **Insert Observer $9/mo into §36.2** via amendment pattern | §37.8 clearest signal from 5 audits; blocks pricing-page copy | **S** |
| 5 | **Consolidated risk register** (new §30.5 or appendix) — ~25 risks × owner × trigger × mitigation | Single highest-leverage artifact for hiring + fundraising | **M** |
| 6 | **Glossary** — internal ↔ external ↔ marketing name table | §36.1 decided; doc doesn't enforce | **S** |
| 7 | **Collapse §1-§29** to §3+§5+§6+§28+§29 + appendix | §30 declared visual subservient; 1,800 visual lines no longer load-bearing | **M** |
| 8 | **Re-sequence §31.5 segment priority** to 2>1>3 (small-team primary) | §37 Jordan+Priya sims + §37.8 all point this way | **M** |
| 9 | **Tracked decisions list** (§42): promote §36.14 + the 15 open items with founder-decision deadlines | Each unresolved item cascades; single-tracked governance minimum | **S** |
| 10 | **Delete preface "domain-free UI kit" framing** — line 1 says this is TRIBOT | Fixes the single most confusing top-level framing contradiction | **S** |

### 41.9 The 90-minute 5-section reading sequence

For a new team member — skips §1-§29, skips §32-§35, reads §31 only for numbers:

1. **§30.1-§30.7 + §30.14** (15 min) — engineering view of the product
2. **§36.1-§36.8 + §36.11 + §36.15** (20 min) — canonical decisions overriding §30
3. **§40.1 + §40.4 + §40.9** (10 min) — amendment reframing §30 as one instance of a pattern
4. **§37.5 + §37.6 + §37.8** (15 min) — market truth §31-§34 only approximated
5. **§38.3 + §38.5** (10 min) — implementation-vs-spec reality check

**70 minutes → 80% of signal.**

### 41.10 The harshest single sentence

> **"The spec has been audited more thoroughly than it has been written — §35 found the errors, §36 made the calls, §37 invalidated §36.2's pricing, §40 amended §36.8, and the source sections never learned any of it, so TRIBOT today is a coherent product only in the mind of the one person who has read the whole thing in order."**

---

*§41 is the meta-level truth. §42 proposes fixes. §43 (upcoming) writes `TRIBOT-FINAL.md` — the operational doc that picks up only what works.*

---

## 42. Fix proposals — ready-to-execute

> **Captured 2026-04-22.** Senior Product Operator (ex-Stripe COO staff + ex-Linear PM + ex-Notion chief of staff) produced concrete, shippable solutions to every §41 finding. **Target: coherence score 4.75 → 7.4 by 2026-06-17 (8 weeks).** Team = founder + 1 engineer + part-time designer.

### 42.1 Contradiction resolutions

| Ref | Contradiction | Fix | Owner | Effort |
|---|---|---|---|---|
| A | Preface ≠ §30 | Delete preface; replace with one line: *"TRIBOT is a Guardian-kernel product for OpenClaw. Versioned working notes below."* | Founder | S |
| B | §36.8 vs §40.4 precedence | Inline §40.4 amendment into §36.8; add §36.0 governance paragraph declaring precedence rules; collapse §40.4 to pointer | Founder | S |
| C | §37 invalidated §36.2 | **Add §36.2a — post-§37 amendment: insert Observer $9 as the $0→paid wedge; Solo $19 demoted to "kernel upgrade for individuals"** | Founder + eng (Observer hosted-audit infra) | M |
| D | §31.3 CVE list never pruned | Rewrite §31.3 bullets using §36.12's "Guardian addresses / does NOT address" split; grep-kill "every major security firm validated us" | Founder | S |
| E | §37 B2B pull vs §40 horizontal pull | Add §36.4a sequencing rule: *"Phases 0-6 OpenClaw + segment 2>1>3. §40 adapters explicitly post-GA, gated by §40.6 ≥5-runtimes metric."* | Founder + eng-lead | S |
| F | Crystal identity never back-ported | Global find/replace *"character is always Crystal"* → *"character takes user's selected gem (Crystal default)"* in §24, §28.9, §30.15-16 | Designer + founder | S |
| G | §38: spec behind its own artifacts | Split §36.4 Phase 0 into 0a (shipped — landing) + 0b (open — code rename). Add §36.15b: *"When artifact ships ahead of spec, spec updates within 48h or artifact rolls back."* | Eng + founder | M |

### 42.2 Buried lede promotions (exact copy, ready to paste)

**1. Guardian verbs → §30.1:**
> *"TRIBOT is a Guardian kernel that intercepts, inspects, gates, and records every tool call your agent makes. Around that kernel, three editable layers — Persona (who the agent is), Skills (what it can do), and Runtime (how it loops) — let you swap identity without rewiring capability. OpenClaw is the first supported runtime; the kernel is runtime-agnostic by architecture."*

**2. Dave's line → pitch deck slide 2 subtitle:**
> *"We are a security company. The four primitives are how we organize the code; the product is a kernel that keeps your agent from breaking your machine."*

**3. §31.5 segment priority rewrite:**
> *"Primary: Segment 2 (small-team CTOs on OpenClaw, $99 Team tier, co-sell 'Protected by TRIBOT' badge). Secondary: Segment 1 (prosumers, $9 Observer + $19 Solo). Tertiary: Segment 3 (SMB Business $499). §31's 1>2>3 ordering deprecated; §37 sims established Jordan converts 90d before Alex."*

**4. §36.8a — narrative-dilution tradeoff stated plainly:**
> *"We accept narrative dilution at GA ('OpenClaw's safety layer' → 'safety for your agent runtime') in exchange for category optionality post-Series A. Cost: ~1 design-partner slip per 10 pitches. Benefit: if MCP becomes default interop, TAM multiplier 2-4×. Dilution reversible (tighten back); TAM foreclosure is not."*

**5. Pricing-page headline:**
> *"TRIBOT sells observability at $9, calm at $19, credential at $39-$99, compliance at $499. Each tier answers a different question you're already asking."*

**6. §36.8 rationale footnote:**
> *"§39.5 measured Hermes adapter at ~M lift (4-6 weeks). §36.8's original '2× engineering surface' claim referenced the full multi-runtime port, not per-adapter cost. Per-adapter economics are tractable; audit re-scope gates sequencing."*

### 42.3 Bloat reductions

| What collapses | Survives | Target |
|---|---|---|
| §1-§29 → appendix | §3 + §5 + §6 + §28 + §29 | `/appendix/visual-working-notes.md` (60% reduction) |
| §35 + §36 rationale → appendix | §36.1-§36.16 binding calls | `/appendix/35-36-resolution-history.md` |
| 4 competing pricing ladders | §36.2 + §36.2a | Delete from §31.6, §32.2.3, §33.4, §34.4 |
| §21 research briefs + §22 craftsmanship | — | `/appendix/meta/` |
| §32's 100 raw findings | §32.3-§32.5 matrices | `/appendix/32-full-findings.md` |
| §24 + §33.1 north-star paragraphs | §30.16 only (strongest) | Collapse both into pointers |

**Net estimated reduction: 4,514 → ~2,200 lines with zero loss of decision-bearing content.**

### 42.4 Risk register — 25 risks × owner × trigger × mitigation

| # | Risk | Owner | Trigger | Mitigation |
|---|---|---|---|---|
| R1 | "TRIBOT" TM collision | Founder | Corsearch finds live mark | §36.3 pivot to CLAWGUARD/TRIARK |
| R2 | Prosumer WTP fails at $19 | Founder | <6/10 in §36.11 concierge; <300 waitlist | Pivot B2B; Observer $9 as wedge |
| R3 | Microsoft Copilot bundles agent safety free | Founder + eng | MS announces GA of Copilot Runtime Guard | Team-tier 12mo lock-ins; "Protected by TRIBOT" badge revshare |
| R4 | NemoClaw prosumer tier launches | Founder | <$50/mo NemoClaw | Differentiate on transparency + local-first; retreat to dev wedge |
| R5 | OpenClaw Foundation hostile to wrappers | Founder | Foundation RFC on "official safety layer" | Preemptive PR contribution; apply for endorsed-partner |
| R6 | Trail of Bits audit slips past 2026-10-01 | Eng-lead | W12 status shows >2wk slip | Cut Gmail scope to protect audit; GA slips to 12-01 max |
| R7 | mTLS-UDS bridge OS-specific CVE | Eng-lead | Windows Named Pipe / macOS UDS advisory | Kernel-keyring fallback (§32.2.4 F11); 72h hotfix SLA |
| R8 | Art. 22 HITL queue undefined at GA | Founder + legal | Priya-class buyer can't close | Minimal queue end Phase 1; Business-tier feature |
| R9 | Controller/Processor challenged | Legal | First subpoena on Team customer | Signed Processor letter in DPA; outside counsel retainer |
| R10 | Crypto-shredding fails Irish DPC | Legal | DPC challenges | Retain Irish privacy counsel; fall back to conventional delete + tombstone |
| R11 | Upstream OpenClaw RCE blamed on TRIBOT | Founder | CVE on OpenClaw hits TRIBOT users | §36.12 disclosure pre-written; 4h public advisory SLA |
| R12 | ClawHub authors revolt over signing | Founder | >10% top-50 refuse | Opt-in signing at GA; mandatory v1.1; honor-system at v1.0 |
| R13 | 2nd engineer hire slips past pre-seed | Founder | 60d no accepted offer | Hire first, close second; bridge contractor |
| R14 | Waitlist <400 at week 1 | Founder | Analytics D7 | Walk post to $6M; reframe as post-launch raise |
| R15 | Per-instance pricing cliff at 100 customers | Founder | First Team hits 75 | Publish full ladder >50/>100 pre-GA; $79 pilot lock |
| R16 | Source-code escrow delays enterprise pilot | Legal | Priya-class deliverable slip | Iron Mountain contract pre-signed |
| R17 | Insurance cap insufficient for fintech | Legal + founder | Lumenswap-class asks $10M | Defer fintech to post-Series A; $2M adequate for non-regulated |
| R18 | Van Westendorp invalidates ladder | Founder | n≥400 results show elasticity off | Re-ladder pre-GA; Observer $9 protects $0→paid either way |
| R19 | MCP fragments — <5 runtimes compliant Q3 2026 | Eng-lead | Compliance count ≤2 | Stay OpenClaw-only; shelve Phase B 12mo |
| R20 | Design partner reneges | Founder | Threadloom/Lumenswap-class pulls | 3 partners pipeline not 1; published escrow as reassurance |
| R21 | Simon Willison-class kills launch | Founder | Negative review D-day | Pre-brief 2wk out; embargo access; 7d postmortem |
| R22 | LLM API outage breaks classifier | Eng-lead | 30min classifier outage | Local fallback classifier (smaller model, TPM inference) |
| R23 | Founder burnout pre-hire | Founder | >70h/wk for >8wk | Part-time designer locked Phase 0; 2nd eng non-negotiable |
| R24 | Brand mark not designed by GA | Designer + founder | §36.14 M10 open at W18 | Lock 2D Crystal-facet by end Phase 1 |
| R25 | Spec drift recurs | Founder (process) | Artifact ships ahead of spec again | §36.15b 48h rule; weekly spec-vs-artifact diff |

### 42.5 Glossary — 15 rows (internal / external / marketing)

| Internal code | External UI | Marketing copy |
|---|---|---|
| `soul.*` | Persona | "your agent's identity" |
| `skills.*` | Skills | "what your agent can do" |
| `executor.*` | Runtime | "the agentic loop" (usually hidden) |
| `father.*` | Guardian | "the safety kernel" / "keeps your agent from breaking your machine" |
| `father-core` | Guardian-core | (not marketed; OS-service term) |
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

### 42.6 One-page executive summary (178 words)

> **TRIBOT is a Guardian kernel for AI agents.** It sits between your agent and the tools it calls — intercepting, inspecting, gating, and recording every tool invocation so your agent can't break your machine, exfiltrate your data, or act without leaving receipts. We ship OpenClaw-first at GA in November 2026, with adapters for Claude Desktop, Claude Code, and Cursor to follow post-launch.
>
> Three tiers carry the business: **Observer** at $9/mo (audit log + alerts — the real prosumer wedge), **Team** at $99/mo (small-team CTOs on OpenClaw — the first cash wedge), and **Business** at $499/mo (SMB self-serve with SSO, DPA, and escrow). A Trail of Bits audit lands pre-launch; our honest kill-criteria are published; our sub-processor list is linked.
>
> We are not an enterprise RFP play, not a multi-model platform at launch, and not an "AI safety" company in the abstract. We are a narrow, operator-built safety kernel for the specific agents real people are already running. Pre-seed $1.2M, founder + one engineer + part-time designer, 11 months to GA.

### 42.7 Five-slide investor deck

**S1 · Title** — TRIBOT: the Guardian kernel for OpenClaw · "Your agent won't break your machine." · Pre-seed $1.2M · GA 2026-11-15

**S2 · Problem (Dave's line)** — We are a security company. The four primitives are how we organize the code. · 3.2M MAU OpenClaw; 135K instances exposed; injection-class incidents monthly · Nothing sits in the tool-call path today.

**S3 · Product + proof** — Guardian: intercept, inspect, gate, record. Every tool call. Local. OSS core. · Trail of Bits audit lands 2026-10-01; published · Honest kill-criteria: if prosumer doesn't convert, B2B-first; if MCP fragments, OpenClaw-only.

**S4 · Go-to-market** — Observer $9 → Team $99 → Business $499. Segment order 2>1>3 · B2B2C wedge: "Protected by TRIBOT" badge for Jordan-class CTOs · Waitlist >400/W1 = hire #2 + close.

**S5 · Ask** — $1.2M pre-seed, $6M post · 11-month runway to GA + 30 design partners · Founder: 40 public OpenClaw skills, most-active ClawHub contributor · Reversible bets flagged; irreversible (Guardian architecture, OpenClaw-first GA) committed.

### 42.8 Decision log — 15 open items with reversibility

| # | Decision | Revers. | Owner | Recommended |
|---|---|---|---|---|
| 1 | TM clearance | 4 | Legal/founder | Run Corsearch now |
| 2 | Prosumer thesis (3 experiments) | 2 | Founder | Ship all in Phase 0 |
| 3 | Stage-model breakpoints | 1 | Eng-lead | Adopt §32.2.5 three-tier |
| 4 | Lakera pricing recheck | 1 | Founder | Re-scan 7d |
| 5 | Kylie Robison role | 1 | Founder | Defer 90d |
| 6 | Crystal back-port §28.9 | 1 | Designer | Ship this week |
| **7** | **Observer $9 in ladder** | **3** | **Founder** | **Yes — highest leverage** |
| **8** | **B2B-first vs prosumer-first** | **3** | **Founder** | **B2B-first (2>1>3)** |
| 9 | §40.4 inline into §36.8 | 1 | Founder | Ship this week |
| 10 | 2D Crystal-facet brand mark | 2 | Designer+founder | Commission Phase 1 |
| 11 | MyClaw partnership | 3 | Founder | Open Phase 2 (after audit) |
| 12 | OpenClaw Foundation | 4 | Founder | Open channel Phase 1 |
| 13 | Gmail MVP vs Observer-first | 3 | Founder | Both — Observer Phase 0, Gmail Phase 4 |
| 14 | Art. 22 HITL queue scope | 3 | Legal+founder | Minimal queue end Phase 1 |
| 15 | Second engineer hire | 5 | Founder | Hire before pre-seed close (§37.5 convergence) |

### 42.9 What TRIBOT is NOT — unified exclusion map

| Not this | Source | Why we say so |
|---|---|---|
| SOC2 enterprise safety platform | §30.14, §36.5 | No Fortune-500 procurement; SSO-lite ≠ RFP |
| Multi-model platform at GA | §34.8, §36.8 | OpenClaw-first; adapters post-GA; closed runtimes never |
| Prompt-injection-free product | §34.9, §36.12 | Reduce blast radius; not eliminate attack |
| Patcher of upstream OpenClaw CVEs | §31.3, §36.12 | Client-side kernel; OpenClaw patches its own code |
| Moltbook fleet management | §36.7, §39.7 | Single-user; `/panic` per-user; fleet behind Team tier |
| Generic "AI safety" company | §37.4, §40.5 | Sell reliability, not safety (Dave's line) |
| Substitute for HITL legal review | §32.2.2, §37.3 | Art. 22 queue is roadmap, not current |
| Wrapper of closed runtimes | §40.5 Phase D | Security model incoherent; never first-party |
| Server-side multi-tenant platform | §36.12 | Client-side kernel; Moltbook-class DB compromises out of scope |

### 42.10 Seven-step onboarding — replaces §41.1's 2-3 day bootstrap

1. **D1 AM (30min):** §30.1 rewritten + §42.5 glossary
2. **D1 PM (90min):** §36.1-§36.8 + §36.11 + §36.15 — canonical calls
3. **D2 AM (45min):** §40.1 + §40.4 + §40.9 — amendment
4. **D2 PM (60min):** §37.5 + §37.6 + §37.8 — market truth
5. **D3 AM (45min):** §38.3 + §38.5 — artifact vs spec
6. **D3 PM (30min):** §42.4 risk register + §42.8 decision log
7. **D4:** clone repo; run `tribot-watch`; trace tool call through Guardian-core; PR adds one audit-log field

**Total: ~5h reading + 1d onboarding code.**

### 42.11 Fix-priority sequencing

**Weeks 1-2 (founder solo, no code):** Delete preface · §40.4 inline · §36.2a Observer amendment · §31.3 prune · §31.5 re-sequence 2>1>3 · §30.1 rewrite · Crystal back-port · Glossary · Exec summary · What-TRIBOT-is-NOT map · kick off TM clearance. **End W2 coherence: ~6.5.** Zero code.

**Weeks 3-8 (eng hired W4):** Risk register · Decision log · Investor deck · Collapse §1-§29 to appendix · Phase 0b internal rename · §36.4a sequencing rule · Run §36.11 validation · Commission brand mark · Open OpenClaw Foundation channel. **End W8 coherence: ~7.4** (§42.12 gate hit).

**6 months (W9-W24):** Phase 1 legal spine · Phase 2 security kernel · Trail of Bits audit (scoped W9 → lands W22 = 2026-10-01) · MyClaw outreach Phase 2 · 3 design partners by W18 · Van Westendorp n≥400 · landing page rebuild with §36.2a.

### 42.12 Go/no-go gate — coherence 4.75 → 7.4 by 2026-06-17

**Ship by end W8:**
- §36.0 governance + §36.8 inline amendment (internal consistency 5→8)
- §30.1 Guardian-verbs rewrite (usability 3→6)
- §31.5 segment re-sequence + §36.2a Observer (strategy↔execution 6→8)
- Risk register + decision log + exec summary + 5-slide deck (VC defensibility 5→7)
- Glossary + 7-step onboarding (usability 6→8)
- §1-§29 collapsed to appendix

**Weighted score end W8: 7.4/10.**

### 42.13 If only 3 things

If constrained to 3 fixes out of 40+:

1. **Ship Observer $9 + Guardian-verbs §30.1 + segment 2>1>3 as one revision.** Three logically coupled changes (pricing-page headline + product-definition + segment-priority all move together or produce contradiction). Founder-week. Fixes 3 contradictions, 3 buried ledes, 2 highest-leverage open decisions. Raises Dave's wedge score 3/5 → 5/5.

2. **Ship risk register + decision log as §42 appendix.** Every pitch/hire/VC meeting now references published governance. Raises VC defensibility 5/10 → 8/10. Signals founder-grade process to #2 eng candidate.

3. **Back-port §36+§40 into §30-§34 prose.** The L-effort hygiene fix. Every future audit/engineer/investor re-read stops needing "§36>§30; §40>§36.8" mental scaffolding. Raises internal consistency 5/10 → 9/10. Closes the spec-drift failure mode §41 named.

**If forced to one: #1** — Observer $9 is the clearest signal across 5 audits.
**If forced to two: #1 + #2** — otherwise next audit re-invents §41.
**#3 is the move that makes the spec an artifact-of-team, not artifact-of-one.**

---

*§42 is the fix plan. §43 (next) uses §42.3 collapse rules + §42.13 "if only 3 things" to synthesize `TRIBOT-FINAL.md` — the operational doc with only what works + what we need.*

---

## 43. External audit integration — Manus AI findings

> **Captured 2026-04-22.** An external AI agent (Manus) produced two reports: an Executive Master Report and a Technical Security Deep-Dive. This section extracts the ideas that upgrade the spec (not restate it) and flags what should carry forward to Phase 2 engineering.

### 43.1 Strategic upgrades — what Manus added we hadn't articulated

**A. Active Orchestrator pattern (not passive proxy).** Current §30.7 Guardian intercepts tool calls one-by-one. Manus's insight: for complex compound calls, Guardian should **split** the call into smaller sub-calls, each with its own scope check. Prevents "one big call gets broad access" failure mode. **Impact:** adds a "Decompose" verb to the 4-verb pipeline → becomes **Intercept → Decompose → Inspect → Gate → Record.** Phase 2 engineering item.

**B. Visual Security Signature on every chat response.** Every Guardian-touched message carries a small visual "signature" pill attached to the bubble — proves-it-was-audited at glance. Analogous to email's DKIM icon but user-facing. **Impact:** new UI component for Phase 3 UX. Ships as a subtle mono-caption pill: `✓ guardian 14:37 · chain e091` below each streamed reply.

**C. Behavioral Guardrails (pre-tool-call).** Current inbound classifier catches patterns in the *prompt*. Manus argues for a second layer that catches deviations in the *agent's own behavior over time* — e.g., agent suddenly requests files unrelated to the stated task. **Impact:** a persistent "task-intent" model that scopes allowed actions per session; flags deviations for review before Tool Call executes. Phase 2 extension of Guardian kernel.

### 43.2 Technical additions worth integrating

| Technique | What it adds | Integration point |
|---|---|---|
| **eBPF syscall monitoring** (Linux) | Real-time kernel-level enforcement — blocks `open()`, `execve()`, `socket()` outside sandbox scope BEFORE they happen | §32.2.4 item 4 — add eBPF hook alongside the existing landlock/seccomp combo on Linux. macOS gets `Endpoint Security Framework` equivalent; Windows gets ETW + minifilter drivers |
| **cgroups v2 + namespace isolation** | Per-agent CPU/RAM/IO limits with hard caps | §32.2.4 item 4 — systemd `User=tribot` unit already specified; add explicit cgroup v2 `CPUQuota=50%`, `MemoryMax=2G`, `IOWeight=100` |
| **24h cert auto-rotation** | On top of existing `/panic` + manifest-change rotation triggers | §32.2.4 item 1 — add timer-based rotation: every 24h regardless of other triggers |
| **SIGKILL to process tree on /panic** | Hardware-level kill (not graceful SIGTERM) | §32.2.4 item 7 — `/panic` sends `SIGKILL` to process group (pkill -KILL -g) not just to the main process |
| **GPU-accelerated gradients via canvas/WebGL** | Prevents color banding on AMOLED dark mode | §5 Liquid Glass — consider for the gem-swap moment specifically; not critical for landing page |
| **Mask-image gradient depth** | `mask-image: linear-gradient(to bottom, black, transparent)` for a fade-out depth effect | §5 Liquid Glass — elegant addition for glass surfaces that meet sharp edges |

### 43.3 Reconciliation with existing spec

| Manus claim | Our existing position | Verdict |
|---|---|---|
| *"mTLS over UDS"* | §32.2.4 F9 — confirmed identical | ✅ Aligned |
| *"Hash-chained append-only log"* | §30.9 — confirmed identical | ✅ Aligned |
| *"Sigstore Rekor integration"* | §32.2.4 F13 — confirmed (self-hosted Rekor per §35 T10 fix) | ✅ Aligned |
| *"Zero-Dependency Core"* | §32.2.4 F9 — we specified statically-linked Go/Rust with no npm in kernel | ✅ Aligned |
| *"The Guardian **never** makes a mistake"* (§5 summary) | §31.8 Risk #4: *"Father zero-day is eventually high probability"* + §36.12: *"we treat injection defense as harm reduction, not a solved problem"* | ❌ **Reject** — Manus's claim is marketing, not engineering truth. Our position is more defensible and has survived five audits. |
| *"Semantic Classifier (local SLM)"* | §32.2.4 F2 — Lakera/Rebuff + local Llama-Guard | ✅ Aligned (Llama-Guard is an SLM) |
| *"Contextual classifiers not just Regex"* | §32.2.4 F2 — confirmed | ✅ Aligned |
| *"Trail of Bits public audit at launch"* | §36.4 Phase 2 + §33.6 PR — confirmed non-negotiable | ✅ Aligned |

### 43.4 Changes to the FINAL doc

From this external audit, three items should promote into `TRIBOT-FINAL.md` §2 (The product) and §5 (Architecture):

1. **Add a fifth verb to Guardian's pipeline:** the canonical description becomes *"intercept, decompose, inspect, gate, record."* One word added. No structural change.
2. **Add "Security Signature" to the receipt spec** in FINAL §2.3 — every streamed reply carries a small chain-anchored pill; the sample receipt already in FINAL shows the chain fragment (`a7c4 → e091`) which is functionally this primitive, just not yet named.
3. **Add eBPF (Linux) / ESF (macOS) / minifilter (Windows) to the §32.2.4 hardening stack** as a Phase 2 engineering deliverable — not on the landing page, but in the next-revision architecture spec.

### 43.5 What to reject from Manus's reports (honest filter)

- **"Rust improves performance by 40%"** — unsubstantiated specific number. Rust vs. Go on kernel work is a defensible language choice but the 40% figure has no citation. Our §32.2.4 says "statically-linked Go or Rust" — keep that flexibility.
- **"GPU-accelerated gradients via canvas/WebGL"** for the landing page — overkill. CSS `@property` morph already hits 60fps on non-ancient hardware. This is Phase 2 idea, not Phase 0.
- **"TRIBOT is a new standard"** framing — grandiose. §30.1 Guardian-verb definition is more defensible. Resist the "standard-setter" voice.
- **"The Guardian never makes a mistake"** claim — directly contradicts §31.8 + §36.12 honesty posture. Reject.

### 43.6 One-line takeaway

> **Manus's Active Orchestrator + Behavioral Guardrails + Security Signature are three upgrades worth carrying into Phase 2 engineering and the FINAL doc. Everything else Manus said we already have, or we reject.**

---

*§43 integrates the external audit. Next up: direct HTML skeleton audit + fixes before Phase 2 engineering begins. The site must be luxury-grade before we move to building the actual kernel.*

---

## 44. Landing-page customer reviews + UI/UX audit (consolidated)

> **Captured 2026-04-22.** Three customer personas + one Senior UI/UX Design Auditor reviewed the production-candidate landing page. This section consolidates findings and flags fixes. The landing page is the first production artifact — all feedback that matters for public presentation gets fixed; feedback that contradicts founder decisions (pricing removed, Trust section hidden, Moltbook callout removed) is documented but not restored.

### 44.1 Customer probabilities

| Persona | Fit | Key probabilities |
|---|---|---|
| **Alex** (prosumer dev) | Aligned | 55% waitlist · 70% CLI install · 25% recommend |
| **Jordan** (small-team CTO, B2B2C) | Aligned | 70% pilot request · 55% intro call · 25% sign 3-month pilot |
| **Priya** (SMB VP Eng, regulated) | Conditional | N procurement · Y 30-min call · Y pilot with 5 deliverables · N pass |

**Aggregate signal:** sufficient to book discovery calls and land pilots; **insufficient to close paid procurement** today. Exactly right for a pre-launch site.

### 44.2 Convergent positive signals (3 of 3 customers + UI/UX)

1. **Live terminal demo** — "biggest trust builder" (Alex), "70% of landing terminals are theater; if this is real, it's the pitch" (Jordan), "technical credibility above most vendors" (Priya), "9/10 wow" (UI/UX).
2. **Architecture 3D grid** — 4 gems × 4 characters is the tentpole. UI/UX rated 10/10. Alex: "the 3D character is standing there staring at me, not doing the cursed slow-rotate."
3. **Receipt card** — show-don't-tell done right. UI/UX 9/10. Jordan: "tells me Ariel has actually operated these systems."
4. **mTLS bridge + CLI install** — credibility mark. Alex: "the difference between someone who has actually shipped software and a marketing team." Jordan: "Supabase-tier move."
5. **Founder letter (serif-first ritual)** — UI/UX 9/10. Jordan: "if it earns specificity, not performance."

### 44.3 Convergent negative signals (must fix)

| # | Finding | Source | Action |
|---|---|---|---|
| 1 | **Dead CSS + `display:none` sections** (Pricing, Trust) + orphan CSS (Roadmap, Moltbook-callout, kill-criteria) | UI/UX P0 | **DELETE entirely** — do not ship `display:none` permanently |
| 2 | **Off-ladder type sizes** (10.5, 12.5, 13.5, 14.5, 15.5) | UI/UX P0 | Collapse to integers (11, 13, 14, 15, 16) |
| 3 | **Hover translate inconsistency** (7 different values: 1/2/2/2/2/3/4/4px) | UI/UX P0 | Two tiers only: -2px utility, -4px hero |
| 4 | **CTA H2 duplicates Hero H1** verbatim | UI/UX #10 | Rewrite to forward-motion line |
| 5 | **Amber template breaks 3-gem system** (not defined in `:root`) | UI/UX #7 | Either promote Amber to 4th gem OR recolor Support to Crystal/Emerald/Ruby |
| 6 | **Code-block Copy button not functional** | UI/UX #10 (upgrade) | Wire to `navigator.clipboard.writeText` |
| 7 | **No latency/p99 numbers** | Jordan + Priya | Deferred to Phase 2 engineering — not on landing page |
| 8 | **No GitHub/threat-model link** | Alex | Deferred until Phase 2 — kernel repo doesn't exist yet |

### 44.4 Diverging customer signals (document, don't fix)

| # | Finding | Source | Decision rationale |
|---|---|---|---|
| D1 | "Trust section conspicuously missing" — Hero promises "trust," page hides Trust section | 3/3 customers | Founder explicitly hid Trust section earlier. Decision stands. **Risk acknowledged:** hero line "actually trust" is a promise the page doesn't fully pay off. Revisit pre-launch. |
| D2 | "Multi-tenant / fleet deployment story missing" | Jordan | Valid for B2B2C customers; defer to Phase 2 + a dedicated `/teams` page post-GA |
| D3 | "SOC 2 / DPA / sub-processor list" | Priya | Procurement-grade artifacts not on pre-launch marketing page. These belong in a pilot-agreement packet, not the public site |
| D4 | "Pricing page deferred" | Priya says "pre-launch OK" | Founder call confirmed. Pricing returns post-validation |
| D5 | "3D founder portrait feels hide-something" | Alex | Keep the 3D portrait — it's a brand identity choice (§33.1 Brand Strategist). Can add real photo option later |
| D6 | "Gem switcher is 40h better spent on rule engine" | Alex | Disagree — the gem-swap retint is the brand's hero moment (§28.4). Ship both |
| D7 | "Amber template color" | UI/UX P0 | **FIX** — this is a design system violation |

### 44.5 UI/UX auditor section scores

Lowest "wow" sections (flagged for improvement):
- **Flow (5/10)** — monochrome, feels like whiteboard export. Needs scroll-reveal packet animation.
- **Features (5/10)** — 6-card utility grid. Needs micro-receipts replacing generic tags.
- **Problem (6/10)** — missing Moltbook callout would lift it; founder removed it intentionally.
- **FAQ (6/10)** — stock `<details>` accordions. Needs serif-italic questions + gutter counters.
- **Footer (6/10)** — serviceable, could add build-hash + chain-head in mono for release-artifact feel.

### 44.6 Priority-ordered fix list (applied to HTML in sequence)

**P0 — hygiene + coherence (must ship before any pre-launch):**
1. Delete `display:none` Pricing + Trust sections from HTML entirely
2. Delete orphan CSS: Roadmap, Moltbook-callout, kill-criteria
3. Fix Amber template color (recolor Support to Crystal or promote Amber to root token)
4. Normalize hover translates to 2 tiers
5. Collapse off-ladder type sizes
6. Rewrite CTA H2 (no verbatim echo of hero)
7. Wire Copy button on code block

**P1 — polish (next session):**
8. Flow section: stagger-reveal dashed-line "packet" animation
9. Features: replace `.feature-tag` with 1-line micro-receipts
10. FAQ: serif-italic questions + mono gutter counters
11. Architecture: 120ms stagger-reveal on 4 characters on scroll-in
12. Terminal: char-by-char on `warn` + `blocked` lines at 70 cps

**P2 — luxury upgrades (pre-launch polish sprint):**
13. Founder drop-cap on opening paragraph
14. Hero parallax (Guardian +4%Y on scroll)
15. Receipt: animated hash-chain reveal
16. Footer: build-hash + chain-head mono line

### 44.7 The single sentence from each reviewer

> **Alex:** "tribot.dev — actually shows a Guardian blocking a prompt injection in a live terminal, uses mTLS, has a solo founder with a 3D avatar; I don't hate it, which is more than I can say for 90% of AI safety landing pages."
>
> **Jordan:** "Worth the 30-min call — the primitives story and signed audit chain are genuinely differentiated, but a serious-product page should be able to get me 60% of the way there. Linear's docs get me 80% before I talk to anyone. TRIBOT is at 40%. Fixable."
>
> **Priya:** "Worth 5 minutes and probably a 30-minute call — the primitives story and signed audit chain are genuinely differentiated, but they've hidden their own Trust section and deferred pricing, so you're evaluating the tech not the company until they send the paperwork."
>
> **UI/UX:** "This is an A-/A landing page with three weak sections (Flow, Features, FAQ) and a hygiene problem. The gem-morph system, the architecture 3D grid, the terminal, the receipt, and the founder letter are genuinely luxury-grade craft. Fix the dead code, collapse the type ladder, normalize the hover tiers, and lift the three weak sections — you move from 'impressive' to 'referenced in design-crit threads for six months.'"

---

*§44 is the external validation plus internal audit. P0 fixes go to HTML now. Remaining polish items queue for pre-launch sprint.*

---

## 37. Sales + investor simulation outcomes

> **Captured 2026-04-22.** Four specialist agents played target personas while being pitched TRIBOT: a prosumer user being sold Solo ($19), a small-team CTO being sold Team ($99), an SMB VP-Engineering being sold Business ($499), and an angel investor being pitched the $1.2M pre-seed. Two further investor simulations (seed VC + Series A) were planned but blocked by a rate limit and deferred to the next round. This section preserves each simulation + cross-simulation synthesis. **These are stress tests of the pitch, not the product** — they reveal where the story breaks when a sharp, realistic target pushes back.

### 37.1 Simulation 1 — Alex (prosumer, $19/mo target)

**Persona:** Alex Chen, 32, senior backend engineer at a 40-person fintech. Runs OpenClaw privately. Pays $73/mo stack (MyClaw Pro + API). Had a calendar-invite prompt-injection scare 6 weeks ago. Reads Simon Willison; lives on /r/LocalLLaMA. Pays $20 1Password + $8 Raycast Pro + $10 Claude Pro.

**Verdict:** **Hard-no at $19 today. 18% conversion probability in 90 days.**

**Why it landed there:**
- Took the capability-firewall pitch seriously but questioned LLM-judge false-positive rates.
- Called the Gmail integration a migration lift they won't take.
- **"Why isn't `tribot-watch` — the free CLI — the actual product? Just sell me a great audit log."**
- Kill signal: the "SOC 2 compliant AI safety" framing would trigger instant close-tab.
- Resistance was *"do I believe you,"* not cost.

**What Alex would pay tomorrow:** **$9/mo** for `tribot-watch` Plus — the free CLI + 90-day hosted history + Slack/Discord alerts + self-host export. **Not the Guardian kernel.**

**What would convert Alex:** a second injection scare in the next 60 days + one concrete blog post showing Guardian catching a real attack. That combo closes at ~70%.

**Single sharpest line from the transcript:**
> *"Anyone selling 'AI safety' in 2026 who isn't shipping a postmortem is selling vibes."*

### 37.2 Simulation 2 — Jordan (small-team CTO, $99/mo target)

**Persona:** Jordan Okafor, 38, CTO of Threadloom — 6-person B2B SaaS, $18K MRR, 47 customer OpenClaw instances. Just had a LinkedIn-injection incident cost $2,400 refund + near-churn on a $580/mo logo. Has looked at Runlayer ($900/mo too heavyweight) and Lakera ($99 doesn't touch tool calls). Already runs incident runbooks he wrote on weekends.

**Verdict:** **Design-partner pilot yes (if 4 conditions met by Friday). 35% paid conversion in 90 days, 65% in 12 months.**

**Why it landed there:**
- The *cross-conversation leak detector* genuinely interested him (differentiator).
- Pricing math worked at his scale ($99 flat for <50 instances, $8/instance after — no surprise line items).
- But flagged **4 objections the pitch didn't land on:**
  1. **Ops burden of 47 Guardians** — needs Linear-for-policies bulk-edit UX, not 47 tabs.
  2. **100-customer pricing cliff** — $8/instance past 50 scales faster than MRR at enterprise customers.
  3. **Audit log legal ownership** — who's Controller when a Threadloom customer is subpoenaed? DPA not linked on website.
  4. **Co-sell UX** — does TRIBOT let Jordan embed audit view in his own product, so *his* customers see safety receipts?

**The co-sell answer Jordan demands:** conditional yes to "Protected by TRIBOT" badge, but **only** if opt-in per customer + 15% discount per badge-displaying customer + badge links to page *Jordan* controls + 1-hour kill-switch during TRIBOT incidents.

**What would make Jordan sign Friday:**
- Pilot agreement + ToB scope doc + intro to another design partner with 20+ wrapped instances
- Cross-conversation leak detector live in pilot, not at GA
- $79/mo flat for 12 months, locked through end of 2027, up to 75 instances

**Walk-away kill signals:**
- Per-instance pricing without a published ceiling
- ToB audit slips past GA with no make-good
- Acquisition by hyperscaler without source-code escrow + 60-day change-of-control exit clause

**Single sharpest line:**
> *"Lakera's $99 doesn't touch tool calls, which is where my actual incident happened, so Lakera is theater."*

### 37.3 Simulation 3 — Priya (SMB VP-Engineering, $499/mo target)

**Persona:** Priya Shah, 44, VP Engineering at Lumenswap — Dublin-based fintech, 120 people, ~€18M ARR, 14 OpenClaw agents in production pilot. CISO flagged as "approved for pilot, not production." DPO terrified of GDPR. Looking at Runlayer (€43K/yr too expensive) and NemoClaw (€85K/yr overkill). Runs her own Lakera integration.

**Verdict:** **Design-partner yes conditional on 4 deliverables in 10 business days. 55% design-partner in 90d. 20% paid $499/mo in 12 months.**

**The 4 conditional deliverables (blocker-grade):**
1. Source-code escrow clause in writing (Iron Mountain)
2. DPA with named sub-processor list (Anthropic? OpenAI? AWS Bedrock? OpenClaw Foundation?)
3. Signed letter confirming TRIBOT = Data **Processor** (not Controller) for audit log
4. GDPR Art. 22 / AI Act Art. 14 **human-in-the-loop appeal queue** roadmap with target date

**5 objections the pitch didn't land on:**
1. **Art. 22 HITL queue** — Guardian auto-block on loan/KYC decisions without appeal mechanism may violate Art. 22.
2. **Sub-processor transparency** — vague DPA language = automatic DPO no.
3. **Crypto-shredding legal defensibility** — Irish DPC skeptical; needs legal opinion, not engineering answer.
4. **Upstream CVE indemnification cap** — seed-stage vendor insurance won't cover a fintech breach event.
5. **Data Controller vs. Processor status for audit log** — load-bearing legal question that determines joint-liability.

**3 internal-committee members to convince:**
- **CISO (Declan):** transparency-log integrity, Skills sandbox egress, 4-hour incident SLA, upstream-CVE containment
- **DPO (Siobhán):** EU data path, Art. 28 DPA, HITL appeal SLA, Controller/Processor letter, Art. 17 erasure DPC-defensible
- **CFO (Martin):** 24-month TCO vs Runlayer/NemoClaw, exit cost, escrow triggers, runway credibility under NDA, guarantee $499 doesn't become $4,990 at month 13

**Single sharpest line:**
> *"'Trust us' doesn't clear procurement. Trust us is a pitch-deck answer."*

### 37.4 Simulation 4 — Dave (angel investor, $50K pre-seed)

**Persona:** Dave Morrison, 51, ex-founder (Atlassian acqui-hire 2019, ~$60M). Writes 12-18 angel checks/year, $25-100K. Says yes to ~1.5% of 150 meetings. Explicitly **does not invest in "AI safety"** startups. Lives on X; writes "Operator's Notebook" Substack read by 8K founders.

**Verdict:** **Follow-on if tier-1 seed leads. Re-engage at waitlist 1,000 signups. Not committing $50K today.**

**Rubric score: 24/35 (below his 26 threshold).** Pulled up by:
- Honest kill criteria (5/5) — *"best disclosure I've seen this quarter"*
- Founder vibes (4/5) — self-aware, flagged weak assumptions
- Founder-market fit (4/5) — 40 public OpenClaw skills = real proof of work
- Market-timing thesis (4/5) — post-Moltbook install base genuinely inflecting

Pulled down by:
- Wedge clarity (3/5) — deck doesn't lead with Guardian
- Moat path (2/5) — wrapper economics are brutal
- Incumbent risk (2/5) — Microsoft rebuttal half-convincing

**5 conditions that would make Dave write the check:**
1. **Waitlist hits 400+ signups in week one** (not 30 days)
2. **Second engineer hired before close** (bus-factor de-risk)
3. **Named design partner** from the 180 OpenClaw startups, reference-checkable
4. **Repriced at $6M post**, not $8M
5. **Drop "Guardian" language** from public marketing. Lead with *"your agent won't break your machine."* Safety framing triggers wrong buyer persona.

**Single sharpest line:**
> *"You're really a security company wearing a four-primitive costume. That's fine, I'd actually rather you said that on slide two."*

**Dave's unpublished Substack draft (excerpt):**
> *"'Safety kernel for prosumers' is LittleSnitch economics — beloved, ten thousand users, flatline. And his rebuttal on Peter-goes-hostile assumed philosophical consistency from a man who just took an OpenAI paycheck."*

### 37.5 Cross-simulation convergence — the 6 things everyone said

Every one of the four targets (independent agents, different characters) flagged these:

| # | Convergent finding | Implication |
|---|---|---|
| **1** | **Trail of Bits audit timing is the single pre-launch decision.** Jordan, Priya, Alex (implicitly via "show me a postmortem"), and Dave all probed it. | Confirms §33.6 PR strategist + §33.7 convergence matrix. **Non-negotiable deliverable.** |
| **2** | **Per-instance / per-scale pricing surprises kill deals.** Jordan asked about 100-customer cliff; Priya asked about $4,990 at month 13; Dave asked what the acquirer multiple is. | Publish a full pricing ladder including the >50 and >100 tiers. Lock pilot pricing through end of 2027. |
| **3** | **`tribot-watch` (the audit CLI) is the real wedge.** Alex would pay $9 for it standalone. Dave would write on waitlist traction. Jordan would pilot on it. Priya's DPO needs it as audit evidence. | §36.10's read-only CLI posture is right. Consider making the **hosted audit history at $9/mo** the actual $0→paid conversion step, not the Guardian kernel. |
| **4** | **The prosumer thesis is the weakest of the three buyer stories.** Alex alone refuses to pay at $19. Jordan + Priya will pay at $99/$499. | §36.11 kill criteria are the right gate. If prosumer fails, B2B wedge (Jordan + Priya segment) is the real market. |
| **5** | **Contract/portability language matters more than features.** Jordan: source-code escrow + change-of-control + 60-day exit. Priya: named sub-processors + Controller/Processor letter + Art. 22 HITL. Dave: self-host fallback. | §32.2.2 legal work (Sprint §32.5 Phase 1) is not optional — these are contract blockers, not nice-to-haves. |
| **6** | **"Why you" / team size is a real risk.** Dave asked directly; Jordan asked via "pilot if design partner I can reference"; Priya asked via business-continuity escrow; Alex asked via "why should I believe you'll exist in 18 months." | **Hire second engineer before closing pre-seed.** Publish founder's 40 OpenClaw skills prominently. Ship one named design partner before any marketing. |

### 37.6 What the simulations changed in the pitch

**Based on the 4 sims, the pitch needs the following concrete rewrites:**

1. **Lead with reliability, not safety.** Dave: "Your agent won't break your machine" > "AI safety kernel." Alex: "policy firewall" (what it actually does) > "Guardian" (what we call it).
2. **`tribot-watch` + $9 audit tier goes on the pricing page as "Observer."** Free CLI + $9 hosted audit with 90-day retention + Slack/Discord alerts + self-host export. This becomes the $0→paid step. $19 Solo tier becomes the Guardian-kernel upgrade.
3. **Trail of Bits audit scope + timeline becomes slide 3 of the deck.** Not a footnote. Not "non-negotiable" — actually scoped, signed, dated.
4. **Design-partner program gets a published term sheet.** Escrow clause + DPA template + sub-processor list must be linked on the website. Jordan and Priya both said "send me the pilot agreement by Friday" and that's the first moment either would convert.
5. **B2B2C wedge gets equal weight in the deck.** Jordan's 47 customers + Priya's 14 agents are worth more in Year 1 than 20K solo prosumers, and two of four targets were operators wanting to embed safety receipts in their own products.
6. **Founder story needs to lead with the 40 public skills + one named employee.** "Solo founder + 1 engineer" scares everyone; "founder of the most-active ClawHub contributor + co-founder from [named shop]" reads differently.
7. **Drop "multi-model within 120 days"** from all marketing (confirmed from §36.8). Every target assumed OpenClaw-only and no one asked about multi-model.
8. **Kill-criteria slide stays in.** Dave rewarded it heavily — *"best disclosure I've seen this quarter."* Keep it as a credibility signal.

### 37.7 What the simulations couldn't test (gaps)

**Two investor simulations were planned and did not complete:**

- **Seed VC ($1-2M check, Threshold Ventures-style).** Execution failed on a rate-limit timeout. Would have tested: partnership-memo readiness, $3M-ARR-in-24-months credibility, whether the pitch has a "champion-able" story a principal can take to a Monday partner meeting. **Next round: re-spawn with tighter 3-part brief.**

- **Series A VC ($8-15M check, tier-1 fund).** Not spawned. Would have tested: whether the story scales past seed, whether the unit economics model holds up under $100M ARR projection pressure, whether there's an acquirer story at $500M+. **Defer until: $50K MRR + first design-partner case study published.**

**Additional simulations worth running in the next wave:**

- **A skeptical Simon Willison / simonw.net** persona — the single blog post that could tank or validate public launch. High-leverage test.
- **An OpenClaw core maintainer** — will OpenClaw Foundation endorse, ignore, or push back on a branded safety wrapper?
- **A customer of a customer** (Threadloom's end-user) — whether the "Protected by TRIBOT" badge reads as trust signal or added complexity.
- **A Microsoft product manager** who just read the pitch — intelligence on whether the incumbent-risk window is 9 months or 18 months.
- **A ClawHub skill author** — will they allow signing + scanning, or revolt?

### 37.8 The sharpest single takeaway

The four simulations, taken together, produce one unified sentence:

> **TRIBOT's real first product is a $9/mo audit CLI sold to prosumers + indie builders, with the Guardian kernel as an optional upgrade for small teams ($99+) who've had an incident. The $19 Solo tier is a bet that prosumers will pay for insurance; the simulations suggest they won't, but they'll pay for observability. Reshape the ladder accordingly.**

This doesn't invalidate §36 — it refines it. The §36.11 kill criteria remain the right gate. But the sims suggest the first revenue will come from Jordan (Team $99), not Alex (Solo $19), and the first free-to-paid conversion will be Alex buying Observer at $9 for the audit log, not Guardian at $19 for the kernel.

**Revised pricing (provisional, pending Van Westendorp validation):**

| Tier | Price | Bet |
|---|---|---|
| **Free** | $0 | `tribot-watch` CLI only |
| **Observer** | **$9/mo** | Free CLI + hosted audit + alerts + export. The real prosumer wedge. |
| **Solo** | $19/mo | Guardian kernel for individuals. Bet on post-incident upgrade. |
| **Pro** | $39/mo | Test Lab + Version rail. For serious individual builders. |
| **Team** | $99/mo | 5 seats + Fleet dashboard. The real cash wedge. |
| **Business** | $499/mo | SSO-lite + SOC 2 Type I letter + DPA + escrow. For SMB Segment 3. |

Observer at $9/mo didn't exist in §36.2. It should. It is the single clearest signal from the four simulations.

---

*§37 is the pressure-test on §36. The sims will need a second round once Seed VC + Series A + simonw-style skeptic are tested. Until then, the Observer tier and the Trail of Bits audit are the two deliverables that need to move to Phase 0 of §36.4.*

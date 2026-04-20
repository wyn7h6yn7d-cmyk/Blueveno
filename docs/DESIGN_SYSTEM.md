# Blueveno visual design system

Blueveno is a **premium trading journal and performance analytics** product. The interface should feel **dark-first, blue-led, calm, and expensive**—closer to a research terminal than a consumer fintech app.

---

## 1. Design principles

| Principle | What it means |
|-----------|----------------|
| **Dark navy foundation** | UI sits on deep, cool bases. Warmth appears rarely and only for meaning (warning, human copy). |
| **Blue as trust, not decoration** | Primary blue signals structure and focus. Electric cyan is **accent only**—never fills large areas. |
| **Cinematic, not noisy** | Depth comes from **layered backgrounds**, subtle grain, and **one** focal glow—not rainbow gradients or floating blobs. |
| **High information density** | Traders scan. Whitespace is **purposeful**; empty areas should feel “reserved for data,” not empty. |
| **Sharp geometry** | Prefer crisp edges, fine grids, monospace for metadata. Avoid bubbly shapes and playful illustration. |

**Avoid:** generic gradient orbs, neon panels, heavy glassmorphism, muddy gray-on-gray, decorative charts with no legend context.

---

## 2. Color tokens

### 2.1 Primary palette (blue identity)

Use **OKLCH** for perceptual consistency across displays.

| Token | Role | OKLCH (approx.) | Usage |
|-------|------|-----------------|--------|
| `bv-void` | Deepest canvas | `oklch(0.055 0.038 268)` | Root background, full-bleed marketing |
| `bv-base` | Page surface | `oklch(0.082 0.032 266)` | App shell behind content |
| `bv-raised` | Standard surface | `oklch(0.108 0.03 264)` | Main content area (maps to `--background` in dark) |
| `bv-surface` | Card / panel | `oklch(0.125 0.028 262)` | Cards, sidebars |
| `bv-surface-high` | Elevated card | `oklch(0.148 0.026 260)` | Hover, nested modules |
| `bv-surface-inset` | Recessed well | `oklch(0.075 0.034 268)` | Chart wells, table stripes, input wells |

### 2.2 Secondary palette (accents)

| Token | Role | OKLCH (approx.) | Usage |
|-------|------|-----------------|--------|
| `bv-blue-deep` | Structural blue | `oklch(0.36 0.11 252)` | Dividers, chart grid, inactive series |
| `bv-blue-accent` | Primary interactive | `oklch(0.62 0.13 252)` | Links, focus rings, key metrics (aligns with `--primary`) |
| `bv-ice` | Highlight text | `oklch(0.91 0.025 250)` | Eyebrows, labels on dark, “cold” emphasis |
| `bv-cyan-electric` | Emphasis | `oklch(0.70 0.14 250)` | Single KPI pulse, active tab indicator, sparkline peak—**sparingly** |
| `bv-warm` | Restrained contrast | `oklch(0.78 0.08 55)` | Warnings, “attention” (not success—that stays cool green if needed) |
| `bv-eyebrow` | Mono labels | `oklch(0.66 0.10 252)` | Section kicker text (`text-bv-eyebrow`) |
| `bv-border-accent` | Section rules | `oklch(0.52 0.12 252 / 0.32)` | `via-bv-border-accent` on dividers |

**Psychology:** Navy reads as **institutional and serious**. Ice/cyan reads as **precision and data**. Warm is **human exception**—use when the system must interrupt calm.

**Primary CTA depth:** `shadow-bv-primary` combines hairline, soft cobalt bloom, and inset top highlight—use on primary buttons and key CTAs instead of one-off OKLCH shadows.

### 2.3 Foreground & borders

| Token | Usage |
|-------|--------|
| Text primary | `oklch(0.97 0.01 260)` — headlines, body on dark |
| Text secondary | `oklch(0.72 0.02 260)` — supporting copy |
| Text muted | `oklch(0.55 0.02 260)` — meta, timestamps |
| Border hairline | `oklch(1 0 0 / 6–9%)` — panels, tables |
| Border emphasis | `oklch(0.55 0.12 250 / 0.25–0.35)` — selected row, focused field |

---

## 3. Background layers (cinematic depth)

Stack from back to front:

1. **Base** — `bv-void` or `bv-base` (full page).
2. **Ambient wash** — single **radial** or **elliptical** gradient (blue at ~12–22% opacity), anchored to **top-center or corner**—never centered “blob” in the middle of the screen.
3. **Grid** — `bg-grid` (64px) for marketing; `bg-grid-fine` (24px) inside terminals/charts.
4. **Vignette** — `bg-vignette` to darken edges and draw focus to content.
5. **Noise** — very low opacity (`~0.04`) so flat colors feel **film-like**, not plastic.

**Rule:** No more than **two** large gradients + grid + noise. If it looks like a stock “startup hero,” remove a layer.

---

## 4. Glow treatments

| Type | Implementation | When |
|------|------------------|------|
| **Terminal / hero frame** | `border-glow-subtle`: 1px light edge + soft outer blue + inset top highlight | Featured device mockups, primary CTA panel |
| **Focus glow** | `box-shadow` using `bv-cyan-electric` at **low alpha** + tight blur | Keyboard focus on critical controls only |
| **Ambient glow** | Radial gradient in CSS, **not** a blurred div behind every card | Section transitions, one per viewport region |

**Avoid:** multiple competing glows; glow on every card.

---

## 5. Border treatments

- **Default:** 1px `white/6–9%` on dark.
- **Inset panels:** top inner highlight `oklch(1 0 0 / 4%)` (see `.border-glow-subtle`).
- **Selected:** `bv-blue-accent` at 25–35% opacity, not full saturation stroke.
- **Dashed:** only for placeholders, upload zones, or “draft” states.

---

## 6. Card styles

| Variant | Classes / pattern |
|---------|-------------------|
| **Standard** | `rounded-xl` or `rounded-2xl`, `border border-border/80`, `bg-bv-surface` or `bg-card`, subtle `shadow-bv-card` |
| **Nested** | Inner card uses `bv-surface-inset` or one step darker background; reduce radius by one step (`rounded-lg` inside `rounded-2xl`) |
| **Interactive** | Hover: border `white/10`, background +`white/[0.02]`, **no** scale > 1.02 |

---

## 7. Typography scale

**Fonts (current stack):** Inter (UI), Space Grotesk (`font-display` / headings), JetBrains Mono (data, labels).

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Display XL | `2.5rem–3.35rem` | 500 | Hero headline |
| Display L | `2rem–2.5rem` | 500 | Section titles |
| Title | `1.25rem–1.5rem` | 500 | Card titles |
| Body | `0.9375rem–1rem` | 400 | Paragraphs |
| Small | `0.875rem` | 400 | Secondary |
| Meta | `10–11px` | 400–500 | `font-mono`, `uppercase`, `tracking-[0.2em–0.35em]` for labels |

**Rules:**

- Headlines: **tight** `tracking-tight`, not wide marketing caps.
- Data: **tabular nums** where numbers align (`tabular-nums`).
- One **gradient text** treatment per view (e.g. `.text-gradient-electric`) for a single hero phrase only.

---

## 8. Spacing system

Base unit **4px**. Prefer Tailwind’s scale; align to this mental model:

| Intent | Scale |
|--------|--------|
| Tight (dense dashboard) | `gap-2`–`gap-3`, `p-3`–`p-4` |
| Standard (cards) | `gap-4`–`gap-6`, `p-6`–`p-8` |
| Section (marketing) | `py-28`–`py-36`, `gap-14`–`gap-20` |

**Vertical rhythm:** section title → `mt-5` body → `mt-20` grid (already used on landing). Dashboards: **tighter**—reduce vertical gaps by one step vs marketing.

---

## 9. Radius system

| Token | Value | Use |
|-------|--------|-----|
| `rounded-md` | `--radius-md` | Inputs, small chips |
| `rounded-lg` | `--radius-lg` | Buttons (shadcn default) |
| `rounded-xl` | `--radius-xl` | Cards, dropdowns |
| `rounded-2xl` | `--radius-2xl` | Feature cards, modals |
| `rounded-full` | — | Pills, primary CTAs on marketing |

**Rule:** Outer radius **≥** inner radius. Don’t mix `rounded-3xl` containers with sharp inner tables without intent.

---

## 10. Shadow system

| Token | Role |
|-------|------|
| `shadow-bv-card` | Resting cards—soft, wide, low contrast |
| `shadow-bv-float` | Dropdowns, popovers |
| `shadow-bv-glow` | Optional CTA emphasis (use rarely) |

Implementation: prefer **semi-transparent blue-tinted** shadows, not pure black blobs.

---

## 11. Chart styling principles

- **Background:** `bv-surface-inset` or darker; fine grid at **low** opacity.
- **Series:** primary line `bv-blue-accent` → `bv-cyan-electric` gradient along stroke; area fill with **vertical gradient** to transparent (already in hero SVG).
- **Axes:** minimal ticks; labels `text-zinc-500`, `font-mono`, small.
- **Reference lines:** dashed `white/10`, not bright colors.
- **No chartjunk:** one message per chart; if you need three insights, use three small multiples—not one rainbow chart.

---

## 12. Iconography direction

- **Style:** Stroke icons (Lucide-style), **1.5px** stroke, rounded caps where the UI is rounded.
- **Size:** 16px inline; 20px in empty states; never oversized decorative icons.
- **Color:** Default `text-zinc-400`; active `bv-blue-accent` or `bv-cyan-electric`; **no** multicolor icons in data tables.
- **Metaphor:** terminal, clipboard, activity, shield, book—**avoid** trophy, rocket, game controller.

---

## 13. Button styles

Map to shadcn `Button` variants:

| Intent | Variant | Notes |
|--------|---------|--------|
| Primary action | `default` | Uses `--primary`; marketing may use custom `rounded-full` + electric shadow for hero only |
| Secondary | `outline` | `border-input`, subtle fill on dark |
| Tertiary | `ghost` | For toolbars and tables |
| Destructive | `destructive` | Keep subdued; red is rare in trading UIs—use for irreversible actions |

**Dashboard:** prefer **small** sizes (`size="sm"` / `xs`) in dense layouts.

---

## 14. Form styles

- **Inputs:** `bg-bv-surface-inset` or `input/30`, `border-white/12`, focus ring `ring` / `bv-blue-accent`.
- **Labels:** `text-sm` + `text-muted-foreground`; required field—subtle indicator, not red asterisk spam.
- **Help text:** `text-xs` below field, `text-zinc-500`.

---

## 15. Table styles

- **Header:** `bg-bv-surface-inset` or sticky with `backdrop-blur`, `text-[11px] font-mono uppercase tracking-wider text-zinc-500`.
- **Rows:** default transparent; hover `bg-white/[0.03]`; selected `border-l-2 border-bv-blue-accent` optional.
- **Numbers:** right-align, `tabular-nums`, `font-mono` optional for P&L columns.

---

## 16. Dashboard panel styles

- **Page:** `bv-base` with optional **single** radial wash; **no** marketing vignette unless shell is shared with marketing.
- **Layout:** clear **grid** (`grid-cols-12`), consistent gutters (`gap-4`–`gap-6`).
- **Panel:** `rounded-xl`, hairline border, `shadow-bv-card`; title row with mono eyebrow + actions on the right.
- **Density:** favor **more panels** with clear hierarchy over one giant widget.

---

## 17. Empty states

- **Layout:** centered content, **max-w-sm** copy; one stroke icon in `bv-blue-deep` or `zinc-500`.
- **Copy:** calm, specific (“No trades in this range”)—not playful.
- **Primary action:** one button; secondary link optional.

---

## 18. Upgrade / paywall prompts

- **Container:** `rounded-2xl`, `border` with **slightly stronger** `bv-blue-accent` tint (not neon); background `bv-surface` with **very subtle** inner glow.
- **Icon:** lock or key—**single color**.
- **Title:** display small, no hype adjectives.
- **Bullets:** three concrete outcomes (features), not “unlock everything.”

---

## 19. Tailwind-friendly usage

Semantic colors are exposed as `bg-bv-*`, `text-bv-*`, `border-bv-*` (see `app/globals.css`). Prefer these over ad-hoc `oklch()` in components.

**Examples:**

```html
<!-- Section shell -->
<section class="relative bg-bv-void text-zinc-100">
  <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.28]" />
  <div class="relative max-w-7xl mx-auto px-6 py-28">...</div>
</section>

<!-- Dashboard panel -->
<div class="rounded-xl border border-white/[0.06] bg-bv-surface shadow-bv-card">
  <div class="border-b border-white/[0.06] px-4 py-3">
    <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">Expectancy</p>
  </div>
  <div class="p-4">...</div>
</div>
```

---

## 20. Section styling (marketing)

1. **One focal moment per section** (headline block **or** visual, not both fighting).
2. **Eyebrow** in mono + `bv-ice` or `zinc-500` + wide tracking.
3. **Headline** `font-display`, `tracking-tight`, zinc-50.
4. **Body** `text-zinc-400`, max-width ~`42rem` for readability.
5. **CTAs:** at most one primary + one secondary; align to a grid.

---

## 21. Dashboard styling (app)

1. **No decorative gradients** behind every chart.
2. **Consistent panel chrome** (title bar, padding, border).
3. **Typography:** downshift one step vs marketing; more mono for numbers.
4. **Color:** reserve `bv-cyan-electric` for **live** or **delta** indicators.

---

## 22. Visual hierarchy (examples)

| Pattern | Weak (avoid) | Strong (Blueveno) |
|---------|----------------|---------------------|
| Hero | Big gradient blob + generic stock chart | Navy stack + **one** spotlight + terminal frame with real structure |
| KPI row | Four equal bright cards | One **primary** metric with cyan accent; others muted |
| Table | Gray maze | Clear header, hover row, monospace figures |
| CTA | “Unlock” neon button | Solid primary or outline; **full** width only on mobile |

---

## 23. Implementation reference

| Asset | Location |
|-------|----------|
| Tokens & utilities | `app/globals.css` (`--bv-*`, `.bg-grid`, `.border-glow-subtle`, etc.) |
| Theme bridge | `@theme inline { ... }` in `globals.css` |
| UI primitives | `components/ui/*` |

When adding new screens, **extend tokens** before introducing new hex values.

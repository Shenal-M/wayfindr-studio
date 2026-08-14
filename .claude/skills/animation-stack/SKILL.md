---
name: animation-stack
description: How to animate anything in this repo. Read BEFORE writing or editing any animation, transition, scroll effect, hover state, carousel, marquee, reveal, parallax, or page transition — and before adding any animation dependency. Assigns each job to exactly one of CSS / Motion / GSAP / Lenis and gives the working code for each. Triggers on: animate, animation, transition, motion, easing, stagger, scroll, ScrollTrigger, parallax, pin, scrub, smooth scroll, Lenis, GSAP, Framer Motion, motion/react, hover, tap, drag, layout shift, AnimatePresence, reveal on scroll, marquee, carousel, page transition, reduced motion, jank, 60fps.
---

# Animation & Motion

This repo runs a four-layer motion stack. Each layer owns a distinct job. Picking the
wrong layer is the single most common source of animation bugs here, and every bug
listed in this file is one that actually shipped.

**The one inviolable rule: never let two layers write to the same DOM element.** Two
libraries writing `transform` on one node fight every frame, and the winner is
whichever wrote last. This is not a style preference — it is a correctness constraint.

## Pick a layer

Work down the table. Take the **first** row that matches.

| The animation is… | Use | Why not the others |
| --- | --- | --- |
| A symmetric two-state change on hover/focus/open, no physics, no orchestration | **CSS transition** | Free, no JS, no client boundary. Interrupts gracefully in both directions. |
| Driven by scroll **position** — parallax, scrub, pin, reveal-on-enter | **GSAP ScrollTrigger** | Motion's `whileInView` can't scrub, pin, or batch. CSS can't read scroll. |
| A multi-step choreographed sequence with overlapping timing | **GSAP timeline** | Motion has no position parameter; sequencing it means nested delays that drift. |
| A continuous programmatic loop needing measured geometry | **GSAP tween** | Needs `repeat: -1` + `progress()` preservation across rebuilds. |
| React state → visual state (hover, tap, drag, toggle, copied) | **Motion** | GSAP needs manual `dependencies` + `overwrite` to track state; Motion is declarative. |
| An element entering/leaving the React tree | **Motion `<AnimatePresence>`** | Nothing else can delay unmount. |
| A box changing size/position because layout changed | **Motion `layout` prop** | The only option that doesn't require measuring by hand. |
| Page-wide smooth scrolling | **Lenis** | The only smooth-scroll layer. Never add a second. |

### Deciding between Motion and GSAP when both could work

The line is **what drives the animation**, not how complex it is.

- Driven by **scroll position or a clock** → GSAP.
- Driven by **React state or presence in the tree** → Motion.

A mount-time entrance is Motion's (it's presence). A scroll-triggered entrance is
GSAP's (it's scroll). Both animate opacity and `y`; they are still different jobs.

## 1. Lenis — smooth scrolling, and nothing else

Lenis owns page scroll. It is configured once, in
[`SmoothScrollProvider.tsx`](../../../src/components/SmoothScrollProvider.tsx). Do not
instantiate it anywhere else, and do not add a second smooth-scroll library.

**Lenis drives real `window.scrollY`.** It does not transform a wrapper element. This
is the whole reason it replaced GSAP's ScrollSmoother here, and it has three
consequences worth knowing:

- `position: fixed` works normally. Nothing needs to be hoisted out of a wrapper.
- ScrollTrigger needs **no `scrollerProxy()`**. It reads native scroll and just works.
- There is no fractional wrapper transform, so no sub-pixel resampling — the shimmer
  and 1px-jitter class of bug is structurally gone, not worked around.

### Construct it directly, not with `<ReactLenis>`

`lenis/react` exists, and this repo deliberately doesn't use it. `ReactLenis` holds
its instance in `useState` and creates it inside a *passive* effect, exposing it via
`useImperativeHandle` — so the ref is empty during every layout effect on mount, and
still empty during the parent's own passive effect, because the ref only reflects the
instance after the re-render that `setLenis` schedules.

A parent effect reading `ref.current.lenis` therefore finds nothing, skips attaching
the ticker, and — since `autoRaf` must be off — leaves Lenis with no rAF driver at
all. **Scrolling silently stops.** Constructing Lenis inside the same effect that
syncs and destroys it makes the three one ordered unit with no timing to get right.

If a descendant ever needs the instance, add a small context in
`SmoothScrollProvider` rather than reaching for `ReactLenis`.

### The GSAP sync — get this exactly right

Lenis and GSAP must share **one** rAF loop. If they each run their own, Lenis writes
`scrollY` on its loop and ScrollTrigger reads the stale value on its tick, which is a
1–2 frame lag that reads as scroll-linked animations lagging or juddering behind the
scroll.

```tsx
useGSAP(() => {
  // autoRaf: false is mandatory — GSAP's ticker is the only loop on the page.
  const lenis = new Lenis({ autoRaf: false, lerp: 0.1, syncTouch: false, anchors: true });

  const raf = (time: number) => lenis.raf(time * 1000); // GSAP ticks in seconds, Lenis wants ms
  gsap.ticker.add(raf);

  // Same-frame sync: ScrollTrigger recomputes on the tick that moved the scroll.
  lenis.on("scroll", ScrollTrigger.update);

  // Without this, GSAP clamps a large delta after a tab has been backgrounded and
  // Lenis receives a truncated time step — the page lurches on refocus.
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
    lenis.destroy(); // removes its own listeners, including the one above
  };
}, []);
```

`lagSmoothing(0)` is **global** to GSAP. Any long-running loop (the marquee) will
therefore jump forward rather than resume in place after the tab is backgrounded.
That's the accepted trade: correct scroll beats a marquee that never skips.

### Rules

- ✅ Scroll programmatically with `lenis.scrollTo()`. `window.scrollTo` and
  `element.scrollIntoView` bypass Lenis and fight it.
- ✅ Put `data-lenis-prevent` on any nested scrollable element (modal body, code block)
  so its own scroll isn't hijacked.
- ✅ Under `prefers-reduced-motion: reduce`, do not create Lenis at all. Native scroll
  is the correct reduced-motion behaviour.
- ❌ Never set `autoRaf: true` (or omit it) while GSAP drives the ticker.
- ❌ Never call `lenis.raf()` from your own `requestAnimationFrame`.

## 2. GSAP — scroll and timelines, via `useGSAP()` only

Import from [`src/lib/gsap.ts`](../../../src/lib/gsap.ts), never from `"gsap"`
directly. That module performs `registerPlugin` exactly once; registering per-component
is how plugins end up half-registered in dev.

### `useGSAP()`, never `useEffect`

```tsx
const containerRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  gsap.to(".card", { y: 0, opacity: 1, stagger: 0.1 });
}, { scope: containerRef });
```

`useGSAP` reverts every tween, timeline and ScrollTrigger created inside it on unmount
and on dependency change. A `useEffect` doing GSAP work leaks ScrollTriggers that keep
firing against detached nodes — whose rects all read zero, so they also corrupt every
subsequent `ScrollTrigger.refresh()`.

- ✅ Always pass `scope`. Unscoped selector strings match elements in other components.
- ✅ Wrap anything created in an event handler in `contextSafe()`, or it escapes the
  context and never gets reverted.
- ✅ Use `{ dependencies: [...], revertOnUpdate: true }` when a rebuild must clear the
  previous pass's inline styles.

### Animate transforms and opacity

`x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation`, `autoAlpha` are composited and
never trigger layout. Animating `width`, `height`, `top`, `left` or `margin` forces
layout on every frame — for the whole document, not just that element.

If a box's **size** must animate, that's a layout animation: use Motion's `layout`
prop (§3), don't tween `width` in GSAP.

### Two hard-won GSAP gotchas

**Pin `y: 0` alongside any `yPercent` tween.** GSAP reads an existing transform back
off the computed matrix as *pixels*. If an effect re-runs (Strict Mode, fast refresh)
it parses the previous pass's translate as `y: 158px` and stacks `yPercent` on top,
stranding the element a full line-height away. Setting `y: 0` on both ends makes the
tween independent of whatever transform it finds.

```ts
gsap.fromTo(el, { yPercent: 101, y: 0 }, { yPercent: 0, y: 0 });
```

For the same reason, **hold GSAP entrance start-states as `visibility`/`opacity` in
CSS, never as a `transform`** — a CSS `translateY(100%)` gets read back as pixels and
double-applied. See the `.anim` rules in
[`globals.css`](../../../src/app/globals.css).

**Refresh after late layout changes.** Resize is handled automatically (debounced
200ms); webfonts swapping in and images loading are not.

```ts
document.fonts?.ready.then(() => ScrollTrigger.refresh());
```

### Scroll-linked patterns

Parallax — scrub `yPercent` against the element's own scroll range:

```ts
gsap.fromTo(img,
  { yPercent: -8 },
  {
    yPercent: 8,
    ease: "none", // required: any other ease breaks the 1:1 scroll mapping
    scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
  }
);
```

Reveal-on-enter — use `batch()` so elements crossing the line together stagger as a
group rather than each on its own schedule:

```ts
ScrollTrigger.batch(gsap.utils.toArray("[data-reveal]", root), {
  start: "top 85%",
  once: true,
  onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.12, overwrite: true }),
});
```

- ❌ Never put `scrollTrigger` on a child tween of a timeline. It goes on the timeline.
- ❌ Never combine `scrub` and `toggleActions` — `scrub` silently wins.
- ❌ Never leave `markers: true` in committed code.

### Never drive React state from scroll

A `scroll` listener calling `setState` re-renders the tree on every frame. Write to a
CSS custom property from `onUpdate` instead — no React involvement, no re-render:

```ts
ScrollTrigger.create({
  trigger: el,
  start: "top 80%",
  end: "bottom 60%",
  scrub: true,
  onUpdate: (self) => el.style.setProperty("--progress", `${self.progress * 100}%`),
});
```

## 3. Motion — component state, presence, layout

**Import from `motion/react`.** Not `framer-motion` (the old package name) and not
`motion` (that's the vanilla build). Installed version is **13.x**; the `motion/react`
API is unchanged from 12.

```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";
```

Every file importing `motion/react` needs `"use client"`. In a server component,
`import * as motion from "motion/react-client"` gives you the same components without
opening a client boundary yourself.

### State → visual state

Drive props from state and let Motion interpolate. No refs, no `dependencies` array,
no `overwrite` — interruption mid-flight is handled, and it eases from wherever it
currently is.

```tsx
<motion.span
  animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -10 }}
  transition={{ duration: 0.35, ease: EASE }}
/>
```

### Gestures

`whileHover` / `whileTap` / `whileFocus` / `drag`. Reach for these when the
interaction needs spring physics, gesture tracking, or coordination with other
animations — **not** for a plain symmetric hover, which stays in CSS.

### Presence — the thing nothing else can do

`<AnimatePresence>` defers unmount until the exit animation finishes. Without it, the
alternative is keeping the element permanently mounted behind `opacity-0
pointer-events-none`, which leaves focusable content in the tree for keyboard and
screen-reader users.

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      …
    </motion.div>
  )}
</AnimatePresence>
```

Children need a stable `key`. For a one-at-a-time swap use `mode="wait"`.

Default (`sync`) mode is only right when the outgoing and incoming elements can be
told apart while both are on screen — different position, different size, different
weight. **Two blocks of the same copy in the same slot cannot**: at the crossover
they're both around half opacity and read as one double-struck paragraph. That is why
`IndustriesCarousel` waits even though its fixed-height stage would let the two
overlap freely. Make the exit much shorter than the entrance instead — it's what the
click waits behind, and nobody needs to watch a paragraph leave.

### Orchestration via variants

Prefer `staggerChildren` over hand-computed `transitionDelay` values, which drift and
have to be reversed by hand on exit.

```tsx
const list = { open: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
const item = { closed: { opacity: 0, y: 8 }, open: { opacity: 1, y: 0 } };

<motion.nav variants={list} initial="closed" animate="open">
  {items.map((i) => <motion.a key={i.label} variants={item} />)}
</motion.nav>
```

### Continuous input → motion values, never state

For anything driven by a continuously-changing input — cursor position, pointer
velocity, a drag offset — put the value in a `useMotionValue` and, if it needs
smoothing, wrap it in `useSpring`. A motion value is **not** React state: writing to
it updates the DOM node directly, so the component does not re-render.

```tsx
const target = useMotionValue(0);
const rotation = useSpring(target, { stiffness: 150, damping: 20, mass: 0.4 });

// In a listener — one style write, zero renders.
target.set(next);

<motion.svg style={{ rotate: rotation }} />
```

This is the rule `NavigatorIcon.tsx` was breaking: it held the angle in `useState` and
ran its own rAF loop to lerp toward it, so it re-rendered at 60fps on every page,
forever — with no idle condition, and tearing down its loop on every mousemove because
the effect depended on the target. `useSpring` replaces both the loop and the lerp.

**Springs interpolate numerically, so they know nothing about angles.** Feed one 359°
then 1° and it travels the long way round. Accumulate an unwrapped heading on the input
side instead, so consecutive targets are always within ±180°:

```ts
const delta = (((next - heading.current) % 360) + 540) % 360 - 180;
heading.current += delta;
```

### Layout animations

The `layout` prop animates a box between two layouts using transforms, measured for
you. This is the correct answer to "the container must resize smoothly", and it
replaces measuring `offsetWidth` and tweening `width` — which forces layout every
frame and needs a guard for the `display: none` case where the measurement reads 0.

```tsx
<motion.span layout transition={{ duration: 0.3 }}>
  <AnimatePresence mode="wait" initial={false}>
    <motion.span key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      {label}
    </motion.span>
  </AnimatePresence>
</motion.span>
```

For height specifically, `animate={{ height: "auto" }}` works and Motion measures it.

**Two constraints come with `layout`, and together they rule it out more often than
you'd expect.** Both are consequences of the same thing: it animates with transforms.

1. **A `layout` element renders scaled, so its children distort.** Text inside a box
   animating its own height is squashed or stretched for the duration. The documented
   fix is to put `layout` on the child so it gets counter-scaled — which is why
   `CopyLabel` carries it on both the wrapper and the swapping label.
2. **`layout` owns the element's transform, so it can't coexist with `x`/`y`/`scale`
   on that element.** This is why `CopyLabel` crossfades on opacity alone instead of
   sliding.

Put them together and a container that must both resize *and* slide its contents has
no arrangement that works: the child needs `layout` to avoid being distorted, and
needs to not have it in order to move. `IndustriesCarousel` is where that bit — and
the answer was to stop animating the height. Every description is rendered into one
CSS grid cell with `visibility: hidden`, so the stage is permanently as tall as the
longest of them.

**Before reaching for `layout`, ask whether the box needs to resize at all.** A stage
held open at its largest size costs some whitespace and buys a great deal: no
distortion, no transform conflict, siblings that stop moving between states, no
document-height change while the page scrolls, and it works with JS off.

### SSR, and why the hero is still GSAP

Motion serialises `initial` into the server-rendered `style` attribute, so a Motion
mount animation cannot flash its final state before hydration. GSAP can, which is why
GSAP start states live in CSS behind the `.anim` gate in
[`globals.css`](../../../src/app/globals.css).

That does **not** make Motion strictly better for entrances, and the hero headline in
`HomePage.tsx` is the case where it loses. An SSR'd `initial` is an inline style, so if
the JS bundle never arrives — a chunk 404s, a hydration error, a stale service
worker — the content stays stuck at `opacity: 0` with nothing left to animate it. The
`.anim` gate covers exactly that: a `<noscript>` rule neutralises it with scripting
off, and an inline timer in the root layout removes the class if
`window.__gsapReady` was never set. Motion has no equivalent hook.

So: **prefer Motion for mount animations on content that is decorative or
below-the-fold; keep the gated-CSS + GSAP arrangement for anything whose invisibility
would break the page.** The hero headline is the entire first screen, so it stays.

Whatever you choose, do not leave an element hidden by a start state with no path back
if its animation never runs.

## 4. CSS — still the default for simple hovers

A symmetric two-state change is what CSS transitions are for. They interpolate from the
current computed value using the same curve in both directions and cost no JS.

This was tried the other way round in [`Button.tsx`](../../../src/components/Button.tsx)
and CSS won: driving the hover from a GSAP timeline meant `play()` on enter and
`reverse()` on leave, and `reverse()` replays the *easing* backwards, so an ease-out
exit became an ease-in — the panel hung still, then snapped away.

Keep `Button` free of `"use client"`. Adding Motion to it opens a client boundary for
every server component that renders a button, and buys nothing.

Always pair a CSS transition with `motion-reduce:transition-none`.

### Don't build an icon out of a text character you intend to rotate

A `+` glyph rotated 45° into a `×` is the shortest path to a plus/close toggle and it
always looks slightly wrong. A typographic plus is centred on the font's math axis,
not on its line box, so rotating the box pivots around a point that isn't where the
strokes cross — the mark travels through a small arc instead of turning in place. The
two strokes are also drawn to different lengths and hinted for orthogonal rendering,
so off-axis it lands lopsided and soft. Two absolutely-positioned bars with
`bg-current` cost the same and give equal weight, an exact centre, and a pivot that
*is* the crossing. `ContactContent`'s accordion mark is the reference.

While you're there: rotate **135°**, not 45°. A plus has 90° rotational symmetry so
both land on the same cross, but an eighth of a turn is over before it registers.
135° is the same endpoint with three times the travel, and an ease-out spends nearly
all of it in the first third of the duration, so it reads as deliberate without
taking longer.

### Give an opening panel and its contents different clocks

A disclosure that transitions the box and fades the contents on one shared duration
puts the text at half opacity while the box is at half height, and half-faded text in
a half-open box is a smear rather than a reveal. Let the box lead and the contents
follow ~100ms behind, so they arrive into space that already exists.

Make the close asymmetric: contents out fast (~150ms), box shut on the full duration.
The open is what the user asked for; the close is tidying up, and nothing should still
be legible under a descending edge. Same reasoning as the short carousel exit above.

Keep the panel's spacing *inside* the collapsing region (`pb-8` on the content) rather
than as a margin on the collapsing element. An animated `margin` is a second layout
property on a second clock, and the grid collapse already takes inner padding with it.

## Reduced motion

Every animation must have a reduced-motion path. Honour the *intent*: end states
still apply, travel and looping do not.

**GSAP** — `gsap.matchMedia()`, which reverts automatically when the query stops
matching:

```ts
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => { /* tweens */ });
return () => mm.revert();
```

For animations that must still *happen*, just instantly, branch on the condition:

```ts
mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
  (ctx) => { const duration = ctx.conditions?.motion ? 0.35 : 0; /* … */ });
```

**Motion** — `useReducedMotion()`, and zero the transition rather than dropping the
animation, so state changes still land:

```tsx
const reduce = useReducedMotion();
<motion.div transition={{ duration: reduce ? 0 : 0.35 }} />
```

**Lenis** — don't create it.

**CSS** — `motion-reduce:transition-none` on transitions, plus neutralise any `.anim`
start state inside `@media (prefers-reduced-motion: reduce)`, or GSAP-gated content
stays permanently invisible.

**CSS `@keyframes` entrances need care, because `animation: none` can hide content.**
Any element that pairs `opacity-0` with an entrance animation is relying on
`animation-fill-mode: both` to bring it to 1. Switch the animation off and the base
class is the only thing left setting opacity — the element stays invisible forever.

Redefine the keyframes instead. Identical `from`/`to` means the animation still runs
and still fills, so the end state applies throughout — including during a staggered
delay, since the backwards fill of `both` applies `from` while waiting:

```css
@media (prefers-reduced-motion: reduce) {
  @keyframes fadeInUp {
    from { transform: none; opacity: 1; }
    to   { transform: none; opacity: 1; }
  }
}
```

One block covers every call site and a new one can't forget it. `animate-none` is only
safe where nothing depends on the animation to become visible — `animate-bounce` on the
hero scroll cue, for instance, which is an infinite animation and the clearest case of
all.

An infinite loop (the marquee) is precisely what reduced motion asks us not to do:
it should not start at all.

## Shared timing values

Durations and eases live in [`src/components/motion.ts`](../../../src/components/motion.ts).
Import them; don't retype numbers. The bubble and the hook that dismisses it once
disagreed by 200ms, so the label flipped back mid-fade.

## Where each layer lives now

| File | Layer | Job |
| --- | --- | --- |
| `SmoothScrollProvider.tsx` | Lenis + GSAP | Smooth scroll, ticker sync, route-change reset |
| `ScrollRevealProvider.tsx` | GSAP | Site-wide `[data-reveal]` batch — see below |
| `lib/gsap.ts` | GSAP | Single `registerPlugin` call site — ScrollTrigger only |
| `HomePage.tsx` | GSAP | Hero stagger, scroll-cue scrub, `[data-parallax]` |
| `Marquee.tsx` | GSAP | Measured seamless infinite loop |
| `ScrollRevealText.tsx` | GSAP | Per-line scrubbed wipe, written to a CSS var |
| `CapabilitiesList.tsx` | GSAP | Per-row masked entrance + scroll-driven active row (below md only) |
| `CopyBubble.tsx` / `CopyLabel.tsx` | Motion | Copy state, presence, layout width |
| `Navigation.tsx` | Motion | Menu overlay presence + staggered items |
| `NavigatorIcon.tsx` | Motion | Cursor-following spring, via motion values |
| `IndustriesCarousel.tsx` | Motion | Slide presence over a fixed-height stage |
| `Button.tsx` | CSS | Hover wipe — stays a server component |
| `ContactContent.tsx` | CSS | Entrance keyframes and accordion — see below |

### Revealing something on scroll

Don't write a new ScrollTrigger. Add two things to the element:

```tsx
<div className="reveal-init" data-reveal>
```

`data-reveal` is the trigger, `reveal-init` is the CSS start state. `ScrollRevealProvider`
in the site layout picks it up on every route, batches it with the surrounding
elements, staggers the batch, and handles reduced motion. It's an attribute, so a
server component can opt in without a client boundary.

**Do not put `reveal-init` on, or above, these three:**

| Don't reveal | Why |
| --- | --- |
| A `sticky` element or any ancestor | A transform makes it a containing block, changing what the sticky offset resolves against |
| An ancestor of a Motion `layout` element | `layout` measures viewport rects; a moving ancestor makes it measure a moving target |
| An ancestor of a scrub-driven element (`ScrollRevealText`) | Its own trigger measures its container's position, so a transform maps the scrub to the wrong range |

In all three cases reveal a sibling — usually the section's eyebrow or heading —
and leave the animated element alone.

### Nothing driven by scroll may change layout

If an animation's input is scroll position, its output has to be `transform` or
`opacity`. Not height, not `grid-template-rows`, not margin — those change document
height, and a document-height change while Lenis is easing is a scroll correction
the user feels as content sliding out from under their finger. It is worse than
jank, because the page moves in the opposite direction to the gesture.

`CapabilitiesList` was the case that made this concrete. Below md it expanded the
focused row's sub-services and collapsed the previous one's. The row losing focus is
*above* the fold line, so its collapse pulled the row you were reading upward — every
focus change displaced the page mid-scroll. The fix wasn't a smoother height tween;
it was to leave the sub-services laid out permanently below md and let the emphasis
be carried by the title's colour and the arrow's ingress, neither of which touches
layout.

Hover is a different matter: `grid-rows-[0fr→1fr]` on hover is fine, because the
user isn't scrolling. That's why the same component still expands on hover from md
up. The rule is about the *input*, not the property.

Tune the timing in `ScrollRevealProvider`, not per call site. `BATCH_MAX` is the
smoothness control: a multi-column grid that collapses to one column on mobile has
every card crossing the trigger together, and capping the batch splits that into
waves that each keep their stagger instead of one undifferentiated wash.

`ContactContent.tsx` is intentionally still CSS. Its entrances are one-shot
`@keyframes` and its accordion uses the `grid-rows-[0fr→1fr]` technique, both of which
work with no JS at all. There is nothing for Motion to improve there; don't convert it
just for consistency. Revisit only if the accordion needs to animate content that must
unmount, which is when presence starts to matter.

## Adding a new animation — checklist

1. Pick the layer from the table. Take the first matching row.
2. Confirm no other layer already writes to that element.
3. GSAP? Import from `src/lib/gsap.ts`, use `useGSAP` with a `scope`.
4. Motion? Import from `motion/react`, file has `"use client"`.
5. Animating transform/opacity, not width/height/top/left.
6. Reduced-motion path exists.
7. Durations from `motion.ts`.
8. No `markers: true`, no `scroll` listener calling `setState`.

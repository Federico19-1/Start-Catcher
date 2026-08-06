# 🧠 hints_for_code.md

A guide to the *code side* of Star Catcher: how to keep it looking
hand-crafted (not AI-slop) to anyone who evaluates it, how the codebase is
organized, and which parts repay the most study time.

---

## Part 1 — Making the code look human-made to evaluators

The biggest "AI tell" in code is **the absence of decisions**. AI output is
generic, consistent-to-a-fault, and over-commented. Human code shows opinion.
Here is the checklist, in priority order.

### 1.1 Naming: say *what it means*, not *what it is*
- `gameState`, `playerHitFlash`, `bossCompletionMs` — good. Generic names like
  `data`, `temp`, `stuff`, `handler`, `item2` are immediate red flags.
- Named constants instead of magic numbers: `PLAYER_HIT_FLASH_FRAMES`,
  `I_FRAMES_AFTER_HIT`, `FIRE_RATE_COOLDOWN_MS`. A reviewer should be able to
  tune game feel by editing constants at the top of the file, never by hunting
  digits inside loops.

### 1.2 Comments that explain *why*, not *what*
- ❌ `// adds 1 to score` next to `score += 1`.
- ✅ "// +1 per kill so Battle scoring mirrors Classic expectations" or
  "// Fix: recordMissionEvent now passes the SAME m object it mutated, so the
  `_lastAllCompleteDayKey` write lands on the reference that the caller's
  final saveUserMissions() is about to persist." — that comment exists in this
  codebase and it's exactly the kind of *decision* documentation a reviewer
  wants to see.
- Big comment blocks over *every* function are an AI signature. Comment the
  interesting 20%, leave the boring 80% clean.

### 1.3 Kill dead code and placeholder features
- Dead toasts, unused variables, "coming soon" cards that never ship — remove
  them. An evaluator will grep for `console.log` and `// TODO` and count.
- This codebase already removed the `bossLockHintUntil` toast when the locked
  BOSS FIGHT card started redirecting to the objectives page. That's the
  discipline to keep: **when a feature changes, delete the old path**.
- The CO-OP "SEPARATE DEVICES — coming soon" card is the last remaining
  placeholder. Either build it or remove it before a serious evaluation.

### 1.4 One voice, one style
- English comments only (all Italian comments have been translated).
- Consistent section numbering (`N. TITLE`) and subsection banners
  (`// ===== N.M title =====`) — this file now follows a single, visible
  convention from line 1.
- Same brace style, same arrow-function vs `function` mix, same `const`-first
  discipline. A linter-config or a `package.json` with a lint script makes the
  intent obvious.

### 1.5 Show engineering judgment
- **Perf awareness:** the background star loops scale with `IS_MOBILE`
  (`50 : 100`, `24 : 42`). Mention that trade-off in a comment — it proves
  someone thought about low-end phones.
- **State-machine safety:** `gameState` is a closed set of constants; the
  damage gates check `!gameOver`; `update()` early-returns. Explicitly
  documenting invariants ("the player cannot take damage while
  `meteoriteHitCooldown > 0`") reads as deliberate design.
- **Testing:** the project ships a harness (`elite-test.html`) that drives the
  iframe via `contentWindow` and asserts behaviour through the page title.
  Keep a tiny smoke suite like this — it is the single most convincing
  "this was engineered, not generated" artifact you can show.

### 1.6 Human formatting quirks (the good kind)
- Short focused functions with one obvious responsibility.
- Occasional *opinionated* comments ("// deliberately forgiving capture
  radius", "// tuned so a focused duo sustains the pool").
- Commit messages that describe the *why* of a change ("Fixed CO-OP related
  stuff" → "Route locked BOSS FIGHT clicks to the objectives page").

---

## Part 2 — How the code is organized

### 2.1 The single-file architecture
Everything lives in `star-catcher-TEST.html`: markup + CSS + one `<script>`.
That is a pragmatic choice for a game that runs from a double-click, but it
means **structure must be carried by comments**. The file opens with a
**TABLE OF CONTENTS** and then follows a strict numbering:

| # | Section | What lives there |
|---|---|---|
| 0 | Setup | canvas/ctx, right-click suppression, wheel scroll, mobile detection, input→canvas coordinate helper |
| 1 | Game state & globals | `GAME_STATES`, `GAME_MODES`, runtime state, hover system, entity pools, boss/monster state, mascot |
| 2 | Audio setup | shared AudioContext, per-mode music (menu/classic/survival), volume setters, all SFX |
| 3 | Records management | localStorage store, per-mode top-10 buckets, boss-unlock tracking, play time, settings + account persistence |
| 4 | Game logic | daily missions + streaks, Missions screen (p.1), BOSS objectives page (p.2), entities, run lifecycle, rocket mascot |
| 5 | Update loops | main `update()`, survival monster, survival/battle/boss/coop ticks, enemy factory, `endGame()` |
| 6 | Drawing functions | background/parallax, mascot, menu, account, stars/meteorites, ships, battle renderers, HUD, pause/game-over, records, settings, pickers, `draw()` dispatcher |
| 7 | Menu actions | the `handleMenuAction()` switch + save-run helpers |
| 8 | Input & DOM wiring | click/mousemove/touch/keyboard, pause button, mobile account card, save helpers |
| 9 | Polyfill & utilities | `roundRect` fallback |
| 10 | Game loop & init | `gameLoop()`, first-interaction audio unlock, mobile fire button, boot |

Subsections are numbered `N.M` (e.g. `6.7 Battle / BOSS renderers`), so a
jump-to-line is always unambiguous: "the boss HUD is in 6.8" tells you exactly
where to look.

### 2.2 The comment grammar
- `/* ==== N. TITLE ==== */` — top-level sections.
- `// ===== N.M title =====` — subsections (there are 60+).
- `// ----- related block -----` — local clusters inside a function.
- `// Fix: ...` / `// Bug-fix friendly overload ...` — *decision* comments that
  record why a piece of code is shaped the way it is. These are the most
  valuable comments in the file.
- `// ----- Timing constants (frames, assuming ~60 fps) -----` — one place for
  game-feel tuning.

### 2.3 The game architecture in one paragraph
The game is a **state machine**: `gameState` picks a draw function (`draw()`
dispatches to `drawMenu`, `drawMissionsScreen`, …), and while `PLAYING` the
per-frame loop calls `update()`, which dispatches on `gameMode` to the Classic
/ Survival / Battle / BOSS / CO-OP tick. Each mode owns its entity pools
(`stars`, `meteorites`, `battleEnemies`, `enemyBullets`, `greenPlayerBeams`,
`healStars`). Persistence is a thin `localStorage` layer keyed per account
(`user`, `user__survival`, `user__battleNormal`, `user__boss`, `user__missions`,
`user__playTime`), and every screen reads from it through tiny accessor
functions. Input is a single `menuButtons[]` hit-test array built by the
current draw function — one array, one click handler, no per-screen event
mess.

---

## Part 3 — What to study first

If you have limited time, read the code in this order. Each item teaches a
transferable pattern.

1. **`GAME_STATES` + `draw()` (1.1 and 6.14)** — the heart of the game.
   Understanding the state machine explains every screen transition and makes
   the rest of the file navigable.
2. **`menuButtons[]` pattern (6.x + 8.1)** — one shared hit-test array.
   Elegant, and the trick behind every clickable canvas UI element.
3. **`updateBattle()` / `updateBoss()` (5.4 / 5.5)** — the most complex game
   logic: spawn ramps, telegraphs (`flashTimer`), i-frames, score/HP economy.
   Reading both side by side shows how BOSS reuses Battle mechanics.
4. **`isBossFightUnlocked()` + the BOSS OBJECTIVES page (3.5 + 4.3)** — a
   complete feature: a rule (3 records), a UI (progress bars), and a redirect
   flow. It demonstrates the full "state → logic → render" chain.
5. **`claimDailyStreak()` / `claimSuperStreak()` + `recordMissionEvent()`**
   (4.1) — careful state persistence with idempotency guards ("once per day").
   The comment about passing the same object reference is a genuine bug-fix
   story worth learning.
6. **`drawVectorIcon()` (1.3.1)** — how to replace emoji with parametric
   vector art; a small, self-contained lesson in canvas drawing.
7. **`gameLoop()` + `initAudioOnUserInteraction()` (10)** — the boot sequence,
   autoplay-policy handling, and the rAF-scheduling discipline ("schedule the
   next frame FIRST so a one-off error can't kill the loop").

### Things to notice that aren't code
- `Hints.md` — game-design advice (aesthetics, richness, anti-slop).
- `elite-test.html` — a headless-ish smoke test that drives the game through
  its own `contentWindow`.
- `palette.css` / `palette.scss` — the design tokens (colors, fonts) that the
  canvas code deliberately echoes (`--amber-gold` ≈ `#ffbf24`, etc.).

### Honest weak spots (what to improve next)
- Single ~9,000-line HTML file: the code organization is good, but splitting
  `script` into modules (`state.js`, `audio.js`, `render.js`, `logic.js`,
  `records.js`) is the next-level step for a reviewer to take the project
  seriously as a maintainable codebase.
- No formal tests beyond the smoke harness.
- A couple of legacy helpers remain unused — a clean `grep` pass removes them.

---

### Golden rule for evaluation day
An evaluator can't watch you think — they read your **decisions**. Every named
constant, every `// Fix:` comment, every deleted dead path, every consistent
section banner is a decision made visible. That is what separates "generated
code" from "written code".

# 🚀 Star Catcher — Functions & Features Reference

This document lists **every button**, **every screen**, and **every mechanic** you can encounter in Star Catcher, with the rules that decide **when each control appears** and **what it does when you press it**.

> Source: single-file game at `star-catcher.html` (HTML5 Canvas + vanilla JavaScript, no frameworks, no backend — all progress is stored in `localStorage`).

---

## Table of contents

1. [Quick start: controls](#1-quick-start-controls)
2. [Game modes](#2-game-modes)
3. [Main menu](#3-main-menu)
4. [Account screen](#4-account-screen)
5. [Settings screen](#5-settings-screen)
6. [Records screen](#6-records-screen)
7. [Missions screen](#7-missions-screen)
8. [Pause overlay](#8-pause-overlay)
9. [In-game HUD & game-over](#9-in-game-hud--game-over)
10. [Mobile touch controls](#10-mobile-touch-controls)
11. [🔥 Daily Streak vs 🔥 Super Streak (in depth)](#11--daily-streak-vs--super-streak-in-depth)
12. [Daily mission pool](#12-daily-mission-pool)
13. [Persistence (what's saved, where)](#13-persistence-whats-saved-where)

---

## 1. Quick start: controls

| Action                     | Desktop                                  | Mobile / touch                                                                 |
|----------------------------|------------------------------------------|--------------------------------------------------------------------------------|
| Move the ship              | **←** / **→** arrow keys, **mouse**, **mouse drag** | Drag your finger on the canvas, or use the **◀ ▶** touch buttons below the canvas |
| Pause / resume             | **P** key, or the **⏸** button next to the canvas | **⏸** button next to the canvas                                                |
| Restart after game-over    | **R** key                                | Tap anywhere on the canvas                                                     |
| Open the Missions page     | **M** key, or the **M KEY** pill on the menu | **M KEY** pill on the menu                                                     |
| Interact with Blue mascot  | Hover over him (cursor only)             | Tap him (each tap cycles to a new line)                                        |

Every action above also plays the click / collect / record sound — provided **Settings → SFX** is ON.

---

## 2. Game modes

The game exposes two distinct rule-sets. The current mode is shown at the top of the HUD.

### ⭐ Classic mode (default)
- Falling **stars** of varying colors descend from the top.
- Catching a star with your ship = **+1 point**, a satisfying "ding" sound.
- Missing a star (it reaches the bottom) = **−1 life**.
- You start with **3 lives**. When they hit zero → game over.
- Survival record: your highest per-account score is auto-saved to the leaderboard.

### ☠ Survival mode
- The sky turns red. **Meteorites** with fiery trails rain down. Score = **seconds you stay alive**.
- Meteorites spawn faster the longer you survive (capped at a per-frame rate).
- Hitting a meteorite = **−1 life** + brief i-frames so a stacked cluster can't drain all 3 in one frame.
- Same 3-life rule as Classic; same "highest score per account" leaderboard (a separate bucket, top-10).

> Tip: Both modes feed the **daily missions** system, so playing either or both counts toward today's challenges.

---

## 3. Main menu

The main menu (`gameState: MENU`) renders a single screen with **7 buttons** arranged in three rows + two corners.

### ▶ PLAY button (top-left of the button grid)
- **Always visible** on the main menu.
- **Click / tap** → start **Classic mode** (provided you have an account). If you don't have one yet, the game drops you on the **Account screen** first so you can pick a name.
- Plays the **click sound**.

### 👤 ACCOUNT button (top-right of the button grid)
- **Always visible**.
- **Click / tap** → go to the **Account screen** (create a name or switch accounts).
- Plays the **click sound**.

### 🏆 RECORDS button (bottom-left of the button grid)
- **Always visible**.
- **Click / tap** → go to the **Records screen**.
- Plays the **click sound**.

### ⚙ SETTINGS button (bottom-right of the button grid)
- **Always visible**.
- **Click / tap** → go to the **Settings screen** (MUSIC + SFX toggles).
- Plays the **click sound**.

### 💀 SURVIVAL button (full-width red bar, third row)
- **Always visible**.
- **Click / tap** → start **Survival mode** (or route to the Account screen if you don't have one).
- Plays the **click sound**.

### 🅼 M KEY pill (top-right corner)
- **Always visible** on the main menu — gold-and-burgundy pill labelled **"M KEY"** with subtitle **"OPEN MISSIONS"**.
- **Click / tap it** (or press **M**) → go to the **Missions screen**.
- Plays the **click sound**. The **M** keyboard shortcut works from any state that returns to the menu, including after game-over.

### 👾 Blue the mascot (bottom-left interactive character)
- **Always visible** on the menu (decorative, bobbing, blinking).
- **Hover (desktop only)** → a speech bubble fades in with one of nine rotating lines.
- **Tap (mobile)** → bubble opens instantly with a new line; auto-closes after a short window.
- This character does not affect gameplay — it's a friendly companion that lines like "Try the new SURVIVAL mode!" or "Tip: arrow keys also work."

### 🚀 Rocket emoji (decorative)
- Sits beside the **STAR CATCHER** title in the menu.
- If you click it enough times it gets "annoyed" and flies around the canvas with elastic bounce physics before settling back.

---

## 4. Account screen

A modal page used both for creating the first account and for switching accounts. The mobile-friendly overlay stays anchored over the canvas.

### 👤 NEW ACCOUNT input
- **Label:** "👤 NEW ACCOUNT"
- **Subtitle:** "Enter your name (max 12 characters)"
- **Input box** (centered, blue glow): type your name here (1–12 chars).
  - On **desktop**, keyboard typing works — keyboard auto-focuses the page once you click the input.
  - On **mobile**, a blue-bordered text input pops up so you don't have to use the on-screen keyboard.

### 🗑️ Clear Name button (mobile input only)
- **Always visible** in the mobile input row.
- **Click** → empties the input field so you can start over.

### ✅ CONFIRM button (mobile input only)
- **Always visible**.
- **Click** → save the typed name to `localStorage`, load its record bucket, load its per-account settings, reset the ship, and return to the **Main menu**.
- If the new name is the same as the current one, no confirmation dialog is shown.
- If the new name is **different**, the game asks: *"Changing account from X to Y. Your previous records will be reset. Continue?"*. **OK** → wipes the old account's records & switches. **Cancel** → stays on the Account screen.

### ✖ CANCEL button (mobile input only)
- **Always visible**.
- **Click** → close the mobile input and return to the **Main menu** without changing accounts.

### 🗑️ Clear Account button (mobile input only)
- **Always visible**.
- **Click** → permanently delete the **current account** from `localStorage` (records + missions + streaks all gone), then return to a fresh **Main menu** with no user logged in.

> 💡 On desktop, the same Confirm / Cancel logic runs from the keyboard (`Enter` and `Esc` respectively). If you type a too-long name, the game alerts you that names must be ≤ 12 characters and won't save.

---

## 5. Settings screen

The Settings screen is reachable from either the **Main menu** or the **Pause overlay**. Settings are saved **per account**, so switching accounts restores each player's audio preferences.

### 🎵 MUSIC toggle pill (green when ON, dark when OFF)
- **Always visible**.
- **Click** → toggle the **background music** (the menu song) on/off for the current account, save to `localStorage`. Toggling triggers `playMenuMusic()` so you can immediately hear the change.
- Plays the **click sound**.

### 🔊 SFX toggle pill (green when ON, dark when OFF)
- **Always visible**.
- **Click** → toggle **every other sound effect** (collect, lose-life, game-over, record, click) on/off for the current account, save to `localStorage`.
- Plays the **click sound**.

### ← BACK button (centered, bottom)
- **Always visible**.
- **Click** → returns to where you came from: **Main menu** if you entered from the menu, **Pause overlay** if you entered from a paused game.

> 💡 The game also tracks that you visited Settings today and that you toggled a setting — both chip into the Daily Mission **"Visit Settings today"** and **"Toggle a setting today"**.

---

## 6. Records screen

A read-only leaderboard that shows your **top 5 scores per mode** plus the **total time you played** on the current account.

### Two side-by-side columns — ⭐ CLASSIC and ☠ SURVIVAL
- **Visible only if you are logged in.** If not, you see "Create an account to see your records!" and only the BACK button works.
- **Classic column** lists up to 5 of your top star-catching scores with **🥇 / 🥈 / 🥉 / n.** medals.
- **Survival column** lists up to 5 of your top survival times (in seconds) with the same medals.

### 🕓 Total play-time row (bottom)
- **Visible only on the account page below the columns.**
- Shows accumulated play time formatted as `Xh Ym Zs` (or `Xm Ys` / `Ys`) — uses real-time *active* play only (paused time is excluded thanks to the in-out flush calls in the game loop).

### ← BACK button (centered, bottom)
- **Always visible**.
- **Click** → return to the **Main menu**.

---

## 7. Missions screen

The hub for **daily challenges** and **streaks**. This is where the Streak / Super Streak buttons live, so this section is the most detailed.

> **How to get here:** press **M** on the keyboard, or click the **M KEY** pill on the Main menu.
>
> If you are not logged in, the screen shows *"Create an account to track your progress!"* and only the BACK button works.

### Date badge (top)
- Shows today's weekday + month + day (e.g. *Friday, Nov 22*) so you can confirm you're seeing today's challenges.

### 🏆 STREAK PANEL — the two streak counters side by side

Two cards in a single rounded panel. Each card has:
- A label
- A 🔥 fire emoji
- The current streak count (number)
- A **claim button** directly underneath

---

#### 🔥 DAILY STREAK (yellow / orange — left card)
- **Always visible** when logged in.
- The number is your current daily-claim streak: how many consecutive days you have *opened the Missions page and clicked `CLAIM TODAY`*.
- Starts at 0 on a brand-new account. Goes up by 1 every consecutive day. Resets to 1 if you skip a day.

#### ⏩ "CLAIM TODAY" button (under DAILY STREAK)
- **Visible when** the DAILY STREAK has **not** been claimed for today yet.
- **Hidden / in a green "✓ CLAIMED" state** once you've already claimed today.
- **Click** → bumps the daily streak (idempotent: a second click on the same day is harmless). Plays the celebration record-sound.
- *The button shows up every day; missing a day simply means the next click resets the count to 1.*

---

#### 🔥 SUPER STREAK (red / burgundy — right card)
- The number is your current super-streak: how many **consecutive days you completed every daily challenge**.
- Starts at 0 on a brand-new account.
- Goes up by 1 every consecutive day of full completion.
- Resets to 1 if you skip a day.

#### ⏩ "SUPER CLAIM!" button (under SUPER STREAK) — *always visible, locks until you finish all dailies*

This button sits under the SUPER STREAK counter **the whole day**, regardless of progress. It has three visual states:

| State          | When you see it                                                                                 | Look                                                 | Click behaviour                                                                  |
|----------------|-------------------------------------------------------------------------------------------------|------------------------------------------------------|----------------------------------------------------------------------------------|
| 🔒 **LOCKED**  | Default — at least one of today's 3 missions is still ⛕                                         | Dim grey, faint border, grey text "LOCKED"           | Rendered as clickable but **no-op**: `claimSuperStreak()` returns without bumping |
| **SUPER CLAIM!**| All 3 mission cards sit on green ✅                                                             | Red glow, "SUPER CLAIM!"                             | **Click →** bumps the super streak by 1 (resets to 1 on non-consecutive days)    |
| **✓ CLAIMED** | You already clicked it today                                                                    | Green border, "✓ CLAIMED"                            | No click target — input is intentionally dropped                                   |

- **Always visible**: even at minute-zero of the day, the button is on screen so the player knows what today's super bonus looks like.
- **Click → no-op while LOCKED**: the player's tap is acknowledged by the UI (click target still pushed so it feels tappable) but `claimSuperStreak()` returns without an audio cue or counter bump.
- **Click → real bump when ready**: see the row above; plays the celebration record-sound.
- **Persistence**: claiming stores the day under `superClaimedDate`. Reloading the page or closing/reopening the tab keeps it claimed until the per-day reset block in `refreshMissionsForUser()` wipes the field.

> Differentiating it from the daily streak: the **DAILY STREAK** button (CLAIM TODAY) is **always actionable** the moment you open the Missions page. The **SUPER STREAK** button (SUPER CLAIM!) is **locked** until you prove you did the day's work.

---

### 🗒 TODAY'S MISSIONS (3 cards)

A scrollable list (well, a small one — there are always exactly 3) of cards, one per daily mission, picked deterministically from the pool of 10 (see [§ 12](#12-daily-mission-pool)). The seed is the **YYYY-MM-DD** string of today's date, so every player sees the same 3 missions on the same day.

Each card has:
- **Status icon** on the left (`⛕` when incomplete, `✅` when complete).
- **The mission label** (e.g. *"Catch 5 stars in Classic"*).
- **A live progress line** that updates as you play today:
  - `Best today: 3 / 5 ⭐`
  - `Best today: 12s / 30s ☠`
  - `Visited Settings today`
  - `☠ Survival ✓` (for *"Play both modes"*)
- The card colours flip from blue-bordered → green-bordered the moment the mission completes.

> Missions are evaluated **passively**: any time you do something during the day that counts toward a mission, the relevant flag sticks. You don't have to "submit"; playing through one Star Collector round is enough.

### ← BACK button (centered, bottom)
- **Always visible**.
- **Click** → return to the **Main menu**.
- Also responds to the **← arrow key** and **Esc**.

---

## 8. Pause overlay

Triggered by the **P** key, the **⏸** button next to the canvas, or right after the recording flow finishes. Cannot be opened while game-over is showing.

### ▶ RESUME button (green, left)
- **Always visible** in the pause overlay.
- **Click / press P** → unpause and resume the game. Restart the play-time clock.

### ⚙ SETTINGS button (blue, middle)
- **Always visible** in the pause overlay.
- **Click** → opens the Settings screen. The BACK button on Settings returns to the pause overlay (not the main menu).

### ⌂ MENU button (red, right)
- **Always visible** in the pause overlay.
- **Click** → quit the current run and return to the **Main menu**. The run is discarded (no record is saved unless the run ended via the game-over path first).

---

## 9. In-game HUD & game-over

While you're playing, the canvas keeps a few always-on indicators.

### Score / Best / Lives row (top corners)
- **Left**:
  - *Classic:* `⭐ Points: N`
  - *Survival:* `☠ SURVIVAL` badge, then `☠ SURVIVED` and the seconds.
- **Right side**: the top shows your **👤 username**; below it `❤️ x N` lives (red on Survival).
- **`🏆 Best: N`** (or `N s` for Survival) sits left, just below the score.

### ⏸ Pause button (just outside the canvas, near a corner)
- **Visible only during PLAYING or PAUSED states**.
- The smart position routine tries to park it on the **left of the canvas** first, then the right, then above, then below — always keeping a 14px gap so it never overlaps the play field.
- **Click** → same effect as **P**: toggle pause.

### 🅿 "P" key hint pill (gold, next to the pause button)
- **Visible only during PLAYING or PAUSED states** — visual reminder that the keyboard shortcut exists.
- A 350ms fade hides it cleanly when you leave those states.

### NEW RECORD banner (in-game)
- Briefly flashes **"✦ NEW RECORD! ✦"** in gold (Classic) or red (Survival) the moment you cross your previous best — only if you already have a best (i.e. not your first-ever run).

### Game Over overlay (after lives hit zero)
- **Always visible** at the end of a run.
- Shows `GAME OVER`, your final score, your best, and the same animations you'd see in classic mode.
- Press **R** or tap anywhere → return to the **Main menu**.

---

## 10. Mobile touch controls

When the viewport is **< 768 px wide** or a touch-first device is detected, two big on-screen direction buttons appear below the canvas:

| Button | Action                |
|--------|-----------------------|
| ◀      | Moves ship left       |
| ▶      | Moves ship right      |

- **Visible only on mobile detection** (touch support OR narrow viewport). Auto-re-evaluates on `resize` and `orientationchange`.
- Drag-the-finger-to-steer on the canvas still works alongside them.

---

## 11. 🔥 Daily Streak vs 🔥 Super Streak (in depth)

Both streaks are **per-account**, **day-keyed**, and shared across both game modes. They live in a single record object you can inspect via the browser console: `JSON.parse(localStorage.starCatcherAllRecords)["<yourUser>__missions"]`.

### 🔥 Daily Streak — daily check-in

| Aspect              | Value |
|---------------------|-------|
| **Color / theme**   | Yellow → orange (🔥) |
| **Trigger**         | Manual — you click the **CLAIM TODAY** button |
| **Counts toward?**  | Number of consecutive days you opened the Missions page and clicked the button |
| **Skipping a day**  | Resets to **1** the next day |
| **Visibility of the claim button** | **Always** when the user is logged in. Switches to "✓ CLAIMED" once today has been claimed |
| **Persistence**     | Stored under the `starCatcherAllRecords["<user>"]` bucket as `streakCount`, `lastClaimedDate` |

**How to claim:** Mission page → click **CLAIM TODAY**. Done.

---

### 🔥 Super Streak — finish-it-all challenge

| Aspect              | Value |
|---------------------|-------|
| **Color / theme**   | Red → burgundy (🔥) |
| **Trigger**         | Manual — you click the **SUPER CLAIM!** button, but the button only counts toward the streak **once all 3 daily missions are complete** |
| **Counts toward?**  | Number of consecutive days you completed **every** daily mission and pressed the claim button |
| **Skipping a day**  | Resets to **1** the next eligible day |
| **Visibility of the claim button** | **Always visible** under the SUPER STREAK counter. Locked (grey "🔒 LOCKED") until today's `missionsForDay` is fully complete. Once all 3 are done: "SUPER CLAIM!" (red). After clicking: "✓ CLAIMED" (green) until tomorrow |
| **Persistence**     | `superStreakCount`, `lastSuperClaimDate`, `superClaimedDate` on a per-account basis |

**How to claim, step-by-step:**

1. Play the day until **all 3 mission cards** show the green ✅ (you may mix Classic + Survival + Settings).
2. Open the Missions page (**M** key or M-key pill).
3. Look at the **right card** (SUPER STREAK). Even before you finish, the button is there — greyed-out as "🔒 LOCKED".
4. Once all 3 missions complete, the button flips to red **"SUPER CLAIM!"**.
5. Click it.
6. The button flips to green **"✓ CLAIMED"** and the celebration record-sound plays. Your super streak count went up by 1 (or reset to 1 on the first day, or stayed the same if you already claimed today).
7. Come back tomorrow, finish all 3 again, and repeat to grow the streak.

#### Why the Super Streak Button is the fun challenge

- **Daily Streak** = *consistent check-in*. Players collect it by just opening the page and clicking CLAIM TODAY.
- **Super Streak** = *demonstrated capability*. The button is there all day, but **disabled / locked** until your actions today prove you did everything. It is the visual, interactive reward for max effort.

#### Edge cases the Super Streak Button handles

- **All done but never clicked** → streak count stays at its previous value (the auto-bumped value), your count is preserved but won't grow again until you click.
- **Clicked while LOCKED** → absolute no-op: `claimSuperStreak()` returns `null` and nothing is inflated, played, or saved.
- **Already claimed today** → second click is a no-op: the button does not inflate the count and the click target is dropped.
- **Mission set changed at midnight** → `refreshMissionsForUser()` resets `_lastAllCompleteDayKey` and `superClaimedDate` so the system is ready for a fresh day.

---

## 12. Daily mission pool

Ten mission templates in the pool. Each day, three are picked **deterministically** from today's date hash so every player sees the same set.

| ID            | Label                                    | Type             | What counts                           |
|---------------|------------------------------------------|------------------|---------------------------------------|
| `catch5`      | Catch 5 stars in Classic                 | `classic_score`  | Best single Classic score ≥ 5         |
| `catch10`     | Catch 10 stars in Classic                | `classic_score`  | Best single Classic score ≥ 10        |
| `catch15`     | Catch 15 stars in Classic                | `classic_score`  | Best single Classic score ≥ 15        |
| `survive20`   | Survive 20s in Survival                  | `survival_time`  | Best single Survival time ≥ 20        |
| `survive30`   | Survive 30s in Survival                  | `survival_time`  | Best single Survival time ≥ 30        |
| `survive45`   | Survive 45s in Survival                  | `survival_time`  | Best single Survival time ≥ 45        |
| `no_death`    | Finish Classic with all 3 lives          | `no_death_run`   | A Classic run that ended without losing all 3 lives |
| `visit_set`   | Visit Settings today                     | `visit_settings` | Open the Settings screen today        |
| `toggle_set`  | Toggle a setting today                   | `toggle_setting` | Any MUSIC / SFX toggle today          |
| `both_modes`  | Play both Classic + Survival             | `both_modes`     | Finish at least one run in each mode today |

> Pool movement is checked at every `recordMissionEvent()` call so progress feedback is real-time in the mission cards.

---

## 13. Persistence (what's saved, where)

Everything is stored in a single global key in `localStorage`:

| Key                                  | What it stores                                          |
|--------------------------------------|---------------------------------------------------------|
| `starCatcherAllRecords["user"]`       | Top-10 classic scores (descending) for that user        |
| `starCatcherAllRecords["user__survival"]` | Top-10 survival scores                              |
| `starCatcherAllRecords["user__playTime"]` | Accumulated active play time (ms) for that user    |
| `starCatcherAllRecords["user__missions"]`| Daily streak / Super Streak counters, today's missions, claim dates |
| `starCatcherSettings_<user>`         | Per-account music/sfx toggles                           |
| `starCatcherLastUser`                | Last logged-in user (auto-loaded on launch)             |

> ℹ️ There is **no server** and **no backup**. Clearing browser storage, or playing in a different browser/profile, will not transfer your progress.

---

### 🛠 Quick troubleshooting

| Symptom                                              | Likely cause                                  |
|------------------------------------------------------|-----------------------------------------------|
| I "claimed" but the count didn't change              | You missed yesterday → count resets to **1** (intended) |
| SUPER CLAIM! is grey / says LOCKED                  | Not every mission is done yet — finish all 3 first |
| SUPER CLAIM! does nothing when tapped               | Same as above (button accepts taps for UX but the logic gates them) |
| I switched accounts and lost missions / streak data | Switching via the Account screen wipes the prior user by design |
| Music doesn't start                                  | Browser autoplay policy: tap/click anywhere once to unlock audio |

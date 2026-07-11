# 🚀 Star Catcher
A small space arcade game built with **HTML5 Canvas** and **vanilla JavaScript** — no external libraries or frameworks: pilot your ship, catch the falling stars, and don't let too many slip by.
<img width="881" height="640" alt="image" src="https://github.com/user-attachments/assets/e358c3a1-4dc9-4cdd-8ae3-84296ecd969d" />

## ✨ Features

- 🎮 **Classic arcade gameplay** — catch falling stars by moving your ship horizontally
- 👤 **Local accounts** — create a player profile saved in the browser, with a personal high-score leaderboard
- 🏆 **High score tracking** — your best scores are automatically saved for each account
- 🔊 **Hybrid audio system** — sound effects generated procedurally via the Web Audio API (no assets to download), plus dedicated audio files for the collect sound and background music
- ⏸️ **Dedicated pause button** — in addition to the keyboard shortcut
- 📱 **Desktop and mobile controls** — keyboard and mouse on desktop, on-screen touch controls below 768px width
- 🎨 **Sci-fi UI** — Orbitron font, blue/neon palette, animated menu

## 🎮 How to play

- Move your ship to intercept the stars falling from the top: each star caught is worth **+1 point**
- You have **3 lives**: every star that reaches the bottom of the screen without being caught costs you one
- The game ends when your lives reach zero; if your score beats a previous personal record, it's saved automatically

## 🕹️ Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move the ship | **←** **→** arrow keys, or mouse click/drag | Drag your finger on the screen, or use the **◀ ▶** buttons |
| Pause / Resume | **P** key, or the ⏸ button top-right | ⏸ button top-right |
| Restart (after game over) | **R** key | Tap the screen |

## 🛠️ Tech stack

- **HTML5 Canvas** for game rendering (800×600px)
- **Vanilla JavaScript** — no external dependencies
- **Web Audio API** for synthesized sound effects (beeps, notes, arpeggios)
- **localStorage** for account and high-score persistence, with no server/backend required
- **Google Fonts (Orbitron)** for the sci-fi typography

## 📁 Project structure

```
star-catcher/
├── star-catcher.html                      # markup, styling, and game logic in a single file
├── menu-song.mp3                          # main menu background music
├── paulyudin-synth-pop-Classic-Mode.mp3   # background music while playing Classic mode
└── README.md                              # the README.md
```

> Both audio files must be located in the **same folder** as `star-catcher.html`. (The Classic-mode track plays automatically during Classic Mode runs and is controlled by a dedicated **🎵 CLASSIC MUSIC** toggle in Settings, independent from the main-menu 🎵 MUSIC toggle — each one mutes exactly its own song.)

## 🚀 Running the game

Some browsers block loading local audio files when the HTML is opened directly from disk (`file://`). For a smooth experience, serve the folder with a small local server:

```bash
python3 -m http.server
```

then open [http://localhost:8000/star-catcher.html](http://localhost:8000/star-catcher.html) in your browser.

Alternatively, you can simply double-click `star-catcher.html` to open it: the game remains fully playable, with at most some audio limitations depending on the browser.

## 🎧 Credits

- Menu music — **PaulYudin**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)
- Classic-mode music — **PaulYudin**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)

## 📄 License

Distributed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Bug reports, ideas, and pull requests are welcome! Feel free to open an issue in the repository to discuss them.
ng README.en.md…]()
## 📱 Playing on a phone

The game is a single-file HTML5 Canvas app with one optional audio
asset, so it ships to a phone with zero install steps. Below are the
recipes that actually work today.

### A. Static hosting (easiest, no build)

1. Upload the project folder to any static host (GitHub Pages,
   Netlify Drop, Cloudflare Pages, Vercel, or a self-hosted nginx).
   Three files are needed:
   - `star-catcher.html`
   - `menu-song.mp3`
2. Open the deployed URL in the phone's browser (Safari on iOS or
   Chrome on Android).
3. Tap the browser's Share / menu button and choose **Add to Home
   Screen** to install it as a full-screen PWA-style app icon.

### B. Quick local Wi-Fi share (anyone on the same router)

From the project folder on the laptop, run any tiny static server:
```bash
npx http-server -p 8000      # or:  python3 -m http.server 8000
```
Look up the laptop's local IP (`ipconfig getifaddr en0` on macOS,
`ipconfig` on Windows, `hostname -I` on Linux) — it will look like
`192.168.1.42`. On the phone, open `http://192.168.1.42:8000/star-catcher.html`
in the browser.

### C. GitHub Gist trick (zero infrastructure)

Paste the full contents of `star-catcher.html` into a public GitHub
Gist (`star-catcher.html`). Append `?raw=true` or use a service such
as `htmlpreview.github.io` to render the gist as an HTML page, then
open that page on the phone.

---

### Mobile controls

- **Move the ship**: drag your finger on the canvas, or use the big
  **◀ ▶** buttons that appear below the canvas on screens narrower
  than 768 px.
- **Pause / resume**: tap the **⏸** button in the top-left corner.
- **Restart after game over**: tap anywhere on the canvas (or press
  **R** if you have a keyboard paired with the phone).
- **Blue the mascot**: tap him on the menu screen — he'll say a new
  line each tap so you can read several in a row.

### Audio notes (important on phones)

Browsers on iOS and Android **block autoplay** of any audio until the
user interacts with the page. Star Catcher handles this automatically:

- The first tap / click / keypress unlocks the Web Audio context.
- ~1 second later the menu music starts playing.
- **⚙ Settings** now exposes **three** audio toggles, each saved
  per-account:
  - **🎵 MUSIC** — main-menu song
  - **🎵 CLASSIC MUSIC** — background song during Classic Mode gameplay
  - **🔊 SFX** — every other in-game sound effect (collect, lose-life,
    game-over, record, click)

### Performance notes

Mobile mode is detected automatically by checking for touch support
and viewport width. When the device looks like a phone:

- Background twinkles drop from 100 → 50 stars.
- Meteorite cap drops from 40 → 25 per frame.
- Meteorite glow shadows are skipped (the most expensive per-rock
  op-canvas cost).
- Survival-mode red scanlines use a wider stride.

If the game still feels slow, switch to a simpler browser, disable
background apps, or lower the device's screen brightness.

### Gotchas

- Some Android browsers aggressively throttle `requestAnimationFrame`
  when the tab is in the background — switch to the game tab before
  measuring FPS.
- Audio cues may have a short delay on the very first interaction;
  this is normal while the Web Audio context initialises.
- The mobile account input opens over the canvas; if you accidentally
  hit it, tap **✖ CANCEL** to go back to the menu.

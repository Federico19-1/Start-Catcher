# 🚀 Star Catcher
A small space arcade game built with **HTML5 Canvas** and **vanilla JavaScript** — no external libraries or frameworks. Pilot your ship in Classic Mode to catch the falling stars, or switch to Survival Mode and stay alive as long as possible.
<img width="881" height="640" alt="PERFECT MENU" src="https://github.com/user-attachments/assets/9d9db6d9-2ebb-4892-b8c4-707625b21a9b" />


## ✨ Features

- 🎮 **Two game modes** — Classic Mode for star-catching score runs, Survival Mode for meteorite dodging and time-based runs
- 👤 **Local accounts** — create a player profile saved in the browser, with per-account records and settings
- 🏆 **High score tracking** — your best Classic and Survival results are saved automatically for each account
- 🔊 **Hybrid audio system** — procedural Web Audio SFX, three bundled music tracks (menu, Classic, Survival), and a collect-sound fallback that can use `star-sound.txt` if you add it
- ⏸️ **Dedicated pause button** — in addition to the keyboard shortcut
- 📱 **Desktop and mobile controls** — mouse on desktop, on-screen touch controls and canvas drag below 768px width
- 🎨 **Sci-fi UI** — Orbitron font, blue/neon palette, animated menu

## 🎮 How to play

- **Classic Mode**: catch the falling stars. Each catch is worth **+1 point**, and every missed star costs one of your **3 lives**.
- **Survival Mode**: avoid the falling meteorites for as long as you can. Your score is the time you survive in seconds.
- If a run beats a previous personal record, the game saves it automatically.

## 🕹️ Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move the ship | Mouse click/drag | Drag your finger on the screen |
| Pause / Resume | **P** key, or the ⏸ button alongside the canvas | ⏸ button alongside the canvas |
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
├── desifreemusic-comedy-shock-amp-embarrassment-sudden-realization-music-SurvivalMode.mp3
│                                          # background music while playing Survival mode
└── README.md                              # project documentation
```

> All three MP3 files must live in the **same folder** as `star-catcher.html`. If you also want the collect sound to load from a file instead of the built-in fallback, place `star-sound.txt` next to the HTML too. Otherwise, the game synthesizes that sound in-browser.

## 🚀 Running the game

Some browsers block loading local audio files when the HTML is opened directly from disk (`file://`). For the full experience, serve the folder with a small local server:

```bash
python3 -m http.server
```

Then open [http://localhost:8000/star-catcher.html](http://localhost:8000/star-catcher.html) in your browser.

You can also double-click `star-catcher.html` to open it directly. The game still runs, but music loading and autoplay behavior may depend on the browser.

## 🎧 Credits

- Menu music — **PaulYudin**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)
- Classic-mode music — **PaulYudin**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)
- Survival-mode music — **DesiFreeMusic**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)

## 📱 Playing on a phone

Star Catcher is fully playable on phones. Use the on-screen controls, and keep in mind that mobile browsers usually block audio until the first tap or click.

### Mobile controls

- **Move the ship**: drag your finger on the canvas.
- **Pause / resume**: tap the **⏸** button alongside the canvas.
- **Restart after game over**: tap anywhere on the canvas (or press **R** if you have a keyboard paired with the phone).
- **Blue the mascot**: tap him on the menu screen — he'll say a new line each tap so you can read several in a row.

### Audio notes

- The first tap / click / keypress unlocks the Web Audio context.
- About 1 second later the menu music starts playing.
- **⚙ Settings** exposes four audio toggles, each saved per account:
  - **🎵 MUSIC** — main-menu song
  - **🔊 SFX** — every other in-game sound effect (collect, lose-life, game-over, record, click)
  - **⭐ CLASSIC MUSIC** — background song during Classic Mode gameplay
  - **☠ SURVIVAL MUSIC** — background song during Survival Mode gameplay

### Performance notes

Mobile mode is detected automatically by checking for touch support and viewport width. When the device looks like a phone:

- Background twinkles drop from 100 → 50 stars.
- Meteorite cap drops from 40 → 25 per frame.
- Meteorite glow shadows are skipped.
- Survival-mode red scanlines use a wider stride.

## 📄 License

Distributed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Bug reports, ideas, and pull requests are welcome! Feel free to open an issue in the repository to discuss them.

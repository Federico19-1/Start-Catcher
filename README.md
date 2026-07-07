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
├── star-catcher.html   # markup, styling, and game logic in a single file
├── menu-song.mp3       # main menu background music
└── README.md           # the README.md
```

> Both audio files must be located in the **same folder** as `star-catcher.html`.

## 🚀 Running the game

Some browsers block loading local audio files when the HTML is opened directly from disk (`file://`). For a smooth experience, serve the folder with a small local server:

```bash
python3 -m http.server
```

then open [http://localhost:8000/star-catcher.html](http://localhost:8000/star-catcher.html) in your browser.

Alternatively, you can simply double-click `star-catcher.html` to open it: the game remains fully playable, with at most some audio limitations depending on the browser.

## 🎧 Credits

- Menu music — **PaulYudin**, from [Pixabay](https://pixabay.com/) (Pixabay Content License, free to use)

## 📄 License

Distributed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Bug reports, ideas, and pull requests are welcome! Feel free to open an issue in the repository to discuss them.
ng README.en.md…]()

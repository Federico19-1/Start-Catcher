# Star Catcher

Star Catcher is a small browser arcade game built with HTML5 Canvas and vanilla JavaScript. I kept it in a single HTML file on purpose: it is easy to open, easy to edit, and does not need a framework or a backend.

You can play two different modes. In Classic mode you catch falling stars and try to push your score as high as possible. In Survival mode you dodge meteorites and see how long you can stay alive.

<img width="881" height="640" alt="image" src="https://github.com/user-attachments/assets/e358c3a1-4dc9-4cdd-8ae3-84296ecd969d" />

## What is in the game

- Classic mode with a combo chain, so consecutive catches matter more than just raw survival.
- Lucky stars that appear less often and give a bigger reward when you catch them.
- Survival mode with time-based scoring and a harder dodge pattern.
- Local accounts saved in the browser, including records, settings, missions, and play time.
- Daily missions and streaks for a reason to come back tomorrow.
- Music and sound effects built directly into the project, with separate volume controls.
- Mouse, touch, and keyboard controls so it works on desktop and mobile.

## How to play

- Classic mode: catch the stars, keep your lives alive, and build a combo.
- Survival mode: avoid the meteorites as long as you can. Your score is the number of seconds you survive.
- Lucky stars are worth more and can refill a heart if you are missing one.
- Scores and settings are stored per account in the browser.

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move the ship | Mouse move / drag over the canvas | Drag your finger on the canvas |
| Pause / resume | P key or the pause button | Pause button beside the canvas |
| Restart after game over | R key | Tap the screen |
| Open missions | M key from the menu | Missions button in the menu |

## Run locally

The game can be opened directly, but audio works better when the folder is served locally. From the project directory, run:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/star-catcher.html` in your browser.

If you double-click the HTML file, the game still runs, but some browsers may block local audio files until the page is served.

## Project files

- `star-catcher.html` - markup, CSS, and game logic in one file
- `menu-song.mp3` - menu music
- `paulyudin-synth-pop-Classic-Mode.mp3` - Classic mode music
- `desifreemusic-comedy-shock-amp-embarrassment-sudden-realization-music-SurvivalMode.mp3` - Survival mode music
- `README.md` - this guide

All three MP3 files need to stay in the same folder as `star-catcher.html`. If you also add `star-sound.txt`, the collect sound will use that file; otherwise the game falls back to a generated sound.

## Tech

- HTML5 Canvas for rendering
- Vanilla JavaScript for gameplay and UI
- Web Audio API for sound effects
- localStorage for account data, settings, records, and missions

## Credits

- Menu music by PaulYudin on Pixabay
- Classic mode music by PaulYudin on Pixabay
- Survival mode music bundled with the project

## License

No separate license file is included in this workspace yet.

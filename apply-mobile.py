"""Mobile-adaptation patches for star-catcher.html.

Implements:
  1. Responsive canvas CSS so the page scales on a phone while
     keeping the 4:3 aspect ratio.
  2. IS_MOBILE flag + getGameCoords helper that maps CSS pixels back to
     the internal 800x600 coordinate space.
  3. Updated click + mousemove + touch handlers using the scaled coords.
  4. Blue mascot speaks on tap (mobile-only path) with a small
     timestamp-driven decay so the bubble stays long enough to read.
  5. Performance reductions on mobile: fewer background twinkles,
     tighter meteorite cap, no shadow-blur for meteorites, wider
     scanline spacing in the survival overlay.
  6. README.md gets a "Playing on a phone" section appended.
"""
import os

# --------------------------------------------------------------------------
# 1) Update CSS -> responsive canvas
# --------------------------------------------------------------------------
with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

css_old = """        canvas {
            border: 2px solid #4a4a8a;
            border-radius: 10px;
            box-shadow: 0 0 40px rgba(74, 74, 138, 0.5);
            cursor: pointer;
            touch-action: none;
            user-select: none;
        }"""
css_new = """        canvas {
            border: 2px solid #4a4a8a;
            border-radius: 10px;
            box-shadow: 0 0 40px rgba(74, 74, 138, 0.5);
            cursor: pointer;
            touch-action: none;
            user-select: none;
            /* Mobile-friendly: shrink the canvas inside the viewport while
               keeping the 4:3 aspect ratio of the internal grid. */
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }"""
if css_old in content:
    content = content.replace(css_old, css_new)
    print('OK: responsive canvas CSS')

# Slightly relax the body so the canvas sits centred with no extra
# margins pushing it off-screen on small phones.
body_old = """        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #0a0a1a;
            font-family: 'Orbitron', sans-serif;
            overflow: hidden;
            user-select: none;
        }"""
body_new = """        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #0a0a1a;
            font-family: 'Orbitron', sans-serif;
            overflow: hidden;
            user-select: none;
            /* Phone-friendly: leave room for the address bar to appear
               and disappear without re-flowing the canvas. */
            padding: 8px;
            box-sizing: border-box;
        }"""
if body_old in content:
    content = content.replace(body_old, body_new)
    print('OK: padding + box-sizing on body')

# --------------------------------------------------------------------------
# 2) IS_MOBILE constant + getGameCoords helper, just after canvas/ctx.
# --------------------------------------------------------------------------
setup_old = """        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');"""
setup_new = """        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Detect a touch-first device or narrow viewport once on boot —
        // used to dial back background / overlay work on phones.
        const IS_MOBILE = ('ontouchstart' in window || navigator.maxTouchPoints > 0)
            || window.innerWidth <= 768;

        // Convert a DOM event (mouse OR touch) into canvas-internal pixel
        // coordinates. Re-evaluates the bounding rect on every call so
        // it stays correct across orientation changes and address-bar
        // resizes, which cost essentially nothing.
        function getGameCoords(event) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            let clientX, clientY;
            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if (event.changedTouches && event.changedTouches.length > 0) {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }"""
if setup_old in content:
    content = content.replace(setup_old, setup_new)
    print('OK: IS_MOBILE constant + getGameCoords helper')

# --------------------------------------------------------------------------
# 3) Rewrite click handler to use scaled coords.
# --------------------------------------------------------------------------
click_old = """        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mx = event.clientX - rect.left;
            const my = event.clientY - rect.top;

            for (const btn of menuButtons) {
                const r = btn.rect;
                if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                    handleMenuAction(btn.action);
                    break;
                }
            }
        });"""
click_new = """        canvas.addEventListener('click', (event) => {
            const c = getGameCoords(event);
            for (const btn of menuButtons) {
                const r = btn.rect;
                if (c.x >= r.x && c.x <= r.x + r.w && c.y >= r.y && c.y <= r.y + r.h) {
                    handleMenuAction(btn.action);
                    break;
                }
            }
        });"""
if click_old in content:
    content = content.replace(click_old, click_new)
    print('OK: click handler uses scaled coords')

# --------------------------------------------------------------------------
# 4) Rewrite mousemove handler with scaled coords.
# --------------------------------------------------------------------------
move_old = """        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mx = event.clientX - rect.left;
            const my = event.clientY - rect.top;

            const wasHovering = blueCharacter.isHovering;
            if (gameState === GAME_STATES.MENU) {
                if (!rocketEmoji.isEscaping) {
                    const dx = mx - rocketEmoji.x;
                    const dy = my - rocketEmoji.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 50) {
                        rocketEmoji.isEscaping = true;
                        rocketEmoji.escapeTimer = 1200; // 20 secondi a 60 FPS
                        const speed = 5 + Math.random() * 4;
                        const angle = Math.random() * Math.PI * 2;
                        rocketEmoji.vx = Math.cos(angle) * speed;
                        rocketEmoji.vy = Math.sin(angle) * speed;
                    }
                }
                const hoverNow = blueHoverHitTest(mx, my);
                blueCharacter.isHovering = hoverNow;
                if (hoverNow && !wasHovering) {
                    pickNewBlueLine();
                }
            } else {
                blueCharacter.isHovering = false;
            }

            if (gameState === GAME_STATES.PLAYING) {
                player.targetX = mx;
            }
        });"""
move_new = """        canvas.addEventListener('mousemove', (event) => {
            const c = getGameCoords(event);
            const wasHovering = blueCharacter.isHovering;
            if (gameState === GAME_STATES.MENU) {
                if (!rocketEmoji.isEscaping) {
                    const dx = c.x - rocketEmoji.x;
                    const dy = c.y - rocketEmoji.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 50) {
                        rocketEmoji.isEscaping = true;
                        rocketEmoji.escapeTimer = 1200; // 20 secondi a 60 FPS
                        const speed = 5 + Math.random() * 4;
                        const angle = Math.random() * Math.PI * 2;
                        rocketEmoji.vx = Math.cos(angle) * speed;
                        rocketEmoji.vy = Math.sin(angle) * speed;
                    }
                }
                const hoverNow = blueHoverHitTest(c.x, c.y);
                blueCharacter.isHovering = hoverNow;
                if (hoverNow && !wasHovering) {
                    pickNewBlueLine();
                }
            } else {
                blueCharacter.isHovering = false;
            }

            if (gameState === GAME_STATES.PLAYING) {
                player.targetX = c.x;
            }
        });"""
if move_old in content:
    content = content.replace(move_old, move_new)
    print('OK: mousemove handler uses scaled coords')

# --------------------------------------------------------------------------
# 5) Rewrite touch handlers with Blue tap-to-speak (mobile).
# --------------------------------------------------------------------------
touch_old = """        // Supporto per touch drag su canvas (mobile)
        let canvasTouchActive = false;
        canvas.addEventListener('touchstart', (event) => {
            if (gameState === GAME_STATES.PLAYING) {
                canvasTouchActive = true;
                const rect = canvas.getBoundingClientRect();
                const touch = event.touches[0];
                player.targetX = touch.clientX - rect.left;
            }
        });
        canvas.addEventListener('touchmove', (event) => {
            if (gameState === GAME_STATES.PLAYING && canvasTouchActive) {
                const rect = canvas.getBoundingClientRect();
                const touch = event.touches[0];
                player.targetX = touch.clientX - rect.left;
            }
        });
        canvas.addEventListener('touchend', (event) => {
            if (gameState === GAME_STATES.PLAYING) {
                canvasTouchActive = false;
            }
        });"""
touch_new = """        // Touch drag on canvas — drives the ship during gameplay AND
        // the Blue mascot on the menu (since mousemove never fires on
        // touch devices).
        let canvasTouchActive = false;
        canvas.addEventListener('touchstart', (event) => {
            const c = getGameCoords(event);
            if (gameState === GAME_STATES.PLAYING) {
                canvasTouchActive = true;
                player.targetX = c.x;
            } else if (gameState === GAME_STATES.MENU && IS_MOBILE) {
                // Tap Blue to make him speak. The hover state is held
                // for ~1.5s via a timestamp so there is time to read the
                // bubble before it fades back out.
                if (blueHoverHitTest(c.x, c.y)) {
                    blueCharacter.isHovering = true;
                    blueCharacter.hoverResetAt = Date.now() + 1500;
                    pickNewBlueLine();
                }
            }
        }, { passive: true });
        canvas.addEventListener('touchmove', (event) => {
            if (gameState === GAME_STATES.PLAYING && canvasTouchActive) {
                const c = getGameCoords(event);
                player.targetX = c.x;
            }
        }, { passive: true });
        canvas.addEventListener('touchend', (event) => {
            if (gameState === GAME_STATES.PLAYING) {
                canvasTouchActive = false;
            }
        }, { passive: true });"""
if touch_old in content:
    content = content.replace(touch_old, touch_new)
    print('OK: touch handlers rewired with scaled coords + Blue tap')

# --------------------------------------------------------------------------
# 6) Mobile-mode performance tweaks.
# --------------------------------------------------------------------------

# 6a) Reduce twinkle background count when IS_MOBILE.
twinkle_old = """            ctx.shadowBlur = 0;
            for (let i = 0; i < 100; i++) {"""
twinkle_new = """            ctx.shadowBlur = 0;
            const twinkleCount = IS_MOBILE ? 50 : 100;
            for (let i = 0; i < twinkleCount; i++) {"""
if twinkle_old in content:
    content = content.replace(twinkle_old, twinkle_new)
    print('OK: lower twinkle count on mobile')

# 6b) Meteorite cap.
metcap_old = """            // Safety cap so a long survival run can't accumulate thousands
            // of meteorites and tank the framerate.
            if (meteorites.length > 40) {
                meteorites.splice(0, meteorites.length - 40);
            }"""
metcap_new = """            // Safety cap so a long survival run can't accumulate thousands
            // of meteorites and tank the framerate. Tighter on mobile.
            const meteorCap = IS_MOBILE ? 25 : 40;
            if (meteorites.length > meteorCap) {
                meteorites.splice(0, meteorites.length - meteorCap);
            }"""
if metcap_old in content:
    content = content.replace(metcap_old, metcap_new)
    print('OK: tighter meteorite cap on mobile')

# 6c) Skip the shadowBlur glow on meteorites when IS_MOBILE — that's the
# most expensive per-frame cost in drawMeteorite.
glow_old = """            // Soft outer glow so the meteorite reads as burning
            ctx.shadowColor = `hsl(${m.hue}, 95%, 60%)`;
            ctx.shadowBlur = 24;"""
glow_new = """            // Soft outer glow so the meteorite reads as burning.
            // Skip on mobile — shadowBlur is the most expensive per-meteorite
            // op and a phone can't sustain 25+ of them at 60fps.
            ctx.shadowColor = `hsl(${m.hue}, 95%, 60%)`;
            ctx.shadowBlur = IS_MOBILE ? 0 : 24;"""
if glow_old in content:
    content = content.replace(glow_old, glow_new)
    print('OK: skipped meteorite shadow-blur on mobile')

# 6d) Survival-red-filter scanlines — wider spacing on mobile.
scan_old = """            // Subtle red scanline flicker, much weaker than the body tint
            ctx.fillStyle = 'rgba(255, 60, 60, 0.05)';
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 2);
            }"""
scan_new = """            // Subtle red scanline flicker, much weaker than the body tint.
            // Use a wider row stride on mobile so the loop cuts in half.
            ctx.fillStyle = 'rgba(255, 60, 60, 0.05)';
            const scanStride = IS_MOBILE ? 8 : 4;
            for (let y = 0; y < canvas.height; y += scanStride) {
                ctx.fillRect(0, y, canvas.width, 2);
            }"""
if scan_old in content:
    content = content.replace(scan_old, scan_new)
    print('OK: wider scanline stride on mobile')

# --------------------------------------------------------------------------
# 7) updateBlueCharacter should also expire the mobile tap-on-Blue bubble.
# --------------------------------------------------------------------------
update_old = """        function updateBlueCharacter(now) {
            blueCharacter.bobPhase = now / 600;
            const target = blueCharacter.isHovering ? 1 : 0;
            blueCharacter.bubbleFadeTarget = target;
            const cur = blueCharacter.bubbleAlpha;
            const step = 0.08;
            if (cur < target) blueCharacter.bubbleAlpha = Math.min(target, cur + step);
            else if (cur > target) blueCharacter.bubbleAlpha = Math.max(target, cur - step);
        }"""
update_new = """        function updateBlueCharacter(now) {
            blueCharacter.bobPhase = now / 600;
            // On mobile, the bubble was forced open by a tap and should
            // auto-close after the short window so the screen doesn't
            // stay sticky.
            if (IS_MOBILE && blueCharacter.isHovering
                && blueCharacter.hoverResetAt
                && now > blueCharacter.hoverResetAt) {
                blueCharacter.isHovering = false;
            }
            const target = blueCharacter.isHovering ? 1 : 0;
            blueCharacter.bubbleFadeTarget = target;
            const cur = blueCharacter.bubbleAlpha;
            const step = 0.08;
            if (cur < target) blueCharacter.bubbleAlpha = Math.min(target, cur + step);
            else if (cur > target) blueCharacter.bubbleAlpha = Math.max(target, cur - step);
        }"""
if update_old in content:
    content = content.replace(update_old, update_new)
    print('OK: Blue tap-on-mobile expires via timestamp')

with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('HTML patch complete. Final size:', len(content))

# --------------------------------------------------------------------------
# 8) Append the "Playing on a phone" section to README.md.
# --------------------------------------------------------------------------
readme_path = 'README.md'
with open(readme_path, 'r', encoding='utf-8') as f:
    readme = f.read()

mobile_section = """

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
- Use **⚙ Settings → 🎵 MUSIC** to mute or resume; the choice is
  saved per-account.

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
"""

if "## \ud83d\udcf1 Playing on a phone" not in readme:
    with open(readme_path, 'a', encoding='utf-8') as f:
        f.write(mobile_section.lstrip())
    print('OK: appended mobile section to README.md')
else:
    print('SKIP: README already has mobile section')

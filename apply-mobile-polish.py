"""Final polish for the mobile adaptation patches, addressing the
3 small items flagged by the code reviewer:
  1. max-width / max-height use viewport units so they remain stable
     when body uses flex layout.
  2. IS_MOBILE updates on resize/orientationchange so a tablet that gets
     narrower than 768 px after boot still gets the perf tweaks.
  3. Blue tap on the menu call event.preventDefault() so the phantom
     click event (300 ms later) doesn't fire on whatever menu button
     is under it.
"""
with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

patches = []

# 1) view-port units instead of percentages
canvas_css_old = """            /* Mobile-friendly: shrink the canvas inside the viewport while
               keeping the 4:3 aspect ratio of the internal grid. */
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;"""
canvas_css_new = """            /* Mobile-friendly: shrink the canvas inside the viewport while
               keeping the 4:3 aspect ratio of the internal grid.
               Viewport units (vw/vh) are safer than percentages here
               because the parent flex item's intrinsic size can play
               tricks with % sizing in Safari. */
            max-width: 100vw;
            max-height: 100vh;
            object-fit: contain;"""
if canvas_css_old in content:
    content = content.replace(canvas_css_old, canvas_css_new)
    patches.append('viewport units on canvas instead of %')

# 2) IS_MOBILE re-evaluated on resize/orientationchange.
is_mobile_old = """        // Detect a touch-first device or narrow viewport once on boot —
        // used to dial back background / overlay work on phones.
        const IS_MOBILE = ('ontouchstart' in window || navigator.maxTouchPoints > 0)
            || window.innerWidth <= 768;"""
is_mobile_new = """        // Detect a touch-first device or narrow viewport — used to dial
        // back background / overlay work on phones. Re-evaluated on
        // resize and orientationchange so a tablet that narrows after
        // boot picks up the same perf tweaks.
        function detectMobile() {
            return ('ontouchstart' in window || navigator.maxTouchPoints > 0)
                || window.innerWidth <= 768;
        }
        let IS_MOBILE = detectMobile();
        window.addEventListener('resize', () => { IS_MOBILE = detectMobile(); });
        window.addEventListener('orientationchange', () => {
            IS_MOBILE = detectMobile();
        });"""
if is_mobile_old in content:
    content = content.replace(is_mobile_old, is_mobile_new)
    patches.append('IS_MOBILE updates on resize + orientationchange')

# 3) Blue tap on mobile should preventDefault so the synthetic click that
#    follows ~300 ms later doesn't double-fire under the bubble.
touchstart_old = """        canvas.addEventListener('touchstart', (event) => {
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
        }, { passive: true });"""
touchstart_new = """        canvas.addEventListener('touchstart', (event) => {
            const c = getGameCoords(event);
            if (gameState === GAME_STATES.PLAYING) {
                canvasTouchActive = true;
                player.targetX = c.x;
            } else if (gameState === GAME_STATES.MENU && IS_MOBILE) {
                // Tap Blue to make him speak. The hover state is held
                // for ~1.5s via a timestamp so there is time to read the
                // bubble before it fades back out. preventDefault keeps
                // the touch from bubbling into a synthetic click ~300 ms
                // later that could double-hit a button under the bubble.
                if (blueHoverHitTest(c.x, c.y)) {
                    blueCharacter.isHovering = true;
                    blueCharacter.hoverResetAt = Date.now() + 1500;
                    pickNewBlueLine();
                    event.preventDefault();
                }
            }
        }, { passive: true });"""
if touchstart_old in content:
    content = content.replace(touchstart_old, touchstart_new)
    patches.append('Blue tap preventDefault to swallow click tail')

with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Applied:')
for p in patches:
    print('  - ' + p)
print('Final size:', len(content))

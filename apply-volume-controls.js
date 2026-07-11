// apply-volume-controls.js
//
// One-shot patcher that adds standard +/- volume controls for the menu
// music and the classic-mode music inside the existing Settings panel.
// They render as slim subsections directly underneath the MUSIC and
// CLASSIC MUSIC toggle rows so each music toggle owns its own volume.
//
// Edit summary:
//   1. Extend the per-account `settings` default to include
//      menuVolume / classicVolume (defaults 0.3 each).
//   2. Extend loadSettings() to load + sanitise the new fields with
//      a safe fallback (0.3 if missing or out of range; non-numeric
//      or NaN also fallback to 0.3).
//   3. Have initMenuAudio() / initClassicAudio() seed their `.volume`
//      from the new settings fields instead of a hard-coded 0.3.
//   4. Add setMenuVolume() / setClassicVolume() helpers that clamp,
//      round to 0.1-step, persist, and propagate to the live Audio
//      element (lazy-init if necessary so a future play respects the
//      user's choice).
//   5. Add a drawVolumeRow() canvas helper that paints a "VOLUME"
//      label, a −/+ step button pair, a continuous filled bar, and a
//      numeric percentage readout. Pushes stepper button rects onto
//      menuButtons so the existing click dispatcher picks them up.
//   6. Reflow drawSettingsScreen() to fit 5 sections (3 toggles +
//      2 volume rows). Toggle rows shrink from 95→72 px, panel
//      height grows by 25 px, the BACK button shifts down by 5 px
//      to clear the taller panel.
//   7. Wire 4 new action cases ('menuVolUp'/'menuVolDown'/
//      'classicVolUp'/'classicVolDown') into the menu action switch.

const fs = require('fs');
let content = fs.readFileSync('star-catcher.html', 'utf8');

const edits = [];
function add(desc, old, repl) { edits.push({ desc, old, repl }); }

// Always round a 0..1 volume to the nearest 0.1 step so the user
// always sees a value matching one of the 11 backing levels (0%, 10%,
// …, 100%). Clamps out-of-range inputs so a hand-edited localStorage
// can never push the Audio API outside [0, 1].
function clampVolume(v) {
    if (typeof v !== 'number' || !isFinite(v)) return 0.3;
    const clamped = Math.min(1, Math.max(0, v));
    return Math.round(clamped * 10) / 10;
}

// 1) Settings default object — add menuVolume + classicVolume.
//    Update the comment too so future readers see the new fields.
add(
    'settings default + comment',
    `        // Per-account audio preferences. music = menu background song,
        // classicMusic = background song during Classic Mode gameplay,
        // sfx = every other in-game sound effect. The two music flags
        // are independent — each toggle controls exactly one track.
        let settings = { music: true, classicMusic: true, sfx: true };`,
    `        // Per-account audio preferences.
        //   music / classicMusic  — independent on/off toggles for the
        //                            menu song and the Classic-mode BGM.
        //   menuVolume / classicVolume — playback level for each track
        //                                (0.0 .. 1.0 in 0.1 steps).
        //   sfx                     — every other in-game sound effect.
        let settings = {
            music: true,
            classicMusic: true,
            sfx: true,
            menuVolume: 0.3,
            classicVolume: 0.3
        };`
);

// 2) loadSettings() — pull menuVolume / classicVolume from localStorage
//    with the same hardening used for the booleans. Migration: rows
//    written before this change had no volume keys, so they fall back
//    to 0.3 (matching the previous hard-coded init value).
add(
    'loadSettings with volume fields',
    `        function loadSettings() {
            try {
                const raw = localStorage.getItem(settingsStorageKey());
                if (raw) {
                    const parsed = JSON.parse(raw);
                    return {
                        music: typeof parsed.music === 'boolean' ? parsed.music : true,
                        // Migration: accounts created BEFORE the split used
                    // settings.music to silence BOTH tracks. If the new field
                    // is missing, inherit the previous music value so those
                    // users aren't suddenly surprised by Classic BGM.
                    classicMusic: typeof parsed.classicMusic === 'boolean' ? parsed.classicMusic : (typeof parsed.music === 'boolean' ? parsed.music : true),
                        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : true
                    };
                }
            } catch (e) { /* fall through to defaults */ }
            return { music: true, classicMusic: true, sfx: true };
        }`,
    `        function loadSettings() {
            // Defensive defaults that match the let-settings initialiser
            // above. We return them as a fresh object on every call so
            // mutation by callers (e.g. toggle handlers) never bleeds
            // across accounts.
            const defaults = {
                music: true,
                classicMusic: true,
                sfx: true,
                menuVolume: 0.3,
                classicVolume: 0.3
            };
            try {
                const raw = localStorage.getItem(settingsStorageKey());
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Migration: accounts created BEFORE the split used
                    // settings.music to silence BOTH tracks. If the new
                    // field is missing, inherit the previous music value
                    // so those users aren't suddenly surprised by Classic
                    // BGM. Volume fields always default to 0.3 — matches
                    // the previous hard-coded initMenuAudio/initClassicAudio
                    // value so legacy accounts hear the same loudness as
                    // before this feature existed.
                    return {
                        music: typeof parsed.music === 'boolean' ? parsed.music : defaults.music,
                        classicMusic: typeof parsed.classicMusic === 'boolean'
                            ? parsed.classicMusic
                            : (typeof parsed.music === 'boolean' ? parsed.music : defaults.classicMusic),
                        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : defaults.sfx,
                        menuVolume: clampVolume(parsed.menuVolume),
                        classicVolume: clampVolume(parsed.classicVolume)
                    };
                }
            } catch (e) { /* fall through to defaults */ }
            return defaults;
        }`
);

// 3) initMenuAudio() — read the configured volume instead of a hard
//    0.3 so per-account preferences apply on the very first play.
add(
    'initMenuAudio volume from settings',
    `        function initMenuAudio() {
            if (!menuAudio) {
                menuAudio = new Audio('menu-song.mp3');
                menuAudio.loop = true;
                menuAudio.volume = 0.3; // Volume ridotto per non far sovrastare i suoni del gioco
            }
        }`,
    `        function initMenuAudio() {
            if (!menuAudio) {
                menuAudio = new Audio('menu-song.mp3');
                menuAudio.loop = true;
                // Seed from per-account settings so the saved volume
                // takes effect on the very first play (and on the
                // boot-path autoplay scheduled by setTimeout below).
                menuAudio.volume = settings.menuVolume;
            }
        }`
);

// 3b) initClassicAudio() — same pattern for the Classic BGM.
add(
    'initClassicAudio volume from settings',
    `        function initClassicAudio() {
            if (!classicAudio) {
                classicAudio = new Audio('paulyudin-synth-pop-Classic-Mode.mp3');
                classicAudio.loop = true;
                classicAudio.volume = 0.3; // Stesso volume della musica del menu
            }
        }`,
    `        function initClassicAudio() {
            if (!classicAudio) {
                classicAudio = new Audio('paulyudin-synth-pop-Classic-Mode.mp3');
                classicAudio.loop = true;
                // Seed from per-account settings (mirrors initMenuAudio
                // so each track's saved level applies on first play).
                classicAudio.volume = settings.classicVolume;
            }
        }`
);

// 4) Volume setter helpers. Insert them right after the existing
//    playMenuMusic() / playClassicMusic() / stopClassicMusic() block
//    so all audio plumbing for one piece of music lives in one place.
//    We pick the comment block right above `let audioCtx = null` as a
//    safe anchor — it's stable and unique. The replay cases for the
//    setters are: clamp/round, persist, propagate to the live Audio
//    element (lazily init the element if the user hasn't played the
//    track yet so the next play honours the new level), and bump
//    settingsToggledCountToday for the 'Toggle a setting today'
//    daily mission so any change counts once.
add(
    'setMenuVolume + setClassicVolume + clampVolume helpers',
    `        // Suono di raccolta stellina - caricato dal file star-sound.txt
        let starSound = null;`,
    `        // ----- Volume setters -----
        // Always round to the nearest 0.1 step + clamp to [0, 1]. The
        // Audio API rejects anything outside [0, 1] silently, so an
        // out-of-range persist call could leave the user's music at a
        // different level than what the slider displays. setMenuVolume()
        // and setClassicVolume() share clampVolume() so both tracks
        // behave identically. We lazily init the Audio element on the
        // first volume change so the user's chosen level survives even
        // before the song has actually been played. Mission integration:
        // every change bumps settingsToggledCountToday; the 'toggle_setting'
        // mission just needs ≥1, so multiple clicks still only count once
        // toward unlock.
        function setMenuVolume(v) {
            settings.menuVolume = clampVolume(v);
            saveSettings();
            if (!menuAudio) initMenuAudio();
            menuAudio.volume = settings.menuVolume;
        }

        function setClassicVolume(v) {
            settings.classicVolume = clampVolume(v);
            saveSettings();
            if (!classicAudio) initClassicAudio();
            classicAudio.volume = settings.classicVolume;
        }

        // Suono di raccolta stellina - caricato dal file star-sound.txt
        let starSound = null;`
);

// 5) drawVolumeRow() — slim row that lives directly under a music
//    toggle in the Settings panel. We insert it just before
//    drawSettingsRow() so functions are defined top-down (panel rows
//    use it).
add(
    'drawVolumeRow helper',
    `        function drawSettingsRow(x, y, w, h, title, description, value, action) {`,
    `        // ----- Volume row (used as a sub-row under MUSIC / CLASSIC MUSIC) -----
        // Renders "VOLUME" label + −/+ step buttons + filled bar + % readout.
        // The bar is CONTINUOUS (one rect), not segmented, so it expands/
        // contracts smoothly with each step. Only the step buttons are
        // click targets — tapping the bar itself does nothing, matching
        // the surrounding tap-driven UI. The same gold/orange palette
        // the BACK button uses ties the row to the panel's accent colour.
        // With 11 volume levels (0.0 → 1.0 in 0.1 steps) and matching the
        // existing Orbitron typography, the row reads as a sibling of
        // drawSettingsRow rather than a foreign widget.
        function drawVolumeRow(x, y, w, h, level, decAction, incAction) {
            // "VOLUME" label on the left.
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 11px Orbitron, sans-serif';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 3;
            ctx.fillStyle = '#88ddff';
            ctx.fillText('VOLUME', x + 6, y + h / 2);

            // − button (28×28 square)
            const btnSize = 28;
            const btnY = y + (h - btnSize) / 2;
            const decBtnX = x + 65;

            // Continuous bar (200×12)
            const barW = 200;
            const barH = 12;
            const barX = decBtnX + btnSize + 12;
            const barY = y + (h - barH) / 2;

            // + button (28×28 square)
            const incBtnX = barX + barW + 12;

            // Step button geometry is reused both for rendering and for
            // registering click targets, so wrap it in a tiny helper.
            function drawStep(cx, label) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = 'rgba(255,170,80,0.55)';
                ctx.fillStyle = '#3a2a1a';
                ctx.beginPath();
                ctx.roundRect(cx, btnY, btnSize, btnSize, 8);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(255,170,80,0.7)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(cx, btnY, btnSize, btnSize, 8);
                ctx.stroke();
                ctx.fillStyle = '#ffd84a';
                ctx.font = 'bold 18px Orbitron, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, cx + btnSize / 2, btnY + btnSize / 2);
            }

            drawStep(decBtnX, '−');
            drawStep(incBtnX, '+');

            // Bar background pill
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0e1a2e';
            ctx.strokeStyle = 'rgba(74,170,255,0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 6);
            ctx.fill();
            ctx.stroke();

            // Filled portion (clamped to [0, 1] for safety even though
            // the setter already rounded — defence in depth for cases
            // like a hand-tampered localStorage value).
            const safeLevel = Math.min(1, Math.max(0, level));
            const fillW = Math.round(barW * safeLevel);
            if (fillW > 0) {
                const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
                fillGrad.addColorStop(0, '#ffaa55');
                fillGrad.addColorStop(1, '#ffd84a');
                ctx.fillStyle = fillGrad;
                ctx.beginPath();
                ctx.roundRect(barX, barY, fillW, barH, 6);
                ctx.fill();
            }

            // Numeric readout on the right
            ctx.font = 'bold 13px Orbitron, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 3;
            ctx.fillText(Math.round(safeLevel * 100) + '%', x + w - 6, y + h / 2);

            // Click targets for ±, only. Bar itself is NOT clickable
            // (tapping it would imply continuous drag, which is out of
            // scope for "standard buttons").
            menuButtons.push({
                rect: { x: decBtnX, y: btnY, w: btnSize, h: btnSize },
                action: decAction
            });
            menuButtons.push({
                rect: { x: incBtnX, y: btnY, w: btnSize, h: btnSize },
                action: incAction
            });

            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.shadowBlur = 0;
        }

        function drawSettingsRow(x, y, w, h, title, description, value, action) {`
);

// 6) drawSettingsScreen() body — reflow so the panel fits 5 rows.
//    Toggle rows shrink 95→72 px, panel height grows 340→365 px,
//    and the two new volume sub-rows slot in underneath MUSIC and
//    CLASSIC MUSIC. The BACK button is shifted down by 5 px so it
//    doesn't crowd the taller panel.
add(
    'drawSettingsScreen outer panel size',
    `            // Outer panel (sized for 3 toggle rows: MUSIC, SFX, CLASSIC MUSIC)
            const panelW = 480;
            const panelH = 340;
            const panelX = canvas.width / 2 - panelW / 2;
            const panelY = 160;`,
    `            // Outer panel — sized for 3 toggle rows + 2 volume sub-rows.
            // Each music track owns its volume directly underneath (the
            // SFX row stays toggle-only since there is no SFX BGM track).
            const panelW = 480;
            const panelH = 365;
            const panelX = canvas.width / 2 - panelW / 2;
            const panelY = 160;`
);

add(
    'drawSettingsScreen five rows',
    `            // Three toggle rows inside the panel, evenly spaced.
            const padX = 30;
            const innerW = panelW - padX * 2;
            const rowX = panelX + padX;

            drawSettingsRow(rowX, panelY + 20, innerW, 95,
                '🎵 MUSIC',
                'Background song in the main menu',
                settings.music, 'toggleMusic');

            drawSettingsRow(rowX, panelY + 120, innerW, 95,
                '🔊 SFX',
                'All other sounds during gameplay',
                settings.sfx, 'toggleSfx');

            drawSettingsRow(rowX, panelY + 220, innerW, 95,
                '⭐ CLASSIC MUSIC',
                'Plays during Classic Mode runs',
                settings.classicMusic, 'toggleClassicMusic');`,
    `            // 5 sections inside the panel:
            //   1) MUSIC toggle              (h=72)
            //   2) Menu music volume         (h=36)   — sub-row of MUSIC
            //   3) SFX toggle                (h=72)
            //   4) CLASSIC MUSIC toggle      (h=72)
            //   5) Classic music volume      (h=36)   — sub-row of CLASSIC
            //
            // Gaps:
            //   * 5 px between a toggle and its own volume sub-row (close
            //     visual coupling → "this volume controls THIS toggle").
            //   * 15 px between SECTION boundaries (SFX ↔ MUSIC, SFX ↔
            //     CLASSIC) so the volume sub-rows clearly belong to their
            //     parent toggle instead of looking like standalone rows.
            const padX = 30;
            const innerW = panelW - padX * 2;
            const rowX = panelX + padX;

            drawSettingsRow(rowX, panelY + 15, innerW, 72,
                '🎵 MUSIC',
                'Background song in the main menu',
                settings.music, 'toggleMusic');

            drawVolumeRow(rowX, panelY + 92, innerW, 36,
                settings.menuVolume, 'menuVolDown', 'menuVolUp');

            drawSettingsRow(rowX, panelY + 143, innerW, 72,
                '🔊 SFX',
                'All other sounds during gameplay',
                settings.sfx, 'toggleSfx');

            drawSettingsRow(rowX, panelY + 230, innerW, 72,
                '⭐ CLASSIC MUSIC',
                'Plays during Classic Mode runs',
                settings.classicMusic, 'toggleClassicMusic');

            drawVolumeRow(rowX, panelY + 307, innerW, 36,
                settings.classicVolume, 'classicVolDown', 'classicVolUp');`
);

add(
    'BACK button slightly lower to clear taller panel',
    `            // BACK button — sits below the taller panel that now
            // hosts three toggle rows.
            const btnW = 180;
            const btnH = 45;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = canvas.height - 55;`,
    `            // BACK button — sits below the now-taller panel (5 rows
            // total). Shifted 5 px DOWN from canvas.height-55 to leave
            // the per-account footer line breathing room above it.
            const btnW = 180;
            const btnH = 45;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = canvas.height - 50;`
);

// 7) Append 4 new action cases right before the 'settingsBack' case.
//    The dispatcher pattern lives in a switch inside the action
//    handler — the existing toggle cases (toggleMusic, toggleSfx,
//    toggleClassicMusic) all call recordMissionEvent('toggled_setting')
//    so we follow suit. setMenuVolume / setClassicVolume already
//    persist + apply to the live Audio element, so these cases only
//    need to advance the level by ±0.1 and play the click sound.
add(
    'volume action cases',
    `                case 'settingsBack':
                    if (gameStateBeforeSettings === GAME_STATES.PAUSED) {
                        gameState = GAME_STATES.PAUSED;
                    } else {
                        gameState = GAME_STATES.MENU;
                        showMobileInput(false);
                    }
                    gameStateBeforeSettings = GAME_STATES.MENU;
                    break;`,
    `                case 'menuVolDown':
                    if (settings.menuVolume > 0) {
                        setMenuVolume(settings.menuVolume - 0.1);
                        playClickSound();
                        recordMissionEvent('toggled_setting');
                    }
                    break;
                case 'menuVolUp':
                    if (settings.menuVolume < 1) {
                        setMenuVolume(settings.menuVolume + 0.1);
                        playClickSound();
                        recordMissionEvent('toggled_setting');
                    }
                    break;
                case 'classicVolDown':
                    if (settings.classicVolume > 0) {
                        setClassicVolume(settings.classicVolume - 0.1);
                        playClickSound();
                        recordMissionEvent('toggled_setting');
                    }
                    break;
                case 'classicVolUp':
                    if (settings.classicVolume < 1) {
                        setClassicVolume(settings.classicVolume + 0.1);
                        playClickSound();
                        recordMissionEvent('toggled_setting');
                    }
                    break;
                case 'settingsBack':
                    if (gameStateBeforeSettings === GAME_STATES.PAUSED) {
                        gameState = GAME_STATES.PAUSED;
                    } else {
                        gameState = GAME_STATES.MENU;
                        showMobileInput(false);
                    }
                    gameStateBeforeSettings = GAME_STATES.MENU;
                    break;`
);

// ----- Dry-run guard: every oldString must appear exactly as-is -----
let missing = 0;
for (const e of edits) {
    if (!content.includes(e.old)) {
        console.log('MISS:', e.desc);
        missing++;
    }
}
if (missing > 0) {
    console.log('Aborting due to', missing, 'missing pattern(s).');
    process.exit(1);
}

for (const e of edits) {
    // Single replacement per edit avoids touching duplicated lines
    // unintentionally (e.g. multiple identical comments).
    content = content.replace(e.old, e.repl, 1);
    console.log('OK:  ', e.desc);
}

fs.writeFileSync('star-catcher.html', content);
console.log('Final size:', content.length, 'bytes');

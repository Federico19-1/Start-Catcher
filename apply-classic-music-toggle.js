const fs = require('fs');
let content = fs.readFileSync('star-catcher.html', 'utf8');

const edits = [];
function add(desc, old, repl) { edits.push({ desc, old, repl }); }

// 1) Update the settings-default comment + add classicMusic to the default object
add(
  'settings default + comment',
  '        // Per-account audio preferences. music = menu background song,\n        // sfx = every other in-game sound effect.\n        let settings = { music: true, sfx: true };',
  '        // Per-account audio preferences. music = menu background song,\n        // classicMusic = background song during Classic Mode gameplay,\n        // sfx = every other in-game sound effect. The two music flags\n        // are independent — each toggle controls exactly one track.\n        let settings = { music: true, classicMusic: true, sfx: true };'
);

// 2) Update loadSettings to fall back to classicMusic: true when missing
add(
  'loadSettings fallback',
  `        function loadSettings() {
            try {
                const raw = localStorage.getItem(settingsStorageKey());
                if (raw) {
                    const parsed = JSON.parse(raw);
                    return {
                        music: typeof parsed.music === 'boolean' ? parsed.music : true,
                        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : true
                    };
                }
            } catch (e) { /* fall through to defaults */ }
            return { music: true, sfx: true };
        }`,
  `        function loadSettings() {
            try {
                const raw = localStorage.getItem(settingsStorageKey());
                if (raw) {
                    const parsed = JSON.parse(raw);
                    return {
                        music: typeof parsed.music === 'boolean' ? parsed.music : true,
                        classicMusic: typeof parsed.classicMusic === 'boolean' ? parsed.classicMusic : true,
                        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : true
                    };
                }
            } catch (e) { /* fall through to defaults */ }
            return { music: true, classicMusic: true, sfx: true };
        }`
);

// 3) Update the initClassicAudio header comment (MUSIC toggle no longer silences classic)
add(
  'initClassicAudio header comment',
  `        // ----- Classic-Mode gameplay music -----
        // Separate Audio element dedicated to the Classic run (the one
        // where the player catches the stars). Created on demand the
        // first time we enter a Classic game so the file is only
        // requested when actually needed — same lazy-load pattern as
        // initMenuAudio() above. The MUSIC toggle in Settings affects
        // BOTH the menu song and this track, so the player can silence
        // all background music with a single click.`,
  `        // ----- Classic-Mode gameplay music -----
        // Separate Audio element dedicated to the Classic run (the one
        // where the player catches the stars). Created on demand the
        // first time we enter a Classic game so the file is only
        // requested when actually needed — same lazy-load pattern as
        // initMenuAudio() above. Controlled by its own setting
        // (settings.classicMusic), independent from the menu track,
        // so the player can mute each song separately.`
);

// 4) playClassicMusic now bails on settings.classicMusic (not settings.music)
add(
  'playClassicMusic guard',
  `            if (!settings.music) {
                // Music disabled — make sure nothing is playing (matches
                // playMenuMusic behaviour). Also rewind so the next play
                // starts from the top.
                if (classicAudio && !classicAudio.paused) {
                    classicAudio.pause();
                    classicAudio.currentTime = 0;
                }
                return;
            }`,
  `            if (!settings.classicMusic) {
                // Classic-Mode music disabled — make sure nothing is
                // playing. Also rewind so the next play starts from the
                // top, matching playMenuMusic() behaviour.
                if (classicAudio && !classicAudio.paused) {
                    classicAudio.pause();
                    classicAudio.currentTime = 0;
                }
                return;
            }`
);

// 5) Revert the playClassicMusic() call inside toggleMusic (MUSIC is menu-only now),
//    plus insert the new toggleClassicMusic case immediately before toggleSfx.
add(
  'toggleMusic handler + new toggleClassicMusic case',
  `                case 'toggleMusic':
                    settings.music = !settings.music;
                    saveSettings();
                    playMenuMusic();       // respects new settings.music value
                    playClassicMusic();    // same flag silences the Classic BGM too
                    playClickSound();
                    recordMissionEvent('toggled_setting');
                    break;`,
  `                case 'toggleMusic':
                    settings.music = !settings.music;
                    saveSettings();
                    playMenuMusic();       // respects new settings.music value
                    playClickSound();
                    recordMissionEvent('toggled_setting');
                    break;
                case 'toggleClassicMusic':
                    settings.classicMusic = !settings.classicMusic;
                    saveSettings();
                    playClassicMusic();    // respects new settings.classicMusic value (silences or resumes the Classic BGM)
                    playClickSound();
                    recordMissionEvent('toggled_setting');
                    break;`
);

// 6) Resize the Settings panel to fit a third row, reflow rows, move BACK button down
add(
  'Settings panel size',
  `            // Outer panel
            const panelW = 480;
            const panelH = 250;
            const panelX = canvas.width / 2 - panelW / 2;
            const panelY = 175;`,
  `            // Outer panel (sized for 3 toggle rows: MUSIC, SFX, CLASSIC MUSIC)
            const panelW = 480;
            const panelH = 340;
            const panelX = canvas.width / 2 - panelW / 2;
            const panelY = 160;`
);

add(
  'Three settings rows',
  `            // Two toggle rows inside the panel
            const padX = 30;
            const innerW = panelW - padX * 2;
            const rowX = panelX + padX;

            drawSettingsRow(rowX, panelY + 15, innerW, 100,
                '🎵 MUSIC',
                'Background song in the menu',
                settings.music, 'toggleMusic');

            drawSettingsRow(rowX, panelY + 125, innerW, 100,
                '🔊 SFX',
                'All other sounds during gameplay',
                settings.sfx, 'toggleSfx');`,
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
                '🎵 CLASSIC MUSIC',
                'Background song during Classic Mode gameplay',
                settings.classicMusic, 'toggleClassicMusic');`
);

add(
  'BACK button position',
  `            // BACK button
            const btnW = 180;
            const btnH = 50;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = canvas.height - 70;`,
  `            // BACK button — sits below the taller panel that now
            // hosts three toggle rows.
            const btnW = 180;
            const btnH = 45;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = canvas.height - 55;`
);

let missing = 0;
for (const e of edits) {
  if (!content.includes(e.old)) {
    console.log('MISS:', e.desc);
    missing++;
  }
}
if (missing > 0) {
  console.log('Aborting due to', missing, 'missing patterns.');
  process.exit(1);
}

for (const e of edits) {
  content = content.replace(e.old, e.repl, 1);
  console.log('OK:  ', e.desc);
}

fs.writeFileSync('star-catcher.html', content);
console.log('Final size:', content.length, 'bytes');

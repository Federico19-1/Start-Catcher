const fs = require('fs');
let content = fs.readFileSync('star-catcher.html', 'utf8');

const edits = [];
function add(desc, old, repl) { edits.push({ desc, old, repl }); }

// 1) Legacy migration: when classicMusic field is missing on an
//    existing per-account settings record, inherit the previous
//    `music` value instead of defaulting to true. This preserves the
//    pre-split behavior for users who had MUSIC off (which used to
//    silence BOTH tracks).
add(
  'legacy-migration in loadSettings',
  `                    classicMusic: typeof parsed.classicMusic === 'boolean' ? parsed.classicMusic : true,`,
  `                    // Migration: accounts created BEFORE the split used
                    // settings.music to silence BOTH tracks. If the new field
                    // is missing, inherit the previous music value so those
                    // users aren't suddenly surprised by Classic BGM.
                    classicMusic: typeof parsed.classicMusic === 'boolean' ? parsed.classicMusic : (typeof parsed.music === 'boolean' ? parsed.music : true),`
);

// 2) Differentiate the new toggle visually + tighten the description
//    so it doesn't repeat the row label.
add(
  'CLASSIC MUSIC row label + description',
  `            drawSettingsRow(rowX, panelY + 220, innerW, 95,
                '🎵 CLASSIC MUSIC',
                'Background song during Classic Mode gameplay',
                settings.classicMusic, 'toggleClassicMusic');`,
  `            drawSettingsRow(rowX, panelY + 220, innerW, 95,
                '⭐ CLASSIC MUSIC',
                'Plays during Classic Mode runs',
                settings.classicMusic, 'toggleClassicMusic');`
);

// 3) Re-centre the BACK button text after the height change (50 → 45).
//    Original: btnH=50, text at btnY+34 → 68% from top. New: btnH=45,
//    so text should sit at btnY+30 to keep ~67% from top.
add(
  'BACK button text centring',
  `            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 22px Orbitron, sans-serif';
            ctx.fillText('← BACK', canvas.width / 2, btnY + 34);`,
  `            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 22px Orbitron, sans-serif';
            // btnY + 30 keeps the text at ~67% from the top of the
            // 45-px button (was ~68% with the original 50-px height).
            ctx.fillText('← BACK', canvas.width / 2, btnY + 30);`
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

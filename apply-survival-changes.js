const fs = require('fs');
let html = fs.readFileSync('star-catcher.html', 'utf8');
const originalLength = html.length;

function apply(desc, needle, replacement) {
    if (!html.includes(needle)) {
        console.log('MISS: ' + desc);
        return false;
    }
    const before = html.length;
    html = html.replace(needle, replacement);
    console.log('OK:   ' + desc + '  (delta: ' + (html.length - before) + ' chars)');
    return true;
}

// 1. Remove the broken drawRecordRow stub (which leaves callers crashing).
apply(
    'remove broken drawRecordRow stub',
    '        function drawRecordRow(x, y, w, value, suffix) {\n' +
    '            const medal = value > 0 ? (\n' +
    '                y < 1000 ? \'🥇\' : \'🥈\'  // I-frames not consulted; medals are positional.\n' +
    '            ) : null;\n\n' +
    '            // Simplified positional medal so multiple rows in the same\n' +
    '            // column get 🥇/🥈/🥉/4./5. matching their list index.\n' +
    '            // The caller does not pass an index, so derive one from the y\n' +
    '            // delta against the column start passed implicitly via the\n' +
    '            // fixed 38px row height.\n' +
    '            void medal;\n\n' +
    '            // We need the row index to derive a medal: callers pass an\n' +
    '            // implicit row by passing the y-coordinate. Compute it from\n' +
    '            // the difference vs. a 38px row height starting at y - 38 * k.\n' +
    '            // To keep the API clean we manually number rows by y delta\n' +
    '            // (every column uses classicStartY + i * 38).\n' +
    '            const idx = Math.round((y - (y - (y % 38))) / 38);  // helpful fallback (unused)\n' +
    '            void idx;\n\n' +
    '            // Instead of relying on y math, callers paint each row\n' +
    '            // explicitly when needed. This helper takes a pre-decided\n' +
    '            // medal string to keep column drawer code simple.\n' +
    '        }\n\n' +
    '        function drawSettingsRow',
    '        function drawSettingsRow'
);

// 2. Replace the 2x2 drawMenu button block with a 3-row layout that
//    includes SURVIVAL alongside PLAY.
apply(
    'add SURVIVAL button to menu (3-row layout)',
    '            // Two rows of two buttons: PLAY/ACCOUNT top, RECORDS/SETTINGS bottom\n' +
    '            const btnY = 380;\n' +
    '            const btnW = 180;\n' +
    '            const btnH = 50;\n' +
    '            const gap = 25;\n' +
    '            const row2Y = btnY + btnH + 35;\n' +
    '            const row2H = 40;\n\n' +
    '            const playX = canvas.width / 2 - btnW - gap / 2;\n' +
    '            const playCenterX = playX + btnW / 2;\n' +
    '            ctx.shadowBlur = 30;\n' +
    '            ctx.shadowColor = \'#4af\';\n' +
    '            ctx.fillStyle = \'#2a6aff\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(playX, btnY, btnW, btnH, 12);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'white\';\n' +
    '            ctx.font = \'bold 24px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'▶ PLAY\', playCenterX, btnY + 34);\n\n' +
    '            const accX = canvas.width / 2 + gap / 2;\n' +
    '            const accCenterX = accX + btnW / 2;\n' +
    '            ctx.shadowBlur = 20;\n' +
    '            ctx.shadowColor = \'#88aaff\';\n' +
    '            ctx.fillStyle = \'#3a3a6a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(accX, btnY, btnW, btnH, 12);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'#88aaff\';\n' +
    '            ctx.font = \'bold 22px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'👤 ACCOUNT\', accCenterX, btnY + 34);\n\n' +
    '            const recX = canvas.width / 2 - btnW - gap / 2;\n' +
    '            const recCenterX = recX + btnW / 2;\n' +
    '            ctx.shadowBlur = 15;\n' +
    '            ctx.shadowColor = \'#ffd700\';\n' +
    '            ctx.fillStyle = \'#2a2a4a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(recX, row2Y, btnW, row2H, 10);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'#ffd700\';\n' +
    '            ctx.font = \'20px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'🏆 RECORDS\', recCenterX, row2Y + 28);\n\n' +
    '            const settingsX = canvas.width / 2 + gap / 2;\n' +
    '            const settingsCenterX = settingsX + btnW / 2;\n' +
    '            ctx.shadowBlur = 15;\n' +
    '            ctx.shadowColor = \'#aaaaaa\';\n' +
    '            ctx.fillStyle = \'#2a2a3a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(settingsX, row2Y, btnW, row2H, 10);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.strokeStyle = \'rgba(170, 170, 170, 0.4)\';\n' +
    '            ctx.lineWidth = 2;\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(settingsX, row2Y, btnW, row2H, 10);\n' +
    '            ctx.stroke();\n' +
    '            ctx.fillStyle = \'#cccccc\';\n' +
    '            ctx.font = \'20px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'⚙ SETTINGS\', settingsCenterX, row2Y + 28);\n\n' +
    '            menuButtons = [\n' +
    '                { rect: { x: playX, y: btnY, w: btnW, h: btnH }, action: \'play\' },\n' +
    '                { rect: { x: accX, y: btnY, w: btnW, h: btnH }, action: \'account\' },\n' +
    '                { rect: { x: recX, y: row2Y, w: btnW, h: row2H }, action: \'records\' },\n' +
    '                { rect: { x: settingsX, y: row2Y, w: btnW, h: row2H }, action: \'settings\' }\n' +
    '            ];',
    '            // 3 rows of buttons: PLAY/SURVIVAL on top (both play modes),\n' +
    '            // ACCOUNT/RECORDS in the middle (personalisation / history),\n' +
    '            // SETTINGS alone on the bottom row, centred.\n' +
    '            const btnY = 380;\n' +
    '            const btnW = 180;\n' +
    '            const btnH = 50;\n' +
    '            const gap = 25;\n' +
    '            const row2Y = btnY + btnH + 30;\n' +
    '            const row2H = 50;\n' +
    '            const row3Y = row2Y + row2H + 25;\n' +
    '            const row3H = 40;\n\n' +
    '            // Row 1 LEFT: PLAY\n' +
    '            const playX = canvas.width / 2 - btnW - gap / 2;\n' +
    '            const playCenterX = playX + btnW / 2;\n' +
    '            ctx.shadowBlur = 30;\n' +
    '            ctx.shadowColor = \'#4af\';\n' +
    '            ctx.fillStyle = \'#2a6aff\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(playX, btnY, btnW, btnH, 12);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'white\';\n' +
    '            ctx.font = \'bold 24px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'▶ PLAY\', playCenterX, btnY + 34);\n\n' +
    '            // Row 1 RIGHT: SURVIVAL — red, with skull emoji. The entry point\n' +
    '            // for the high-difficulty dodge mode.\n' +
    '            const survivalX = canvas.width / 2 + gap / 2;\n' +
    '            const survivalCenterX = survivalX + btnW / 2;\n' +
    '            ctx.shadowBlur = 35;\n' +
    '            ctx.shadowColor = \'#ff0000\';\n' +
    '            ctx.fillStyle = \'#a01010\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(survivalX, btnY, btnW, btnH, 12);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.strokeStyle = \'rgba(255, 90, 90, 0.7)\';\n' +
    '            ctx.lineWidth = 2;\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(survivalX, btnY, btnW, btnH, 12);\n' +
    '            ctx.stroke();\n' +
    '            ctx.fillStyle = \'#ffcccc\';\n' +
    '            ctx.font = \'bold 22px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'💀 SURVIVAL\', survivalCenterX, btnY + 34);\n\n' +
    '            // Row 2 LEFT: ACCOUNT\n' +
    '            const accX = canvas.width / 2 - btnW - gap / 2;\n' +
    '            const accCenterX = accX + btnW / 2;\n' +
    '            ctx.shadowBlur = 15;\n' +
    '            ctx.shadowColor = \'#88aaff\';\n' +
    '            ctx.fillStyle = \'#3a3a6a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(accX, row2Y, btnW, row2H, 10);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'#88aaff\';\n' +
    '            ctx.font = \'bold 22px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'👤 ACCOUNT\', accCenterX, row2Y + 34);\n\n' +
    '            // Row 2 RIGHT: RECORDS\n' +
    '            const recX = canvas.width / 2 + gap / 2;\n' +
    '            const recCenterX = recX + btnW / 2;\n' +
    '            ctx.shadowBlur = 12;\n' +
    '            ctx.shadowColor = \'#ffd700\';\n' +
    '            ctx.fillStyle = \'#2a2a4a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(recX, row2Y, btnW, row2H, 10);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.fillStyle = \'#ffd700\';\n' +
    '            ctx.font = \'20px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'🏆 RECORDS\', recCenterX, row2Y + 34);\n\n' +
    '            // Row 3: SETTINGS (centre)\n' +
    '            const settingsX = canvas.width / 2 - btnW / 2;\n' +
    '            const settingsCenterX = settingsX + btnW / 2;\n' +
    '            ctx.shadowBlur = 10;\n' +
    '            ctx.shadowColor = \'#aaaaaa\';\n' +
    '            ctx.fillStyle = \'#2a2a3a\';\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(settingsX, row3Y, btnW, row3H, 10);\n' +
    '            ctx.fill();\n' +
    '            ctx.shadowBlur = 0;\n' +
    '            ctx.strokeStyle = \'rgba(170, 170, 170, 0.4)\';\n' +
    '            ctx.lineWidth = 2;\n' +
    '            ctx.beginPath();\n' +
    '            ctx.roundRect(settingsX, row3Y, btnW, row3H, 10);\n' +
    '            ctx.stroke();\n' +
    '            ctx.fillStyle = \'#cccccc\';\n' +
    '            ctx.font = \'18px Orbitron, sans-serif\';\n' +
    '            ctx.fillText(\'⚙ SETTINGS\', settingsCenterX, row3Y + 26);\n\n' +
    '            menuButtons = [\n' +
    '                { rect: { x: playX, y: btnY, w: btnW, h: btnH }, action: \'play\' },\n' +
    '                { rect: { x: survivalX, y: btnY, w: btnW, h: btnH }, action: \'survival\' },\n' +
    '                { rect: { x: accX, y: row2Y, w: btnW, h: row2H }, action: \'account\' },\n' +
    '                { rect: { x: recX, y: row2Y, w: btnW, h: row2H }, action: \'records\' },\n' +
    '                { rect: { x: settingsX, y: row3Y, w: btnW, h: row3H }, action: \'settings\' }\n' +
    '            ];'
);

// 3. Update the 'play' case in handleMenuAction and add a 'survival' case.
apply(
    'add survival menu action + explicit play mode',
    '                case \'play\':\n' +
    '                    if (!currentUser) {\n' +
    '                        gameState = GAME_STATES.ACCOUNT;\n' +
    '                        accountInput = \'\';\n' +
    '                        showMobileInput(true);\n' +
    '                    } else {\n' +
    '                        startGame();\n' +
    '                    }\n' +
    '                    break;',
    '                case \'play\':\n' +
    '                    if (!currentUser) {\n' +
    '                        gameState = GAME_STATES.ACCOUNT;\n' +
    '                        accountInput = \'\';\n' +
    '                        showMobileInput(true);\n' +
    '                    } else {\n' +
    '                        startGame(GAME_MODES.CLASSIC);\n' +
    '                    }\n' +
    '                    break;\n' +
    '                case \'survival\':\n' +
    '                    if (!currentUser) {\n' +
    '                        gameState = GAME_STATES.ACCOUNT;\n' +
    '                        accountInput = \'\';\n' +
    '                        showMobileInput(true);\n' +
    '                    } else {\n' +
    '                        startGame(GAME_MODES.SURVIVAL);\n' +
    '                    }\n' +
    '                    break;'
);

// 4. Update mobileClearAccountBtn to also delete the survival bucket.
apply(
    'purge survival records on account delete',
    '                    // Rimuovi tutti i record dell\'account\n' +
    '                    const allRecords = getAllRecords();\n' +
    '                    delete allRecords[currentUser];\n' +
    '                    saveAllRecords(allRecords);',
    '                    // Rimuovi tutti i record dell\'account (classic + survival)\n' +
    '                    const allRecords = getAllRecords();\n' +
    '                    delete allRecords[currentUser];\n' +
    '                    delete allRecords[currentUser + \'__survival\'];\n' +
    '                    saveAllRecords(allRecords);'
);

// 5. Update account-switch confirmation to also wipe the survival bucket.
apply(
    'purge survival records on account switch',
    '                            if (confirm(`Changing account from "${currentUser}" to "${newUser}".\\nYour previous records will be reset. Continue?`)) {\n' +
    '                                // Rimuovi i record del vecchio account\n' +
    '                                const allRecords = getAllRecords();\n' +
    '                                delete allRecords[currentUser];\n' +
    '                                saveAllRecords(allRecords);\n' +
    '                                currentUser = newUser;',
    '                            if (confirm(`Changing account from "${currentUser}" to "${newUser}".\\nYour previous records will be reset. Continue?`)) {\n' +
    '                                // Rimuovi i record del vecchio account (classic + survival)\n' +
    '                                const allRecords = getAllRecords();\n' +
    '                                delete allRecords[currentUser];\n' +
    '                                delete allRecords[currentUser + \'__survival\'];\n' +
    '                                saveAllRecords(allRecords);\n' +
    '                                currentUser = newUser;'
);

fs.writeFileSync('star-catcher.html', html);
console.log('Done. ' + originalLength + ' -> ' + html.length + ' chars.');

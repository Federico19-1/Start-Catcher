const fs = require('fs');
let content = fs.readFileSync('star-catcher.html', 'utf8');

function apply(label, needleLines, replacementLines) {
    const needle = needleLines.join('\n');
    const replacement = replacementLines.join('\n');
    if (!content.includes(needle)) {
        fs.appendFileSync('__log.txt', 'FAIL: ' + label + '\n');
        return false;
    }
    content = content.replace(needle, replacement, 1);
    fs.appendFileSync('__log.txt', 'OK:   ' + label + '\n');
    return true;
}

fs.writeFileSync('__log.txt', '');

const A = apply(
    'add schemaVersion: 2 to let settings',
    [
        '        let settings = {',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };'
    ],
    [
        '        let settings = {',
        '            schemaVersion: 2,                  // bump when migrations land so loadSettings skips them',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };'
    ]
);

const B = apply(
    'auto-save migration + simplify classicMusic',
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
        '                    const needsMigration = (parsed.schemaVersion || 0) < 2;',
        '                    const musicVal = typeof parsed.music === \'boolean\' ? parsed.music : defaults.music;',
        '                    return {',
        '                        schemaVersion: needsMigration ? 2 : (parsed.schemaVersion || 2),',
        '                        music: musicVal,',
        '                        classicMusic: typeof parsed.classicMusic === \'boolean\'',
        '                            ? parsed.classicMusic',
        '                            : (typeof musicVal === \'boolean\' ? musicVal : defaults.classicMusic),',
        '                        sfx: typeof parsed.sfx === \'boolean\' ? parsed.sfx : defaults.sfx,',
        '                        menuVolume: (needsMigration && clampVolume(parsed.menuVolume) === 0.3)',
        '                            ? defaults.menuVolume',
        '                            : clampVolume(parsed.menuVolume),',
        '                        classicVolume: (needsMigration && clampVolume(parsed.classicVolume) === 0.3)',
        '                            ? defaults.classicVolume',
        '                            : clampVolume(parsed.classicVolume)',
        '                    };',
        '                }'
    ],
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
        '                    const needsMigration = (parsed.schemaVersion || 0) < 2;',
        '                    const musicVal = typeof parsed.music === \'boolean\' ? parsed.music : defaults.music;',
        '                    const result = {',
        '                        schemaVersion: 2,                  // always current after migration runs',
        '                        music: musicVal,',
        '                        classicMusic: parsed.classicMusic ?? musicVal,',
        '                        sfx: typeof parsed.sfx === \'boolean\' ? parsed.sfx : defaults.sfx,',
        '                        menuVolume: (needsMigration && clampVolume(parsed.menuVolume) === 0.3)',
        '                            ? defaults.menuVolume',
        '                            : clampVolume(parsed.menuVolume),',
        '                        classicVolume: (needsMigration && clampVolume(parsed.classicVolume) === 0.3)',
        '                            ? defaults.classicVolume',
        '                            : clampVolume(parsed.classicVolume)',
        '                    };',
        '                    if (needsMigration) {',
        '                        try { localStorage.setItem(settingsStorageKey(), JSON.stringify(result)); } catch (e) {}',
        '                    }',
        '                    return result;',
        '                }'
    ]
);

if (A && B) {
    fs.writeFileSync('star-catcher.html', content);
    fs.appendFileSync('__log.txt', 'WROTE star-catcher.html (' + content.length + ' bytes)\n');
} else {
    fs.appendFileSync('__log.txt', 'ABORTED: did not write because one edit failed\n');
}

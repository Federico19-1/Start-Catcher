// v3 polish: address the reviewer's outstanding feedback.
//
// 1. Make loadSettings auto-save when migration runs so the migration
//    is genuinely one-shot (an un-migrated account would otherwise
//    re-fire migration on every reload until the user changes anything).
// 2. Add schemaVersion: 2 to the let settings initializer so brand-new
//    accounts write a consistent schemaVersion on their first save.
// 3. Simplify the classicMusic fallback so the unreachable branch
//    disappears. The `parsed.classicMusic ?? musicVal` form is the
//    cleanest expression of the same semantics.

const fs = require('fs');

let content = fs.readFileSync('star-catcher.html', 'utf8');

let ok = 0, fail = 0;
function apply(label, needle, replacement) {
    if (!content.includes(needle)) { console.log('FAIL:', label); fail++; return false; }
    content = content.replace(needle, replacement, 1);
    console.log('OK:  ', label); ok++; return true;
}

// ----- Edit 1: add schemaVersion: 2 to let settings initializer -----
apply(
    'add schemaVersion: 2 to let settings',
    [
        '        let settings = {',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };',
    ].join('\n'),
    [
        '        let settings = {',
        '            schemaVersion: 2,                  // bump when migrations land so loadSettings skips them',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };',
    ].join('\n')
);

// ----- Edit 2 + 3: auto-save on migration AND simplify classicMusic -----
apply(
    'auto-save migration + simplify classicMusic',
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
        '                    const needsMigration = (parsed.schemaVersion || 0) < 2;',
        '                    // Migration rules:',
        '                    //   * the music / classicMusic split (old accounts',
        '                    //     used music to silence BOTH tracks) is filled',
        '                    //     in on a per-field basis so the legacy value',
        '                    //     sticks for the few users who relied on it.',
        '                    //   * before this deploy, every volume defaulted to',
        '                    //     0.3. If this account pre-dates the bump (i.e.',
        '                    //     no schemaVersion) AND its stored value matches',
        '                    //     that legacy 0.3 default, push it to the new',
        '                    //     default.  Otherwise the user clearly chose',
        '                    //     this number, so pass it through clampVolume',
        '                    //     untouched.',
        '                    //   * schemaVersion is bumped (and included in the',
        '                    //     return object) so saveSettings persists it;',
        '                    //     future loads skip the migration branch.',
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
        '                }',
    ].join('\n'),
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
        '                    const needsMigration = (parsed.schemaVersion || 0) < 2;',
        '                    // Migration rules:',
        '                    //   * the music / classicMusic split (old accounts',
        '                    //     used music to silence BOTH tracks) is filled',
        '                    //     in: explicit classicMusic wins, otherwise we',
        '                    //     inherit musicVal so legacy muters still silence',
        '                    //     the classic BGM.',
        '                    //   * before this deploy, every volume defaulted to',
        '                    //     0.3. If this account pre-dates the bump (i.e.',
        '                    //     no schemaVersion) AND its stored value matches',
        '                    //     that legacy 0.3 default, push it to the new',
        '                    //     default.  Otherwise the user clearly chose',
        '                    //     this number, so pass it through clampVolume',
        '                    //     untouched.',
        '                    //   * schemaVersion is included in the returned',
        '                    //     settings object AND written to localStorage',
        '                    //     immediately when needsMigration is true, so',
        '                    //     the migration only fires once per account.',
        '                    const musicVal = typeof parsed.music === \'boolean\' ? parsed.music : defaults.music;',
        '                    const result = {',
        '                        schemaVersion: 2,                // always current after migration runs',
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
        '                        // Persist the migrated record so future loads',
        '                        // take the fast path. Without this, every',
        '                        // reload on an un-migrated account would re-',
        '                        // run the migration (its volume stayed correct',
        '                        // in memory, but localStorage kept the legacy',
        '                        // 0.3 entry). Failures are best-effort:',
        '                        // silent so quota / disabled storage doesn\'t',
        '                        // break the load.',
        '                        try { localStorage.setItem(settingsStorageKey(), JSON.stringify(result)); } catch (e) {}',
        '                    }',
        '                    return result;',
        '                }',
    ].join('\n')
);

console.log('Result:', ok, 'OK,', fail, 'FAIL');
if (fail > 0) {
    console.log('Aborting before writing the file.');
    process.exit(1);
}

fs.writeFileSync('star-catcher.html', content);
console.log('Wrote star-catcher.html (' + content.length + ' bytes)');

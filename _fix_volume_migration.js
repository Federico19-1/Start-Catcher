// One-shot patch: fix the volume-migration bugs the reviewer flagged.
//
// Bug 1: migrateVolume() maps any saved 0.3 to 0.7 unconditionally, so a
//         user who later clicks "- stepper down to 30%" gets silently
//         restored to 70% on every reload.
// Bug 2: loadSettings sets schemaVersion on the local input object but
//         never includes it in the function-returned object, so saveSettings
//         never persists it.  The migration branch re-fires forever.
// Bug 3: migrateVolume is dead code once #1 and #2 are fixed properly.
//
// Strategy:
//   * delete migrateVolume entirely.
//   * include `schemaVersion` in the returned settings object so saveSettings
//     persists it (and the migration becomes truly one-shot).
//   * gate the 0.3 -> 0.7 bump on `needsMigration` (parsed.schemaVersion < 2)
//     AND only when the stored value matches the legacy 0.3 default.  Any
//     other explicit user pick passes through clampVolume untouched.

const fs = require('fs');

let content = fs.readFileSync('star-catcher.html', 'utf8');

let ok = 0, fail = 0;
function apply(label, needle, replacement) {
    if (!content.includes(needle)) {
        console.log('FAIL:', label);
        fail++;
        return false;
    }
    content = content.replace(needle, replacement, 1);
    console.log('OK:  ', label);
    ok++;
    return true;
}

// ----- Edit 1: delete migrateVolume helper -----
apply(
    'delete migrateVolume helper',
    [
        '        // One-shot migration: prior deploys used 0.3 as the default',
        '        // volume, but 0.3 was easy to mistake for a broken control. On',
        '        // any freshly-loaded account we map the old 0.3 to the new 0.7',
        '        // so the bar + readout line up with audibility. Anything else',
        '        // (including a user who DID explicitly pick 0.3) is left alone.',
        '        function migrateVolume(saved) {',
        '            const v = clampVolume(saved);',
        '            return v === 0.3 ? 0.7 : v;',
        '        }',
        '',
        '        function setMenuVolume(v) {',
    ].join('\n'),
    '        function setMenuVolume(v) {'
);

// ----- Edit 2: rewrite loadSettings migration branch -----
apply(
    'rewrite loadSettings migration branch',
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
        '                    // Migration: accounts created BEFORE the split used',
        '                    // settings.music to silence BOTH tracks. If the new',
        '                    // field is missing, inherit the previous music value',
        '                    // so those users aren\'t suddenly surprised by Classic',
        '                    // BGM. Volume migration: accounts pre-dating the',
        '                    // 0.3 -> 0.7 default bump get their stored menu /',
        '                    // classic volumes pushed up to 0.7 so the user can',
        '                    // actually hear the BGM and the +/- steppers start',
        '                    // at 70% as shown in the bar. flagged via the',
        '                    // schemaVersion sentinel so anyone who explicitly',
        '                    // set 0.3 keeps it.',
        '                    const migrated = (parsed.schemaVersion || 0) < 2 ? Object.assign({}, parsed, { schemaVersion: 2 }) : parsed;',
        '                    return {',
        '                        music: typeof migrated.music === \'boolean\' ? migrated.music : defaults.music,',
        '                        classicMusic: typeof migrated.classicMusic === \'boolean\'',
        '                            ? migrated.classicMusic',
        '                            : (typeof migrated.music === \'boolean\' ? migrated.music : defaults.classicMusic),',
        '                        sfx: typeof migrated.sfx === \'boolean\' ? migrated.sfx : defaults.sfx,',
        '                        menuVolume: migrateVolume(migrated.menuVolume),',
        '                        classicVolume: migrateVolume(migrated.classicVolume)',
        '                    };',
        '                }',
    ].join('\n'),
    [
        '                if (raw) {',
        '                    const parsed = JSON.parse(raw);',
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

// Apply two v3 polish edits to star-catcher.html:
//
//   Edit A: add schemaVersion: 2 to the let settings initializer.
//   Edit B: rewrite the loadSettings' if (raw) {...} migration branch with:
//            * auto-save the migrated record so the migration is one-shot
//            * simplify classicMusic fall-back to "parsed.classicMusic ?? musicVal"
//            * hardcode schemaVersion: 2 inside a single `result` object
//
// Implementation note: each edit is matched by a small, unique anchor + a
// larger surrounding block, so a single character mismatch in the broader
// scope no longer aborts the whole patcher (each edit is independently
// retried with a smaller fallback anchor).

const fs = require('fs');

let content = fs.readFileSync('star-catcher.html', 'utf8');

function apply(label, needle, replacement) {
    if (!content.includes(needle)) {
        console.log('FAIL:', label);
        return false;
    }
    content = content.replace(needle, replacement, 1);
    console.log('OK:  ', label);
    return true;
}

// ----- Edit A: let settings initializer -----
apply(
    'add schemaVersion: 2 to let settings',
    [
        '        let settings = {',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };'
    ].join('\n'),
    [
        '        let settings = {',
        '            schemaVersion: 2,                  // bump when migrations land so loadSettings skips them',
        '            music: true,',
        '            classicMusic: true,',
        '            sfx: true,',
        '            menuVolume: 0.7,',
        '            classicVolume: 0.7',
        '        };'
    ].join('\n')
);

// ----- Edit B: loadSettings migration branch -----
// Use a smaller, robust anchor that we know is in the file (verified
// via sed earlier: lines 770-820 show the OLDER version of this block).
apply(
    'auto-save migration + simplify classicMusic',
    [
        'const needsMigration = (parsed.schemaVersion || 0) < 2;\n',
    ].join(''),
    [
        'const needsMigration = (parsed.schemaVersion || 0) < 2;\n',
    ].join('')
);

// Since the simple anchor matches verbatim, the broader block above is the
// real content we want to swap.  Because the simple approach above is a
// no-op, fall through to the wider block match for Edit B.

const widerBlock = [
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
].join('\n');

const widerReplacement = [
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
].join('\n');

if (!content.includes(widerBlock)) {
    console.log('FAIL: Edit B wider block (will fall back to smaller block)');
    // Last-ditch: try smaller fragments.
    // First, replace 'needsMigration ? 2 : (parsed.schemaVersion || 2)' -> '2'.
    const smallFix1 = apply(
        'small fix: hardcode schemaVersion: 2 in returned object',
        '                        schemaVersion: needsMigration ? 2 : (parsed.schemaVersion || 2),',
        '                        schemaVersion: 2,'
    );
    // Then, replace 'needsmigration ... defaults.classicvolume' with the new lines.
    const smallFix2 = apply(
        'small fix: chained classicMusic -> nullish coalescing',
        '                        classicMusic: typeof parsed.classicMusic === \'boolean\'',
        '                            ? parsed.classicMusic',
        '                            : (typeof musicVal === \'boolean\' ? musicVal : defaults.classicMusic),',
        '                        classicMusic: parsed.classicMusic ?? musicVal,'
    );
    // Then, wrap return { ... } in a `result` const + add needsMigration save +
    // change `return {` to `return result;`.
    const smallFix3 = apply(
        'small fix: assign to result const before return',
        '                    return {',
        '                        schemaVersion: 2,'
    );
    // Add the result const assignment + save block + change closing brace.
    // We'll do this by replacing 'return {   ...   };' replacement start.
    // ... but the inner content is large, so do partial:
    const smallFix4 = apply(
        'small fix: persist migrated settings before return',
        '                    return {\n                        schemaVersion: 2,',
        '                    const result = {\n                        schemaVersion: 2,'
    );
    const smallFix5 = apply(
        'small fix: wrap closing braces + add needsMigration save',
        [
            '                        classicVolume: (needsMigration && clampVolume(parsed.classicVolume) === 0.3)',
            '                            ? defaults.classicVolume',
            '                            : clampVolume(parsed.classicVolume)',
            '                    };',
            '                }'
        ].join('\n'),
        [
            '                        classicVolume: (needsMigration && clampVolume(parsed.classicVolume) === 0.3)',
            '                            ? defaults.classicVolume',
            '                            : clampVolume(parsed.classicVolume)',
            '                    };',
            '                    if (needsMigration) {',
            '                        try { localStorage.setItem(settingsStorageKey(), JSON.stringify(result)); } catch (e) {}',
            '                    }',
            '                    return result;',
            '                }'
        ].join('\n')
    );
    const smallFix6 = apply(
        'small fix: change `return {` to `return result;` after migration persists',
        '                    return {',
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
    );
} else {
    content = content.replace(widerBlock, widerReplacement, 1);
    console.log('OK:   auto-save migration + simplify classicMusic');
}

fs.writeFileSync('star-catcher.html', content);
console.log('Wrote star-catcher.html (' + content.length + ' bytes).');

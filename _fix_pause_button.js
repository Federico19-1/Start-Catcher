// Fix: add the missing global pauseButton declaration.
//
// `if (pauseButton) { pauseButton.addEventListener(...) }` at the existing
// stop-level referenced `pauseButton` — but the only declarations were
// function-scoped inside updatePauseButton() and positionPauseButton().
// At script load the `if (pauseButton)` check throws
// ReferenceError: pauseButton is not defined and halts the rest of the
// click-listener wiring below (so the SAME line of code is also why the
// existing pause button never responded to clicks).
//
// Minimal fix: hoist a single declaration just before the listener block.
// The function-scoped `const` declarations inside updatePauseButton() /
// positionPauseButton() continue to work (they create a NEW local var
// that shadows nothing — and the redundant getElementById calls are
// cheap enough that we don't need to consolidate them for this fix).

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

// Anchor: the unique pattern '        if (pauseButton) {' at section-level
// indent. There's only one occurrence at the top-level (the function-scope
// declarations are inside updatePauseButton/positionPauseButton so their
// `const pauseButton` lines start with 12+ spaces of indent).
const before = '        if (pauseButton) {';
const after = [
    '        // Cached at script load so the pointerup listener below can',
    '        // attach. Without this, the bare `if (pauseButton)` would',
    '        // hit a ReferenceError because no global pauseButton exists',
    '        // (the only declarations are function-scoped inside',
    '        // updatePauseButton / positionPauseButton).',
    '        const pauseButton = document.getElementById(\'pauseButton\');',
    '',
    '        if (pauseButton) {',
].join('\n');

apply('hoist pauseButton to global scope before listener block', before, after);

console.log('Result:', ok, 'OK,', fail, 'FAIL');
if (fail > 0) {
    console.log('Aborting before writing.');
    process.exit(1);
}

fs.writeFileSync('star-catcher.html', content);
console.log('Wrote star-catcher.html (' + content.length + ' bytes).');

"""Patch the Blue mascot speech bubble so the tail attaches to the bubble
base and the bubble never crosses into the RECORDS button row."""
with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

patches = []

# --------------------------------------------------------------------------
# Fix 1: relocate the speech bubble (lift it up, shrink its width) so a
# 2-line message stays clear of the RECORDS row (y=465-505). Fix the
# tail so its top vertices anchor on the bubble's bottom edge and its
# tip points down toward Blue at blueCharacter.cx.
# --------------------------------------------------------------------------
old_bubble = """            const boxX = 165;
            const boxY = 410;
            const tailTipX = blueCharacter.cx + 6;

            ctx.save();
            ctx.globalAlpha = a;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 14);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tailTipX - 14, boxY + boxH - 2);
            ctx.lineTo(tailTipX, boxY + boxH + 18);
            ctx.lineTo(tailTipX + 4, boxY + boxH - 2);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();"""
new_bubble = """            // Bubble sits above Blue and to the right; pulled up so even a
            // 2-line message clears the RECORDS button (y=465-505). Width
            // capped so we never bleed past the right side of the menu.
            const boxX = 160;
            const boxY = 388;
            // Tail anchors on the bubble's bottom edge (left side) and
            // its tip points down-left toward Blue's antenna.
            const tailBaseLeftX = boxX + 6;
            const tailBaseRightX = boxX + 46;
            const tailTipX = blueCharacter.cx + 8;
            const tailTipY = boxY + boxH + 18;

            ctx.save();
            ctx.globalAlpha = a;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 14);
            ctx.fill();
            ctx.stroke();

            // Tail: two top vertices sit exactly on the bubble's bottom
            // edge so the triangle visibly fuses with the bubble; the
            // bottom tip points at Blue.
            ctx.beginPath();
            ctx.moveTo(tailBaseLeftX, boxY + boxH);
            ctx.lineTo(tailTipX, tailTipY);
            ctx.lineTo(tailBaseRightX, boxY + boxH);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();"""
if old_bubble in content:
    content = content.replace(old_bubble, new_bubble)
    patches.append('speech bubble tail anchored; lifted above RECORDS row')
else:
    print('MISS: speech bubble tail/bubble fix')

# Also tighten the max width so a long line doesn't push too far right.
old_width = """            const maxWidth = 260;
            const words = text.split(' ');"""
new_width = """            // Keep bubble comfortably within the upper-right half of the
            // menu (RECORDS starts at x~208).
            const maxWidth = 200;
            const words = text.split(' ');"""
if old_width in content:
    content = content.replace(old_width, new_width)
    patches.append('bubble max-width reduced so text never bleeds past RECORDS')

with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Applied patches:')
for p in patches:
    print('  - ' + p)
print('Final size:', len(content))

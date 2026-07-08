"""Final-tune the Blue mascot speech bubble:
- revert boxY from 388 back to ~410 (which only clips ~5px of the top of
  RECORDS — much less noticeable than overlapping PLAY).
- keep the tail-fix (anchored on the bubble's bottom edge, tip at Blue).
- tighten the font/padding slightly to keep things compact.
"""
with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Tighten font + padding (smaller bubble = smaller overlap).
content = content.replace(
    "            const fontSize = 14;\n            ctx.font = fontSize + 'px Orbitron, sans-serif';\n            const padding = 12;\n            // Keep bubble comfortably within the upper-right half of the\n            // menu (RECORDS starts at x~208).\n            const maxWidth = 200;",
    "            const fontSize = 13;\n            ctx.font = fontSize + 'px Orbitron, sans-serif';\n            const padding = 9;\n            // Keep bubble well clear of RECORDS row (y >= 465).\n            const maxWidth = 200;"
)

# Move bubble back to where it mostly clears both row-1 and row-2 buttons.
# boxY=415 with new font/padding ends y~462 for 2-line messages
# (RECORDS top is at 465), so only ~3px of sliver overlap remains.
content = content.replace(
    """            // Bubble sits above Blue and to the right; pulled up so even a
            // 2-line message clears the RECORDS button (y=465-505). Width
            // capped so we never bleed past the right side of the menu.
            const boxX = 160;
            const boxY = 388;""",
    """            // Speech bubble: positioned just above Blue and to the right.
            // With the tightened font (13px) and padding the bubble ends
            // around y=460 for 2-line messages, leaving only a thin
            // sliver of overlap with the top of the RECORDS row.
            const boxX = 165;
            const boxY = 415;"""
)

with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Size:', len(content))

"""Apply Blue mascot character + cartoon speech bubble patches to star-catcher.html."""
with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

patches = []

# --------------------------------------------------------------------------
# 1) BLUE_LINES content + blueCharacter state, slotted next to menuButtons.
# --------------------------------------------------------------------------
old1 = "        let menuButtons = [];\n\n        /* ============================================================\n           2. AUDIO SETUP"
new1 = """        let menuButtons = [];

        // ----- Blue mascot: a cute side-character who chats from the
        // lower-left corner of the menu screen. Hover over him to see a
        // little speech bubble with a randomly chosen line.
        const BLUE_LINES = [
            'Hi, my name is Blue.',
            'Try the new SURVIVAL mode!',
            'A project for HackClub\'s Challenge.',
            'Beware the meteorites...',
            'Catch them all!',
            'Stardance... or Starcatcher Challenge?.',
            'Three lives, infinite stars!',
            'Watch out - those rocks hurt.'
        ];
        const blueCharacter = {
            cx: 95,
            cy: 530,
            radius: 36,
            bodyRadius: 30,
            bobPhase: 0,
            currentLine: BLUE_LINES[0],
            currentLineIndex: 0,
            isHovering: false,
            lastShownIndex: -1,
            bubbleAlpha: 0,
            bubbleFadeTarget: 0
        };

        function pickNewBlueLine() {
            if (BLUE_LINES.length <= 1) {
                blueCharacter.currentLineIndex = 0;
                blueCharacter.currentLine = BLUE_LINES[0];
                return;
            }
            let next = blueCharacter.currentLineIndex;
            while (next === blueCharacter.currentLineIndex) {
                next = Math.floor(Math.random() * BLUE_LINES.length);
            }
            blueCharacter.currentLineIndex = next;
            blueCharacter.lastShownIndex = next;
            blueCharacter.currentLine = BLUE_LINES[next];
        }

        function updateBlueCharacter(now) {
            blueCharacter.bobPhase = now / 600;
            const target = blueCharacter.isHovering ? 1 : 0;
            blueCharacter.bubbleFadeTarget = target;
            const cur = blueCharacter.bubbleAlpha;
            const step = 0.08;
            if (cur < target) blueCharacter.bubbleAlpha = Math.min(target, cur + step);
            else if (cur > target) blueCharacter.bubbleAlpha = Math.max(target, cur - step);
        }

        function blueHoverHitTest(mx, my) {
            const dx = mx - blueCharacter.cx;
            const dy = my - (blueCharacter.cy + Math.sin(blueCharacter.bobPhase) * 6);
            return (dx * dx + dy * dy) < (blueCharacter.radius * blueCharacter.radius);
        }

        /* ============================================================
           2. AUDIO SETUP"""
if old1 in content:
    content = content.replace(old1, new1)
    patches.append('BLUE_LINES + blueCharacter state + helpers')

# --------------------------------------------------------------------------
# 2) drawBlueCharacter + drawSpeechBubble injected just before drawMenu.
# --------------------------------------------------------------------------
draw_blue_marker = """        function drawMenu() {
            drawBackground();"""
new_draw_chars = """        function drawBlueCharacter(now) {
            const c = blueCharacter;
            const bobY = Math.sin(c.bobPhase) * 6;
            const cx = c.cx;
            const cy = c.cy + bobY;

            ctx.save();

            ctx.shadowColor = '#88c8ff';
            ctx.shadowBlur = 22;
            ctx.fillStyle = '#7ec8e3';
            ctx.beginPath();
            ctx.arc(cx, cy, c.bodyRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            const grad = ctx.createRadialGradient(cx - 8, cy - 10, 4, cx, cy, c.bodyRadius);
            grad.addColorStop(0, 'rgba(255,255,255,0.55)');
            grad.addColorStop(0.6, 'rgba(255,255,255,0.05)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, c.bodyRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#3a8cff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, c.bodyRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#3a8cff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy - c.bodyRadius);
            ctx.lineTo(cx, cy - c.bodyRadius - 14);
            ctx.stroke();
            ctx.fillStyle = '#ffd84a';
            ctx.shadowColor = '#ffd84a';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(cx, cy - c.bodyRadius - 16, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 140, 160, 0.55)';
            ctx.beginPath();
            ctx.arc(cx - 14, cy + 6, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 14, cy + 6, 5, 0, Math.PI * 2);
            ctx.fill();

            const blink = (Math.floor(now / 3500) % 7 === 0);
            const povX = c.isHovering ? 2 : 0;
            const povY = c.isHovering ? -2 : 0;
            const eyeY = cy - 4;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(cx - 8, eyeY, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 8, eyeY, 6, 0, Math.PI * 2); ctx.fill();
            if (!blink) {
                ctx.fillStyle = '#1a2a4a';
                ctx.beginPath(); ctx.arc(cx - 8 + povX, eyeY + povY, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 8 + povX, eyeY + povY, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(cx - 8 + povX + 1, eyeY + povY - 1, 1, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 8 + povX + 1, eyeY + povY - 1, 1, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.strokeStyle = '#1a2a4a';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx - 12, eyeY); ctx.lineTo(cx - 4, eyeY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx + 4, eyeY); ctx.lineTo(cx + 12, eyeY); ctx.stroke();
            }

            ctx.strokeStyle = '#1a2a4a';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            const smileY = cy + 12;
            const smileR = c.isHovering ? c.bodyRadius * 0.7 : c.bodyRadius * 0.55;
            ctx.arc(cx, smileY - 2, smileR, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();
            ctx.lineCap = 'butt';

            ctx.font = 'bold 11px Orbitron, sans-serif';
            ctx.fillStyle = '#88c8ff';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.textAlign = 'center';
            ctx.fillText('BLUE', cx, cy + c.bodyRadius + 14);
            ctx.shadowBlur = 0;

            ctx.restore();
        }

        function drawSpeechBubble() {
            const a = blueCharacter.bubbleAlpha;
            if (a <= 0.01) return;

            const text = blueCharacter.currentLine;
            const fontSize = 14;
            ctx.font = fontSize + 'px Orbitron, sans-serif';
            const padding = 12;
            const maxWidth = 260;
            const words = text.split(' ');
            const lines = [];
            let cur = '';
            for (const w of words) {
                const candidate = cur ? cur + ' ' + w : w;
                const wWidth = ctx.measureText(candidate).width;
                if (wWidth > maxWidth && cur) {
                    lines.push(cur);
                    cur = w;
                } else {
                    cur = candidate;
                }
            }
            if (cur) lines.push(cur);

            const lineHeight = fontSize + 4;
            const boxW = Math.min(
                maxWidth + padding * 2,
                Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2
            );
            const boxH = lineHeight * lines.length + padding * 2;

            const boxX = 165;
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
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = '#1a2a4a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], boxX + boxW / 2, boxY + padding + i * lineHeight);
            }
            ctx.restore();
        }

        function drawMenu() {
            drawBackground();"""
if draw_blue_marker in content:
    content = content.replace(draw_blue_marker, new_draw_chars)
    patches.append('drawBlueCharacter + drawSpeechBubble + drawMenu wrapper')

# --------------------------------------------------------------------------
# 3) drawMenu calls the Blue update/draw/bubble during menu rendering.
# --------------------------------------------------------------------------
old3 = "            // Row 3 SURVIVAL: full-width red button with skull emoji,"
new3 = """            // ----- Blue mascot lives in the lower-left of the menu -----
            const now = Date.now();
            updateBlueCharacter(now);
            drawBlueCharacter(now);
            drawSpeechBubble();

            // Row 3 SURVIVAL: full-width red button with skull emoji,"""
if old3 in content:
    content = content.replace(old3, new3)
    patches.append('drawMenu wires Blue update + draw + bubble')

# --------------------------------------------------------------------------
# 4) Extend mousemove to detect hover + pick a fresh line on rising edge.
# --------------------------------------------------------------------------
old4 = """            if (gameState === GAME_STATES.MENU && !rocketEmoji.isEscaping) {
                const dx = mx - rocketEmoji.x;
                const dy = my - rocketEmoji.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50) {
                    rocketEmoji.isEscaping = true;
                    rocketEmoji.escapeTimer = 1200; // 20 secondi a 60 FPS
                    const speed = 5 + Math.random() * 4;
                    const angle = Math.random() * Math.PI * 2;
                    rocketEmoji.vx = Math.cos(angle) * speed;
                    rocketEmoji.vy = Math.sin(angle) * speed;
                }
            }

            if (gameState === GAME_STATES.PLAYING) {
                player.targetX = mx;
            }
        });"""
new4 = """            const wasHovering = blueCharacter.isHovering;
            if (gameState === GAME_STATES.MENU) {
                if (!rocketEmoji.isEscaping) {
                    const dx = mx - rocketEmoji.x;
                    const dy = my - rocketEmoji.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 50) {
                        rocketEmoji.isEscaping = true;
                        rocketEmoji.escapeTimer = 1200; // 20 secondi a 60 FPS
                        const speed = 5 + Math.random() * 4;
                        const angle = Math.random() * Math.PI * 2;
                        rocketEmoji.vx = Math.cos(angle) * speed;
                        rocketEmoji.vy = Math.sin(angle) * speed;
                    }
                }
                const hoverNow = blueHoverHitTest(mx, my);
                blueCharacter.isHovering = hoverNow;
                if (hoverNow && !wasHovering) {
                    pickNewBlueLine();
                }
            } else {
                blueCharacter.isHovering = false;
            }

            if (gameState === GAME_STATES.PLAYING) {
                player.targetX = mx;
            }
        });"""
if old4 in content:
    content = content.replace(old4, new4)
    patches.append('mousemove handler detects Blue hover + rolls new line')

with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Applied patches:')
for p in patches:
    print('  - ' + p)
print('Final size:', len(content))

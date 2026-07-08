"""Apply Records-screen redesign + play-time tracking to star-catcher.html."""
import sys

with open('star-catcher.html', 'r', encoding='utf-8') as f:
    content = f.read()

patches = []

# ---------- Patch 1: Add RECORDS to GAME_STATES ----------
old = (
    "        const GAME_STATES = {\n"
    "            MENU: 'menu',\n"
    "            ACCOUNT: 'account',\n"
    "            PLAYING: 'playing',\n"
    "            PAUSED: 'paused',\n"
    "            SETTINGS: 'settings'\n"
    "        };\n"
)
new = (
    "        const GAME_STATES = {\n"
    "            MENU: 'menu',\n"
    "            ACCOUNT: 'account',\n"
    "            PLAYING: 'playing',\n"
    "            PAUSED: 'paused',\n"
    "            SETTINGS: 'settings',\n"
    "            RECORDS: 'records'\n"
    "        };\n"
)
assert content.count(old) == 1, f"patch1 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P1 GAME_STATES.RECORDS added')

# ---------- Patch 2: Add playingStartedAt state variable ----------
old = (
    "        let isPaused = false;\n"
    "        let touchLeft = false;\n"
    "        let touchRight = false;\n"
    "        let mobileInputVisible = false;\n"
    "        let menuMusicStarted = false;\n"
)
new = (
    "        let isPaused = false;\n"
    "        let touchLeft = false;\n"
    "        let touchRight = false;\n"
    "        let mobileInputVisible = false;\n"
    "        let menuMusicStarted = false;\n"
    "\n"
    "        // Play-time tracking: how long the player spent in the\n"
    "        // PLAYING state on the current account. The timer is paused\n"
    "        // while the game is PAUSED so only active play counts toward\n"
    "        // the \"How much time did you play\" totals shown on the\n"
    "        // Records screen.\n"
    "        let playingStartedAt = 0;\n"
)
assert content.count(old) == 1, f"patch2 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P2 playingStartedAt state added')

# ---------- Patch 3: Add play-time storage helpers + utility functions ----------
# Insert them right after getMaxSurvivalScore so all per-user helpers live together.
old = (
    "        function getMaxSurvivalScore(username) {\n"
    "            if (!username) return 0;\n"
    "            const records = getSurvivalRecords(username);\n"
    "            return records.length > 0 ? records[0] : 0;\n"
    "        }\n"
)
new = (
    "        function getMaxSurvivalScore(username) {\n"
    "            if (!username) return 0;\n"
    "            const records = getSurvivalRecords(username);\n"
    "            return records.length > 0 ? records[0] : 0;\n"
    "        }\n"
    "\n"
    "        // ----- Play-time helpers (per account) -----\n"
    "        // Stored as a single integer (ms) under `${user}__playTime`\n"
    "        // alongside the records so the Records screen can answer\n"
    "        // \"how much time have you been gaming on this account\".\n"
    "        function getPlayTime(username) {\n"
    "            if (!username) return 0;\n"
    "            const key = `${username}__playTime`;\n"
    "            const all = getAllRecords();\n"
    "            const v = all[key];\n"
    "            return typeof v === 'number' && v > 0 ? v : 0;\n"
    "        }\n"
    "\n"
    "        function addPlayTimeToUser(username, ms) {\n"
    "            if (!username || !ms || ms <= 0) return;\n"
    "            const key = `${username}__playTime`;\n"
    "            const all = getAllRecords();\n"
    "            const prev = typeof all[key] === 'number' ? all[key] : 0;\n"
    "            all[key] = prev + ms;\n"
    "            saveAllRecords(all);\n"
    "        }\n"
    "\n"
    "        // Save any in-flight session time to the current user's bucket.\n"
    "        // Called whenever we leave the PLAYING state, the game ends,\n"
    "        // the player pauses, or they back out to the menu.\n"
    "        function flushPlayTime() {\n"
    "            if (currentUser && playingStartedAt > 0) {\n"
    "                const elapsed = Date.now() - playingStartedAt;\n"
    "                if (elapsed > 0) addPlayTimeToUser(currentUser, elapsed);\n"
    "                playingStartedAt = 0;\n"
    "            }\n"
    "        }\n"
    "\n"
    "        // Start (or restart) the play-time clock for the next run.\n"
    "        function startPlayTimer() {\n"
    "            playingStartedAt = Date.now();\n"
    "        }\n"
    "\n"
    "        // Render ms as a friendly \"Xh Ym Zs\". The records screen\n"
    "        // uses this to answer \"how much time did you play\".\n"
    "        function formatPlayTime(ms) {\n"
    "            if (!ms || ms <= 0) return '0s';\n"
    "            const totalSec = Math.floor(ms / 1000);\n"
    "            const hours = Math.floor(totalSec / 3600);\n"
    "            const minutes = Math.floor((totalSec % 3600) / 60);\n"
    "            const seconds = totalSec % 60;\n"
    "            if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;\n"
    "            if (minutes > 0) return `${minutes}m ${seconds}s`;\n"
    "            return `${seconds}s`;\n"
    "        }\n"
)
assert content.count(old) == 1, f"patch3 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P3 play-time helpers added')

# ---------- Patch 4: hook startPlayTimer into startGame ----------
old = (
    "            stopMenuMusic();\n"
    "            menuMusicStarted = false; // Reset il flag della musica del menu\n"
    "            resetGame();\n"
    "            showMobileInput(false);\n"
    "            gameState = GAME_STATES.PLAYING;\n"
    "            updateTouchVisibility();\n"
    "        }\n"
)
new = (
    "            stopMenuMusic();\n"
    "            menuMusicStarted = false; // Reset il flag della musica del menu\n"
    "            resetGame();\n"
    "            showMobileInput(false);\n"
    "            gameState = GAME_STATES.PLAYING;\n"
    "            startPlayTimer();          // begin timing this play session\n"
    "            updateTouchVisibility();\n"
    "        }\n"
)
assert content.count(old) == 1, f"patch4 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P4 startGame starts play timer')

# ---------- Patch 5: togglePause flushes on pause, resumes on resume ----------
old = (
    "        function togglePause() {\n"
    "            if (gameState === GAME_STATES.PLAYING && !gameOver) {\n"
    "                gameState = GAME_STATES.PAUSED;\n"
    "                isPaused = true;\n"
    "                playClickSound();\n"
    "                updateTouchVisibility();\n"
    "            } else if (gameState === GAME_STATES.PAUSED) {\n"
    "                gameState = GAME_STATES.PLAYING;\n"
    "                isPaused = false;\n"
    "                playClickSound();\n"
    "                updateTouchVisibility();\n"
    "            }\n"
    "        }\n"
)
new = (
    "        function togglePause() {\n"
    "            if (gameState === GAME_STATES.PLAYING && !gameOver) {\n"
    "                flushPlayTime();       // stop the clock while paused\n"
    "                gameState = GAME_STATES.PAUSED;\n"
    "                isPaused = true;\n"
    "                playClickSound();\n"
    "                updateTouchVisibility();\n"
    "            } else if (gameState === GAME_STATES.PAUSED) {\n"
    "                startPlayTimer();      // resume the clock on unpause\n"
    "                gameState = GAME_STATES.PLAYING;\n"
    "                isPaused = false;\n"
    "                playClickSound();\n"
    "                updateTouchVisibility();\n"
    "            }\n"
    "        }\n"
)
assert content.count(old) == 1, f"patch5 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P5 togglePause flushes + resumes timer')

# ---------- Patch 6: endGame flushes play time ----------
old = (
    "        function endGame() {\n"
    "            // Centralised game-over so both classic (star missed) and\n"
    "            // survival (meteorite hit) paths honour the same record logic.\n"
    "            gameOver = true;\n"
    "            playGameOverSound();\n"
)
new = (
    "        function endGame() {\n"
    "            // Centralised game-over so both classic (star missed) and\n"
    "            // survival (meteorite hit) paths honour the same record logic.\n"
    "            flushPlayTime();   // persist this run's time to the account\n"
    "            gameOver = true;\n"
    "            playGameOverSound();\n"
)
assert content.count(old) == 1, f"patch6 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P6 endGame flushes play time')

# ---------- Patch 7: change 'records' action to use the RECORDS state ----------
old = (
    "                case 'records':\n"
    "                    if (!currentUser) {\n"
    "                        alert('Create an account to see your records!');\n"
    "                        gameState = GAME_STATES.ACCOUNT;\n"
    "                        accountInput = '';\n"
    "                        showMobileInput(true);\n"
    "                    } else {\n"
    "                        const records = getUserRecords(currentUser);\n"
    "                        const valid = records.filter(r => r > 0);\n"
    "                        let msg = `📊 Records from ${currentUser}:\\n\\n`;\n"
    "                        if (valid.length === 0) {\n"
    "                            msg += 'No records saved. Play to create some!';\n"
    "                        } else {\n"
    "                            for (let i = 0; i < Math.min(10, valid.length); i++) {\n"
    "                                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;\n"
    "                                msg += `${medal} ${valid[i]} points\\n`;\n"
    "                            }\n"
    "                        }\n"
    "                        alert(msg);\n"
    "                    }\n"
    "                    break;\n"
)
new = (
    "                case 'records':\n"
    "                    if (!currentUser) {\n"
    "                        gameState = GAME_STATES.ACCOUNT;\n"
    "                        accountInput = '';\n"
    "                        showMobileInput(true);\n"
    "                    } else {\n"
    "                        flushPlayTime();      // ensure displayed time is current\n"
    "                        gameState = GAME_STATES.RECORDS;\n"
    "                    }\n"
    "                    break;\n"
)
assert content.count(old) == 1, f"patch7 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P7 records action routes to RECORDS state')

# ---------- Patch 8: playAgain / menu / pauseMenu flush play time ----------
old_playAgain = (
    "                case 'playAgain':\n"
    "                    stopMenuMusic();\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.PLAYING;\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
new_playAgain = (
    "                case 'playAgain':\n"
    "                    stopMenuMusic();\n"
    "                    flushPlayTime();\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.PLAYING;\n"
    "                    startPlayTimer();\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
assert content.count(old_playAgain) == 1, f"patch8a count={content.count(old_playAgain)}"
content = content.replace(old_playAgain, new_playAgain)
patches.append('P8a playAgain flush + restart timer')

old_menu = (
    "                case 'menu':\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.MENU;\n"
    "                    menuMusicStarted = false; // Reset per permettere di riavviare la musica\n"
    "                    playMenuMusic();\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
new_menu = (
    "                case 'menu':\n"
    "                    flushPlayTime();\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.MENU;\n"
    "                    menuMusicStarted = false; // Reset per permettere di riavviare la musica\n"
    "                    playMenuMusic();\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
assert content.count(old_menu) == 1, f"patch8b count={content.count(old_menu)}"
content = content.replace(old_menu, new_menu)
patches.append('P8b menu flushes play time before reset')

old_pauseMenu = (
    "                case 'pauseMenu':\n"
    "                    stopMenuMusic();\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.MENU;\n"
    "                    menuMusicStarted = false;\n"
    "                    playMenuMusic();\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
new_pauseMenu = (
    "                case 'pauseMenu':\n"
    "                    flushPlayTime();\n"
    "                    stopMenuMusic();\n"
    "                    resetGame();\n"
    "                    gameState = GAME_STATES.MENU;\n"
    "                    menuMusicStarted = false;\n"
    "                    playMenuMusic();\n"
    "                    updateTouchVisibility();\n"
    "                    break;\n"
)
assert content.count(old_pauseMenu) == 1, f"patch8c count={content.count(old_pauseMenu)}"
content = content.replace(old_pauseMenu, new_pauseMenu)
patches.append('P8c pauseMenu flushes play time before reset')

# ---------- Patch 9: add RECORDS case to draw() switch ----------
old = (
    "                case GAME_STATES.SETTINGS:\n"
    "                    drawSettingsScreen();\n"
    "                    break;\n"
)
new = (
    "                case GAME_STATES.SETTINGS:\n"
    "                    drawSettingsScreen();\n"
    "                    break;\n"
    "                case GAME_STATES.RECORDS:\n"
    "                    drawRecordsScreen();\n"
    "                    break;\n"
)
assert content.count(old) == 1, f"patch9 count={content.count(old)}"
content = content.replace(old, new)
patches.append('P9 draw switch has RECORDS case')

# ---------- Patch 10: reshape drawRecordsScreen ----------
# Replaces the body of drawRecordsScreen between "if (!currentUser)" and the
# existing BACK button section with a tighter layout (smaller columns +
# full-width "How much time did you play" band above the BACK button).
old = (
    "        function drawRecordsScreen() {\n"
    "            drawBackground();\n"
    "\n"
    "            ctx.textAlign = 'center';\n"
    "            ctx.shadowBlur = 30;\n"
    "            ctx.shadowColor = '#ffd700';\n"
    "            ctx.font = 'bold 40px Orbitron, sans-serif';\n"
    "            ctx.fillStyle = '#ffd700';\n"
    "            ctx.fillText('🏆 RECORDS', canvas.width / 2, 75);\n"
    "\n"
    "            if (!currentUser) {\n"
    "                ctx.shadowBlur = 10;\n"
    "                ctx.shadowColor = 'black';\n"
    "                ctx.font = '20px Orbitron, sans-serif';\n"
    "                ctx.fillStyle = '#aaa';\n"
    "                ctx.fillText('Create an account to see your records!', canvas.width / 2, 140);\n"
    "            } else {\n"
    "                ctx.shadowBlur = 10;\n"
    "                ctx.shadowColor = 'black';\n"
    "                ctx.font = '16px Orbitron, sans-serif';\n"
    "                ctx.fillStyle = '#66dd88';\n"
    "                ctx.fillText(`Account: ${currentUser}`, canvas.width / 2, 125);\n"
)
new = (
    "        function drawRecordsScreen() {\n"
    "            drawBackground();\n"
    "\n"
    "            ctx.textAlign = 'center';\n"
    "            ctx.shadowBlur = 30;\n"
    "            ctx.shadowColor = '#ffd700';\n"
    "            ctx.font = 'bold 38px Orbitron, sans-serif';\n"
    "            ctx.fillStyle = '#ffd700';\n"
    "            ctx.fillText('🏆 RECORDS', canvas.width / 2, 60);\n"
    "\n"
    "            if (!currentUser) {\n"
    "                ctx.shadowBlur = 10;\n"
    "                ctx.shadowColor = 'black';\n"
    "                ctx.font = '20px Orbitron, sans-serif';\n"
    "                ctx.fillStyle = '#aaa';\n"
    "                ctx.fillText('Create an account to see your records!', canvas.width / 2, 110);\n"
    "            } else {\n"
    "                ctx.shadowBlur = 10;\n"
    "                ctx.shadowColor = 'black';\n"
    "                ctx.font = '15px Orbitron, sans-serif';\n"
    "                ctx.fillStyle = '#66dd88';\n"
    "                ctx.fillText(`Account: ${currentUser}`, canvas.width / 2, 92);\n"
)
assert content.count(old) == 1, f"patch10a count={content.count(old)}"
content = content.replace(old, new)
patches.append('P10a drawRecordsScreen header compacted')

# Reduce the column height so the play-time card breathes
old = (
    "                // Two side-by-side columns so the player can compare their\n"
    "                // classic and survival bests at a glance.\n"
    "                const colW = 350;\n"
    "                const colY = 165;\n"
    "                const colH = 350;\n"
    "                const leftColX = canvas.width / 2 - colW - 15;\n"
    "                const rightColX = canvas.width / 2 + 15;\n"
)
new = (
    "                // Two side-by-side columns so the player can compare their\n"
    "                // classic and survival bests at a glance. Sized so a\n"
    "                // \"How much time did you play\" band can live beneath.\n"
    "                const colW = 350;\n"
    "                const colY = 120;\n"
    "                const colH = 290;\n"
    "                const leftColX = canvas.width / 2 - colW - 15;\n"
    "                const rightColX = canvas.width / 2 + 15;\n"
)
assert content.count(old) == 1, f"patch10b count={content.count(old)}"
content = content.replace(old, new)
patches.append('P10b columns resized to fit play-time card')

# Move BACK button down to leave room for the play time band, and insert
# the play-time card just above it.
old = (
    "            const backY = 560;\n"
    "            ctx.shadowBlur = 10;\n"
    "            ctx.shadowColor = '#4af';\n"
    "            ctx.fillStyle = '#2a4a7a';\n"
    "            ctx.beginPath();\n"
    "            ctx.roundRect(canvas.width / 2 - 80, backY, 160, 35, 10);\n"
    "            ctx.fill();\n"
    "            ctx.shadowBlur = 0;\n"
    "            ctx.fillStyle = 'white';\n"
    "            ctx.font = '18px Orbitron, sans-serif';\n"
    "            ctx.textAlign = 'center';\n"
    "            ctx.fillText('← BACK', canvas.width / 2, backY + 25);\n"
    "\n"
    "            menuButtons = [\n"
    "                { rect: { x: canvas.width / 2 - 80, y: backY, w: 160, h: 35 }, action: 'back' }\n"
    "            ];\n"
    "\n"
    "            ctx.textAlign = 'left';\n"
    "            ctx.shadowBlur = 0;\n"
    "        }\n"
)
new = (
    "            // ----- \"How much time did you play\" card -----\n"
    "            // Sits beneath the two record columns; the value is the\n"
    "            // per-account cumulative ms spent in the PLAYING state,\n"
    "            // formatted nicely. Always rendered (zero value still\n"
    "            // shows \"0s\" so the screen never feels broken on a\n"
    "            // brand-new account).\n"
    "            const cardX = 75;\n"
    "            const cardY = 425;\n"
    "            const cardW = canvas.width - cardX * 2;\n"
    "            const cardH = 90;\n"
    "            ctx.shadowBlur = 22;\n"
    "            ctx.shadowColor = '#66e0ff';\n"
    "            const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);\n"
    "            cardGrad.addColorStop(0, 'rgba(20, 50, 80, 0.85)');\n"
    "            cardGrad.addColorStop(1, 'rgba(10, 25, 50, 0.95)');\n"
    "            ctx.fillStyle = cardGrad;\n"
    "            ctx.beginPath();\n"
    "            ctx.roundRect(cardX, cardY, cardW, cardH, 14);\n"
    "            ctx.fill();\n"
    "            ctx.shadowBlur = 0;\n"
    "            ctx.strokeStyle = 'rgba(102, 224, 255, 0.55)';\n"
    "            ctx.lineWidth = 2;\n"
    "            ctx.beginPath();\n"
    "            ctx.roundRect(cardX, cardY, cardW, cardH, 14);\n"
    "            ctx.stroke();\n"
    "\n"
    "            // Header label (left)\n"
    "            ctx.textAlign = 'left';\n"
    "            ctx.font = 'bold 13px Orbitron, sans-serif';\n"
    "            ctx.shadowColor = 'black';\n"
    "            ctx.shadowBlur = 4;\n"
    "            ctx.fillStyle = '#9cd3ff';\n"
    "            ctx.fillText('⏱  HOW MUCH TIME DID YOU PLAY', cardX + 22, cardY + 26);\n"
    "\n"
    "            // Friendly description\n"
    "            ctx.font = '11px Orbitron, sans-serif';\n"
    "            ctx.fillStyle = '#7eaad6';\n"
    "            ctx.shadowBlur = 3;\n"
    "            ctx.fillText('Active gameplay across this account', cardX + 22, cardY + 46);\n"
    "\n"
    "            // Big value (right-aligned)\n"
    "            const playMs = currentUser ? getPlayTime(currentUser) : 0;\n"
    "            const playText = formatPlayTime(playMs);\n"
    "            ctx.textAlign = 'right';\n"
    "            ctx.font = 'bold 30px Orbitron, sans-serif';\n"
    "            ctx.shadowColor = '#66e0ff';\n"
    "            ctx.shadowBlur = 18;\n"
    "            ctx.fillStyle = '#ffffff';\n"
    "            ctx.fillText(playText, cardX + cardW - 22, cardY + 60);\n"
    "            ctx.shadowBlur = 0;\n"
    "\n"
    "            // Lightweight sub-label under the value\n"
    "            ctx.font = '11px Orbitron, sans-serif';\n"
    "            ctx.fillStyle = '#7eaad6';\n"
    "            ctx.shadowBlur = 3;\n"
    "            ctx.fillText('hours : minutes : seconds', cardX + cardW - 22, cardY + 78);\n"
    "\n"
    "            const backY = 540;\n"
    "            const backW = 160;\n"
    "            const backH = 35;\n"
    "            const backX = canvas.width / 2 - backW / 2;\n"
    "            ctx.shadowBlur = 10;\n"
    "            ctx.shadowColor = '#4af';\n"
    "            ctx.fillStyle = '#2a4a7a';\n"
    "            ctx.beginPath();\n"
    "            ctx.roundRect(backX, backY, backW, backH, 10);\n"
    "            ctx.fill();\n"
    "            ctx.shadowBlur = 0;\n"
    "            ctx.fillStyle = 'white';\n"
    "            ctx.font = '18px Orbitron, sans-serif';\n"
    "            ctx.textAlign = 'center';\n"
    "            ctx.fillText('← BACK', canvas.width / 2, backY + 25);\n"
    "\n"
    "            menuButtons = [\n"
    "                { rect: { x: backX, y: backY, w: backW, h: backH }, action: 'back' }\n"
    "            ];\n"
    "\n"
    "            ctx.textAlign = 'left';\n"
    "            ctx.shadowBlur = 0;\n"
    "        }\n"
)
assert content.count(old) == 1, f"patch10c count={content.count(old)}"
content = content.replace(old, new)
patches.append('P10c play-time card + repositioned BACK button')

# Write back
with open('star-catcher.html', 'w', encoding='utf-8') as f:
    f.write(content)

for p in patches:
    print('OK:', p)

print()
print('total patches applied:', len(patches))
print('new file size:', len(content), 'chars')

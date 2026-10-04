# Horus Super Win 1000 — Scatter/Multiplier Patch
Targeted patch for the latest `demo-main.zip`.

Changes:
- Multiplier is counted only when its symbol cell is part of a valid connected win during Scatter tumble.
- Invalid/unconnected multipliers produce no history, no notification, and no multiplier payout effect.
- Replaced bottom-toast multiplier notification with an integrated reel-area visual.
- Replaced Scatter activation/retrigger bottom toast with an integrated reel-area visual.
- Scatter retrigger formula: 4–5 = +15, 6–7 = +20, 8–9 = +25, then +5 per two additional Scatter symbols.
- Retrigger can repeat during the same Scatter session.
- Existing reel/centering/audio/tumble/7-connect code is otherwise left untouched.

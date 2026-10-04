# Horus Super Win 1000 — Scatter Flow Recovery Patch

This patch corrects the Scatter/Free Spin flow without reverting the agreed UI behavior.

## Fixed
- Scatter notification stays INSIDE the center of the slot-machine/reel area.
- Removes the old bottom toast for Scatter activation.
- Scatter Free Spins start and continue automatically.
- Fixes the startSpin promise-lock that could prevent the next Free Spin from actually starting.
- A multiplier only counts when its symbol is part of a connected winning group.
- A non-connected multiplier is ignored: no history entry, no multiplier calculation, and it cannot block Free Spins.
- Buy Scatter and triggered Scatter both continue automatically.

## Changed files
- index.html
- css/core.css
- js/main.js
- js/game-engine.js
- js/multiplier-engine.js

Replace only these files. Do not replace the rest of the project.

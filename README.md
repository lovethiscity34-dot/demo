# Horus Super Win 1000 — Physical Reel V5

Patch only for `js/reel-engine.js`.

Changes:
- Physical reel direction is now TOP -> BOTTOM on desktop and mobile.
- All 5 columns start rolling together.
- Column 1 stops first; columns 2-5 continue visibly rolling until their own stops.
- No blank/empty reel is exposed during staggered stopping.
- Fast -> slow -> stop remains per column.
- Preserves V4 tumble logic and other game systems.
- Includes the symbol centering fix during rolling/stopped states without changing mobile layout CSS.

Install this file as `js/reel-engine.js` over the V4 version.
After deployment, hard refresh with Ctrl+Shift+R.

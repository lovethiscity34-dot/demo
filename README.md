# Horus Super Win 1000 — Physical Reel V6

Patch for the V5 physical reel.

## Fix
- Desktop centering is preserved exactly as in V5.
- Mobile/tablet symbols are centered using the existing grid centering.
- Removes the desktop `translate(-50%, -50%)` correction on screens <= 850px, which was shifting mobile symbols off-center.
- Rolling direction, staggered stopping, continuous symbols, tumble, 5x5, 8-connect, Scatter and all other game logic are untouched.

## Install
Replace only:
`js/reel-engine.js`

Do not replace the CSS files. After deployment, hard refresh with Ctrl+Shift+R.

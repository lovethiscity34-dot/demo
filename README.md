Horus Super Win 1000 - BGM Patch

Replace:
  js/audio/audio-engine.js

Add:
  audio/normal/normal-bg.mp3
  audio/scatter/scatter-bg.mp3

Behavior:
- Normal BGM loops continuously.
- Entering Scatter stops Normal and starts Scatter from the beginning.
- Scatter BGM loops continuously while Scatter is active.
- Returning to Normal stops Scatter and resumes Normal.
- Existing SFX routing is preserved.

After uploading to GitHub Pages, hard-refresh with Ctrl+Shift+R.

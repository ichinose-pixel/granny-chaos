# Validation — 2026-09-14

- Local Node tests passed: 100 camera/vehicle-heading/input combinations, speed cap, braking, dead zone, reversal and analog input.
- Local mission simulation passed: seven missions, recurring challenge state, paused free-roam timer, timeout retry, respawn, save/restore, finite geometry. Renderer and DOM are mocked.
- Original rig validation passed: normalized weights, joint indices and finite vertices across idle/run/seated/attack poses.
- GitHub Actions Game checks passed on commit 561688ba5c16e73cfde5c26d55b631c0edbb0488 (run 34822423066).
- GitHub Pages served the game HTML and modules. Cloud Chrome displayed the start UI, but WebGL initialization failed with GL_VENDOR / GL_RENDERER = Disabled. Actual 3D rendering, vehicle play and mobile ergonomics could not be verified.
- Added startup failure messaging and reload action to avoid an unresponsive start button when graphics or module loading fails.

Remaining device checks: iOS Safari and Android Chrome in portrait/landscape; screen-relative driving after rotating the camera; stop/reverse/enter/exit; prolonged play performance; overlays and touch targets; progress after reloading.

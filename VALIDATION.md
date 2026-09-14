# Validation — 2026-09-14

- Local Node tests passed: 100 camera/vehicle-heading/input combinations, speed cap, braking, dead zone, reversal and analog input.
- Local mission simulation passed: seven missions, recurring challenge state, paused free-roam timer, timeout retry, respawn, save/restore, finite geometry. Renderer and DOM are mocked.
- Original rig validation passed: normalized weights, joint indices and finite vertices across idle/run/seated/attack poses.
- GitHub Actions Game checks passed on commit 561688ba5c16e73cfde5c26d55b631c0edbb0488 (run 34822423066).
- GitHub Pages served the game HTML and modules. Cloud Chrome displayed the start UI, but WebGL initialization failed with GL_VENDOR / GL_RENDERER = Disabled. Actual 3D rendering, vehicle play and mobile ergonomics could not be verified.
- Added startup failure messaging and reload action to avoid an unresponsive start button when graphics or module loading fails.

Remaining device checks: iOS Safari and Android Chrome in portrait/landscape; screen-relative driving after rotating the camera; stop/reverse/enter/exit; prolonged play performance; overlays and touch targets; progress after reloading.

## Interactive Canvas diagnostic verification

The optional `dist/?diagnostic=1` mode replaces only the WebGL renderer with a Canvas2D observer. It uses the production pointer handlers, drive controller, camera calculation, collision checks, missions and ride action. Saves use a separate diagnostic key. Setup buttons move the player/vehicle to starting positions; movement during tests is through the original joystick.

Cloud Chrome checks, 2026-09-14:
- Started the actual game and boarded the senior scooter with the normal ride button.
- Dragged the on-screen joystick upward: approximately 25.64 game units along input, displayed lateral deviation 0.00. The long initial drag hit an automation timeout; the input remained held and was explicitly released with a joystick click. This trial is directional evidence, not an uninterrupted timing test.
- Rotated the camera by 90 degrees with the diagnostic setup button, then dragged right and left: approximately 4.72 units per input; position moved from z=-30 to -35.10 and back to -30; speed returned to zero after each release.
- Used the normal dismount button, then the passenger-car setup and normal ride button. Dragged upward and right; each moved along its screen direction and stopped on release. Upward trial: approximately 7.08 units during measured input.
- Drove toward a building: collision counter reached 4, final position x=11.45,z=-36.84, final speed zero. Screenshot showed the car outside the building footprint.
- Corrected diagnostic release-distance bookkeeping to include the first deceleration frame; durations explicitly use game time.
- Added a diagnostic frame/telemetry smoke test with mocked Canvas and DOM, alongside the existing gameplay tests.

Limits: remote pointer drags are mouse input through the same pointer handlers, not physical multi-touch. The remote browser updates slowly and game dt is capped; these trials do not establish wall-clock response latency, device FPS, 3D visual quality, or mobile ergonomics. No continuous moving-camera/joystick multitouch test was performed.

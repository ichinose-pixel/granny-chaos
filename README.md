# GRANNY CHAOS
Japanese small-town 3D sandbox prototype. Static, offline-capable assets after download, Three.js r160 (MIT).

Controls: WASD/arrows movement, E enter/exit, Space handbag/horn, Shift sprint/boost, drag scene to turn camera. Touch joystick and buttons supported.

Gameplay: board scooter, destroy 3 props, evade police line of sight for 8 seconds, free roam. Health, wanted levels, escape rewards, respawn. Audio opt-in.

UI research: https://www.gtabase.com/articles/grand-theft-auto-v/gta-5-features-guide-gameplay-hud-combat-money
Original code and models; no GTA branding, logos, or game assets included.

Validation: syntax and headless logic simulation (mount, exit, destruction, mission transitions, wanted, escape, rewards, respawn). Browser rendering and physical-device performance not yet verified.

## September 14 update
- Rounded geometry, remodeled grandmother (hair curls, glasses, facial details, cardigan, articulated limbs and handbag), detailed scooter and car trim.
- Detailed shop fronts, vending machines, cafe signs, benches, drains, cherry trees, distant buildings, petals and driving dust.
- Seven sequential missions: scooter, destruction, escape, delivery, timed checkpoints, wanted-level challenge, homecoming. Repeatable time trials afterward.
- Mission selection panel, free-roam suspension, retry, destination guidance, rewards, turbo unlock and local progression saving.
- Static world geometry merged by material to reduce draw calls; police pursue the last seen position and clear after escape.
- Validation: all seven mission transitions, post-story challenge, frozen free-roam timer, timeout retry, respawn, saved-progress restore, DOM/asset references and finite mesh geometry. No physical-device or browser rendering test performed.

## Reference-driven character update
Analyzed the downloaded Shopping Mall 3D HTML and decompressed glTF/runtime metadata (see REFERENCE_ANALYSIS.md). Replaced primitive-composed humanoids with original continuous weighted meshes and 17-joint rigs. Added original blended idle/run/seated/attack motion, fixed elevated camera with chase toggle, daylight color treatment and contact shadows. Maintained missions and saves. Source model construction is reproducible with NumPy and SciPy using scripts/build-character.py.

Validation included offline mesh pose renders and a repair of stretched arm/torso vertices, normalized weights, valid joint indices, bounded posed coordinates, mission simulation, module and DOM checks. These renders inspect the geometry; they are not browser screenshots or a physical-device test.

## Driving controls
Vehicles now use screen-relative directional input from the actual camera heading. All directions accelerate toward that screen direction, with analog speed, smooth visual turning, a 0.12 dead zone and fast release/reversal braking. Chase-camera auto-centering waits until input is released and the vehicle has stopped. Entering/exiting clears stored vehicle velocity. Validated 100 camera/vehicle-heading/input combinations plus diagonal speed, dead zone, braking, reversal and existing mission regressions; no device test.

## Run and verify
Serve the repository with `python3 -m http.server 8080` and open http://localhost:8080/dist/. Run `npm test` with Node.js 22 or later; no npm dependencies are required. GitHub Actions runs the same logic checks on push and pull requests. These mocked-renderer tests do not verify browser graphics or touch ergonomics.

For GitHub Pages, select Settings → Pages → Deploy from a branch → main / (root). The root page opens dist/.

## Canvas diagnostic mode
Open `dist/?diagnostic=1` to test the existing game logic without WebGL. The joystick is shown on desktop too. White arrow = vehicle front; cyan = requested direction; pink = velocity. The panel exposes speed, coordinates, camera heading, collision count and recent input/braking measurements. Durations are game time, not wall-clock latency. Setup buttons position the player near a vehicle or on a straight road; use the normal ride button afterward. Production 3D rendering remains the default. See VALIDATION.md for observed results and limits.

# Shopping Mall 3D reference analysis

Source: https://d13gainv9c9spf.cloudfront.net/ourwork/shopping-mall-3d.html
Inspected September 14, 2026. Findings below are from downloaded source and decoded model metadata, not a successful live playthrough. The reference remained on its preloader in the cloud browser and logged `CanvasRenderer is not yet implemented`, including after one reload.

## Packaging and architecture

- Single HTML, 2,849,057 characters, about 2.85 MB. Includes CSS, platform store click handlers, advertising analytics, audio/fonts and encoded assets.
- Brotli-compressed application payload expands to 4,169,281 bytes of JavaScript. Compressed glTF JSON and binary model data are also embedded.
- Three.js-based 3D renderer and GLTFLoader/SkinnedMesh/AnimationMixer mechanisms are present; Pixi-related 2D UI renderer code is bundled. Library inclusion alone is not proof a particular feature is active.
- Export metadata: November 3, 2025, version `PFV10_FullFlow_Intro_Pile_EndCard_Pizza_MachineStart`.

## Character — confirmed asset values

Blender glTF exporter v4.5.47. Character uses one 40-joint Armature.

| Mesh | Vertices | Triangles |
|---|---:|---:|
| body | 1,947 | 3,104 |
| player_tshirt | 852 | 1,232 |
| worker_appron | 571 | 928 |
| worker_cap | 624 | 1,136 |

Four animation clips: idle, idle_carry, run, run_carry. The clip channels number 123, 120, 123, 120 respectively; channels do not equal distinct joints. Clothing meshes are switched on/off by character role. Character materials are solid-color, metallic 0, roughness 0.5, double-sided. The character model's texture list is empty. Runtime configuration changes player skin and clothing colors. Thus the quality is primarily silhouette, smooth deformation and motion rather than realistic skin textures.

Animation transitions use a fade-to-action mechanism. Run playback speed is linked to movement speed. Front and back carry locators connect objects to the character. Idle-carry/run-carry variants maintain a coherent carrying pose.

## Camera, light and ground contact

- Scene perspective camera FOV 75; gameplay sets zoom 3.1 (effective vertical FOV approximately 27.8 degrees).
- Gameplay spherical camera setup is radius 30, phi 0.8 rad, theta 0.5 rad, with additional configured offsets. Movement can animate zoom over 0.5 seconds.
- Key game events can move the camera to show the next action.
- Main directional light at (5,10,5), intensity 3. Ambient light intensity 0; white/gray hemisphere light intensity 1.
- Export renderer settings include antialias true, resolution 2, NoToneMapping, SRGBColorSpace, shadowMapEnabled false. Many models have castShadow flags, but those flags alone do not make dynamic shadow maps active.
- Characters explicitly add a flat shadow-texture plane with opacity 0.4 and depthWrite false. This is a cheap, stable ground-contact cue.
- Environment uses atlas textures and editable color regions. Selected props explicitly disable casting/receiving shadows.

## Game feedback

- Quest order is configurable. The reference progresses through unlock/production/service goals rather than leaving the player without a next objective.
- Carry locators, item movement/tweens, optional stack wiggle, ground goal markers and camera moves make collecting and depositing items legible.
- Runtime player movement speed is 6; workers 5. These are internal world units, not real-world meters.

## Adaptation in Granny Chaos

Original implementation, with no proprietary reference models, images, animation clips, analytics or advertising redirects shipped.

1. New continuous smooth-surface humanoid mesh with vertex colors, a 17-joint skeleton, weighted elbow/knee deformation and original procedural idle/run/seated/attack animation blending.
2. Grandmother-specific silver hair, bun, glasses, cardigan, skirt and a hand-attached swinging bag.
3. Clean daylight colors, smooth solid-color character materials and inexpensive radial contact shadows.
4. Default elevated, narrow-FOV camera; previous chase view remains selectable. Driving no longer constantly rotates the elevated camera.
5. Existing seven-mission flow, map, progress and rewards retained.
6. Original generation script is included in scripts/build-character.py, allowing reproducible mesh edits.

Validation: seven-mission state transitions, save/restore, free-roam timer suspension and retries; finite geometry, normalized weights, valid skeleton indices and CPU-evaluated skinned poses. The reference could not be visually played in the available browser. Target browser rendering and physical-device performance remain unverified.

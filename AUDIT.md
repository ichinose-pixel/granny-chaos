# Mobile/gameplay audit — 2026-09-14

No production gameplay or UI changes made during this audit. tests/audit-mobile.html is an isolated, static production HTML/CSS snapshot with coarse-pointer media rules applied for desktop inspection. It does not render the 3D world or emulate mobile hardware. Browser inspection covered 390×844, 360×640 and 844×390 CSS-pixel frames. Existing drive, mission and diagnostic-frame tests passed. The live diagnostic mission menu was also inspected.

## Verified layout findings
- 390×844: mission panel y=112..243.8, width 354; map y=508.2..634; controls y=647..789. Significant persistent information spread across the screen.
- 360×640: mission panel y=112..264.6 overlaps pause/sound/mission buttons beginning at y=255. Description occupies ~24% of screen height.
- 844×390: joystick x=40..150,y=252..362 overlaps pause x=25..64,y=345..380 and sound x=75..143.6,y=345..380. Potential unintended pause/sound toggle in the overlapping area.
- Action controls overlap the location/speed display in both portrait and landscape.
- Keyboard shortcut labels remain visible under coarse-pointer rules: #actions button small {display:block} has greater specificity than #actions small {display:none}. In narrow portrait the dash label wraps awkwardly.
- Landscape success banner covers y=144.3..264.3, 120px (~31% of height), including the center of gameplay. It persists for 3.5 game seconds while gameplay continues (source).

## Camera calculation
Using the production Three.js camera, settled overview pose and ray intersections with ground y=0, horizontal ground span at screen center is approximately:

| viewport | on foot | vehicle |
|---|---:|---:|
| 390×844 | 7.16 | 8.86 |
| 844×390 | 28.27 | 36.24 |

World road width is 16 units. Vertical FOV remains 32 degrees and portrait only adds 3 to camera distance and height. This explains narrow lateral awareness in portrait. These are mathematical camera measurements, not rendered 3D observations; objects away from the center line have different scale. Recommend minimum horizontal awareness tuned by aspect ratio, speed-sensitive zoom/forward framing, preserving readable character size; evaluate candidate distances before choosing one.

## Additional source/UI findings
- Cash has rewards and penalties but no player-controlled spending/upgrade choices. Turbo is an automatic story-stage unlock. Rewards need a purpose.
- Delivery and race destinations use markers/straight segments; turn-by-turn route guidance and clear arrival/stop progress are absent or weak.
- All-mission restart resets progress/cash immediately without a confirmation step.
- Boot restores the original start-button label after game initialization, replacing the saved-progress label. Continue state is not communicated reliably.
- Mission panel is a progress list; completed rows are not replay buttons. Replay variety beyond repeat time trials is limited.

## Recommended order
1. Mobile HUD hierarchy and actual overlaps; hide keyboard labels; reserve center space; compact contextual objective.
2. Portrait camera coverage and forward visibility while driving; adaptive framing instead of a single larger distance.
3. Compact success notifications and clearer navigation/arrival progress.
4. Save/continue/reset clarity.
5. Reward spending and repeatable gameplay variety.

Not verified: physical multitouch, iOS/Android browser chrome and safe areas, actual WebGL visual quality, mobile FPS, moving-camera-plus-driving simultaneous gesture ergonomics.

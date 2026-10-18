# Web Chase 2D

A side-scrolling chase game that runs in the browser. A web-slinging hero swings across a night skyline after a caped thief riding a donkey. Built with plain HTML, CSS and JavaScript on a 2D canvas. No frameworks, no build step, no audio files.

**Play it:** https://YOUR-USERNAME.github.io/web-chase-2d/

## Controls

| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Web-swing to the highlighted anchor | Hold `Space` | Hold click or touch |
| Pump the swing / brake | `→` / `←` | |
| Reel the rope in faster | `↓` | |
| Release | Let go of `Space` | Release click or touch |
| Jump, then web-flip in the air | `↑` (or `W`) | |
| Dive in the air | `↓` | |
| Glide when no anchor is in reach | Hold `Space` | Hold click or touch |

Release while rising at about 45 degrees ahead of the anchor for a perfect release: extra speed and bonus points that stack up to x5.

## How the game works

- **Chase:** the thief gets faster each level. Close the gap by collecting coins and swinging well. Let the gap grow too wide and he escapes. Catch him to level up.
- **Swinging:** a pendulum constraint on a rope that slowly reels in. When the rope goes taut, the outward velocity is removed, so momentum carries through the swing.
- **Glide:** with no anchor in reach, holding opens a web-wing. A meter limits it and refills on the ground or while swinging.
- **Audio:** the music, hoofbeats, effects and wind are synthesized live with the Web Audio API.
- **Graphics:** three pre-rendered parallax skyline layers, particles, screen shake and a camera that looks ahead as you speed up.

## Run locally

No install needed. Open `index.html` in a browser.

If you prefer a local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
index.html   page markup and HUD
style.css    layout and styling
game.js      all game code, organised into numbered sections
LICENSE      MIT
```

`game.js` is split into sections: canvas and viewport, audio, art assets, game state, player actions, simulation, rendering, main loop and input.

## Notes

- All characters are original creations.
- The page loads one web font (Barlow Condensed) from Google Fonts and falls back to system fonts if it is unavailable.
- Sound starts after you press Start, because browsers block audio until a user gesture.

## License

MIT. See [LICENSE](LICENSE).

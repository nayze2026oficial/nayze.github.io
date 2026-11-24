# Master Prompt & Context Guide for AntiGravity

## Project Title
**NAYZE - Interactive Studio Lobby & 8-Bit Minigame Launch Platform**

---

## Technical Context & File Mapping
This application is structured around a multi-modal web experience featuring:
1. **Lobby/Studio State:** Virtual studio environment (`LOBBY/fondo_estudio.jpg`) with clickable hotspots for NPC interaction and media.
2. **Pre-Save & Smart Link System:** Device-aware universal linking for Spotify, Apple Music, YouTube, and TikTok.
3. **8-Bit Canvas Engine:** Beat-'em-up minigame featuring progression-based track unlocks (`AUDIO/disc_track_1.wav` to `disc_track_4.wav`).
4. **Synthesizer Engine:** Real-time Web Audio API sound generator for authentic retro sound effects (hits, kicks, defeat).
5. **Universal Controls:** Keyboard inputs (PC) and virtual touch D-Pad/action controls (Mobile).

### Exact Directory & Asset Structure Required
```text
PROYECTO_NAYZE/
 ├── index.html
 ├── LOBBY/
 │    └── fondo_estudio.jpg
 ├── ECENARIO/
 │    └── ECENARIO.jpg
 ├── SPRITE DE MOVIMIENTOS/
 │    └── SPRITE NAYCE/
 │         └── FOTO DE PERFIL NAYZE.png
 ├── SPRITE DE ENEMIGO/
 ├── DISK/
 │    ├── disc_track_1.png
 │    ├── disc_track_2.png
 │    ├── disc_track_3.png
 │    └── disc_track_4.png
 └── AUDIO/
      ├── disc_track_1.wav
      ├── disc_track_2.wav
      ├── disc_track_3.wav
      └── disc_track_4.wav
```

---

## Execution Prompt (Copy & Paste to AntiGravity)

```text
Build a responsive 8-bit web experience for the musical artist NAYZE based on the following specifications:

1. ARCHITECTURE & WORKFLOW:
   - Initial State: Studio Lobby displaying `LOBBY/fondo_estudio.jpg`.
   - Interaction A (Monitor Hotspot): Opens Modal 1 containing Pre-Save links and Smart Linking to Spotify, Apple Music, YouTube, and TikTok.
   - Interaction B (NAYZE Avatar Hotspot): Triggers an RPG dialogue box asking: "¡Hola! Soy NAYZE. ¿Quieres jugar para desbloquear adelantos exclusivos de mi nueva canción?".
     - Choosing [NO] closes dialogue.
     - Choosing [SÍ] opens Modal 2 (8-Bit Arcade Minigame).

2. SMART LINKING API:
   - Detect User Agent: If mobile, trigger native app deep links (e.g., spotify://); fallback to web URLs if desktop or app missing.

3. MINIGAME CANVAS & AUDIO PROGRESSION:
   - iPod Unit: Displays track status. Locks tracks 1-4 initially.
   - Enemies: 4 sequential enemies (3 HP each). Defeating Enemy N unlocks Track N (.wav loop) in the iPod and illuminates Disc N in the lower HUD.
   - Player (NAYZE): Moves along ground line (Arrow keys / A-D / Touch D-Pad) and attacks (Z for punch, X for kick / Touch buttons).
   - Audio Synth: Uses Web Audio API square and triangle waves for retro punch, kick, and enemy defeat SFX.
   - Overlay & Modals: Includes explicit [X] close buttons and backdrop dismiss handlers.
```
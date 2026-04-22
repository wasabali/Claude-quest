# Character Sprite Credits

## Ninja Adventure Asset Pack (CC0)

Character sprites used for Cloud Quest trainers, the player character, and NPCs are
sourced from the **Ninja Adventure Asset Pack** by Robert and Pixel-Boy.

- **Source:** https://pixel-boy.itch.io/ninja-adventure-asset-pack  
- **License:** CC0 (Public Domain) — no attribution required, but credited here for transparency.

### What's included

Each character sprite sheet is a 4-direction walk-cycle sheet (96 × 128 px at base 1×,
upscaled 3× to 288 × 384 px for the 48 px tile size used by Cloud Quest).

Sprite sheets live in `assets/sprites/characters/` and are named by archetype:

| File | Archetype |
|------|-----------|
| `ninja_hero.png` | Versatile young hero (player default) |
| `ninja_old_samurai.png` | Grizzled veteran warrior |
| `ninja_mage.png` | Robed wizard/spell-caster |
| `ninja_sorceress.png` | Female magic user |
| `ninja_archwizard.png` | Elder all-knowing spell-caster |
| `ninja_warlock.png` | Dark/mysterious magic user |
| `ninja_samurai.png` | Disciplined sword-wielder |
| `ninja_knight.png` | Armoured, principled fighter |
| `ninja_heavy_bandit.png` | Large, bulky brawler |
| `ninja_captain.png` | Naval/fleet commander |
| `ninja_soldier.png` | Rank-and-file armoured fighter |
| `ninja_warrior.png` | Sturdy battle-hardened fighter |
| `ninja_archer.png` | Precise ranged fighter |
| `ninja_monk.png` | Meditative martial artist |
| `ninja_ninja.png` | Stealthy operative |
| `ninja_assassin.png` | Fast, event-driven rogue |
| `ninja_robot.png` | Automated mechanical fighter |
| `ninja_adventurer.png` | Young, inexperienced traveller |
| `ninja_woman_fighter.png` | Female armoured fighter |
| `ninja_pirate.png` | Swashbuckling sales type |
| `ninja_burglar.png` | Quick, opportunistic thief |
| `ninja_demon.png` | Sinister corrupted figure |
| `ninja_skeleton.png` | Deprecated/ancient undead |
| `ninja_ogre.png` | Massive destructive brute |
| `ninja_goblin.png` | Small but chaotic primitive |
| `ninja_slime.png` | Formless null entity |
| `ninja_sheriff.png` | Law-enforcement type |
| `ninja_clown.png` | Chaotic unpredictable joker |
| `ninja_magician.png` | Stage-magician trickster |
| `ninja_king.png` | Final-boss authority figure |

### Sprite sheet layout

Each `.png` is a **4-row × 3-column** grid at 3× scale (48 × 48 px per frame):

| Row | Direction |
|-----|-----------|
| 0   | Down (south) |
| 1   | Left (west) |
| 2   | Right (east) |
| 3   | Up (north) |

Columns 0–2 are the three walk-cycle frames per direction.

### Obtaining the files

1. Download **Ninja Adventure Asset Pack** from https://pixel-boy.itch.io/ninja-adventure-asset-pack
2. Run the upscale script (3×): `node scripts/upscale-sprites.js` (see that file for usage)
3. Name the outputs following the table above and place them in `assets/sprites/characters/`

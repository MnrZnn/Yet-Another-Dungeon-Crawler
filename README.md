# Yet-Another-Dungeon-Crawler
A first-person dungeon crawler proof-of-concept built with vanilla JavaScript, HTML, and CSS.

## Overview

This is a browser-based dungeon crawler with raycasting-based 3D rendering. The game features party-based combat, procedural dungeon generation, and an inventory system. This project serves as a proof-of-concept and may be ported to other languages and platforms in the future.

## Features

- First-person raycasting engine for 3D dungeon visualization
- Party-based system with up to 4 characters
- Turn-based combat with attack, magic, and item mechanics
- Three themed dungeon floors: Catacombs, Marble Halls, and Snake Pit
- Procedural dungeon generation with rooms, corridors, and decorations
- Inventory system with equipable weapons and armor
- Minimap for navigation
- Boss encounters on each floor
- Character classes with different stats and abilities
- Combat effects and animations

## How to Play

1. Open `index.html` in a web browser
2. Select up to 4 party members from the character selection screen
3. Enter a name for your hero
4. Navigate using WASD keys
5. Rotate view using arrow keys
6. Find the boss on each floor to collect special items
7. Collect door keys to unlock doors
8. Reach the exit gate on floor 3 to complete the game

## Combat

- **Attack**: Physical damage based on character's attack stat
- **Magic**: Magical damage based on magic stat
- **Item**: Use items from inventory (potions, food, etc.)
- **Flee**: Attempt to escape from combat

## Character Classes

The game includes 12 playable character classes across different races: elves, humans, orcs, vampires, halflings, and trolls. Each class has unique stats for HP, attack, defense, and magic.

## Debug Mode

Enter "debugmode" as your hero name to enable debug features, including the ability to select which floor to start on.

## Assets

All sprites and graphics are from Dungeon Crawl Stone Soup, available at:
https://opengameart.org/content/dungeon-crawl-32x32-tiles

This is a non-profit fan project using DCSS assets.

## Technical Details

- Raycasting-based 3D rendering
- Canvas API for graphics
- 20x20 tile-based dungeon maps
- 60 FPS target frame rate
- Animated combat effects and enemy sprites

## Future Plans

This proof-of-concept may be ported to other programming languages and platforms.

## License

This project uses assets from Dungeon Crawl Stone Soup. Please refer to the DCSS license for asset usage.

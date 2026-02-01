// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    FPS: 60,
    CANVAS_WIDTH: 300,
    CANVAS_HEIGHT: 200,
    FOV: Math.PI / 3,
    MAX_DEPTH: 12,
    TILE_SIZE: 1,
    SPRITE_SIZE: 32,
    MAP_SIZE: 20,
    INVENTORY_SIZE: 16,
    MINIMAP_SIZE: 160,
    RAY_STEP: 0.08,
    RENDER_DISTANCE: 10,
    ENEMY_MOVE_INTERVAL: 30 // Inimigos se movem a cada 30 frames (1 segundo) - MAIS RAPIDO!
};

// ==================== COMBAT EFFECTS ====================
const COMBAT_EFFECTS = {
    cloud_calc_dust: ['cloud_calc_dust_0.png', 'cloud_calc_dust_1.png', 'cloud_calc_dust_2.png', 'cloud_calc_dust_3.png'],
    cloud_fire: ['cloud_fire_0.png', 'cloud_fire_1.png', 'cloud_fire_2.png', 'cloud_fire_3.png'],
    icicle: ['icicle_1.png']
};

// Which races use which magic effect
function getMagicEffectForRace(sprite) {
    if (sprite.includes('vampire') || sprite.includes('orc')) return 'cloud_calc_dust';
    return 'cloud_fire'; // elves and humans
}

function spawnCombatEffect(type, duration) {
    gameState.combatEffects.push({
        type: type,       // 'cloud_calc_dust', 'cloud_fire', or 'icicle'
        startFrame: gameState.animationFrame,
        duration: duration, // in frames
        frames: COMBAT_EFFECTS[type]
    });
}

function updateCombatEffects() {
    gameState.combatEffects = gameState.combatEffects.filter(
        ef => (gameState.animationFrame - ef.startFrame) < ef.duration
    );
}

function renderCombatEffects(canvas, ctx) {
    for (const ef of gameState.combatEffects) {
        const elapsed = gameState.animationFrame - ef.startFrame;
        let frameIndex;
        
        if (ef.type === 'icicle') {
            // Icicle flickers fast — alternate every 2 frames
            frameIndex = Math.floor(elapsed / 2) % ef.frames.length;
            // Fade out over duration
            const alpha = Math.max(0, 1 - elapsed / ef.duration);
            ctx.save();
            ctx.globalAlpha = alpha;
            const img = loadImage(ef.frames[0]);
            if (img.complete && img.width > 0) {
                // Draw centered, pulsing size
                const scale = 1 + Math.sin(elapsed * 0.6) * 0.15;
                const w = canvas.width * 0.45 * scale;
                const h = canvas.height * 0.7 * scale;
                ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
            }
            ctx.restore();
        } else {
            // Cloud effects: play through frames over duration
            frameIndex = Math.floor((elapsed / ef.duration) * ef.frames.length);
            frameIndex = Math.min(frameIndex, ef.frames.length - 1);
            const alpha = Math.max(0, 1 - elapsed / ef.duration);
            ctx.save();
            ctx.globalAlpha = alpha * 0.85;
            const img = loadImage(ef.frames[frameIndex]);
            if (img.complete && img.width > 0) {
                const w = canvas.width * 0.55;
                const h = canvas.height * 0.65;
                ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
            }
            ctx.restore();
        }
    }
}

// ==================== SPRITE MANAGER ====================
const SPRITES = {
    bodies: ['elf_male.png', 'elf_female.png', 'human_male.png', 'human_female.png', 'orc_male.png', 'orc_female.png', 'vampire_male.png', 'vampire_female.png', 'halfling_male.png', 'halfling_female.png', 'troll_male.png', 'troll_female.png'],
    enemies: ['beast.png', 'centaur.png', 'centaur_warrior.png', 'cyclops_new.png', 'deep_dwarf.png', 'deep_dwarf_artificer.png', 'deep_dwarf_berserker.png', 'deep_dwarf_death_knight.png', 'death_warrior.png', 'deep_elf_death_mage.png', 'hairy_devil.png', 'shadow_demon.png', 'orc_warrior_new.png', 'deep_elf_fighter_old.png', 'deep_troll.png', 'greater_naga.png', 'guardian_naga.png', 'guardian_serpent_new.png'],
    // Inimigos por dungeon
    catacombsEnemies: ['beast.png', 'hairy_devil.png', 'shadow_demon.png', 'death_warrior.png', 'deep_troll.png'],
    marbleEnemies: ['centaur.png', 'centaur_warrior.png', 'deep_dwarf.png', 'deep_dwarf_artificer.png', 'deep_dwarf_berserker.png', 'deep_elf_death_mage.png', 'deep_elf_fighter_old.png', 'orc_warrior_new.png'],
    snakeEnemies: ['greater_naga.png', 'guardian_naga.png', 'guardian_serpent_new.png', 'beast.png', 'cyclops_new.png'],
    bosses: ['death_knight.png', 'reaper_old.png', 'necromancer_old.png', 'deep_dwarf_death_knight.png'],
    weapons: ['axe.png', 'battleaxe.png', 'black_sword.png', 'broad_axe.png', 'broadsword.png', 'flail_great2.png', 'giant_club_spike.png', 'great_sword_slant_2.png', 'halberd_new.png', 'katana.png', 'scimitar_new.png'],
    armor: ['aragorn.png', 'aragorn_2.png', 'armour_blue_gold.png', 'armour_mummy.png', 'bikini_red.png', 'bloody.png', 'leather_metal.png', 'robe_of_night.png', 'robe_white.png', 'robe_yellow.png'],
    hair: ['brown_1.png', 'elf_black.png', 'elf_yellow.png', 'long_white.png', 'short_black.png'],
    walls: {
        catacombs: ['catacombs_1.png', 'catacombs_2.png', 'catacombs_3.png', 'catacombs_4.png', 'catacombs_5.png', 'catacombs_6.png', 'catacombs_7.png'],
        marble: ['marble_wall_1.png', 'marble_wall_2.png', 'marble_wall_3.png', 'marble_wall_4.png', 'marble_wall_5.png', 'marble_wall_6.png', 'marble_wall_7.png'],
        snake: ['snake_0.png', 'snake_1.png', 'snake_2.png', 'snake_3.png', 'snake_4.png', 'snake_5.png', 'snake_7.png', 'snake_8.png']
    },
    floors: {
        catacombs: ['cobble_blood_1_new.png', 'pebble_brown_1_new.png'],
        marble: ['marble_floor_1.png', 'marble_floor_2.png'],
        snake: ['lair0.png', 'lair1b.png']
    },
    items: ['mana_potion.png', 'potion.png', 'chunk.png', 'poison.png'], // chunk é comida, poison envenena inimigos
    specialItems: ['misc_quad.png', 'misc_rune.png', 'misc_crystal_old.png'], // Itens especiais por andar
    keys: ['key.png'],
    scrolls: ['scroll.png'], // Scroll separado
    keys: ['key.png'],
    decorations: [
        'chest_2_closed.png', 'chest_2_open.png', 
        'blood_fountain.png', 'blood_fountain_2.png',
        'crumbled_column_1.png', 'crumbled_column_2.png', 'crumbled_column_5.png',
        'dry_fountain.png',
        'statue_iron.png', 'statue_mermaid.png', 'statue_naga.png'
    ],
    animatedDecorations: {
        dithmenos: ['dithmenos.png', 'dithmenos_2.png', 'dithmenos_3.png'],
        gozag: ['gozag_0.png', 'gozag_1.png', 'gozag_2.png']
    },
    doors: ['closed_door.png', 'open_door.png'],
    gates: ['vgate_closed_up.png', 'vgate_open_up.png']
};

// RPG Names
const RPG_NAMES = {
    male: ['Aldric', 'Gareth', 'Theron', 'Baldric', 'Cedric', 'Dorian', 'Fenris', 'Gideon'],
    female: ['Aria', 'Lyra', 'Selene', 'Mira', 'Elara', 'Freya', 'Nessa', 'Thalia']
};

// Character classes with stats
const CHARACTER_CLASSES = {
    'elf_male.png': { name: 'Elf Warrior', hp: 80, attack: 12, defense: 8, magic: 15, gender: 'male', isWarrior: true },
    'elf_female.png': { name: 'Elf Archer', hp: 70, attack: 15, defense: 6, magic: 12, gender: 'female', isWarrior: true },
    'human_male.png': { name: 'Knight', hp: 100, attack: 15, defense: 12, magic: 5, gender: 'male', isWarrior: true },
    'human_female.png': { name: 'Paladin', hp: 90, attack: 13, defense: 10, magic: 10, gender: 'female', isWarrior: true },
    'orc_male.png': { name: 'Orc Berserker', hp: 120, attack: 18, defense: 8, magic: 3, gender: 'male', isWarrior: true },
    'orc_female.png': { name: 'Orc Shaman', hp: 85, attack: 10, defense: 7, magic: 18, gender: 'female', isWarrior: false },
    'vampire_male.png': { name: 'Vampire', hp: 75, attack: 14, defense: 9, magic: 20, gender: 'male', isWarrior: false },
    'vampire_female.png': { name: 'Vampiress', hp: 70, attack: 12, defense: 8, magic: 22, gender: 'female', isWarrior: false },
    'halfling_male.png': { name: 'Halfling Rogue', hp: 65, attack: 16, defense: 6, magic: 8, gender: 'male', isWarrior: true },
    'halfling_female.png': { name: 'Halfling Scout', hp: 60, attack: 14, defense: 5, magic: 10, gender: 'female', isWarrior: true },
    'troll_male.png': { name: 'Troll Warrior', hp: 140, attack: 20, defense: 10, magic: 2, gender: 'male', isWarrior: true },
    'troll_female.png': { name: 'Troll Shaman', hp: 110, attack: 12, defense: 8, magic: 16, gender: 'female', isWarrior: false }
};

// Enemy stats
const ENEMY_STATS = {
    'beast.png': { name: 'Beast', hpMult: 1.0, attackMult: 0.9, xp: 25 },
    'centaur.png': { name: 'Centaur', hpMult: 1.2, attackMult: 1.1, xp: 35 },
    'centaur_warrior.png': { name: 'Centaur Warrior', hpMult: 1.4, attackMult: 1.3, xp: 50 },
    'cyclops_new.png': { name: 'Cyclops', hpMult: 1.8, attackMult: 1.5, xp: 70 },
    'deep_dwarf.png': { name: 'Deep Dwarf', hpMult: 1.1, attackMult: 1.0, xp: 30 },
    'deep_dwarf_artificer.png': { name: 'Dwarf Artificer', hpMult: 1.2, attackMult: 1.2, xp: 40 },
    'deep_dwarf_berserker.png': { name: 'Dwarf Berserker', hpMult: 1.5, attackMult: 1.4, xp: 55 },
    'deep_dwarf_death_knight.png': { name: 'DEATH DWARF KNIGHT', hpMult: 2.4, attackMult: 1.8, xp: 150, isBoss: true, dialogue: 'Your journey ends here, mortals!' },
    'death_warrior.png': { name: 'Death Warrior', hpMult: 1.3, attackMult: 1.2, xp: 40 },
    'death_knight.png': { name: 'DEATH KNIGHT', hpMult: 2.4, attackMult: 1.8, xp: 150, isBoss: true, dialogue: 'Prepare to meet your doom!' },
    'deep_elf_death_mage.png': { name: 'Dark Mage', hpMult: 1.1, attackMult: 1.4, xp: 45 },
    'deep_elf_fighter_old.png': { name: 'Elf Fighter', hpMult: 1.2, attackMult: 1.2, xp: 38 },
    'hairy_devil.png': { name: 'Hairy Devil', hpMult: 1.5, attackMult: 1.3, xp: 55 },
    'reaper_old.png': { name: 'THE REAPER', hpMult: 2.6, attackMult: 1.9, xp: 200, isBoss: true, dialogue: 'Death has come for you!' },
    'shadow_demon.png': { name: 'Shadow Demon', hpMult: 1.2, attackMult: 1.5, xp: 60 },
    'necromancer_old.png': { name: 'NECROMANCER', hpMult: 2.2, attackMult: 2.0, xp: 180, isBoss: true, dialogue: 'I shall raise you as my undead servants!' },
    'orc_warrior_new.png': { name: 'Orc Warrior', hpMult: 1.3, attackMult: 1.1, xp: 35 },
    'deep_troll.png': { name: 'Deep Troll', hpMult: 1.6, attackMult: 1.4, xp: 65 },
    'greater_naga.png': { name: 'Greater Naga', hpMult: 1.4, attackMult: 1.3, xp: 50 },
    'guardian_naga.png': { name: 'Guardian Naga', hpMult: 1.5, attackMult: 1.4, xp: 55 },
    'guardian_serpent_new.png': { name: 'Guardian Serpent', hpMult: 1.3, attackMult: 1.2, xp: 45 }
};

// Dungeon types
const DUNGEON_TYPES = {
    CATACOMBS: { name: 'Stone Catacombs', wallSet: 'catacombs', floorSet: 'catacombs' },
    MARBLE: { name: 'Marble Palace', wallSet: 'marble', floorSet: 'marble' },
    SNAKE: { name: 'Serpent Tomb', wallSet: 'snake', floorSet: 'snake' }
};

// ==================== GAME STATE ====================
const gameState = {
    currentFloor: 0,
    dungeonType: null,
    map: [],
    player: { x: 0, y: 0, angle: 0 },
    party: [],
    inventory: [],
    keys: 0,
    doorKeys: 0,
    gateKeys: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    inCombat: false,
    currentEnemy: null,
    entities: [],
    keysCollected: 0,
    specialItemsCollected: 0,
    scrollUsed: false,
    gameStarted: false,
    selectedCharacters: [],
    heroName: '',
    animationFrame: 0,
    exitDoor: null,
    nextFloorDoorPlaced: false, // Tracks if a next-floor door was placed this map
    combatEffects: [], // Active combat visual effects
    debugMode: false // Debug mode flag
};

// ==================== IMAGE LOADER ====================
const imageCache = {};

function loadImage(path) {
    if (!imageCache[path]) {
        const img = new Image();
        img.src = `sprites/${path}`;
        imageCache[path] = img;
    }
    return imageCache[path];
}

function preloadTextures(dungeonType) {
    const typeData = DUNGEON_TYPES[dungeonType];
    if (typeData) {
        SPRITES.walls[typeData.wallSet].forEach(wall => loadImage(wall));
        SPRITES.floors[typeData.floorSet].forEach(floor => loadImage(floor));
    }
}

// ==================== EQUIPMENT SYSTEM ====================
function isEquipable(itemName) {
    return SPRITES.armor.includes(itemName) || 
           SPRITES.weapons.includes(itemName) ||
           itemName === 'scroll.png';
}

function getItemType(itemName) {
    if (SPRITES.armor.includes(itemName)) return 'armor';
    if (SPRITES.weapons.includes(itemName)) return 'weapon';
    if (itemName === 'scroll.png') return 'scroll';
    return 'consumable';
}

function equipItem(itemName, memberIndex) {
    const member = gameState.party[memberIndex];
    const itemType = getItemType(itemName);
    
    if (itemType === 'armor') {
        if (member.equippedArmor) {
            gameState.inventory.push(member.equippedArmor);
        }
        member.equippedArmor = itemName;
        member.defense += 3;
        addText(`${member.name} equipped ${itemName.replace('.png', '')}! DEF+3`);
    } else if (itemType === 'weapon') {
        if (member.equippedWeapon) {
            gameState.inventory.push(member.equippedWeapon);
        }
        member.equippedWeapon = itemName;
        member.attack += 5;
        addText(`${member.name} equipped ${itemName.replace('.png', '')}! ATK+5`);
    } else if (itemType === 'scroll') {
        if (gameState.scrollUsed) {
            addText(`The scroll has already been used and crumbled to dust!`);
            return;
        }
        if (member.className === 'Paladin') {
            member.attack += 8;
            gameState.scrollUsed = true;
            addText(`${member.name} used the scroll! ATK+8`);
            addText(`The scroll crumbled to dust after use!`);
        } else {
            addText(`${member.name} cannot use this item!`);
            gameState.inventory.push(itemName);
            return;
        }
    }
    
    const itemIndex = gameState.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        gameState.inventory.splice(itemIndex, 1);
    }
    
    updateInventory();
    updatePartyDisplay();
}

function showEquipmentModal(itemName) {
    const modal = document.getElementById('equipmentModal');
    const membersContainer = document.getElementById('equipmentMembers');
    
    membersContainer.innerHTML = '';
    
    gameState.party.forEach((member, index) => {
        const option = document.createElement('div');
        option.className = 'equipment-member-option';
        option.innerHTML = `
            <img src="sprites/${member.sprite}" class="equipment-member-sprite" alt="${member.name}">
            <div>${member.name}</div>
        `;
        option.addEventListener('click', () => {
            equipItem(itemName, index);
            modal.classList.remove('active');
        });
        membersContainer.appendChild(option);
    });
    
    modal.classList.add('active');
}


// ==================== DUNGEON GENERATION ====================
function generateDungeon(dungeonType) {
    const map = [];
    const size = CONFIG.MAP_SIZE;
    
    for (let y = 0; y < size; y++) {
        map[y] = [];
        for (let x = 0; x < size; x++) {
            map[y][x] = 1;
        }
    }
    
    const rooms = [];
    const numRooms = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numRooms; i++) {
        const width = 3 + Math.floor(Math.random() * 4);
        const height = 3 + Math.floor(Math.random() * 4);
        const x = 2 + Math.floor(Math.random() * (size - width - 4));
        const y = 2 + Math.floor(Math.random() * (size - height - 4));
        
        let overlap = false;
        for (const room of rooms) {
            if (!(x + width < room.x || x > room.x + room.width ||
                  y + height < room.y || y > room.y + room.height)) {
                overlap = true;
                break;
            }
        }
        
        if (!overlap) {
            for (let ry = y; ry < y + height; ry++) {
                for (let rx = x; rx < x + width; rx++) {
                    map[ry][rx] = 0;
                }
            }
            rooms.push({ x, y, width, height });
        }
    }
    
    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        const prev = rooms[i - 1];
        const curr = rooms[i];
        const prevCenter = { x: Math.floor(prev.x + prev.width / 2), y: Math.floor(prev.y + prev.height / 2) };
        const currCenter = { x: Math.floor(curr.x + curr.width / 2), y: Math.floor(curr.y + curr.height / 2) };
        
        const startX = Math.min(prevCenter.x, currCenter.x);
        const endX = Math.max(prevCenter.x, currCenter.x);
        for (let x = startX; x <= endX; x++) {
            map[prevCenter.y][x] = 0;
        }
        
        const startY = Math.min(prevCenter.y, currCenter.y);
        const endY = Math.max(prevCenter.y, currCenter.y);
        for (let y = startY; y <= endY; y++) {
            map[y][currCenter.x] = 0;
        }
    }
    
    const entities = [];
    
    // --- DOORS: place doors on walls of random rooms (not the last one) ---
    const numDoors = 2 + Math.floor(Math.random() * 3);
    const doorPositions = []; // track placed doors
    for (let i = 0; i < numDoors; i++) {
        const room = rooms[Math.floor(Math.random() * Math.max(1, rooms.length - 1))];
        const doorPos = findWallPosition(map, room);
        
        if (doorPos) {
            map[doorPos.y][doorPos.x] = 2;
            doorPositions.push(doorPos);
            
            // Decide what's behind this door:
            // On floor 3 (index 2, the last dungeon), all doors have loot only.
            // Otherwise: 50% chance a door leads to the next floor, rest have loot.
            // But only ONE door can lead to next floor per map.
            let doorType = 'loot'; // default
            if (gameState.currentFloor < 2 && !gameState.nextFloorDoorPlaced) {
                if (Math.random() < 0.5) {
                    doorType = 'nextFloor';
                    gameState.nextFloorDoorPlaced = true;
                }
            }
            
            entities.push({
                x: doorPos.x + 0.5,
                y: doorPos.y + 0.5,
                sprite: 'closed_door.png',
                type: 'door',
                isOpen: false,
                wallX: doorPos.x,
                wallY: doorPos.y,
                doorType: doorType // 'loot' or 'nextFloor'
            });
        }
    }
    
    // If no next-floor door was placed yet and we're not on the last floor, force one
    if (gameState.currentFloor < 2 && !gameState.nextFloorDoorPlaced && doorPositions.length > 0) {
        // Make the last placed door a next-floor door
        const lastDoor = entities.filter(e => e.type === 'door').pop();
        if (lastDoor) {
            lastDoor.doorType = 'nextFloor';
            gameState.nextFloorDoorPlaced = true;
        }
    }
    
    // Count how many doors need keys
    const totalDoors = entities.filter(e => e.type === 'door').length;
    let doorKeysToPlace = totalDoors; // guarantee a key for every door
    
    // --- EXIT GATE on the last floor (floor index 2) ---
    if (gameState.currentFloor === 2 && rooms.length > 0) {
        const exitRoom = rooms[rooms.length - 1];
        const exitDoor = findWallPosition(map, exitRoom);
        if (exitDoor) {
            map[exitDoor.y][exitDoor.x] = 2;
            gameState.exitDoor = exitDoor;
            entities.push({
                x: exitDoor.x + 0.5,
                y: exitDoor.y + 0.5,
                sprite: 'vgate_closed_up.png',
                type: 'exit_gate',
                isOpen: false,
                wallX: exitDoor.x,
                wallY: exitDoor.y
            });
        }
    }
    
    // --- BOSS in the last room (always) ---
    if (rooms.length > 0) {
        const bossRoom = rooms[rooms.length - 1];
        const bossX = bossRoom.x + Math.floor(bossRoom.width / 2);
        const bossY = bossRoom.y + Math.floor(bossRoom.height / 2);
        
        const bossSprite = SPRITES.bosses[Math.floor(Math.random() * SPRITES.bosses.length)];
        
        // Boss drops the floor's special item (orb/rune/crystal)
        const specialItemIndex = gameState.currentFloor % SPRITES.specialItems.length;
        const specialItem = SPRITES.specialItems[specialItemIndex];
        
        entities.push({
            x: bossX + 0.5,
            y: bossY + 0.5,
            sprite: bossSprite,
            type: 'enemy',
            hasKey: true,         // Boss always drops a gate key
            hasSpecialItem: specialItem, // Boss drops the floor's special item
            moveTimer: 0
        });
    }
    
    // --- ENEMIES ---
    const numEnemies = 6 + Math.floor(Math.random() * 6) + gameState.level;
    const typeData = DUNGEON_TYPES[dungeonType];
    let enemyPool = SPRITES.enemies;
    
    if (typeData.name === 'Stone Catacombs') {
        enemyPool = SPRITES.catacombsEnemies;
    } else if (typeData.name === 'Marble Palace') {
        enemyPool = SPRITES.marbleEnemies;
    } else if (typeData.name === 'Serpent Tomb') {
        enemyPool = SPRITES.snakeEnemies;
    }
    
    // Some enemies guard door keys
    let keysPlacedOnEnemies = 0;
    for (let i = 0; i < numEnemies; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const ex = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
        const ey = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
        
        const occupied = entities.some(e => Math.floor(e.x) === ex && Math.floor(e.y) === ey);
        if (!occupied) {
            const enemySprite = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            
            // Assign door keys to some enemies
            let hasKey = false;
            if (keysPlacedOnEnemies < doorKeysToPlace && Math.random() < 0.35) {
                hasKey = true;
                keysPlacedOnEnemies++;
            }
            
            entities.push({
                x: ex + 0.5,
                y: ey + 0.5,
                sprite: enemySprite,
                type: 'enemy',
                hasKey: hasKey,
                moveTimer: Math.floor(Math.random() * CONFIG.ENEMY_MOVE_INTERVAL)
            });
        }
    }
    
    // Place remaining door keys in chests if not all assigned to enemies
    let remainingDoorKeys = doorKeysToPlace - keysPlacedOnEnemies;
    
    // --- CHESTS ---
    const numChests = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numChests; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const cx = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
        const cy = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
        
        const occupied = entities.some(e => Math.floor(e.x) === cx && Math.floor(e.y) === cy);
        if (!occupied) {
            let chestHasKey = false;
            if (remainingDoorKeys > 0) {
                chestHasKey = true;
                remainingDoorKeys--;
            }
            
            entities.push({
                x: cx + 0.5,
                y: cy + 0.5,
                sprite: 'chest_2_closed.png',
                type: 'chest',
                hasKey: chestHasKey,
                hasSpecialItem: null
            });
        }
    }
    
    // --- DECORATIONS / FURNITURE (some hide items) ---
    const numDecorations = 6 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numDecorations; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const dx = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
        const dy = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
        
        const occupied = entities.some(e => Math.floor(e.x) === dx && Math.floor(e.y) === dy);
        if (!occupied) {
            let decoSprite;
            let animationType = null;
            
            if (Math.random() < 0.15) {
                if (Math.random() < 0.5) {
                    decoSprite = 'dithmenos.png';
                    animationType = 'dithmenos';
                } else {
                    decoSprite = 'gozag_0.png';
                    animationType = 'gozag';
                }
            } else {
                decoSprite = SPRITES.decorations[Math.floor(Math.random() * SPRITES.decorations.length)];
            }
            
            // Some furniture hides items (potions, keys) — ~25% chance
            let hiddenItem = null;
            if (Math.random() < 0.25 && !animationType) {
                const roll = Math.random();
                if (roll < 0.4) {
                    // Potion or food
                    hiddenItem = SPRITES.items[Math.floor(Math.random() * SPRITES.items.length)];
                } else if (roll < 0.7 && remainingDoorKeys > 0) {
                    // Door key
                    hiddenItem = 'key.png';
                    remainingDoorKeys--;
                } else {
                    // Potion
                    hiddenItem = 'potion.png';
                }
            }
            
            entities.push({
                x: dx + 0.5,
                y: dy + 0.5,
                sprite: decoSprite,
                type: 'decoration',
                animationType: animationType,
                hiddenItem: hiddenItem,
                searched: false
            });
        }
    }
    
    const startRoom = rooms[0];
    gameState.player.x = startRoom.x + Math.floor(startRoom.width / 2) + 0.5;
    gameState.player.y = startRoom.y + Math.floor(startRoom.height / 2) + 0.5;
    gameState.player.angle = 0;
    
    gameState.map = map;
    gameState.entities = entities;
    
    preloadTextures(dungeonType);
    
    return map;
}

// Função auxiliar para encontrar posição na parede
function findWallPosition(map, room) {
    const positions = [];
    
    // Paredes horizontais
    for (let x = room.x; x < room.x + room.width; x++) {
        // Parede superior
        if (room.y > 0 && map[room.y - 1][x] === 1 && map[room.y][x] === 0) {
            positions.push({ x, y: room.y - 1 });
        }
        // Parede inferior
        if (room.y + room.height < map.length && map[room.y + room.height][x] === 1 && map[room.y + room.height - 1][x] === 0) {
            positions.push({ x, y: room.y + room.height });
        }
    }
    
    // Paredes verticais
    for (let y = room.y; y < room.y + room.height; y++) {
        // Parede esquerda
        if (room.x > 0 && map[y][room.x - 1] === 1 && map[y][room.x] === 0) {
            positions.push({ x: room.x - 1, y });
        }
        // Parede direita
        if (room.x + room.width < map[0].length && map[y][room.x + room.width] === 1 && map[y][room.x + room.width - 1] === 0) {
            positions.push({ x: room.x + room.width, y });
        }
    }
    
    return positions.length > 0 ? positions[Math.floor(Math.random() * positions.length)] : null;
}


// ==================== RAYCASTER ENGINE (OTIMIZADO) ====================
class RaycasterEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;
        this.skipPixels = 2;
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderFloorAndCeiling();
        this.renderWalls();
        this.renderSprites();
        
        // Update and render combat effects on top
        updateCombatEffects();
        if (gameState.inCombat && gameState.combatEffects.length > 0) {
            renderCombatEffects(this.canvas, this.ctx);
        }
    }
    
    renderFloorAndCeiling() {
        const player = gameState.player;
        const typeData = DUNGEON_TYPES[gameState.dungeonType];
        const floorTextures = SPRITES.floors[typeData.floorSet];
        
        for (let y = this.canvas.height / 2; y < this.canvas.height; y += 2) {
            const rayDirX0 = Math.cos(player.angle - CONFIG.FOV / 2);
            const rayDirY0 = Math.sin(player.angle - CONFIG.FOV / 2);
            const rayDirX1 = Math.cos(player.angle + CONFIG.FOV / 2);
            const rayDirY1 = Math.sin(player.angle + CONFIG.FOV / 2);
            
            const p = y - this.canvas.height / 2;
            const posZ = 0.5 * this.canvas.height;
            const rowDistance = posZ / p;
            
            const floorStepX = rowDistance * (rayDirX1 - rayDirX0) / this.canvas.width;
            const floorStepY = rowDistance * (rayDirY1 - rayDirY0) / this.canvas.width;
            
            let floorX = player.x + rowDistance * rayDirX0;
            let floorY = player.y + rowDistance * rayDirY0;
            
            for (let x = 0; x < this.canvas.width; x += this.skipPixels) {
                const cellX = Math.floor(floorX);
                const cellY = Math.floor(floorY);
                
                const tx = Math.floor((floorX - cellX) * 32);
                const ty = Math.floor((floorY - cellY) * 32);
                
                const floorTexture = loadImage(floorTextures[(cellX + cellY) % floorTextures.length]);
                
                if (floorTexture.complete && floorTexture.width > 0) {
                    const brightness = Math.max(0.2, 1 - rowDistance / CONFIG.MAX_DEPTH);
                    this.ctx.save();
                    this.ctx.globalAlpha = brightness;
                    this.ctx.drawImage(
                        floorTexture,
                        tx, ty, 1, 1,
                        x, y, this.skipPixels, 2
                    );
                    this.ctx.restore();
                } else {
                    const brightness = Math.max(0, 0.3 - rowDistance / CONFIG.MAX_DEPTH);
                    const color = Math.floor(brightness * 80);
                    this.ctx.fillStyle = `rgb(0, ${color}, 0)`;
                    this.ctx.fillRect(x, y, this.skipPixels, 2);
                }
                
                floorX += floorStepX * this.skipPixels;
                floorY += floorStepY * this.skipPixels;
            }
        }
        
        this.ctx.fillStyle = '#001100';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
    }
    
    renderWalls() {
        const player = gameState.player;
        const map = gameState.map;
        const numRays = Math.floor(this.canvas.width / this.skipPixels);
        
        const typeData = DUNGEON_TYPES[gameState.dungeonType];
        const wallTextures = SPRITES.walls[typeData.wallSet];
        
        for (let i = 0; i < numRays; i++) {
            const x = i * this.skipPixels;
            const rayAngle = player.angle - CONFIG.FOV / 2 + (i / numRays) * CONFIG.FOV;
            const ray = {
                x: player.x,
                y: player.y,
                dx: Math.cos(rayAngle),
                dy: Math.sin(rayAngle)
            };
            
            let distance = 0;
            let hitWall = false;
            let wallX = 0, wallY = 0;
            let hitX = 0, hitY = 0;
            let wallType = 1;
            
            while (!hitWall && distance < CONFIG.MAX_DEPTH) {
                distance += CONFIG.RAY_STEP;
                
                hitX = ray.x + ray.dx * distance;
                hitY = ray.y + ray.dy * distance;
                const testX = Math.floor(hitX);
                const testY = Math.floor(hitY);
                
                if (testX < 0 || testX >= map[0].length || testY < 0 || testY >= map.length) {
                    hitWall = true;
                    distance = CONFIG.MAX_DEPTH;
                } else if (map[testY][testX] >= 1) {
                    hitWall = true;
                    wallX = testX;
                    wallY = testY;
                    wallType = map[testY][testX];
                }
            }
            
            distance *= Math.cos(rayAngle - player.angle);
            
            const wallHeight = (this.canvas.height / distance) * 0.5;
            const wallTop = (this.canvas.height - wallHeight) / 2;
            
            if (hitWall && distance < CONFIG.MAX_DEPTH) {
                let wallTextureX;
                const hitWallX = hitX - Math.floor(hitX);
                const hitWallY = hitY - Math.floor(hitY);
                
                if (Math.abs(hitWallX) < 0.01 || Math.abs(hitWallX - 1) < 0.01) {
                    wallTextureX = hitWallY;
                } else {
                    wallTextureX = hitWallX;
                }
                
                // Renderizar porta na parede se for tipo 2
                if (wallType === 2) {
                    const door = gameState.entities.find(e => 
                        e.type === 'door' && e.wallX === wallX && e.wallY === wallY
                    );
                    const gate = gameState.entities.find(e => 
                        e.type === 'exit_gate' && e.wallX === wallX && e.wallY === wallY
                    );
                    
                    if (door || gate) {
                        const doorEntity = door || gate;
                        const doorTexture = loadImage(doorEntity.sprite);
                        
                        if (doorTexture.complete && doorTexture.width > 0) {
                            const texX = Math.floor(wallTextureX * doorTexture.width);
                            const brightness = Math.max(0.3, 1 - distance / CONFIG.MAX_DEPTH);
                            
                            this.ctx.save();
                            this.ctx.globalAlpha = brightness;
                            this.ctx.drawImage(
                                doorTexture,
                                texX, 0, 1, doorTexture.height,
                                x, wallTop, this.skipPixels, wallHeight
                            );
                            this.ctx.restore();
                        }
                    }
                } else {
                    // Renderizar parede normal
                    const textureIndex = (wallX + wallY) % wallTextures.length;
                    const wallTexture = loadImage(wallTextures[textureIndex]);
                    
                    if (wallTexture.complete && wallTexture.width > 0) {
                        const texX = Math.floor(wallTextureX * wallTexture.width);
                        const brightness = Math.max(0.3, 1 - distance / CONFIG.MAX_DEPTH);
                        
                        this.ctx.save();
                        this.ctx.globalAlpha = brightness;
                        this.ctx.drawImage(
                            wallTexture,
                            texX, 0, 1, wallTexture.height,
                            x, wallTop, this.skipPixels, wallHeight
                        );
                        this.ctx.restore();
                    } else {
                        const brightness = Math.max(0, 1 - distance / CONFIG.MAX_DEPTH);
                        const color = Math.floor(brightness * 100);
                        this.ctx.fillStyle = `rgb(0, ${color}, 0)`;
                        this.ctx.fillRect(x, wallTop, this.skipPixels, wallHeight);
                    }
                }
            }
        }
    }
    
    renderSprites() {
        const player = gameState.player;
        const spritesToRender = [];
        
        for (const entity of gameState.entities) {
            // Não renderizar portas/portões como sprites (já renderizados nas paredes)
            if (entity.type === 'door' || entity.type === 'exit_gate') continue;
            
            const dx = entity.x - player.x;
            const dy = entity.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONFIG.RENDER_DISTANCE && distance > 0.1) {
                const angle = Math.atan2(dy, dx) - player.angle;
                
                let normalizedAngle = angle;
                while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
                while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
                
                spritesToRender.push({
                    entity,
                    distance,
                    angle: normalizedAngle,
                    screenX: (this.canvas.width / 2) * (1 + Math.tan(normalizedAngle) / Math.tan(CONFIG.FOV / 2))
                });
            }
        }
        
        spritesToRender.sort((a, b) => b.distance - a.distance);
        
        for (const sprite of spritesToRender) {
            const { entity, distance, angle, screenX } = sprite;
            
            if (Math.abs(angle) < CONFIG.FOV / 2 + 0.5) {
                const spriteHeight = (this.canvas.height / distance) * 0.4;
                const spriteWidth = spriteHeight;
                const spriteTop = (this.canvas.height - spriteHeight) / 2;
                
                let currentSprite = entity.sprite;
                if (entity.animationType) {
                    const animFrames = SPRITES.animatedDecorations[entity.animationType];
                    const frameIndex = Math.floor(gameState.animationFrame / 15) % animFrames.length;
                    currentSprite = animFrames[frameIndex];
                }
                
                const img = loadImage(currentSprite);
                if (img.complete && img.width > 0) {
                    const brightness = Math.max(0.3, 1 - distance / CONFIG.MAX_DEPTH);
                    this.ctx.save();
                    this.ctx.globalAlpha = brightness;
                    this.ctx.drawImage(
                        img,
                        screenX - spriteWidth / 2,
                        spriteTop,
                        spriteWidth,
                        spriteHeight
                    );
                    this.ctx.restore();
                }
            }
        }
    }
}


// ==================== MINIMAP ====================
class Minimap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.MINIMAP_SIZE;
        this.canvas.height = CONFIG.MINIMAP_SIZE;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    render() {
        const map = gameState.map;
        const player = gameState.player;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cellSize = CONFIG.MINIMAP_SIZE / CONFIG.MAP_SIZE;
        
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 0) {
                    this.ctx.fillStyle = '#003300';
                } else if (map[y][x] === 2) {
                    this.ctx.fillStyle = '#000055'; // Portas em azul escuro
                } else {
                    this.ctx.fillStyle = '#001100';
                }
                this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        for (const entity of gameState.entities) {
            if (entity.type === 'enemy') {
                this.ctx.fillStyle = '#ff0000';
            } else if (entity.type === 'door' || entity.type === 'exit_gate') {
                this.ctx.fillStyle = '#0000ff';
            } else {
                this.ctx.fillStyle = '#ffff00';
            }
            const ex = entity.x * cellSize;
            const ey = entity.y * cellSize;
            this.ctx.fillRect(ex - 1, ey - 1, 2, 2);
        }
        
        this.ctx.fillStyle = '#00ff00';
        const px = player.x * cellSize;
        const py = player.y * cellSize;
        this.ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(
            px + Math.cos(player.angle) * cellSize * 2,
            py + Math.sin(player.angle) * cellSize * 2
        );
        this.ctx.stroke();
    }
}

// ==================== ENEMY AI ====================
function moveEnemies() {
    const player = gameState.player;
    
    for (const entity of gameState.entities) {
        if (entity.type !== 'enemy' || gameState.inCombat) continue;
        
        entity.moveTimer++;
        
        if (entity.moveTimer >= CONFIG.ENEMY_MOVE_INTERVAL) {
            entity.moveTimer = 0;
            
            // Calcular distância ao jogador
            const dx = player.x - entity.x;
            const dy = player.y - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se jogador está próximo (< 5 unidades), mover em direção a ele
            if (distance < 5) {
                const angle = Math.atan2(dy, dx);
                const moveX = Math.cos(angle) * 0.3;
                const moveY = Math.sin(angle) * 0.3;
                
                const newX = entity.x + moveX;
                const newY = entity.y + moveY;
                
                const mapX = Math.floor(newX);
                const mapY = Math.floor(newY);
                
                // Verificar se posição é válida
                if (mapX >= 0 && mapX < gameState.map[0].length && 
                    mapY >= 0 && mapY < gameState.map.length && 
                    gameState.map[mapY][mapX] === 0) {
                    
                    // Verificar colisão com outras entidades
                    const collision = gameState.entities.some(e => 
                        e !== entity && 
                        Math.abs(e.x - newX) < 0.5 && 
                        Math.abs(e.y - newY) < 0.5
                    );
                    
                    if (!collision) {
                        entity.x = newX;
                        entity.y = newY;
                    }
                }
            } else {
                // Movimento aleatório
                const randomAngle = Math.random() * Math.PI * 2;
                const moveX = Math.cos(randomAngle) * 0.2;
                const moveY = Math.sin(randomAngle) * 0.2;
                
                const newX = entity.x + moveX;
                const newY = entity.y + moveY;
                
                const mapX = Math.floor(newX);
                const mapY = Math.floor(newY);
                
                if (mapX >= 0 && mapX < gameState.map[0].length && 
                    mapY >= 0 && mapY < gameState.map.length && 
                    gameState.map[mapY][mapX] === 0) {
                    entity.x = newX;
                    entity.y = newY;
                }
            }
        }
    }
}

// ==================== COMBAT SYSTEM ====================
function startCombat(enemy) {
    gameState.inCombat = true;
    
    const enemyStats = ENEMY_STATS[enemy.sprite];
    const levelMultiplier = 1 + (gameState.level - 1) * 0.35; // Harder scaling
    
    gameState.currentEnemy = {
        sprite: enemy.sprite,
        name: enemyStats.name,
        hp: Math.floor(110 * enemyStats.hpMult * levelMultiplier),
        maxHp: Math.floor(110 * enemyStats.hpMult * levelMultiplier),
        attack: Math.floor(12 * enemyStats.attackMult * levelMultiplier),
        xp: Math.floor(enemyStats.xp * levelMultiplier),
        hasKey: enemy.hasKey || false,
        hasSpecialItem: enemy.hasSpecialItem || null,
        isBoss: enemyStats.isBoss || false,
        entityRef: enemy,
        isPoisoned: false,
        poisonTurns: 0
    };
    
    const enemyOverlay = document.getElementById('enemySpriteOverlay');
    enemyOverlay.src = `sprites/${enemy.sprite}`;
    enemyOverlay.style.display = 'block';
    enemyOverlay.classList.add('active');
    
    document.getElementById('combatMenu').style.display = 'grid';
    addText(`A ${gameState.currentEnemy.name} appeared!`);
    if (gameState.currentEnemy.isBoss) {
        addText(`*** BOSS ENCOUNTERED! ***`);
        if (enemyStats.dialogue) {
            addText(`"${enemyStats.dialogue}"`);
        }
    }
}

function playerAttack() {
    if (!gameState.inCombat || gameState.party.length === 0) return;
    
    const aliveMembers = gameState.party.filter(m => m.hp > 0 && !m.isDead);
    if (aliveMembers.length === 0) {
        gameOver();
        return;
    }
    
    const attacker = aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
    
    // Spawn icicle effect on attack
    spawnCombatEffect('icicle', 18);
    
    // 35% chance to miss (harder)
    if (Math.random() < 0.35) {
        addText(`${attacker.name} attacked but MISSED!`);
        enemyAttack();
        return;
    }
    
    const damage = Math.floor(attacker.attack * (0.7 + Math.random() * 0.5));
    gameState.currentEnemy.hp -= damage;
    
    addText(`${attacker.name} attacked! Damage: ${damage}`);
    
    if (gameState.currentEnemy.hp <= 0) {
        enemyDefeated();
    } else {
        enemyAttack();
    }
}

function enemyAttack() {
    // Apply poison damage first if enemy is poisoned
    if (gameState.currentEnemy.isPoisoned && gameState.currentEnemy.poisonTurns > 0) {
        const poisonDamage = Math.floor(gameState.currentEnemy.maxHp * 0.1);
        gameState.currentEnemy.hp -= poisonDamage;
        gameState.currentEnemy.poisonTurns--;
        addText(`[POISON] The enemy takes ${poisonDamage} poison damage!`);
        
        if (gameState.currentEnemy.poisonTurns === 0) {
            gameState.currentEnemy.isPoisoned = false;
            addText(`The poison has worn off!`);
        }
        
        if (gameState.currentEnemy.hp <= 0) {
            enemyDefeated();
            return;
        }
    }
    
    const aliveMembers = gameState.party.filter(m => m.hp > 0 && !m.isDead);
    if (aliveMembers.length === 0) return;
    
    const target = aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
    
    // 20% chance enemy misses
    if (Math.random() < 0.20) {
        addText(`${gameState.currentEnemy.name} attacked but MISSED!`);
        updatePartyDisplay();
        return;
    }
    
    const damage = Math.floor(gameState.currentEnemy.attack * (0.7 + Math.random() * 0.6));
    target.hp = Math.max(0, target.hp - damage);
    
    addText(`${gameState.currentEnemy.name} attacked ${target.name}! Damage: ${damage}`);
    
    if (target.hp === 0) {
        target.isDead = true;
        addText(`${target.name} has been defeated!`);
        const allDead = gameState.party.every(m => m.isDead || m.hp === 0);
        if (allDead) {
            gameOver();
        }
    }
    
    updatePartyDisplay();
}

function enemyDefeated() {
    addText(`${gameState.currentEnemy.name} has been defeated!`);
    addText(`Gained ${gameState.currentEnemy.xp} XP!`);
    
    gameState.xp += gameState.currentEnemy.xp;
    checkLevelUp();
    
    // Boss drops: gate key + special item
    if (gameState.currentEnemy.hasKey) {
        gameState.keys++;
        gameState.keysCollected++;
        gameState.gateKeys++;
        addText(`[KEY] You found a GATE KEY!`);
        updateStats();
    }
    
    if (gameState.currentEnemy.hasSpecialItem) {
        gameState.specialItemsCollected++;
        addText(`[SPECIAL] Found: ${gameState.currentEnemy.hasSpecialItem.replace('.png', '')}!`);
        addToInventory(gameState.currentEnemy.hasSpecialItem);
        updateStats();
    }
    
    // Non-boss enemies with hasKey drop a door key
    if (gameState.currentEnemy.hasKey && !gameState.currentEnemy.isBoss) {
        gameState.doorKeys++;
        addText(`[KEY] Found a DOOR KEY!`);
        updateStats();
    }
    
    // Remove enemy from map
    const enemyIndex = gameState.entities.findIndex(e => e === gameState.currentEnemy.entityRef);
    if (enemyIndex !== -1) {
        gameState.entities.splice(enemyIndex, 1);
    }
    
    // Random loot drop (40% chance)
    if (Math.random() < 0.4) {
        const items = [...SPRITES.items];
        const item = items[Math.floor(Math.random() * items.length)];
        addText(`Found: ${item.replace('.png', '')}`);
        addToInventory(item);
    }
    
    // Hide enemy sprite
    const enemyOverlay = document.getElementById('enemySpriteOverlay');
    enemyOverlay.classList.remove('active');
    enemyOverlay.style.display = 'none';
    
    gameState.inCombat = false;
    gameState.currentEnemy = null;
    gameState.combatEffects = [];
    document.getElementById('combatMenu').style.display = 'none';
    
    checkFloorCompletion();
}

function useMagic() {
    const aliveMembers = gameState.party.filter(m => m.hp > 0 && !m.isDead);
    if (aliveMembers.length === 0) return;
    
    const mage = aliveMembers.reduce((prev, curr) => prev.magic > curr.magic ? prev : curr);
    
    // Spawn magic effect based on the mage's race
    const effectType = getMagicEffectForRace(mage.sprite);
    spawnCombatEffect(effectType, 28);
    
    const damage = Math.floor(mage.magic * (1.4 + Math.random() * 0.6));
    gameState.currentEnemy.hp -= damage;
    
    addText(`${mage.name} cast a spell! Damage: ${damage}`);
    
    if (gameState.currentEnemy.hp <= 0) {
        enemyDefeated();
    } else {
        enemyAttack();
    }
}

function useItem() {
    const consumables = gameState.inventory.filter(item => 
        item.includes('potion') || item === 'chunk.png' || item === 'poison.png'
    );
    
    if (consumables.length === 0) {
        addText(`You have no consumable items!`);
        return;
    }
    
    // Check for poison first
    const poisonItem = consumables.find(i => i === 'poison.png');
    if (poisonItem) {
        if (!gameState.currentEnemy.isPoisoned) {
            gameState.currentEnemy.isPoisoned = true;
            gameState.currentEnemy.poisonTurns = 3; // 3 turnos de veneno
            addText(`You used poison! The enemy is now poisoned!`);
            
            const itemIndex = gameState.inventory.indexOf(poisonItem);
            gameState.inventory.splice(itemIndex, 1);
            updateInventory();
            
            enemyAttack();
            return;
        } else {
            addText(`The enemy is already poisoned!`);
            // Try to use healing item instead
        }
    }
    
    const item = consumables.find(i => i.includes('potion')) || consumables.find(i => i === 'chunk.png');
    
    if (!item) {
        addText(`You have no usable items!`);
        return;
    }
    
    const aliveMembers = gameState.party.filter(m => m.hp > 0 && !m.isDead && m.hp < m.maxHp);
    
    if (aliveMembers.length === 0) {
        addText(`Nobody needs healing!`);
        return;
    }
    
    const target = aliveMembers[0];
    let healAmount;
    
    if (item === 'chunk.png') {
        healAmount = Math.floor(target.maxHp * 0.25);
        addText(`${target.name} ate some meat! +${healAmount} HP`);
    } else if (item === 'mana_potion.png') {
        healAmount = Math.floor(target.maxHp * 0.4);
        addText(`${target.name} used a mana potion! +${healAmount} HP`);
    } else {
        healAmount = Math.floor(target.maxHp * 0.5);
        addText(`${target.name} used a potion! +${healAmount} HP`);
    }
    
    target.hp = Math.min(target.maxHp, target.hp + healAmount);
    
    const itemIndex = gameState.inventory.indexOf(item);
    gameState.inventory.splice(itemIndex, 1);
    updateInventory();
    updatePartyDisplay();
    
    enemyAttack();
}

function tryFlee() {
    if (gameState.currentEnemy.isBoss) {
        addText(`You cannot flee from a BOSS!`);
        enemyAttack();
        return;
    }
    
    if (Math.random() < 0.5) {
        addText(`You fled successfully!`);
        
        const enemyOverlay = document.getElementById('enemySpriteOverlay');
        enemyOverlay.classList.remove('active');
        enemyOverlay.style.display = 'none';
        
        // Relocate the enemy to a random open spot far from the player
        const enemy = gameState.currentEnemy.entityRef;
        if (enemy) {
            relocateEnemy(enemy);
        }
        
        gameState.inCombat = false;
        gameState.currentEnemy = null;
        gameState.combatEffects = [];
        document.getElementById('combatMenu').style.display = 'none';
    } else {
        addText(`Failed to flee!`);
        enemyAttack();
    }
}

// Relocate an enemy to a random open tile far from the player
function relocateEnemy(enemy) {
    const map = gameState.map;
    const player = gameState.player;
    const attempts = 50;
    
    for (let i = 0; i < attempts; i++) {
        const rx = 1 + Math.floor(Math.random() * (map[0].length - 2));
        const ry = 1 + Math.floor(Math.random() * (map.length - 2));
        
        if (map[ry][rx] !== 0) continue;
        
        const dx = (rx + 0.5) - player.x;
        const dy = (ry + 0.5) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Must be at least 6 tiles away from the player
        if (dist < 6) continue;
        
        // Must not overlap another entity
        const overlap = gameState.entities.some(e => 
            e !== enemy && Math.abs(e.x - (rx + 0.5)) < 0.5 && Math.abs(e.y - (ry + 0.5)) < 0.5
        );
        if (overlap) continue;
        
        enemy.x = rx + 0.5;
        enemy.y = ry + 0.5;
        return;
    }
    // If no spot found after attempts, just leave it where it is
}

function checkLevelUp() {
    if (gameState.xp >= gameState.xpToNextLevel) {
        gameState.level++;
        gameState.xp -= gameState.xpToNextLevel;
        gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
        
        addText(`[UP] LEVEL UP! You are now level ${gameState.level}!`);
        
        for (const member of gameState.party) {
            member.maxHp += 10;
            member.hp = member.maxHp;
            member.attack += 2;
            member.defense += 1;
            member.magic += 2;
        }
        
        updatePartyDisplay();
    }
    updateStats();
}

function gameOver() {
    addText(`[X] GAME OVER! All party members have been defeated!`);
    gameState.inCombat = false;
    document.getElementById('combatMenu').style.display = 'none';
    
    const enemyOverlay = document.getElementById('enemySpriteOverlay');
    enemyOverlay.classList.remove('active');
    enemyOverlay.style.display = 'none';
    
    setTimeout(() => {
        addText(`Reloading game...`);
        setTimeout(() => {
            location.reload();
        }, 1000);
    }, 2000);
}

function checkFloorCompletion() {
    if (gameState.currentFloor < 2) {
        // Not on last floor yet - check if boss was defeated (has special item)
        // The boss drops both key and special item, so check for special item
        const bossDefeatedThisFloor = gameState.specialItemsCollected > gameState.currentFloor;
        
        if (bossDefeatedThisFloor) {
            addText(`[!] Boss defeated! Teleporting to next floor...`);
            setTimeout(() => {
                nextFloor();
            }, 2000);
        }
    } else if (gameState.currentFloor === 2) {
        // Last floor: check if ready for exit gate
        if (gameState.keysCollected >= 3 && gameState.specialItemsCollected >= 3 && gameState.gateKeys > 0) {
            addText(`[!!!] You have all keys and items! Head to the exit gate!`);
        }
    }
}

function nextFloor() {
    gameState.currentFloor++;
    gameState.nextFloorDoorPlaced = false; // Reset for new map
    const types = Object.keys(DUNGEON_TYPES);
    gameState.dungeonType = types[gameState.currentFloor % types.length];
    
    addText(`Descending to the next floor...`);
    addText(`Entering: ${DUNGEON_TYPES[gameState.dungeonType].name}`);
    
    generateDungeon(gameState.dungeonType);
}


// ==================== UI FUNCTIONS ====================
function addText(text) {
    const textContent = document.getElementById('textContent');
    textContent.innerHTML += `> ${text}<br>`;
    textContent.scrollTop = textContent.scrollHeight;
}

function updatePartyDisplay() {
    const container = document.getElementById('partyMembers');
    container.innerHTML = '';
    
    for (const member of gameState.party) {
        const div = document.createElement('div');
        div.className = 'party-member';
        
        const hpPercent = (member.hp / member.maxHp) * 100;
        
        div.innerHTML = `
            <div class="member-sprite-container">
                <img src="sprites/${member.sprite}" class="member-sprite-layer" alt="body">
                <img src="sprites/${member.hair}" class="member-sprite-layer" alt="hair">
                ${member.equippedArmor ? `<img src="sprites/${member.equippedArmor}" class="member-sprite-layer" alt="armor">` : ''}
                ${member.equippedWeapon ? `<img src="sprites/${member.equippedWeapon}" class="member-sprite-layer" alt="weapon">` : ''}
            </div>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-health">HP: ${member.hp}/${member.maxHp}</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${hpPercent}%"></div>
                </div>
                <div class="member-stats">
                    <div>ATK:${member.attack}</div>
                    <div>DEF:${member.defense}</div>
                    <div>MAG:${member.magic}</div>
                </div>
            </div>
        `;
        
        container.appendChild(div);
    }
}

function updateInventory() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < CONFIG.INVENTORY_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
        if (i < gameState.inventory.length) {
            const itemName = gameState.inventory[i];
            const img = document.createElement('img');
            img.src = `sprites/${itemName}`;
            slot.appendChild(img);
            
            if (isEquipable(itemName)) {
                slot.classList.add('equipable');
                slot.addEventListener('click', (e) => {
                    if (e.shiftKey) {
                        // Shift+Click to destroy
                        if (confirm(`Destroy ${itemName.replace('.png', '')}?`)) {
                            gameState.inventory.splice(i, 1);
                            updateInventory();
                            addText(`Destroyed ${itemName.replace('.png', '')}`);
                        }
                    } else {
                        showEquipmentModal(itemName);
                    }
                });
            } else {
                // Non-equipable items can only be destroyed
                slot.addEventListener('click', (e) => {
                    if (e.shiftKey) {
                        if (confirm(`Destroy ${itemName.replace('.png', '')}?`)) {
                            gameState.inventory.splice(i, 1);
                            updateInventory();
                            addText(`Destroyed ${itemName.replace('.png', '')}`);
                        }
                    }
                });
            }
            
            // Right-click to destroy any item
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Destroy ${itemName.replace('.png', '')}?`)) {
                    gameState.inventory.splice(i, 1);
                    updateInventory();
                    addText(`Destroyed ${itemName.replace('.png', '')}`);
                }
            });
        }
        
        grid.appendChild(slot);
    }
}

function updateStats() {
    document.getElementById('floorLevel').textContent = gameState.currentFloor + 1;
    document.getElementById('keyCount').textContent = `${gameState.keysCollected}/3 (P:${gameState.doorKeys} G:${gameState.gateKeys})`;
    document.getElementById('partyLevel').textContent = gameState.level;
    document.getElementById('xpCount').textContent = gameState.xp;
}

function addToInventory(item) {
    if (gameState.inventory.length < CONFIG.INVENTORY_SIZE) {
        gameState.inventory.push(item);
        updateInventory();
    }
}

// ==================== PLAYER MOVEMENT ====================
function movePlayer(forward, strafe) {
    const player = gameState.player;
    const map = gameState.map;
    
    let newX = player.x;
    let newY = player.y;
    
    if (forward !== 0) {
        newX += Math.cos(player.angle) * forward * 0.1;
        newY += Math.sin(player.angle) * forward * 0.1;
    }
    
    if (strafe !== 0) {
        newX += Math.cos(player.angle + Math.PI / 2) * strafe * 0.1;
        newY += Math.sin(player.angle + Math.PI / 2) * strafe * 0.1;
    }
    
    const mapX = Math.floor(newX);
    const mapY = Math.floor(newY);
    
    if (mapX >= 0 && mapX < map[0].length && mapY >= 0 && mapY < map.length) {
        // Permitir passar por portas abertas (tipo 0 ou 2 aberto)
        const tile = map[mapY][mapX];
        if (tile === 0 || (tile === 2 && isDoorOpen(mapX, mapY))) {
            player.x = newX;
            player.y = newY;
            
            checkEntityInteraction();
        }
    }
}

function isDoorOpen(x, y) {
    const door = gameState.entities.find(e => 
        (e.type === 'door' || e.type === 'exit_gate') && 
        e.wallX === x && e.wallY === y
    );
    return door ? door.isOpen : false;
}

function checkEntityInteraction() {
    const player = gameState.player;
    
    for (let i = 0; i < gameState.entities.length; i++) {
        const entity = gameState.entities[i];
        const dx = entity.x - player.x;
        const dy = entity.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.8) {
            if (entity.type === 'enemy' && !gameState.inCombat) {
                startCombat(entity);
                return;
            } else if (entity.type === 'chest') {
                openChest(entity, i);
                return;
            } else if (entity.type === 'door') {
                openDoor(entity);
                return;
            } else if (entity.type === 'exit_gate') {
                openExitGate(entity);
                return;
            } else if (entity.type === 'nextFloorPortal') {
                // Advance to next floor
                nextFloor();
                return;
            } else if (entity.type === 'decoration' && !entity.searched) {
                searchDecoration(entity);
                return;
            }
        }
    }
}

function searchDecoration(deco) {
    deco.searched = true;
    
    if (deco.hiddenItem) {
        if (deco.hiddenItem === 'key.png') {
            gameState.doorKeys++;
            addText(`An item was found! [KEY] Found a DOOR KEY!`);
            console.log('An item was found! (Door Key hidden in decoration)');
            updateStats();
        } else {
            addText(`An item was found! Found: ${deco.hiddenItem.replace('.png', '')}`);
            console.log(`An item was found! (${deco.hiddenItem.replace('.png', '')} hidden in decoration)`);
            addToInventory(deco.hiddenItem);
        }
    }
    // If no hidden item, nothing happens (silent search)
}

function openChest(chest, index) {
    if (chest.sprite.includes('open')) return;
    
    chest.sprite = 'chest_2_open.png';
    addText(`You opened a chest!`);
    
    if (chest.hasKey) {
        // Chest with a door key
        gameState.doorKeys++;
        addText(`[KEY] Found a DOOR KEY!`);
        updateStats();
    }
    
    // Normal chest loot
    const roll = Math.random();
    if (roll < 0.35) {
        // Consumables
        const item = SPRITES.items[Math.floor(Math.random() * SPRITES.items.length)];
        addText(`Found: ${item.replace('.png', '')}`);
        addToInventory(item);
    } else if (roll < 0.6) {
        // Weapon
        const weapon = SPRITES.weapons[Math.floor(Math.random() * SPRITES.weapons.length)];
        addText(`Found weapon: ${weapon.replace('.png', '')}`);
        addToInventory(weapon);
    } else if (roll < 0.8) {
        // Armor
        const armor = SPRITES.armor[Math.floor(Math.random() * SPRITES.armor.length)];
        addText(`Found armor: ${armor.replace('.png', '')}`);
        addToInventory(armor);
    } else if (roll < 0.95) {
        // Nothing (increased from 0.8 to 0.95)
        addText(`The chest is empty...`);
    } else {
        // Scroll - reduced from 20% to 5%
        addText(`Found a MAGIC SCROLL!`);
        addToInventory('scroll.png');
    }
}

function openDoor(door) {
    if (door.isOpen) return;
    
    if (gameState.doorKeys > 0) {
        door.isOpen = true;
        door.sprite = 'open_door.png';
        gameState.doorKeys--;
        gameState.map[door.wallY][door.wallX] = 0;
        addText(`You used a DOOR KEY and opened the door!`);
        updateStats();
        
        // Reveal what's behind the door
        if (door.doorType === 'nextFloor') {
            addText(`[!] A passage to the next floor has been revealed!`);
            // Place a next-floor portal entity right past the door
            const portalX = door.wallX + 0.5;
            const portalY = door.wallY + 0.5;
            gameState.entities.push({
                x: portalX,
                y: portalY,
                sprite: 'dry_fountain.png',
                type: 'nextFloorPortal'
            });
        } else {
            // Loot door: spawn a chest or weapon/armor right at the door tile
            addText(`[!] A treasure room has been revealed!`);
            const lootX = door.wallX + 0.5;
            const lootY = door.wallY + 0.5;
            // Spawn loot directly
            const lootRoll = Math.random();
            if (lootRoll < 0.5) {
                const weapon = SPRITES.weapons[Math.floor(Math.random() * SPRITES.weapons.length)];
                addText(`Found weapon: ${weapon.replace('.png', '')}`);
                addToInventory(weapon);
            } else {
                const armor = SPRITES.armor[Math.floor(Math.random() * SPRITES.armor.length)];
                addText(`Found armor: ${armor.replace('.png', '')}`);
                addToInventory(armor);
            }
        }
    } else {
        addText(`You need a DOOR KEY!`);
    }
}

function openExitGate(gate) {
    if (gate.isOpen) {
        // Victory!
        addText(`[!!!] VICTORY! You escaped the dungeon!`);
        gameState.inCombat = false;
        
        setTimeout(() => {
            if (confirm('Congratulations! You won! Play again?')) {
                location.reload();
            }
        }, 2000);
        return;
    }
    
    if (gameState.keysCollected >= 3 && gameState.specialItemsCollected >= 3 && gameState.gateKeys > 0) {
        gate.isOpen = true;
        gate.sprite = 'vgate_open_up.png';
        gameState.gateKeys--;
        gameState.map[gate.wallY][gate.wallX] = 0;
        addText(`[!!!] You used the GATE KEY! The gate is open!`);
        addText(`Pass through the gate to escape!`);
        updateStats();
    } else {
        if (gameState.keysCollected < 3) {
            addText(`You need 3 keys! (${gameState.keysCollected}/3)`);
        } else if (gameState.specialItemsCollected < 3) {
            addText(`You need 3 special items! (${gameState.specialItemsCollected}/3)`);
        } else {
            addText(`You need a GATE KEY!`);
        }
    }
}

// ==================== CHARACTER SELECTION ====================
function setupCharacterSelection() {
    const grid = document.getElementById('charSelectionGrid');
    const selectedChars = new Set();
    
    for (const [sprite, data] of Object.entries(CHARACTER_CLASSES)) {
        const option = document.createElement('div');
        option.className = 'char-option';
        option.innerHTML = `
            <img src="sprites/${sprite}" alt="${data.name}">
            <div class="char-option-name">${data.name}</div>
        `;
        
        option.addEventListener('click', () => {
            if (selectedChars.has(sprite)) {
                selectedChars.delete(sprite);
                option.classList.remove('selected');
            } else if (selectedChars.size < 4) {
                selectedChars.add(sprite);
                option.classList.add('selected');
            }
            
            document.getElementById('startGameBtn').disabled = selectedChars.size === 0;
        });
        
        grid.appendChild(option);
    }
    
    document.getElementById('startGameBtn').addEventListener('click', () => {
        if (selectedChars.size > 0) {
            gameState.selectedCharacters = Array.from(selectedChars);
            showNameInputModal();
        }
    });
}

function showNameInputModal() {
    const modal = document.getElementById('nameInputModal');
    const input = document.getElementById('heroNameInput');
    const confirmBtn = document.getElementById('confirmNameBtn');
    
    modal.style.display = 'flex';
    input.focus();
    
    const handleConfirm = () => {
        const heroName = input.value.trim() || 'Hero';
        gameState.heroName = heroName;
        
        // Check for debug mode activation
        if (heroName.toLowerCase() === 'debugmode') {
            gameState.debugMode = true;
            addText(`[DEBUG] Debug mode activated!`);
            
            // Show floor selector
            const floorChoice = prompt('Enter floor number (0-2):');
            if (floorChoice !== null) {
                const floorNum = parseInt(floorChoice);
                if (floorNum >= 0 && floorNum <= 2) {
                    gameState.currentFloor = floorNum;
                    addText(`[DEBUG] Starting at floor ${floorNum + 1}`);
                }
            }
        }
        
        modal.style.display = 'none';
        startGame();
    };
    
    confirmBtn.onclick = handleConfirm;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') handleConfirm();
    };
}

function startGame() {
    for (let i = 0; i < gameState.selectedCharacters.length; i++) {
        const sprite = gameState.selectedCharacters[i];
        const classData = CHARACTER_CLASSES[sprite];
        
        const randomHair = SPRITES.hair[Math.floor(Math.random() * SPRITES.hair.length)];
        const randomArmor = SPRITES.armor[Math.floor(Math.random() * SPRITES.armor.length)];
        
        let initialWeapon = null;
        if (classData.isWarrior) {
            initialWeapon = SPRITES.weapons[Math.floor(Math.random() * SPRITES.weapons.length)];
        }
        
        let memberName;
        if (i === 0) {
            memberName = gameState.heroName === 'debugmode' ? 'Hero' : gameState.heroName;
        } else {
            const nameList = RPG_NAMES[classData.gender];
            memberName = nameList[Math.floor(Math.random() * nameList.length)];
        }
        
        gameState.party.push({
            sprite,
            name: memberName,
            className: classData.name,
            hp: classData.hp,
            maxHp: classData.hp,
            attack: classData.attack + (initialWeapon ? 5 : 0),
            defense: classData.defense,
            magic: classData.magic,
            hair: randomHair,
            equippedArmor: randomArmor,
            equippedWeapon: initialWeapon,
            isDead: false
        });
    }
    
    document.getElementById('charSelectScreen').style.display = 'none';
    
    const types = Object.keys(DUNGEON_TYPES);
    // Use debug mode floor if set, otherwise start at 0
    if (!gameState.debugMode) {
        gameState.currentFloor = 0;
    }
    gameState.dungeonType = types[gameState.currentFloor % types.length];
    generateDungeon(gameState.dungeonType);
    
    updatePartyDisplay();
    updateInventory();
    updateStats();
    
    addText(`Welcome to Yet another Dungeon Crawler!`);
    addText(`You are in the ${DUNGEON_TYPES[gameState.dungeonType].name}!`);
    addText(`Find the BOSS on each floor to collect special items!`);
    addText(`Open doors with door keys. Reach the exit gate on floor 3!`);
    addText(`Use WASD to move, Arrow keys to look around`);
    addText(`Walk into furniture to search for hidden items!`);
    
    gameState.gameStarted = true;
}

// ==================== INPUT HANDLING ====================
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.querySelectorAll('.combat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        
        switch(action) {
            case 'attack':
                playerAttack();
                break;
            case 'magic':
                useMagic();
                break;
            case 'item':
                useItem();
                break;
            case 'flee':
                tryFlee();
                break;
        }
    });
});

document.getElementById('cancelEquipBtn').addEventListener('click', () => {
    document.getElementById('equipmentModal').classList.remove('active');
});

// ==================== GAME LOOP ====================
let raycaster;
let minimap;
let lastTime = 0;
const frameTime = 1000 / CONFIG.FPS;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= frameTime) {
        lastTime = currentTime - (deltaTime % frameTime);
        
        gameState.animationFrame++;
        
        if (gameState.gameStarted && !gameState.inCombat) {
            if (keys['w']) movePlayer(1, 0);
            if (keys['s']) movePlayer(-1, 0);
            if (keys['a']) movePlayer(0, -1);
            if (keys['d']) movePlayer(0, 1);
            
            if (keys['arrowleft']) gameState.player.angle -= 0.05;
            if (keys['arrowright']) gameState.player.angle += 0.05;
            
            // Mover inimigos
            moveEnemies();
            
            if (raycaster) {
                raycaster.render();
            }
            if (minimap) {
                minimap.render();
            }
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    setupCharacterSelection();
    
    const canvas = document.getElementById('mazeCanvas');
    raycaster = new RaycasterEngine(canvas);
    
    const minimapCanvas = document.getElementById('minimapCanvas');
    minimap = new Minimap(minimapCanvas);
    
    requestAnimationFrame(gameLoop);
});
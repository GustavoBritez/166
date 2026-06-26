export const TILE_DICT = {
    // Básicos y Sistema (0-3)
    0: { name: 'Suelo', color: 0x2c3e50, solido: false },
    1: { name: 'Pared_Base', color: 0x7f8c8d, solido: true },
    2: { name: 'Meta', color: 0xf1c40f, solido: false, esMeta: true },
    3: { name: 'Spawn', color: 0x00ffff, solido: false },
    
    // Bioma: Hielo (4-7)
    4: { name: 'Hielo', color: 0xa4ebf3, solido: false, friccion: 0.2 }, // Resbala
    5: { name: 'Nieve', color: 0xffffff, solido: false, multiplicadorVel: 0.6 }, // Lento
    6: { name: 'Pared_Hielo', color: 0x2980b9, solido: true },
    7: { name: 'Agua_Congelada', color: 0x1abc9c, solido: false, daño: 1 }, // Frío
    
    // Bioma: Volcánico (8-11)
    8: { name: 'Piedra_Volcanica', color: 0x34495e, solido: false },
    9: { name: 'Lava', color: 0xe67e22, solido: false, daño: 15 }, // Quema
    10: { name: 'Ceniza', color: 0x111111, solido: false, multiplicadorVel: 0.8 },
    11: { name: 'Muro_Obsidiana', color: 0x000000, solido: true },
    
    // Bioma: Pantano/Bosque (12-15)
    12: { name: 'Pasto', color: 0x2ecc71, solido: false },
    13: { name: 'Pantano', color: 0x145a32, solido: false, multiplicadorVel: 0.4 }, // Muy lento
    14: { name: 'Tronco', color: 0x8e44ad, solido: true },
    15: { name: 'Veneno', color: 0x00ff00, solido: false, daño: 5 },
    
    // Bioma: Tech / Laboratorio (16-19)
    16: { name: 'Baldosa_Metal', color: 0xbdc3c7, solido: false },
    17: { name: 'Muro_Titanio', color: 0x2c3e50, solido: true },
    18: { name: 'Acido', color: 0x39ff14, solido: false, daño: 20 },
    19: { name: 'Portal_Lab', color: 0x9b59b6, solido: false, esTeleport: true, destino: 3 }
};
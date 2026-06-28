import { TILE_DICT } from '../Enemigo/EnemigoDecorator.js';
const generarNivelEstres = (tamaño = 100) => {
    // 1. Creación optimizada de la matriz
    const matrizGiga = Array.from({ length: tamaño }, () => Array(tamaño).fill(1));
    const listaEnemigos = [];

    const tipos = ["Baku", "Badtz", "Berry"];
    const colores = { Baku: "#8a2be2", Badtz: "#f1c40f", Berry: "#2ecc71" };

    // 2. EL MINERO (Drunkard's Walk Dinámico)
    let x = 1, y = 1;
    let maxDistanciaCuadrada = 0; // Usamos distancia cuadrada (más rápido que Math.hypot)
    let posMeta = { x: 1, y: 1 };

    // Cálculo proporcional: El minero siempre excava el 45% del área total
    const areaTotal = tamaño * tamaño;
    const pasosTotales = Math.floor(areaTotal * 0.45);

    // Lista para guardar SOLO las celdas que son suelo, evitando recorrer paredes después
    const caminosExcavados = [];

    for (let i = 0; i < pasosTotales; i++) {
        // Si es la primera vez que pisamos esta celda, la guardamos
        if (matrizGiga[y][x] === 1) {
            matrizGiga[y][x] = 0;
            caminosExcavados.push({ x, y });
        }

        // Rastrear la meta usando distancia cuadrada (dx*dx + dy*dy) para ahorrar CPU
        const dx = x - 1;
        const dy = y - 1;
        const distCuadrada = (dx * dx) + (dy * dy);

        if (distCuadrada > maxDistanciaCuadrada) {
            maxDistanciaCuadrada = distCuadrada;
            posMeta = { x, y };
        }

        // Dirección rápida
        const dir = Math.floor(Math.random() * 4);
        if (dir === 0 && y > 1) y--;
        else if (dir === 1 && y < tamaño - 2) y++;
        else if (dir === 2 && x > 1) x--;
        else if (dir === 3 && x < tamaño - 2) x++;
    }

    // Aseguramos inicio y meta fijos
    matrizGiga[1][1] = 3;
    matrizGiga[posMeta.y][posMeta.x] = 2;

    // Pre-calculamos la mitad para los biomas (evita dividir miles de veces en el bucle)
    const mitad = tamaño / 2;

    // 3. PINTADO DE BIOMAS Y ENEMIGOS (Solo iteramos el suelo excavado)
    for (let i = 0; i < caminosExcavados.length; i++) {
        const cx = caminosExcavados[i].x;
        const cy = caminosExcavados[i].y;

        // Saltamos el inicio y la meta
        if ((cx === 1 && cy === 1) || (cx === posMeta.x && cy === posMeta.y)) continue;

        // Zonificación ultra rápida
        const esNorte = cy < mitad;
        const esOeste = cx < mitad;

        const rand = Math.random();

        // Aplicamos la decoración procedural directamente a la matriz
        if (esNorte && esOeste) {
            // Bosque
            if (rand < 0.08) matrizGiga[cy][cx] = 13;
            else if (rand < 0.20) matrizGiga[cy][cx] = 12;
        }
        else if (!esNorte && esOeste) {
            // Volcán
            if (rand < 0.05) matrizGiga[cy][cx] = 9;
            else if (rand < 0.15) matrizGiga[cy][cx] = 8;
        }
        else if (esNorte && !esOeste) {
            // Hielo
            if (rand < 0.15) matrizGiga[cy][cx] = 4;
            else if (rand < 0.25) matrizGiga[cy][cx] = 5;
        }
        else {
            // Tech
            if (rand < 0.05) matrizGiga[cy][cx] = 18;
            else if (rand < 0.30) matrizGiga[cy][cx] = 16;
        }

        // SPAWN DE ENEMIGOS
        const idBloque = matrizGiga[cy][cx];
        const propiedadesBloque = TILE_DICT[idBloque] || { solido: false };

        // Evitamos hacer cálculos de distancia complejos. Si x o y son mayores a 11, está lejos del spawn.
        if (!propiedadesBloque.solido && Math.random() < 0.015 && (cx > 11 || cy > 11)) {
            const tipoElegido = tipos[Math.floor(Math.random() * tipos.length)];
            listaEnemigos.push({
                tipo: tipoElegido,
                gridX: cx,
                gridY: cy,
                color: colores[tipoElegido]
            });
        }
    }

    return { matriz: matrizGiga, enemigos: listaEnemigos };
};
const datosEstres = generarNivelEstres();

// 2. TUS NIVELES
export const GAME_LEVELS = {
    1: {
        type: "lobby",
        title: "Lobby",
        text: " Hola soy tu avatar ",
    },
    2: {
        type: "grum",
        title: "¡Prueba de Estrés 100x100!",
        matriz: datosEstres.matriz,
        enemigos: datosEstres.enemigos
    }
};
// 3. CONFIGURACIÓN GLOBAL DE FÍSICAS
window.GAME_TUNING = window.GAME_TUNING || {
    tileSize: 48,
    playerLives: 3,
    playerSpeed: 170,
    berrySpeedBoost: 0.5,
    berryVisionTiles: 5,
    bulletSpeed: 420,
    bulletRadius: 6,
    bulletCooldown: 220,
    turboMultiplier: 1.6,
    turboDurationMs: 2000,
    enemyDamageCooldownMs: 900
};
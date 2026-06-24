// 1. LA FÁBRICA DE CAOS (Matriz 100x100)
const generarMatrizGigante = () => {
    const tamaño = 100;
    let matrizGiga = [];

    for (let y = 0; y < tamaño; y++) {
        let fila = [];
        for (let x = 0; x < tamaño; x++) {
            // Ponemos paredes fijas en los bordes del mapa
            if (y === 0 || y === tamaño - 1 || x === 0 || x === tamaño - 1) {
                fila.push(1);
            }
            // Ponemos un 15% de paredes aleatorias adentro para hacer un laberinto roto
            else if (Math.random() < 0.15) {
                fila.push(1);
            }
            // El resto es suelo libre
            else {
                fila.push(0);
            }
        }
        matrizGiga.push(fila);
    }

    // Forzamos al jugador en la esquina superior izquierda
    matrizGiga[1][1] = 3;
    // Forzamos la meta en la esquina inferior derecha
    matrizGiga[98][98] = 2;

    return matrizGiga;
};

// 2. TUS NIVELES
const GAME_LEVELS = {
    1: {
        type: "lobby",
        title: "Lobby",
        text: " Hola soy tu avatar ",
    },
    2: {
        type: "grum",
        title: "¡Prueba de Estrés 100x100!",
        // Ejecutamos la función para inyectar los 10.000 bloques
        matriz: generarMatrizGigante(),
        enemigos: [
            { tipo: "Baku", gridX: 50, gridY: 50, color: "#8a2be2" }
        ]
    },
    3: {
        type: "nivel 2",
        title: " BackRooms",
        subtitle: " Sin Salida ",
        rows: 6,
        cols: 6,
        moves: 4,
        emojis: ['🎀', '🌸', '⭐', '💖'],
        mode: "jelly"
    },
    4: {
        type: "nivel 3",
        avatar: "dear-daniel",
        title: " ??? ",
        text: "[INFO] Sin escribir",
        buttonText: " Sin Escribir "
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
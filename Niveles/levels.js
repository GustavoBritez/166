// 1. LA FÁBRICA PROCEDURAL (Matriz + Enemigos)
const generarNivelEstres = () => {
    const tamaño = 100;
    let matrizGiga = [];
    let listaEnemigos = [];

    // Catálogo para elegir enemigos al azar
    const tipos = ["Baku", "Badtz", "Berry"];
    const colores = { Baku: "#8a2be2", Badtz: "#f1c40f", Berry: "#2ecc71" };

    for (let y = 0; y < tamaño; y++) {
        let fila = [];
        for (let x = 0; x < tamaño; x++) {

            // Bordes fijos
            if (y === 0 || y === tamaño - 1 || x === 0 || x === tamaño - 1) {
                fila.push(1);
            }
            // 15% de paredes aleatorias
            else if (Math.random() < 0.15) {
                fila.push(1);
            }
            // Suelo libre
            else {
                fila.push(0);

                // 🔥 LA MAGIA DE LOS ENEMIGOS
                // Hay un 2% de probabilidad de que spawnee un enemigo en este bloque de suelo libre.
                // Además, le decimos (x > 5 || y > 5) para que no spawneen en la puerta de la casa del jugador.
                if (Math.random() < 0.02 && (x > 5 || y > 5)) {

                    const tipoElegido = tipos[Math.floor(Math.random() * tipos.length)];

                    listaEnemigos.push({
                        tipo: tipoElegido,
                        gridX: x,
                        gridY: y,
                        color: colores[tipoElegido]
                    });
                }
            }
        }
        matrizGiga.push(fila);
    }

    matrizGiga[1][1] = 3; // Jugador
    matrizGiga[98][98] = 2; // Meta

    // Ahora la función devuelve las dos cosas empaquetadas
    return {
        matriz: matrizGiga,
        enemigos: listaEnemigos
    };
};

// Generamos el paquete del nivel ANTES de armar el diccionario
const datosEstres = generarNivelEstres();

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
        // Consumimos los datos que generó nuestra máquina procedural
        matriz: datosEstres.matriz,
        enemigos: datosEstres.enemigos
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
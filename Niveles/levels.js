// =================================================================
// CONFIGURACIÓN DE NIVELES (DATA-DRIVEN)
// =================================================================
const GAME_LEVELS = {
    1: {
        type: "nivel 1",
        avatar: "dear-daniel",
        title: " Party ",
        text: `[INFO] Historia ................. Historia`,
        buttonText: " Encuentra el camino "
    },
    2: {
        type: "nivel 2",
        title: "Colocar Titulo",
        gravity: 0.5,
        mapLength: 2000,
        text: `[INFO]`,
        enemies: [
            { name: "Badtz", hp: 3, x: 400, y: 0 }, // Hp = pisadas que necesita para eliminar
            { name: "Cavity", hp: 2, x: 800, y: 0 },
            { name: "Wonder", hp: 1, x: 1200, y: 0 }
        ],
        buttonText: ""
    },
    3: {
        type: "nivel 3", // Motor Match-3 Paramétrico
        title: " Grum ", // Porlovisto en este numero lo que hacemos es colocar atributos de una clase
        subtitle: " Colocar Subtitulo",
        rows: 6,
        cols: 6,
        moves: 4,
        emojis: ['🎀', '🌸', '⭐', '💖'],
        mode: "jelly"
    },
    4: {
        type: "lobby",
        title: " Lobby",
        text: " Hola soy tu avatar ",
    }
};
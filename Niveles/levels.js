// =================================================================
// CONFIGURACIÓN DE NIVELES (DATA-DRIVEN)
// =================================================================
const GAME_LEVELS = {
    1: {
        type: "lobby",
        title: "Lobby",
        text: " Hola soy tu avatar ",
    },
    2: {
        type: "grum",
        title: " Grum 30/6/26",
        text: "Esquivá a la gente y llegá a la mesa ",
        playerStartX: 50,
        playerStartY: 300,
        valuX: 700,        // Dónde te espera la meta
        valuY: 300,
        crowdCount: 10     // Cantidad de "bailarines" a esquivar
    },
    3: {
        type: "nivel 2", //
        title: " BackRooms", // 
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
        text: `[INFO] Sin escribir `,
        buttonText: " Sin Escribir "

    }
};
// =================================================================
// CONFIGURACIÓN DE NIVELES (DATA-DRIVEN)
// =================================================================
const GAME_LEVELS = {
    1: {
        type: "story",
        avatar: "dear-daniel",
        title: "Hola ⚠️",
        text: " Colocar Texto ",
        buttonText: "Continuar"
    },
    2: {
        type: "story",
        avatar: "kitty-thinking", //--- Buscar base 64 no lo tenemos definido en style.css
        title: " Colocar Titulo",
        text: " Colocar texto",
        buttonText: " ¿ Quieres jugar conmigo ? 🎮"
    },
    3: {
        type: "match3", // Motor Match-3 Paramétrico
        title: " Grum ", // Porlovisto en este numero lo que hacemos es colocar atributos de una clase
        subtitle: " Colocar Subtitulo",
        rows: 6,
        cols: 6,
        moves: 4,
        emojis: ['🎀', '🌸', '⭐', '💖'],
        mode: "jelly"
    },
    4: {
        type: "victory", // Pantalla final de la propuesta
        title: "¿Vamos a pasear? 2.0 🎢",
        text: "¡Desbloqueaste el mensaje! Armemos el bolso porque nos vamos a Tigre al Parque de la Costa.",
        btnAccept: "De una, ¡me re pinta! 🗺️",
        btnReject: "No puedo, prefiero estudiar 🤓"
    }
};
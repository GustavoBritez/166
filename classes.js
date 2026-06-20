// =================================================================
// ARCHIVO: classes.js
// MOTOR DE RENDIMIENTO MATCH-3 (PARAMÉTRICO)
// =================================================================
class BoardEngine {
    constructor(gridElement, uiMovesElement, levelConfig, onWinCallback) {
        this.grid = gridElement;
        this.uiMoves = uiMovesElement;
        this.config = levelConfig; // Recibe rows, cols, moves, emojis, mode
        this.onWin = onWinCallback;

        this.matrix = [];
        this.movesLeft = this.config.moves;
        this.tileSize = 35;
        this.jellyComponent = null;
    }

    start() {
        this.grid.innerHTML = '';
        this.matrix = [];

        // Inyección condicional de la mecánica Jelly (Acoplamiento débil)
        if (this.config.mode === "jelly") {
            this.jellyComponent = new JellyModifier(this.grid, this.config.rows, this.config.cols, this.tileSize);
            this.jellyComponent.init();
        }

        // Generación dinámica de la matriz por datos
        for (let r = 0; r < this.config.rows; r++) {
            this.matrix[r] = [];
            for (let c = 0; c < this.config.cols; c++) {
                const emoji = this.config.emojis[Math.floor(Math.random() * this.config.emojis.length)];
                // Instanciás tu clase Tile clásica aquí pasándole (r, c, emoji)
                // this.matrix[r][c] = new Tile(...);
            }
        }
        
        this.uiMoves.innerText = this.movesLeft;
        console.log("Match3 Engine: Grilla paramétrica inicializada.");
    }

    // Se ejecuta al detectar una explosión exitosa de 3 en línea
    registerMatch(matchedPositions) {
        if (this.jellyComponent) {
            // Le avisamos al componente modular externo qué coordenadas limpió el jugador
            this.jellyComponent.onTilesDestroyed(matchedPositions);
        }
        this.checkWinCondition();
    }

    // Verifica las reglas de negocio del nivel actual
    checkWinCondition() {
        if (this.jellyComponent && this.jellyComponent.isGoalAchieved()) {
            console.log("Match3 Engine: Objetivo cumplido.");
            this.onWin(); // Gatilla el callback hacia el AppOrchestrator
            return;
        }

        if (this.movesLeft <= 0) {
            alert("¡Casi! Reiniciando el nivel... 🌸");
            this.start(); // Reinicio controlado del subsistema
        }
    }

    // Liberador de memoria para prevenir fugas (Memory Leaks)
    destroy() {
        console.log("Match3 Engine: Deteniendo motor y liberando handlers...");
        this.matrix = [];
        // Remové acá cualquier event listener global si los usaras
    }
}
// =================================================================
// ARCHIVO: script.js
// ORQUESTADOR MAESTRO DE LA APLICACIÓN
// =================================================================
class AppOrchestrator {
    constructor() {
        this.container = document.getElementById('appContainer');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.successScreen = document.getElementById('successScreen');
        
        this.currentLevelId = 1; // Registro de estado global
        this.activeEngine = null; // Instancia del juego que esté corriendo

        this.boot();
    }

    // Inicialización del sistema (Bootstrapping)
    boot() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loadingScreen.classList.add('fade-out');
                this.container.style.display = 'block';
                this.renderCurrentLevel();
            }, 1200);
        });
    }

    // El ruteador dinámico basado en datos
    renderCurrentLevel() {
        // Recolector de basura manual: Si había un juego corriendo, lo destruimos
        if (this.activeEngine && typeof this.activeEngine.destroy === 'function') {
            this.activeEngine.destroy();
            this.activeEngine = null;
        }

        const levelData = GAME_LEVELS[this.currentLevelId];
        if (!levelData) return;

        this.container.innerHTML = ''; // Limpieza total de los nodos del DOM

        switch(levelData.type) {
            case "story":
                this.renderStoryTemplate(levelData);
                break;
            case "match3":
                this.renderMatch3Template(levelData);
                break;
            case "victory":
                this.renderVictoryTemplate(levelData);
                break;
        }
    }

    renderStoryTemplate(data) {
        this.container.innerHTML = `
            <div class="slide active">
                <div class="daniel-oficial-avatar ${data.avatar}"></div>
                <div class="story-card">
                    <h1>${data.title}</h1>
                    <p>${data.text}</p>
                    <button class="btn btn-next" id="btnNext">${data.buttonText}</button>
                </div>
            </div>
        `;
        document.getElementById('btnNext').addEventListener('click', () => this.nextLevel());
    }

    renderMatch3Template(data) {
        this.container.innerHTML = `
            <div class="slide active">
                <div class="game-header">
                    <h2>${data.title}</h2>
                    <p>${data.subtitle} Movimientos: <span id="movesCount">${data.moves}</span></p>
                </div>
                <div class="grid-container">
                    <div class="grid" id="grid"></div>
                </div>
            </div>
        `;

        const gridEl = document.getElementById('grid');
        const movesEl = document.getElementById('movesCount');

        // Inyectamos las dependencias dinámicas al tablero puro
        this.activeEngine = new BoardEngine(gridEl, movesEl, data, () => this.nextLevel());
        this.activeEngine.start();
    }

    renderVictoryTemplate(data) {
        this.container.innerHTML = `
            <div class="card">
                <h1>${data.title}</h1>
                <p>${data.text}</p>
                <div class="btn-container">
                    <button class="btn btn-acepto" id="btnAccept">${data.btnAccept}</button>
                    <button class="btn btn-rechazo" id="btnReject">${data.btnReject}</button>
                </div>
            </div>
        `;
        document.getElementById('btnAccept').addEventListener('click', () => {
            this.container.style.display = 'none';
            this.successScreen.style.display = 'flex';
        });
        document.getElementById('btnReject').addEventListener('click', () => {
            alert("¡Modo estudio desactivado por comando superior! Dale que salimos 🎡");
        });
    }

    nextLevel() {
        this.currentLevelId++;
        this.renderCurrentLevel();
    }
}

// Única instancia viva en el navegador
document.addEventListener("DOMContentLoaded", () => {
    window.app = new AppOrchestrator();
});
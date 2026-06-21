class AppOrchestrator {
    constructor() {
        // 1. Capturamos el contenedor único (donde limpiaremos e inyectaremos las pantallas)
        this.container = document.getElementById('storyContainer');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.successScreen = document.getElementById('successScreen');

        // Estado global del juego
        this.currentLevelId = 1; // Nivel de arranque (Acordate de pasarlo a 1 si querés arrancar desde el principio)
        this.activeEngine = null; // Acá se guardará el motor de turno 

        this.boot();
    }

    boot() {
        this.showLoadingScreen();

        // Espera a que el navegador termine de descargar los assets (fichas, imágenes)
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loadingScreen.classList.add('fade-out');
                this.container.style.display = 'block';

                // 🔥 DISPARAMOS EL PRIMER NIVEL DE NUESTRA BASE DE DATOS
                this.renderCurrentLevel();
            }, 1200);
        });
    }

    showLoadingScreen() {
        this.loadingScreen.style.display = 'flex';
        this.container.style.display = 'none';
        this.successScreen.style.display = 'none';
    }

    renderCurrentLevel() {
        if (this.activeEngine && typeof this.activeEngine.destroy === 'function') {
            this.activeEngine.destroy();
            this.activeEngine = null;
        }

        const levelData = GAME_LEVELS[this.currentLevelId];
        if (!levelData) return;
        const gameObject = GameFactory.build(
            levelData.type,
            levelData,
            () => this.goToLobby(),
            (id) => this.jumpToLevel(id)
        );

        if (!gameObject) return;

        this.container.innerHTML = gameObject.template;
        this.activeEngine = gameObject.init();
    }

    // Método cuando un minijuego grita "gané": lo mandamos al Lobby (Nivel 4)
    goToLobby() {
        console.log("Nivel completado. Regresando al centro de comandos...");
        this.currentLevelId = 4; // Poné acá el ID exacto donde definiste tu lobby en levels.js
        this.renderCurrentLevel();
    }

    // Método cuando el menú dice "eligieron este nivel"
    jumpToLevel(id) {
        console.log(`Cargando nivel seleccionado: ${id}`);
        this.currentLevelId = id;
        this.renderCurrentLevel();
    }
    // Avanza el puntero de la base de datos y redibuja la interfaz
    nextLevel() {
        this.currentLevelId++;
        this.renderCurrentLevel();
    }

    // Cierre del ciclo de vida (Muestra la pantalla rosa final)
    triggerSuccessState() {
        this.container.style.display = 'none';
        this.successScreen.style.display = 'flex';
    }
}

// Inicialización global única
document.addEventListener("DOMContentLoaded", () => {
    window.app = new AppOrchestrator();
});
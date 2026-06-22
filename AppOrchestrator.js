class AppOrchestrator {
    constructor() {
        this.container = document.getElementById('storyContainer');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.successScreen = document.getElementById('successScreen');

        this.currentLevelId = 1;
        this.activeEngine = null;

        this.boot();
    }

    boot() {
        this.showLoadingScreen();
        console.log("Iniciando juego"); // Aviso en consola

        window.addEventListener('load', () => {
            // Carga inicial: Dura exactamente 3 segundos (3000 ms)
            setTimeout(() => {
                this.renderCurrentLevel(); // Armamos el Lobby por detrás del telón

                this.loadingScreen.classList.add('fade-out');
                this.container.style.display = 'block';

                // Limpiamos la pantalla de carga del DOM para que no bloquee los botones
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                    this.loadingScreen.classList.remove('fade-out');
                }, 500);

            }, 3000);
        });
    }

    showLoadingScreen(personaje = 'kitty') {
        const imagenCargaDiv = document.getElementById('imagenCarga');

        // Limpiamos las clases anteriores por las dudas
        imagenCargaDiv.classList.remove('CargaKitty-page', 'CargaDearDaniels-page');

        // Decidimos cuál inyectar
        if (personaje === 'daniel') {
            imagenCargaDiv.classList.add('CargaDearDaniels-page');
        } else {
            imagenCargaDiv.classList.add('CargaKitty-page');
        }

        // Mostramos la pantalla
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
            (id, personaje) => this.jumpToLevel(id, personaje)
        );

        if (!gameObject) return;

        this.container.innerHTML = gameObject.template;
        this.activeEngine = gameObject.init();
    }

    jumpToLevel(id, personaje = 'kitty') {
        console.log(`Cargando nivel ${id} con pantalla de ${personaje}`);
        this.showLoadingScreen(personaje);

        setTimeout(() => {
            this.currentLevelId = id;
            this.renderCurrentLevel();

            // 🔥 LA LÍNEA MÁGICA: Prendemos la luz del juego de nuevo
            this.container.style.display = 'block';

            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.loadingScreen.classList.remove('fade-out');
            }, 500);

        }, 2000);
    }
    // =========================================================
    // 🎬 SISTEMA DE TRANSICIONES ENTRE NIVELES (El Telón)
    // =========================================================

    goToLobby() {
        console.log("Regresando al Lobby...");
        this.showLoadingScreen('kitty');

        setTimeout(() => {
            this.currentLevelId = 1;
            this.renderCurrentLevel();

            this.container.style.display = 'block';

            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.loadingScreen.classList.remove('fade-out');
            }, 500);

        }, 1200);
    }

    nextLevel() {
        this.currentLevelId++;
        this.renderCurrentLevel();
    }

    triggerSuccessState() {
        this.container.style.display = 'none';
        this.successScreen.style.display = 'flex';
    }
}

// Inicialización global única
document.addEventListener("DOMContentLoaded", () => {
    window.app = new AppOrchestrator();
});
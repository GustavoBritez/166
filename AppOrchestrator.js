class AppOrchestrator {
    constructor() {
        // Centraliza las referencias críticas del DOM
        this.loadingScreen = document.getElementById('loadingScreen');
        this.storyContainer = document.getElementById('storyContainer');
        this.successScreen = document.getElementById('successScreen');
        
        // Estado de los subsistemas (inicialmente apagados)
        this.flowManager = null; // Lo que antes era AppManager
        this.gameEngine = null;  // Lo que antes era GameManager

        this.boot();
    }

    // 1. Sistema de arranque (Bootstrapping)
    boot() {
        this.showLoadingScreen();
        this.setupGlobalEvents();
        
        // Espera a que el navegador termine de descargar los assets
        window.addEventListener('load', () => {
            setTimeout(() => this.startStoryFlow(), 1200);
        });
    }

    // 2. Control de la Pantalla de Carga
    showLoadingScreen() {
        this.loadingScreen.style.display = 'flex';
        this.storyContainer.style.display = 'none';
        this.successScreen.style.display = 'none';
    }

    // 3. Transición al flujo interactivo
    startStoryFlow() {
        this.loadingScreen.classList.add('fade-out');
        this.storyContainer.style.display = 'block';
        
        // Inicializamos el manejador de pantallas pasándole este orquestador
        this.flowManager = new FlowManager(this); 
    }

    // 4. Orquestación del Nivel (Se dispara desde el Slide 3)
    loadGameLevel(gridElement, movesDisplay) {
        console.log("Orchestrator: Inicializando el motor de Match-3...");
        
        // Instancia el juego pasándole el callback de victoria hacia este orquestador
        this.gameEngine = new GameEngine(
            gridElement, 
            movesDisplay, 
            () => this.handleLevelCleared()
        );
        this.gameEngine.start();
    }

    // 5. Manejo del éxito en el minijuego
    handleLevelCleared() {
        console.log("Orchestrator: Nivel completado con éxito. Revelando propuesta.");
        document.getElementById('gameLayer').style.opacity = '0';
        
        setTimeout(() => {
            document.getElementById('gameLayer').style.display = 'none';
            document.getElementById('secretInvitation').classList.add('revealed');
        }, 400);
    }

    // 6. Cierre del ciclo de vida
    triggerSuccessState() {
        this.storyContainer.style.display = 'none';
        this.successScreen.style.display = 'flex';
    }
}

// Inicialización global única
document.addEventListener("DOMContentLoaded", () => {
    window.app = new AppOrchestrator();
});
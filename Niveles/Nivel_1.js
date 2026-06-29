import { TilemapRenderer } from '../Service/TilemapRenderer.js';
import { UIManager } from './UiManager/UiManager.js';
import { InputManager } from './PlayerControladorCarpet/InputManager.js';
import { CollisionManager } from './PlayerControladorCarpet/CollisionManager.js';
import { EnemyManager } from './Enemigo/EnemyManager.js';
import { Player } from './PlayerControladorCarpet/Player.js';
import { PlayerController } from './PlayerControladorCarpet/PlayerControllator.js';

export class Nivel_1 {
    constructor(canvas, config, eventBus) {
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz.");
        }

        this.canvas = canvas;
        this.config = config;
        this.eventBus = eventBus;
        this.projectiles = [];

        // Clonamos la matriz para proteger los datos originales de nivel
        this.mapaMatriz = config.matriz.map((fila) => fila.slice());
        this.settings = window.GAME_TUNING || { tileSize: 32, playerSpeed: 170, playerLives: 3 };
        this.tileSize = this.settings.tileSize;

        // 1. Inicializar el motor gráfico PixiJS
        this.app = new PIXI.Application({
            view: canvas,
            resizeTo: window,
            backgroundColor: 0x14121f,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // 2. Estructurar el árbol de nodos de PixiJS (Capas)
        this.mundo = new PIXI.Container();
        this.capaFondo = new PIXI.Container();
        this.capaEntidades = new PIXI.Container();
        this.capaUI = new PIXI.Container();


        this.mundo.addChild(this.capaFondo, this.capaEntidades);
        this.app.stage.addChild(this.mundo, this.capaUI);

        // 3. Inicializar el Modelo de Datos del Jugador (Datos puros)
        this.player = new Player(
            1.5 * this.tileSize,
            1.5 * this.tileSize,
            this.settings.playerSpeed,
            this.settings.playerLives
        );

        // 4. Inyección de dependencias y desacoplamiento de Gerentes (Managers)
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager(this.mapaMatriz, this.tileSize);

        // El controlador asume la lógica del jugador usando sus dependencias
        this.playerController = new PlayerController(this.player, this.inputManager, this.collisionManager);

        this.renderizador = new TilemapRenderer(this.capaFondo, this.mapaMatriz, this.tileSize);
        this.uiManager = new UIManager(this.capaUI);
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, this.config.enemigos);

        this.camara = {
            x: this.player.x,
            y: this.player.y
        };
        this.gameOver = false;
        this.isPaused = false;

        this.handleResize = () => this.redimensionarEscena();
        this.start();
    }

    start() {
        // Suscribirse a eventos del navegador
        window.addEventListener('resize', this.handleResize);

        // Preparar buffers de memoria y pools de objetos gráficos
        this.renderizador.inicializarPool(window.innerWidth, window.innerHeight);
        this.enemyManager.inicializar();

        // Crear la representación visual (Sprite) de Kitty y enlazarla al modelo
        let graficoKitty = new PIXI.Graphics();
        graficoKitty.beginFill(0xff6584); // Rosado característico
        graficoKitty.drawCircle(0, 0, this.tileSize * 0.25);
        graficoKitty.endFill();

        this.player.setSprite(graficoKitty);
        this.capaEntidades.addChild(this.player.sprite);

        // Forzar actualización visual inicial del HUD
        this.uiManager.actualizar(this.player);

        // Iniciar el Ticker principal (Game Loop) sincronizado a los hercios de la pantalla
        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        if (this.gameOver || this.isPaused) return;

        const dt = delta / this.app.ticker.FPS;

        // 1. Actualización en cascada de la lógica de los componentes autónomos
        this.playerController.update(dt);
        this.enemyManager.update(dt, this.player, this);
        this.actualizarProyectiles(dt);

        // 2. Evaluación de reglas del juego globales
        this.verificarVictoria();

        // 3. Procesamiento físico de la posición de la cámara (Caja de zona muerta)
        this.actualizarCamara();

        // 4. Sincronización final de la vista gráfica y la interfaz de usuario
        this.renderizador.actualizarVista(this.camara.x, this.camara.y);
        this.uiManager.actualizar(this.player);
    }

    actualizarProyectiles(dt) {
        // OPTIMIZACIÓN 1: Sacamos la matemática constante fuera de los bucles.
        // Sumamos los radios (0.15 + 0.22 = 0.37) y elevamos el resultado al cuadrado.
        const radioColision = this.tileSize * 0.37;
        const colisionSq = radioColision * radioColision;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let bala = this.projectiles[i];

            bala.x += bala.vx * dt;
            bala.y += bala.vy * dt;
            bala.sprite.x = bala.x;
            bala.sprite.y = bala.y;

            // Choca contra pared
            if (this.collisionManager.esPared(bala.x, bala.y)) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }

            // Choca contra enemigo
            let impactoConfirmado = false;

            for (let j = 0; j < this.enemyManager.enemies.length; j++) {
                let enemigo = this.enemyManager.enemies[j];

                // OPTIMIZACIÓN 2: Teorema de Pitágoras sin raíz cuadrada (O(1) ultrarrápido)
                let dx = bala.x - enemigo.x;
                let dy = bala.y - enemigo.y;
                let distSq = (dx * dx) + (dy * dy);

                // Comparamos los cuadrados directamente
                if (distSq < colisionSq) {
                    enemigo.recibirGolpe(25, 'FISICO');
                    impactoConfirmado = true;
                    break; // Rompemos el bucle del enemigo actual
                }
            }

            // Limpieza de la bala tras confirmar el impacto
            if (impactoConfirmado) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    actualizarCamara() {
        const zonaMuertaW = 150; // 100px a cada lado
        const zonaMuertaH = 100;  // 80px arriba/abajo

        const dx = this.player.x - this.camara.x;
        const dy = this.player.y - this.camara.y;

        if (Math.abs(dx) > zonaMuertaW) {
            this.camara.x += (dx - (Math.sign(dx) * zonaMuertaW)) * 0.1;
        }

        if (Math.abs(dy) > zonaMuertaH) {
            this.camara.y += (dy - (Math.sign(dy) * zonaMuertaH)) * 0.1;
        }

        this.mundo.x = (window.innerWidth / 2) - this.camara.x;
        this.mundo.y = (window.innerHeight / 2) - this.camara.y;
    }

    verificarVictoria() {
        // Si el mánager reporta que la lista está limpia, el nivel se da por concluido
        if (this.enemyManager.enemies.length === 0 && !this.gameOver) {
            this.gameOver = true;
            if (this.eventBus) {
                this.eventBus.emit('LEVEL_VICTORY');
            }
        }
    }

    redimensionarEscena() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            if (this.app && this.app.renderer) {
                // 3. Ajustamos el tamaño del renderizador de PixiJS a la nueva ventana
                this.app.renderer.resize(window.innerWidth, window.innerHeight);

                // 4. Si nuestro renderizador de mapas tiene una piscina de objetos (pool),
                // le notificamos para que ajuste sus buffers de memoria y no se desborden.
                if (this.renderizador && typeof this.renderizador.redimensionarPantalla === 'function') {
                    this.renderizador.redimensionarPantalla(window.innerWidth, window.innerHeight);
                }

                // Opcional: Si tienes elementos de UI que necesiten reposicionarse
                if (this.uiManager && typeof this.uiManager.reajustarUI === 'function') {
                    this.uiManager.reajustarUI(window.innerWidth, window.innerHeight);
                }
            }
        }, 100);
    }

    destroy() {
        // 1. Limpieza de eventos y temporizadores (Evita ejecuciones fantasma)
        clearTimeout(this.resizeTimeout);
        window.removeEventListener('resize', this.handleResize);

        // 2. Destrucción de managers (Inyección de dependencias)
        // Usamos una lista para evitar repetir el 'if' constantemente
        const managers = [this.inputManager, this.renderizador, this.uiManager, this.enemyManager, this.projectileManager];
        for (const manager of managers) {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        }

        // 3. Limpieza profunda del modelo y sprites
        if (this.player) {
            if (this.player.sprite) {
                this.player.sprite.destroy(true); // 'true' asegura destruir texturas/hijos
                this.player.sprite = null;
            }
            this.player = null; // Eliminamos la referencia al objeto del jugador
        }

        // 4. Liberación total de PixiJS (Destrucción jerárquica)
        if (this.app) {
            this.app.destroy(true, {
                children: true,
                texture: true,
                baseTexture: true
            });
            this.app = null;
        }

        // 5. Nulificación final de referencias (La técnica clave)
        // Esto es lo que realmente permite que el Garbage Collector libere la RAM
        this.mapaMatriz = null;
        this.config = null;
        this.eventBus = null;
    }
}
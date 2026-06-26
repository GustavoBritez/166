export class Nivel_1 {
    constructor(canvas, config, eventBus) {
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz.");
        }

        this.canvas = canvas;
        this.config = config;
        this.eventBus = eventBus;
        this.mapaMatriz = config.matriz.map((fila) => fila.slice());
        this.settings = this.obtenerConfiguracionGlobal();

        this.app = new PIXI.Application({
            view: canvas,
            resizeTo: window,
            backgroundColor: 0x14121f,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        this.tileSize = this.settings.tileSize;
        this.worldWidth = this.mapaMatriz[0].length * this.tileSize;
        this.worldHeight = this.mapaMatriz.length * this.tileSize;

        this.mundo = new PIXI.Container();
        this.capaFondo = new PIXI.Container();
        this.capaEntidades = new PIXI.Container();
        this.capaUI = new PIXI.Container();
        this.mundo.addChild(this.capaFondo, this.capaEntidades);
        this.app.stage.addChild(this.mundo, this.capaUI);

        this.player = {
            gridX: 0, gridY: 0, sprite: null, x: 0, y: 0, vx: 0, vy: 0,
            lives: this.settings.playerLives, speed: this.settings.playerSpeed,
            turboMultiplier: this.settings.turboMultiplier, turboUntil: 0,
            fireCooldownUntil: 0, direction: { x: 0, y: 1 }
        };

        this.enemies = []; 
        this.projectiles = [];
        this.keys = {};
        this.gameOver = false;
        this.isPaused = false;

        this.handleKeyDown = (e) => this.onKeyDown(e);
        this.handleKeyUp = (e) => this.onKeyUp(e);
        this.handleResize = () => this.redimensionarEscena();

        this.start();
    }


    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.handleResize);

        this.construirMapa();
        this.crearHud();
        this.redimensionarEscena();
        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        if (this.gameOver || this.isPaused) return;

        const dt = delta / this.app.ticker.FPS;
        const velocity = this.calcularVelocidadActual();

        this.moverJugador(dt, velocity);

        this.actualizarEnemigos(dt);
        
        this.actualizarProyectiles(dt);
        this.verificarColisionesJugadorEnemigo();
        this.verificarVictoria();
        this.verificarPortales();
        this.actualizarCamara();
        this.aplicarFrustumCulling();
        this.actualizarHud();
    }

    crearEnemigos() {
        const definitions = Array.isArray(this.config.enemigos) ? this.config.enemigos : [];
        
        definitions.forEach((data) => {
            let enemigo = this.fabricaDeEnemigos(data); 
            
            enemigo.sprite = this.crearCirculo(data.color, this.tileSize * 0.22);
            enemigo.sprite.x = enemigo.x;
            enemigo.sprite.y = enemigo.y;
            this.capaEntidades.addChild(enemigo.sprite);
            
            this.enemies.push(enemigo);
        });
    }

    actualizarEnemigos(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            enemy.update(dt, this.player, this); 
        }
    }

    fabricaDeEnemigos(data) {
        let enemigo;

        // 1. Instanciamos la clase base (el "personaje")
        switch (data.tipo) {
            case 'Baku':
                enemigo = new EnemigoBaku(data, this.tileSize);
                break;
            case 'Splitter': // <--- Añade esto
                enemigo = new EnemigoBase(data, this.tileSize);
                break;
            default:
                enemigo = new EnemigoBase(data, this.tileSize);
                break;
        }

        // 2. Aplicamos Decoradores (las "capas" de comportamiento)
        // El orden aquí es importante: primero el Splitter, luego fuego si tuviera
        if (data.esSplitter) {
            enemigo = new SplitterDecorator(enemigo, data.vidas || 2);
        }

        if (data.tieneFuego) {
            enemigo = new FireDecorator(enemigo);
        }
        
        if (data.esRapido) {
            enemigo = new SpeedDecorator(enemigo);
        }

        return enemigo;
    }
    
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize);

        this.projectiles.forEach((bullet) => bullet.sprite.destroy());
        this.enemies.forEach((enemy) => enemy.sprite.destroy());

        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
}
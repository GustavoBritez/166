import { TILE_DICT } from '../Enemigo/EnemigoDecorator.js';
import { TilemapRenderer } from './TilemapRenderer.js';

export class Nivel_1 {
    constructor(canvas, config, eventBus) {
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz.");
        }

        this.renderizador = new TilemapRenderer(this.capaFondo, this.mapaData, this.tileSize);
        this.canvas = canvas;
        this.config = config;
        this.eventBus = eventBus;
        this.mapaMatriz = config.matriz.map((fila) => fila.slice());
        this.settings = window.GAME_TUNING;

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
        
        this.camara = {
            x: 1.5 * this.tileSize,
            y: 1.5 * this.tileSize
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
    
    update(delta) {
        if (this.gameOver || this.isPaused) return;

        const dt = delta / this.app.ticker.FPS;
        const velocity = this.calcularVelocidadActual();

        this.moverJugador(dt, velocity);

        this.actualizarEnemigos(dt);

        this.renderizador.actualizarVista(this.camara.x, this.camara.y);

        this.actualizarProyectiles(dt);
        this.verificarColisionesJugadorEnemigo();
        this.verificarVictoria();
        this.verificarPortales();
        this.actualizarCamara() ;
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
    crearHud() {
        // 1. Definimos un estilo de texto (Cute y legible)
        const estiloTexto = new PIXI.TextStyle({
            fontFamily: 'Comic Sans MS', // O la fuente que uses
            fontSize: 28,
            fill: '#ff6584', // Un rosado estilo Kitty
            stroke: '#ffffff',
            strokeThickness: 4,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowDistance: 2,
        });

        // 2. Creamos el texto de las vidas
        this.textoVidas = new PIXI.Text('Vidas: ' + this.player.lives, estiloTexto);
        this.textoVidas.x = 20;
        this.textoVidas.y = 20;

        // 3. Lo agregamos a la capa UI (¡Importante! No a la capa del mundo)
        this.capaUI.addChild(this.textoVidas);
    }
    redimensionarEscena() {
        // Le decimos al motor de PixiJS que ajuste el lienzo al tamaño actual de la ventana
        if (this.app && this.app.renderer) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }
    actualizarHud() {
        // Este método se llama 60 veces por segundo en el update()
        // Solo actualizamos el texto si el valor cambió para ahorrar recursos
        if (this.textoVidas) {
            this.textoVidas.text = 'Vidas: ' + this.player.lives;
        }
    }
    calcularVelocidadActual() {
        let vx = 0;
        let vy = 0;
        const velocidad = this.player.speed; // Los 170 que definiste en tu GAME_TUNING

        // Leemos el objeto this.keys que llenan onKeyDown y onKeyUp
        if (this.keys['w']) vy -= velocidad;
        if (this.keys['s']) vy += velocidad;
        if (this.keys['a']) vx -= velocidad;
        if (this.keys['d']) vx += velocidad;

        // Normalizamos la velocidad en diagonal para que no corra más rápido al presionar W+D
        if (vx !== 0 && vy !== 0) {
            const factorSuma = Math.sqrt(0.5);
            vx *= factorSuma;
            vy *= factorSuma;
        }

        return { vx, vy };
    }
    
    moverJugador(dt, velocity) {
        // Si no te estás moviendo, no hacemos cálculos
        if (velocity.vx === 0 && velocity.vy === 0) return;

        // 1. Calculamos las posiciones tentativas en el siguiente frame
        let nuevoX = this.player.x + velocity.vx * dt;
        let nuevoY = this.player.y + velocity.vy * dt;

        // Tamaño aproximado del hitbox de tu personaje (un recuadro imaginario)
        const radioHitbox = this.tileSize * 0.25; 

        // 2. SISTEMA DE COLISIONES BÁSICO (Contra tu array this.paredes)
        let chocaX = false;
        let chocaY = false;

        if (this.paredes) {
            for (let i = 0; i < this.paredes.length; i++) {
                const pared = this.paredes[i];

                // Chequeo en el eje X
                if (nuevoX + radioHitbox > pared.x &&
                    nuevoX - radioHitbox < pared.x + pared.width &&
                    this.player.y + radioHitbox > pared.y &&
                    this.player.y - radioHitbox < pared.y + pared.height) {
                    chocaX = true;
                }

                // Chequeo en el eje Y
                if (this.player.x + radioHitbox > pared.x &&
                    this.player.x - radioHitbox < pared.x + pared.width &&
                    nuevoY + radioHitbox > pared.y &&
                    nuevoY - radioHitbox < pared.y + pared.height) {
                    chocaY = true;
                }
            }
        }

        // 3. Si no hay colisión, aplicamos el movimiento a las coordenadas lógicas
        if (!chocaX) this.player.x = nuevoX;
        if (!chocaY) this.player.y = nuevoY;

        // 4. Sincronizamos la posición lógica con el Sprite gráfico de PixiJS
        if (this.player.sprite) {
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }
    }
    
    actualizarProyectiles(dt) { }

    verificarVictoria() { }
    
    verificarPortales() { }
    
    actualizarCamara() {
        const pantallaW = window.innerWidth;
        const pantallaH = window.innerHeight;

        // 1. Definimos el tamaño de la "Zona Muerta" (Caja invisible)
        // 100 píxeles significa que Kitty puede moverse 100px a la izquierda o derecha 
        // del centro antes de que la cámara empiece a seguirla.
        const zonaMuertaX = 150; 
        const zonaMuertaY = 100;

        // 2. Comprobamos si Kitty empuja el borde DERECHO de la zona muerta
        if (this.player.x > this.camara.x + zonaMuertaX) {
            this.camara.x = this.player.x - zonaMuertaX;
        } 
        // Comprobamos si empuja el borde IZQUIERDO
        else if (this.player.x < this.camara.x - zonaMuertaX) {
            this.camara.x = this.player.x + zonaMuertaX;
        }

        // 3. Comprobamos si empuja el borde INFERIOR
        if (this.player.y > this.camara.y + zonaMuertaY) {
            this.camara.y = this.player.y - zonaMuertaY;
        } 
        // Comprobamos si empuja el borde SUPERIOR
        else if (this.player.y < this.camara.y - zonaMuertaY) {
            this.camara.y = this.player.y + zonaMuertaY;
        }

        // 4. Movemos el mundo en dirección contraria para centrar la vista en this.camara
        const objetivoX = (pantallaW / 2) - this.camara.x;
        const objetivoY = (pantallaH / 2) - this.camara.y;

        this.mundo.x = objetivoX;
        this.mundo.y = objetivoY;
    }
}
class Nivel_1 {
    constructor(canvas, config, eventBus) {
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz.");
        }

        this.canvas = canvas;
        this.config = config;
        this.onWin = eventBus;
        this.eventBus = eventBus; // Guardamos la autopista de comunicación
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
            gridX: 0,
            gridY: 0,
            sprite: null,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            lives: this.settings.playerLives,
            speed: this.settings.playerSpeed,
            turboMultiplier: this.settings.turboMultiplier,
            turboUntil: 0,
            fireCooldownUntil: 0,
            direction: { x: 0, y: 1 }
        };

        this.enemies = [];
        this.projectiles = [];
        this.keys = {};
        this.lastMoveDirection = { x: 0, y: 0 };
        this.gameOver = false;
        this.victoryTriggered = false;
        this.isPaused = false;

        this.handleKeyDown = (e) => this.onKeyDown(e);
        this.handleKeyUp = (e) => this.onKeyUp(e);
        this.handleResize = () => this.redimensionarEscena();

        this.start();
    }

    obtenerConfiguracionGlobal() {
        const globalSettings = window.GAME_TUNING || {};
        return {
            tileSize: globalSettings.tileSize ?? 48,
            playerLives: globalSettings.playerLives ?? 3,
            playerSpeed: globalSettings.playerSpeed ?? 170,
            berrySpeedBoost: globalSettings.berrySpeedBoost ?? 0.5,
            bulletSpeed: globalSettings.bulletSpeed ?? 420,
            bulletRadius: globalSettings.bulletRadius ?? 6,
            bulletCooldown: globalSettings.bulletCooldown ?? 220,
            turboMultiplier: globalSettings.turboMultiplier ?? 1.6,
            turboDurationMs: globalSettings.turboDurationMs ?? 2000,
            berryVisionTiles: globalSettings.berryVisionTiles ?? 5,
            enemyDamageCooldownMs: globalSettings.enemyDamageCooldownMs ?? 900,
            enemySpeedMultiplier: globalSettings.enemySpeedMultiplier ?? 1
        };
    }

    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.handleResize);

        this.construirMapa();
        this.crearHud();
        this.redimensionarEscena();
        this.app.ticker.add((delta) => this.update(delta));
        this.conectarControlesAudio();
    }

    onKeyDown(e) {
        this.keys[e.key] = true;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'Shift', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key) || e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            e.preventDefault();
        }

        if (e.key === 'Shift') {
            this.activarTurbo();
        }

        if (e.key === ' ' || e.code === 'Space') {
            this.disparar();
        }

        // 🔥 NUEVO: Detectar tecla Escape
        if (e.key === 'Escape') {
            this.togglePause();
        }
    }

    // 🔥 NUEVO MÉTODO: Congela la lógica y muestra/oculta el HTML
    togglePause() {
        if (this.gameOver) return; // Si ya moriste o ganaste, no podés pausar

        this.isPaused = !this.isPaused; // Invierte el estado (Pausado <-> Activo)

        const menuPausa = document.getElementById('menuPausa');
        if (menuPausa) {
            // Activa o apaga la capa en pantalla
            menuPausa.style.display = this.isPaused ? 'flex' : 'none';
        }
    }

    onKeyUp(e) {
        this.keys[e.key] = false;
    }

    construirMapa() {
        const fondoBase = new PIXI.Graphics();
        fondoBase.beginFill(0x181426, 1);
        fondoBase.drawRect(0, 0, this.worldWidth, this.worldHeight);
        fondoBase.endFill();
        this.capaFondo.addChild(fondoBase);

        for (let y = 0; y < this.mapaMatriz.length; y++) {
            for (let x = 0; x < this.mapaMatriz[y].length; x++) {
                const tipoCelda = this.mapaMatriz[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                const tile = new PIXI.Graphics();
                tile.beginFill((x + y) % 2 === 0 ? 0x241d3a : 0x211933, 1);
                tile.drawRoundedRect(0, 0, this.tileSize - 1, this.tileSize - 1, 8);
                tile.endFill();
                tile.x = posX;
                tile.y = posY;
                this.capaFondo.addChild(tile);

                if (tipoCelda === 1) {
                    const pared = new PIXI.Graphics();
                    pared.beginFill(0x8c6df0, 1);
                    pared.drawRoundedRect(0, 0, this.tileSize - 1, this.tileSize - 1, 10);
                    pared.endFill();
                    pared.alpha = 0.9;
                    pared.x = posX;
                    pared.y = posY;
                    this.capaFondo.addChild(pared);
                } else if (tipoCelda === 2) {
                    const meta = new PIXI.Graphics();
                    meta.beginFill(0xffd166, 1);
                    meta.drawRoundedRect(4, 4, this.tileSize - 9, this.tileSize - 9, 10);
                    meta.endFill();
                    meta.x = posX;
                    meta.y = posY;
                    this.capaFondo.addChild(meta);
                } else if (tipoCelda === 3) {
                    this.player.gridX = x;
                    this.player.gridY = y;
                    this.player.x = posX + this.tileSize / 2;
                    this.player.y = posY + this.tileSize / 2;
                    this.player.sprite = this.crearCirculo(0x3da9fc, this.tileSize * 0.22, 0.95);
                    this.player.sprite.x = this.player.x;
                    this.player.sprite.y = this.player.y;
                    this.player.baseScale = this.player.sprite.scale.x;
                    this.capaEntidades.addChild(this.player.sprite);
                    this.mapaMatriz[y][x] = 0;
                }
            }
        }

        this.crearEnemigos();
        this.actualizarCamara(true);
    }

    crearCirculo(color, radio, alpha = 1) {
        const g = new PIXI.Graphics();
        g.beginFill(color, alpha);
        g.drawCircle(0, 0, radio);
        g.endFill();
        return g;
    }

    crearHud() {
        this.hudTexto = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xffffff,
            fontWeight: '700',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 2,
        });
        this.hudTexto.position.set(16, 14);
        this.hudTexto.zIndex = 1000;
        this.capaUI.addChild(this.hudTexto);
        this.actualizarHud();
    }

    actualizarHud() {
        const vidas = Math.max(0, this.player.lives);
        this.hudTexto.text = `Vidas: ${vidas} | SPACE: disparo | SHIFT: turbo`;
    }

    crearEnemigos() {
        const definitions = Array.isArray(this.config.enemigos) ? this.config.enemigos : [];
        const palette = {
            Baku: 0x8a2be2,
            Badtz: 0xf1c40f,
            Berry: 0x2ecc71
        };

        definitions.forEach((data) => {
            const enemy = {
                tipo: data.tipo,
                gridX: data.gridX,
                gridY: data.gridY,
                x: data.gridX * this.tileSize + this.tileSize / 2,
                y: data.gridY * this.tileSize + this.tileSize / 2,
                startX: data.gridX * this.tileSize + this.tileSize / 2,
                startY: data.gridY * this.tileSize + this.tileSize / 2,
                speed: this.settings.playerSpeed,
                sprite: this.crearCirculo(this.parseColor(data.color, palette[data.tipo] ?? 0xffffff), this.tileSize * 0.22),
                lastHitAt: 0,
                patrolDirection: 1,
                visionRadius: this.settings.berryVisionTiles * this.tileSize,
                baseScale: 1
            };

            enemy.sprite.x = enemy.x;
            enemy.sprite.y = enemy.y;
            this.capaEntidades.addChild(enemy.sprite);
            this.enemies.push(enemy);
        });
    }

    parseColor(colorValue, fallback) {
        if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
            return Number.parseInt(colorValue.slice(1), 16);
        }

        if (typeof colorValue === 'number') {
            return colorValue;
        }

        return fallback;
    }

    redimensionarEscena() {
        if (!this.app || !this.player.sprite) return;
        this.actualizarCamara(true);
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

    aplicarFrustumCulling() {
        // 1. Calculamos dónde está mirando la cámara actualmente
        // Como el "mundo" se mueve en reversa (hacia los negativos), invertimos el signo.
        if (!this.app || !this.app.screen) return;

        const vistaIzquierda = -this.mundo.x;
        const vistaDerecha = -this.mundo.x + this.app.screen.width;
        const vistaArriba = -this.mundo.y;
        const vistaAbajo = -this.mundo.y + this.app.screen.height;

        // 2. Margen de seguridad (2 bloques extra alrededor de la pantalla)
        // Evita el efecto de "pop-in" (que el jugador vea cuando el bloque se enciende)
        const margen = this.tileSize * 2;

        // 3. Recorremos TODOS los gráficos del mapa (Suelos, paredes, metas)
        const elementosFondo = this.capaFondo.children;

        for (let i = 0; i < elementosFondo.length; i++) {
            const tile = elementosFondo[i];

            // ¿Este bloque está adentro del rectángulo de visión + margen?
            const estaVisible = (
                tile.x >= vistaIzquierda - margen &&
                tile.x <= vistaDerecha + margen &&
                tile.y >= vistaArriba - margen &&
                tile.y <= vistaAbajo + margen
            );

            // Si está lejos, PixiJS ignora este bloque y no lo renderiza en la GPU
            tile.visible = estaVisible;
        }
    }

    calcularVelocidadActual() {
        return this.player.turboUntil > performance.now()
            ? this.player.speed * this.player.turboMultiplier
            : this.player.speed;
    }

    moverJugador(dt, velocity) {
        const direccion = this.leerDireccion();
        if (direccion.x === 0 && direccion.y === 0) {
            this.player.sprite.scale.set(this.player.baseScale || 1);
            return;
        }

        this.player.direction = direccion;

        const nextX = this.player.x + direccion.x * velocity * dt;
        const nextY = this.player.y + direccion.y * velocity * dt;

        if (this.esPosicionCaminoLibre(nextX, nextY, this.tileSize * 0.22)) {
            this.player.x = nextX;
            this.player.y = nextY;
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }

        const pulso = 1 + (this.player.turboUntil > performance.now() ? 0.08 : 0);
        this.player.sprite.scale.set(pulso);
    }

    leerDireccion() {
        const up = this.keys.ArrowUp || this.keys.w || this.keys.W;
        const down = this.keys.ArrowDown || this.keys.s || this.keys.S;
        const left = this.keys.ArrowLeft || this.keys.a || this.keys.A;
        const right = this.keys.ArrowRight || this.keys.d || this.keys.D;

        if (up) return { x: 0, y: -1 };
        if (down) return { x: 0, y: 1 };
        if (left) return { x: -1, y: 0 };
        if (right) return { x: 1, y: 0 };
        return { x: 0, y: 0 };
    }

    esPosicionCaminoLibre(x, y, radio) {
        const puntos = [
            { x: x - radio, y: y - radio },
            { x: x + radio, y: y - radio },
            { x: x - radio, y: y + radio },
            { x: x + radio, y: y + radio }
        ];

        return puntos.every((punto) => !this.esParedEnPixel(punto.x, punto.y));
    }

    esParedEnPixel(x, y) {
        if (x < 0 || y < 0 || x >= this.worldWidth || y >= this.worldHeight) return true;

        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        return this.mapaMatriz[gridY]?.[gridX] === 1;
    }

    actualizarEnemigos(dt) {
        this.enemies.forEach((enemy) => {
            const speed = this.settings.playerSpeed * (enemy.tipo === 'Berry' ? (1 + this.settings.berrySpeedBoost) : 1);
            const radioEnemigo = this.tileSize * 0.22;

            if (enemy.tipo === 'Baku') {
                const nextX = enemy.x + enemy.patrolDirection * speed * dt;
                const limiteIzquierdo = enemy.startX - this.tileSize * 2;
                const limiteDerecho = enemy.startX + this.tileSize * 2;

                if (nextX < limiteIzquierdo || nextX > limiteDerecho) {
                    enemy.patrolDirection *= -1;
                } else if (this.esPosicionCaminoLibre(nextX, enemy.y, radioEnemigo)) {
                    enemy.x = nextX;
                }
            } else if (enemy.tipo === 'Badtz') {
                const nextY = enemy.y + enemy.patrolDirection * speed * dt;
                const limiteSuperior = enemy.startY - this.tileSize * 2;
                const limiteInferior = enemy.startY + this.tileSize * 2;

                if (nextY < limiteSuperior || nextY > limiteInferior) {
                    enemy.patrolDirection *= -1;
                } else if (this.esPosicionCaminoLibre(enemy.x, nextY, radioEnemigo)) {
                    enemy.y = nextY;
                }
            } else if (enemy.tipo === 'Berry') {
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const distance = Math.hypot(dx, dy);

                if (distance <= enemy.visionRadius) {
                    const chaseSpeed = speed * dt;
                    const stepX = (dx / Math.max(distance, 0.001)) * chaseSpeed;
                    const stepY = (dy / Math.max(distance, 0.001)) * chaseSpeed;
                    const nextX = enemy.x + stepX;
                    const nextY = enemy.y + stepY;

                    if (this.esPosicionCaminoLibre(nextX, nextY, radioEnemigo)) {
                        enemy.x = nextX;
                        enemy.y = nextY;
                    } else {
                        const moveX = this.esPosicionCaminoLibre(nextX, enemy.y, radioEnemigo);
                        const moveY = this.esPosicionCaminoLibre(enemy.x, nextY, radioEnemigo);

                        if (moveX) {
                            enemy.x = nextX;
                        }

                        if (moveY) {
                            enemy.y = nextY;
                        }
                    }
                }
            }

            enemy.sprite.x = enemy.x;
            enemy.sprite.y = enemy.y;
        });
    }

    disparar() {
        const now = performance.now();
        if (now < this.player.fireCooldownUntil) return;
        this.player.fireCooldownUntil = now + this.settings.bulletCooldown;

        const bullet = {
            x: this.player.x,
            y: this.player.y,
            dir: { ...this.player.direction },
            sprite: this.crearCirculo(0xffffff, this.settings.bulletRadius, 0.95)
        };

        if (bullet.dir.x === 0 && bullet.dir.y === 0) {
            bullet.dir = { x: 0, y: -1 };
        }

        bullet.sprite.x = bullet.x;
        bullet.sprite.y = bullet.y;
        this.capaEntidades.addChild(bullet.sprite);
        this.projectiles.push(bullet);
    }

    actualizarProyectiles(dt) {
        this.projectiles = this.projectiles.filter((bullet) => {
            // 1. Movemos la bala matemáticamente
            bullet.x += bullet.dir.x * this.settings.bulletSpeed * dt;
            bullet.y += bullet.dir.y * this.settings.bulletSpeed * dt;
            bullet.sprite.x = bullet.x;
            bullet.sprite.y = bullet.y;

            // 2. Colisión con los bordes del Mundo
            const fueraDeMapa = bullet.x < 0 || bullet.y < 0 || bullet.x > this.worldWidth || bullet.y > this.worldHeight;
            if (fueraDeMapa) {
                bullet.sprite.destroy();
                return false;
            }

            // 3. 🔥 NUEVO: Colisión con las Paredes del Laberinto
            // Reutilizamos el mismo sensor que usa Kitty para no atravesar muros
            if (this.esParedEnPixel(bullet.x, bullet.y)) {
                bullet.sprite.destroy();
                return false; // Se elimina la bala
            }

            // 4. 🔥 MEJORADO: Colisión letal con Enemigos
            // Buscamos el índice del enemigo chocado para poder borrarlo de la lista
            const hitIndex = this.enemies.findIndex((enemy) =>
                this.distancia(bullet.x, bullet.y, enemy.x, enemy.y) < this.tileSize * 0.45 // Hitbox un poco más generosa
            );

            if (hitIndex !== -1) {
                const enemyHit = this.enemies[hitIndex];

                // Animación de muerte: se infla y desaparece rápidamente
                gsap.to(enemyHit.sprite.scale, { x: 1.5, y: 1.5, duration: 0.1 });
                gsap.to(enemyHit.sprite, {
                    alpha: 0,
                    duration: 0.1,
                    onComplete: () => {
                        enemyHit.sprite.destroy(); // Lo borramos de la placa de video
                    }
                });

                // Lo borramos de la lista lógica para que deje de perseguirnos
                this.enemies.splice(hitIndex, 1);

                // Destruimos la bala para que no atraviese al enemigo y mate a otro detrás
                bullet.sprite.destroy();
                return false;
            }

            // Si no chocó con nada, la bala sigue viviendo
            return true;
        });
    }

    verificarColisionesJugadorEnemigo() {
        const ahora = performance.now();

        this.enemies.forEach((enemy) => {
            const distancia = this.distancia(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distancia < this.tileSize * 0.38 && ahora - enemy.lastHitAt >= this.settings.enemyDamageCooldownMs) {
                enemy.lastHitAt = ahora;
                this.recibirDanio();
            }
        });
    }

    recibirDanio() {
        if (this.gameOver) return;

        this.player.lives -= 1;
        this.player.sprite.tint = 0xff8f8f;
        gsap.to(this.player.sprite, {
            duration: 0.18,
            alpha: 0.55,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.player.sprite.alpha = 1;
                this.player.sprite.tint = 0xffffff;
            }
        });

        if (this.player.lives <= 0) {
            this.terminarJuego(false);
        }
    }

    activarTurbo() {
        this.player.turboUntil = performance.now() + this.settings.turboDurationMs;
    }

    verificarVictoria() {
        if (this.victoryTriggered) return;

        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        const celda = this.mapaMatriz[tileY]?.[tileX];

        if (celda === 2) {
            this.victoryTriggered = true;
            this.terminarJuego(true);
        }
    }

    verificarPortales() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        const celda = this.mapaMatriz[tileY]?.[tileX];

        if (celda === 8) {
            this.gameOver = true;
            // Magia directa al nivel 3
            window.orquestador.transitionTo(3);
        }
    }
    terminarJuego(victoria) {
        if (this.gameOver) return;
        this.gameOver = true;

        // Ejecutamos la función que nos mandó el Factory
        if (victoria && typeof this.onWin === 'function') {
            this.onWin();
        } else if (!victoria) {
            // Si perdés, podés llamar directo al orquestador global (opción rápida)
            if (window.orquestador) window.orquestador.procesarDerrota();
        }
    }

    actualizarCamara(force = false) {
        if (!this.app || !this.app.screen || !this.player.sprite) return;

        const halfWidth = this.app.screen.width / 2;
        const halfHeight = this.app.screen.height / 2; // 🔥 ¡Le sacamos las barras!

        const objetivoX = halfWidth - this.player.x;
        const objetivoY = halfHeight - this.player.y;

        const maxX = 0;
        const maxY = 0;
        const minX = Math.min(0, this.app.screen.width - this.worldWidth);
        const minY = Math.min(0, this.app.screen.height - this.worldHeight);

        const clampedX = Math.max(minX, Math.min(maxX, objetivoX));
        const clampedY = Math.max(minY, Math.min(maxY, objetivoY));

        if (force) {
            this.mundo.position.set(clampedX, clampedY);
            return;
        }

        this.mundo.x += (clampedX - this.mundo.x) * 0.12;
        this.mundo.y += (clampedY - this.mundo.y) * 0.12;
    }

    distancia(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    }

    conectarControlesAudio() {
        const btnMusic = document.getElementById('btnMusic');
        const volRange = document.getElementById('volRange');

        if (!btnMusic || !volRange || !window.audioManager) return;

        btnMusic.onclick = () => {
            const playing = window.audioManager.togglePlay();
            btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
        };

        volRange.oninput = (e) => {
            window.audioManager.setVolume(e.target.value);
        };
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
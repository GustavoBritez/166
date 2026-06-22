class Nivel_1 {
    constructor(canvas, config, onWin) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.onWin = onWin;

        this.animationFrameId = null;

        // El jugador (Vos llevando los tragos)
        this.player = {
            x: config.playerStartX,
            y: config.playerStartY,
            width: 40,
            height: 40,
            color: '#3498db', // Azul por ahora
            speed: 5
        };

        // Diccionario para saber qué teclas están presionadas
        this.keys = {};

        // Bindear las funciones de teclado para no perder el "this"
        this.handleKeyDown = (e) => this.keys[e.key] = true;
        this.handleKeyUp = (e) => this.keys[e.key] = false;
    }

    start() {
        console.log("Nivel VIP iniciado. ¡Cuidado con no volcar nada!");

        // Escuchar el teclado
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Arrancar el Game Loop
        this.gameLoop();
    }

    update() {
        // Lógica de movimiento fluida (diagonal permitida)
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) this.player.y -= this.player.speed;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) this.player.y += this.player.speed;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) this.player.x += this.player.speed;

        // 🚧 LÍMITES DE LA PISTA (Para que no te salgas del canvas)
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.x + this.player.width > this.canvas.width) this.player.x = this.canvas.width - this.player.width;
        if (this.player.y + this.player.height > this.canvas.height) this.player.y = this.canvas.height - this.player.height;
    }

    draw() {
        // 1. Limpiar el frame anterior (Básico en cualquier Canvas)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Dibujar a Valu (Punto de llegada - Cuadrado Rosa)
        this.ctx.fillStyle = '#ffb7c5';
        this.ctx.fillRect(this.config.valuX, this.config.valuY, 50, 50);

        // 3. Dibujar al jugador (Vos)
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    // Usamos una arrow function para el loop, así no pierde el contexto de "this"
    gameLoop = () => {
        this.update(); // Primero calculamos matemáticas
        this.draw();   // Después pintamos el resultado

        // Pedimos al navegador que dibuje el próximo frame (aprox 60 veces por segundo)
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    destroy() {
        console.log("Destruyendo motor VIP y limpiando memoria...");
        // Detener el bucle de animaciones
        cancelAnimationFrame(this.animationFrameId);
        // Quitar los "orejones" del teclado para que no queden activos en otros niveles
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
export class PlayerController {
    // + constructor(player, inputManager, collisionManager)
    constructor(player, inputManager, collisionManager) {
        // Guardamos las dependencias inyectadas por Nivel_1
        this.player = player;
        this.inputManager = inputManager;
        this.collisionManager = collisionManager;
    }

    // + update(dt: Number): void
    update(dt) {
        // 1. Si Kitty está muerta, no procesamos ningún movimiento
        if (this.player.isDead) return;

        // 2. Calculamos la intención de movimiento del usuario
        const vectorVelocidad = this.calcularVelocidadActual();
        const vx = vectorVelocidad.vx;
        const vy = vectorVelocidad.vy;

        // 3. Si hay intención de moverse, le pedimos al árbitro (CollisionManager) que valide la física
        if (vx !== 0 || vy !== 0) {
            // resolverMovimiento nos devuelve la posición (x, y) ya ajustada si chocamos contra una pared
            const nuevaPos = this.collisionManager.resolverMovimiento(this.player, vx, vy, dt);

            // Actualizamos la posición lógica en el modelo
            this.player.x = nuevaPos.x;
            this.player.y = nuevaPos.y;
        }

        // 4. Sincronizamos la parte visual (Si implementaste el método actualizarPosicionVisual en Player)
        if (typeof this.player.actualizarPosicionVisual === 'function') {
            this.player.actualizarPosicionVisual();
        } else if (this.player.sprite) {
            // Fallback por si aún manejas el sprite directamente
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }
    }

    // - calcularVelocidadActual(): Object
    calcularVelocidadActual() {
        let vx = 0;
        let vy = 0;
        const velocidadBase = this.player.speed; // Viene de tu archivo de tuning (ej: 170)

        // El Controlador no sabe NADA de teclado, solo le pregunta al InputManager
        if (this.inputManager.isActionPressed('MOVE_UP')) vy -= velocidadBase;
        if (this.inputManager.isActionPressed('MOVE_DOWN')) vy += velocidadBase;
        if (this.inputManager.isActionPressed('MOVE_LEFT')) vx -= velocidadBase;
        if (this.inputManager.isActionPressed('MOVE_RIGHT')) vx += velocidadBase;

        // Normalizamos la velocidad diagonal por Pitágoras (para evitar que Kitty corra más rápido en diagonal)
        if (vx !== 0 && vy !== 0) {
            // Math.SQRT1_2 es una constante nativa de JS ultra-rápida (0.7071...)
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        return { vx, vy };
    }
}
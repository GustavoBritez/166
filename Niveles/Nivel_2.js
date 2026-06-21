// Juego estilo Mario Bross
class Nivel_2 {
    constructor(canvasElement, levelConfig, onWinCallback) {
        this.canvas = canvasElement;
        this.config = levelConfig; // Recibe la gravedad, enemigos, etc.
        this.onWin = onWinCallback;

        this.enemiesArray = [];
        this.player = null;
    }

    start() {
        // 1. Inicializás el jugador
        // this.player = new Player(this.config.gravity);

        // 2. Mapeás el array de datos de levels.js y creás los OBJETOS lógicos con NEW
        this.config.enemies.forEach(enemyData => {
            // Instanciás la clase Enemy pasándole el nombre, la vida y la posición del JSON
            const newEnemy = new PlatformEnemy(enemyData.name, enemyData.hp, enemyData.x, enemyData.y);
            this.enemiesArray.push(newEnemy);
        });

        // 3. Arrancás el bucle del juego (Game Loop a 60 FPS)
        this.gameLoop();
    }

    gameLoop() {
        // Acá corre el bucle de colisiones.
        // Si detectás que el Player cayó en el eje Y por encima de un enemigo:
        // enemy.takeDamage();

        this.checkWinCondition();
    }

    checkWinCondition() {
        // Si todos los enemigos de this.enemiesArray tienen hp <= 0:
        // this.onWin(); // Le grita al AppOrchestrator que pase al nivel 3
    }

    destroy() {
        // Frenás el bucle de juego para liberar la RAM
    }
}

// LA CLASE ENEMIGO QUE TIENE LAS REGLAS DE COMPORTAMIENTO
class PlatformEnemy {
    constructor(name, hp, startX, startY) {
        this.name = name;
        this.hp = hp; // Toma el 1 o 2 del JSON
        this.x = startX;
        this.y = startY;
        this.speed = 2;
    }

    // ACÁ SÍ VAN LAS REGLAS: Cómo se mueve y cómo pierde vida
    updateMovement() {
        this.x += this.speed; // Camina solo de izquierda a derecha
    }

    takeDamage() {
        this.hp--; // Pierde una vida cuando lo pisan
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        // Animación de aplastado y desaparición del mapa
    }
}
export class Player {
    constructor(x, y, speed, vidas) {
        this.x = x;
        this.y = y;

        this.speed = speed;
        this.vidas = vidas;
        this.sprite = null;

        // Estado actual
        this.isDead = false;
    }

    // Método que gestiona su propia parte visual
    setSprite(grafico) {
        this.sprite = grafico;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    // Método para actualizar la posición visual basándose en la lógica
    actualizarPosicionVisual() {
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }
}
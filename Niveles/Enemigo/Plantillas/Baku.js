export class Baku extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'BAKU';
        this.velocidad = 150;
    }
}
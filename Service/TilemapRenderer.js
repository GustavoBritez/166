
export class TilemapRenderer {
    constructor(contenedor, matriz, tileSize) {
        this.contenedor = contenedor;
        this.matriz = matriz;
        this.tileSize = tileSize;
        this.poolBloques = [];
        this.filasPantalla = 0;
        this.colsPantalla = 0;
    }

    // --------------------------------------------------------
    // 1. EL CONSTRUCTOR DEL POOL (O(N) - Solo al inicio)
    // --------------------------------------------------------
    inicializarPool(ancho, alto) {
        this.colsPantalla = Math.ceil(ancho / this.tileSize) + 2;
        this.filasPantalla = Math.ceil(alto / this.tileSize) + 2;
        const totalBloques = this.colsPantalla * this.filasPantalla;

        // TRUCO POKI: PixiJS tiene una textura de 1x1 píxel en memoria.
        // No necesitas cargar imágenes PNG externas (ahorras muchísimos KB).
        const texturaBase = PIXI.Texture.WHITE;

        for (let i = 0; i < totalBloques; i++) {
            // Usamos Sprites, que la GPU procesa miles de veces más rápido que Graphics
            const sprite = new PIXI.Sprite(texturaBase);

            // Escalamos el píxel de 1x1 al tamaño de tu bloque (ej: 48x48)
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;

            // Tintamos el sprite blanco al color que queramos (gris pared)
            sprite.tint = 0x444444;

            // Optimización: Desactivamos eventos del ratón para este bloque
            sprite.eventMode = 'none';
            sprite.visible = false;
            this.poolBloques.push(sprite);
            this.contenedor.addChild(sprite);
        }
    }

    // --------------------------------------------------------
    // 2. EL MOTOR GRÁFICO (O(M) - Donde M es la pantalla visible)
    // --------------------------------------------------------
    actualizarVista(camaraX, camaraY) {
        const startCol = Math.floor((camaraX - window.innerWidth / 2) / this.tileSize);
        const startRow = Math.floor((camaraY - window.innerHeight / 2) / this.tileSize);

        let index = 0;

        // Aquí es donde recorremos la porción VISIBLE de la matriz
        for (let row = 0; row < this.filasPantalla; row++) {
            for (let col = 0; col < this.colsPantalla; col++) {

                const sprite = this.poolBloques[index++];
                const mRow = startRow + row;
                const mCol = startCol + col;

                // Si estamos dentro del mapa válido
                if (mRow >= 0 && mRow < this.matriz.length && mCol >= 0 && mCol < this.matriz[0].length) {

                    // 1. Leemos el número de la matriz (ej. 4 para Lava)
                    const tipoNumero = this.matriz[mRow][mCol];

                    // 2. Buscamos sus reglas en el catálogo de forma ultra rápida
                    const visual = TILE_VISUALS[tipoNumero] || TILE_VISUALS[0]; // Fallback por si hay un error

                    // 3. Aplicamos el visual sin usar condicionales complejos
                    if (visual.dibuja) {
                        sprite.tint = visual.color; // Pintamos del color correspondiente
                        sprite.x = mCol * this.tileSize;
                        sprite.y = mRow * this.tileSize;
                        if (!sprite.visible) sprite.visible = true;
                    } else {
                        // Es suelo invisible (1), escondemos el bloque para no gastar GPU
                        if (sprite.visible) sprite.visible = false;
                    }
                } else {
                    if (sprite.visible) sprite.visible = false;
                }
            }
        }
    }

    // --------------------------------------------------------
    // 3. MÉTODOS DE SEGURIDAD Y SOPORTE
    // --------------------------------------------------------

    obtenerDatosTileProtegido(gridX, gridY) {
        if (gridY < 0 || gridY >= this.matriz.length ||
            gridX < 0 || gridX >= this.matriz[0].length) {
            return null;
        }
        const idTile = this.matriz[gridY][gridX];
        return TILE_DICT[idTile];
    }

    redimensionarPantalla(nuevoAncho, nuevoAlto) {
        // Limpiar el pool viejo para evitar Memory Leaks
        for (const sprite of this.poolBloques) {
            sprite.destroy();
        }
        this.poolBloques = [];
        this.contenedor.removeChildren();

        // Reconstruir con el nuevo tamaño
        this.inicializarPool(nuevoAncho, nuevoAlto);
    }

    destroy() {
        for (const sprite of this.poolBloques) {
            sprite.destroy();
        }
        this.poolBloques = [];
        this.matriz = null;
    }
}


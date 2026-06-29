import { EnemigoBase } from './EnemigoBase.js'; // Asegúrate de tener la ruta correcta
import { Baku } from './Plantillas/Baku.js';
export class EnemyManager {
    constructor(capaEntidades, tileSize, configEnemigos) {
        this.capaEntidades = capaEntidades;
        this.tileSize = tileSize;
        this.configEnemigos = configEnemigos;

        this.enemies = [];
        this.pool = [];
    }

    update(dt, player, engineRef) {
        // Recorremos al revés para limpiar de forma segura
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemigo = this.enemies[i];

            if (enemigo.isDead) {
                // Sacamos del array principal y mandamos al pool para reutilizar
                this.enemies.splice(i, 1);
                this.pool.push(enemigo);

                // Ocultamos el sprite (¡NO lo destruimos!)
                if (enemigo.sprite) enemigo.sprite.visible = false;
                continue;
            }

            enemigo.update(dt, player, engineRef);
        }
    }

    fabricaDeEnemigos(data) {
        let enemigo;

        // ¿Tenemos alguno en el pool esperando?
        if (this.pool.length > 0) {
            enemigo = this.pool.pop();
            // Reiniciamos sus datos básicos
            enemigo.x = data.gridX * this.tileSize + (this.tileSize / 2);
            enemigo.y = data.gridY * this.tileSize + (this.tileSize / 2);
            enemigo.isDead = false;
            if (enemigo.sprite) enemigo.sprite.visible = true;
        } else {
            // Si el pool está vacío, recién ahí creamos uno nuevo
            enemigo = new EnemigoBase(data, this.tileSize);
            // ... (creación inicial del sprite) ...
        }

        this.enemies.push(enemigo);
        return enemigo;
    }

    inicializar() {
        // Validación de seguridad para evitar errores si la config está vacía
        if (!this.configEnemigos || !Array.isArray(this.configEnemigos)) {
            console.warn("EnemyManager: No se encontraron configuraciones de enemigos para inicializar.");
            return;
        }

        for (const data of this.configEnemigos) {
            const nuevoEnemigo = this.fabricaDeEnemigos(data);
            this.enemies.push(nuevoEnemigo);
        }

        console.log(`EnemyManager: Inicializados ${this.enemies.length} enemigos.`);
    }

    destroy() {
        for (const enemigo of this.enemies) {
            if (enemigo.sprite) enemigo.sprite.destroy();
        }
        this.enemies = [];
        this.pool = [];
    }
}
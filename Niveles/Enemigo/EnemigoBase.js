export class EnemigoBase {
    constructor(data, tileSize) {
        this.x = data.gridX * tileSize + (tileSize / 2);
        this.y = data.gridY * tileSize + (tileSize / 2);
        this.tipo = data.tipo;
        this.velocidad = data.velocidad || 100;
        this.sprite = null;

        this.vidaMaxima = data.vida || 100;
        this.vidaActual = this.vidaMaxima;
        this.defensaBase = data.defensa || 10;

        this.resistencias = data.resistencias || {};

        this.isDead = false;

        this.vx = 0;
        this.vy = 0;

        this.recalcularTimer = Math.random() * 0.2;
    }

    recibirGolpe(cantidadDaño, tipoElemento = 'FISICO') {
        if (this.isDead) return;

        const porcentajeResistencia = this.resistencias[tipoElemento] || 0;

        const bonusDefensa = this.defensaBase * porcentajeResistencia;
        const defensaTotal = this.defensaBase + bonusDefensa;

        const dañoFinal = Math.max(1, cantidadDaño - defensaTotal);

        this.vidaActual -= dañoFinal;

        console.log(`Recibió ${dañoFinal} daño de ${tipoElemento}. Vida restante: ${this.vidaActual}`);

        if (this.vidaActual <= 0) {
            this.morir();
        }
    }

    update(dt, player, engine) {
        if (this.isDead) return;


        this.recalcularTimer -= dt;

        if (this.recalcularTimer <= 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distSq = dx * dx + dy * dy;

            if (distSq > 0) {
                const dist = Math.sqrt(distSq);
                this.vx = (dx / dist) * this.velocidad;
                this.vy = (dy / dist) * this.velocidad;
            }

            this.recalcularTimer = 0.2;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    morir() {
        this.isDead = true;
        if (this.sprite) this.sprite.visible = false;
    }
}

class EnemigoBaku extends EnemigoBase {
    update(dt, player, engine) {
        this.velocidad = 150;
        super.update(dt, player, engine);
    }
}

// --- DECORADOR BASE ---
class EnemigoDecorator {
    constructor(enemigo) {
        // Devolvemos un Proxy que redirige cualquier acceso a 'this.enemigo'
        return new Proxy(this, {
            get(target, prop) {
                // Si la propiedad existe en el decorador, úsala.
                // Si no, búscala en el enemigo interno.
                if (prop in target) return target[prop];
                return target.enemigo[prop];
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                } else {
                    target.enemigo[prop] = value;
                }
                return true;
            }
        });
    }

    recibirGolpe(engine) {
        this.enemigo.recibirGolpe(engine);
    }

    update(dt, player, engine) {
        this.enemigo.update(dt, player, engine);
    }
}

// --- CONCRETO: Decorador de Fuego ---
class FireDecorator extends EnemigoDecorator {
    update(dt, player, engine) {
        super.update(dt, player, engine); // Ejecuta el movimiento base

        // Lógica extra: Daño por proximidad
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        if (Math.hypot(dx, dy) < 40) {
            console.log("¡Jugador quemándose!");

        }
    }
}

// --- CONCRETO: Decorador de Velocidad ---
class SpeedDecorator extends EnemigoDecorator {
    update(dt, player, engine) {
        this.enemigo.velocidad *= 1.5;
        super.update(dt, player, engine);
    }
}

class SplitterDecorator extends EnemigoDecorator {
    constructor(enemigo, vidas, esHijo = false) {
        super(enemigo);
        this.vidas = vidas;
        this.esHijo = esHijo;
        this.maxGolpes = vidas;
    }

    update(dt, player, engine) {

        super.update(dt, player, engine);
    }

    recibirGolpe(engine) {
        this.vidas -= 1;
        if (this.vidas <= 0) {
            this.morir(engine);
        }
    }

    morir(engine) {
        const index = engine.enemies.indexOf(this);
        if (index !== -1) engine.enemies.splice(index, 1);
        if (this.sprite) this.sprite.destroy();


        const col = Math.floor(this.x / engine.tileSize);
        const fila = Math.floor(this.y / engine.tileSize);

        for (let i = 0; i < 4; i++) {
            let hijo = new EnemigoBase({ gridX: col, gridY: fila, tipo: 'hijo' }, engine.tileSize);

            hijo.sprite = engine.crearCirculo(0xffffff, engine.tileSize * 0.15);

            hijo.x += (Math.random() - 0.5) * engine.tileSize * 0.5;
            hijo.y += (Math.random() - 0.5) * engine.tileSize * 0.5;

            hijo.sprite.x = hijo.x;
            hijo.sprite.y = hijo.y;


            hijo.velocidad = this.enemigo.velocidad * 0.5;

            engine.capaEntidades.addChild(hijo.sprite);
            engine.enemies.push(hijo);
        }
    }
}
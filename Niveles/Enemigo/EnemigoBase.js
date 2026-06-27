class EnemigoBase {
    constructor(data, tileSize) {
        this.x = data.gridX * tileSize + tileSize / 2;
        this.y = data.gridY * tileSize + tileSize / 2;
        this.tipo = data.tipo;
        this.velocidad = data.velocidad || 100;
        this.sprite = null; 
    }
    recibirGolpe(engine) {
        const index = engine.enemies.indexOf(this);
        if (index !== -1) engine.enemies.splice(index, 1);
        if (this.sprite) this.sprite.destroy();
    }
    update(dt, player, engine) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.velocidad * dt;
            this.y += (dy / dist) * this.velocidad * dt;
        }
        
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
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
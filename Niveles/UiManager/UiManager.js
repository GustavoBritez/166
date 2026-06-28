export class UIManager {
    // + constructor(capaUI: PIXI.Container)
    constructor(capaUI) {
        this.capaUI = capaUI;

        // Elementos visuales
        this.textoVidas = null;
        this.barraTurbo = null;

        // Variables de caché (Dirty Flags) iniciadas en valores imposibles
        // para forzar el primer renderizado
        this.vidasCacheadas = -1;
        this.turboCacheados = -1;

        // Construimos la interfaz al instanciar
        this.inicializarElementos();
    }

    // - inicializarElementos(): void
    inicializarElementos() {
        // 1. Crear el texto de las Vidas
        this.textoVidas = new PIXI.Text('Vidas: 3', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'left',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowDistance: 2
        });
        this.textoVidas.x = 20;
        this.textoVidas.y = 20;
        this.capaUI.addChild(this.textoVidas);

        // 2. Crear la barra de Turbo (vacía por ahora)
        this.barraTurbo = new PIXI.Graphics();
        this.barraTurbo.x = 20;
        this.barraTurbo.y = 60;
        this.capaUI.addChild(this.barraTurbo);
    }

    // + actualizar(player: Object): void
    actualizar(player) {
        if (!player) return;

        // COMPROBACIÓN DE DIRTY FLAGS (Optimización extrema)
        // Solo redibujamos si el valor del modelo es distinto al de nuestra caché

        if (player.vidas !== this.vidasCacheadas) {
            this.actualizarVidas(player.vidas);
            this.vidasCacheadas = player.vidas; // Actualizamos la caché
        }

        // Asumiendo que player.turbo es un valor de 0 a 100
        if (player.turbo !== this.turboCacheados) {
            this.actualizarTurbo(player.turbo);
            this.turboCacheados = player.turbo; // Actualizamos la caché
        }
    }

    // - actualizarVidas(vidas: Number): void
    actualizarVidas(vidas) {
        // Modificar el string de un PIXI.Text es costoso, por eso
        // damos gracias a que los Dirty Flags evitan hacerlo en cada frame.
        this.textoVidas.text = `Vidas: ${vidas}`;

        // Efecto visual rápido cuando cambia la vida (Feedback al jugador)
        if (vidas <= 1) {
            this.textoVidas.style.fill = 0xFF0000; // Rojo peligro
        } else {
            this.textoVidas.style.fill = 0xFFFFFF; // Blanco normal
        }
    }

    // - actualizarTurbo(turboRestante: Number): void
    actualizarTurbo(turboRestante) {
        // Limpiamos el gráfico anterior
        this.barraTurbo.clear();

        // Dibujamos el fondo de la barra (Gris oscuro)
        this.barraTurbo.beginFill(0x333333);
        this.barraTurbo.drawRect(0, 0, 150, 15);
        this.barraTurbo.endFill();

        // Dibujamos el relleno (Cian)
        // Calculamos el ancho basado en el porcentaje (0 a 100)
        const porcentaje = Math.max(0, Math.min(100, turboRestante));
        const anchoRelleno = (porcentaje / 100) * 150;

        this.barraTurbo.beginFill(0x00FFFF);
        this.barraTurbo.drawRect(0, 0, anchoRelleno, 15);
        this.barraTurbo.endFill();
    }

    mostrarMensajeFlotante(texto, x, y) {
        const mensaje = new PIXI.Text(texto, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFF00, // Amarillo
            fontWeight: 'bold'
        });

        mensaje.x = x;
        mensaje.y = y;
        this.capaUI.addChild(mensaje);

        // Pequeña animación de desvanecimiento hacia arriba
        const animarMensaje = () => {
            mensaje.y -= 1; // Sube
            mensaje.alpha -= 0.02; // Se vuelve transparente

            if (mensaje.alpha <= 0) {
                // Cuando es invisible, lo destruimos y quitamos el ticker
                PIXI.Ticker.shared.remove(animarMensaje);
                mensaje.destroy();
            }
        };

        PIXI.Ticker.shared.add(animarMensaje);
    }

    destroy() {
        if (this.textoVidas) {
            this.textoVidas.destroy(true);
            this.textoVidas = null;
        }

        if (this.barraTurbo) {
            this.barraTurbo.destroy(true);
            this.barraTurbo = null;
        }

        if (this.capaUI) {
            this.capaUI.removeChildren();
            this.capaUI = null;
        }
    }
}
class GameFactory {
    static build(tipo, datosNivel, alTerminarNivel, alSeleccionarNivel) {

        switch (tipo) {
            case "nivel 1":
                return {
                    template: `
                        <div class="slide active">
                            <div class="daniel-oficial-avatar ${datosNivel.avatar}"></div>
                            <div class="story-card">
                                <h1>${datosNivel.title}</h1>
                                <p>${datosNivel.text}</p>
                                <button class="btn btn-next" id="btnNext">${datosNivel.buttonText}</button>
                            </div>
                        </div>`,
                    init: () => {
                        // Usamos el callback para avanzar cuando tocan "Continuar"
                        document.getElementById('btnNext').addEventListener('click', alTerminarNivel);
                        return null;
                    }
                };

            case "nivel 2":
                return {
                    template: `
                        <div class="slide active">
                            <h2>${datosNivel.title}</h2>
                            <div id="marioCanvas" style="width:100%; height:400px; background:#87CEEB; position:relative; overflow:hidden;"></div>
                        </div>`,
                    init: () => {
                        const canvasEl = document.getElementById('marioCanvas');
                        // Le pasamos 'alTerminarNivel' al motor para que avise cuando gane
                        const engine = new MarioEngine(canvasEl, datosNivel, alTerminarNivel);
                        engine.start();
                        return engine;
                    }
                };

            case "match3":
                return {
                    template: `
                        <div class="slide active">
                            <div class="game-header">
                                <h2>${datosNivel.title}</h2>
                                <p>Movimientos: <span id="movesCount">${datosNivel.moves}</span></p>
                            </div>
                            <div class="grid-container"><div id="grid" class="grid"></div></div>
                        </div>`,
                    init: () => {
                        const gridEl = document.getElementById('grid');
                        const movesEl = document.getElementById('movesCount');
                        const engine = new BoardEngine(gridEl, movesEl, datosNivel, alTerminarNivel);
                        engine.start();
                        return engine;
                    }
                };

            case "lobby":
                let menuHtml = `
                    <div class="lobby-container">
                        <h1>🏰 ${datosNivel.title}</h1>
                        <p class="lobby-avatar-text">✨ ${datosNivel.text} ✨</p>
                        <div class="levels-grid">
                `;

                // Recorremos los niveles para armar los botones del menú
                Object.keys(GAME_LEVELS).forEach(id => {
                    const lvl = GAME_LEVELS[id];
                    if (lvl.type !== "lobby") {
                        menuHtml += `
                            <button class="btn btn-level-select" data-id="${id}">
                                Nivel ${id}: ${lvl.title}
                            </button>
                        `;
                    }
                });

                menuHtml += `</div></div>`;

                return {
                    template: menuHtml,
                    init: () => {
                        const botones = document.querySelectorAll('.btn-level-select');
                        botones.forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const idSeleccionado = e.target.getAttribute('data-id');
                                // 🔥 ACÁ USAMOS EL CUARTO PARÁMETRO:
                                // Le manda el ID del nivel clickeado a 'jumpToLevel(id)' en el orquestador
                                alSeleccionarNivel(Number(idSeleccionado));
                            });
                        });
                        return null;
                    }
                };

            default:
                console.error(`La Fábrica no sabe cómo construir el juego: ${tipo}`);
                return null;
        }
    }
}
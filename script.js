document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll('.slide');
    const container = document.getElementById('storyContainer');
    const btnS = document.getElementById('btnS');
    const btnNo = document.getElementById('btnNo');
    const successScreen = document.getElementById('successScreen');
    
    let currentSlide = 0;

    // EVENTO PARA AVANZAR EN LA HISTORIA (Al tocar la pantalla)
    container.addEventListener('click', (e) => {
        // Si clickea en un botón o en la última pantalla, no avanza por el click general
        if (e.target.tagName === 'BUTTON' || currentSlide === slides.length - 1) {
            return;
        }

        // Transición al siguiente slide
        slides[currentSlide].classList.remove('active');
        currentSlide++;
        slides[currentSlide].classList.add('active');
    });

    // Acción al presionar el botón ganador ("De una")
    btnS.addEventListener('click', () => {
        container.style.display = 'none';
        successScreen.style.display = 'flex';
    });

    // Acción al presionar el botón "No puedo" (Sano, sin esconderse)
    btnNo.addEventListener('click', () => {
        alert("¡Pará un poco, master de los libros! 🤓 Ponete en modo Genki por un día, dale que la vamos a pasar espectacular.");
    });
});
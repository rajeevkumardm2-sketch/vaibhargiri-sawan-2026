document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM ELEMENTS
    const loader = document.getElementById('loader');
    const startButton = document.getElementById('startButton');
    const introSection = document.getElementById('intro');
    const experienceMain = document.getElementById('experience');
    const bgMusic = document.getElementById('bgMusic');
    const particleCanvas = document.getElementById('particleCanvas');
    
    // Select all scenes AND theEnd section as part of the transition sequence
    const scenes = document.querySelectorAll('.scene, #theEnd');

    let currentSceneIndex = 0;
    let isTransitioning = false;

    // 2. LOADER CONTROLLER
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.8s ease';
                setTimeout(() => loader.style.display = 'none', 800);
            }
        }, 800);
    });

    // 3. CANVAS PARTICLES
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * particleCanvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedY = Math.random() * -0.5 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y += this.speedY;
                if (this.y < 0) this.reset();
            }
            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            resizeCanvas();
            particles = Array.from({ length: 40 }, () => new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', resizeCanvas);
        initParticles();
        animateParticles();
    }

    // 4. START JOURNEY
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (bgMusic) {
                bgMusic.volume = 0.6;
                bgMusic.play().catch(e => console.log("Audio play error:", e));
            }

            introSection.style.opacity = '0';
            introSection.style.transition = 'opacity 1s ease';

            setTimeout(() => {
                introSection.style.display = 'none';
                experienceMain.style.display = 'block';
                setTimeout(() => {
                    experienceMain.style.opacity = '1';
                    updateScene(0); // Show Scene 1 directly
                }, 50);
            }, 1000);
        });
    }

    // 5. SCENE SWITCHING LOGIC
    function updateScene(newIndex) {
        if (newIndex < 0 || newIndex >= scenes.length || isTransitioning) return;

        isTransitioning = true;

        scenes.forEach((scene, idx) => {
            const video = scene.querySelector('video');

            if (idx === newIndex) {
                scene.classList.add('active');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(e => console.log("Video error:", e));
                }
            } else {
                scene.classList.remove('active');
                if (video) video.pause();
            }
        });

        currentSceneIndex = newIndex;

        // Prevent rapid scroll glitches
        setTimeout(() => {
            isTransitioning = false;
        }, 1200);
    }

    // 6. SCROLL CONTROLLER
    window.addEventListener('wheel', (e) => {
        if (experienceMain.style.display !== 'block' || isTransitioning) return;

        if (e.deltaY > 0 && currentSceneIndex < scenes.length - 1) {
            updateScene(currentSceneIndex + 1);
        } else if (e.deltaY < 0 && currentSceneIndex > 0) {
            updateScene(currentSceneIndex - 1);
        }
    }, { passive: true });

    // 7. TOUCH SWIPE CONTROLLER
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (experienceMain.style.display !== 'block' || isTransitioning) return;

        const touchEndY = e.changedTouches[0].screenY;
        const diff = touchStartY - touchEndY;

        if (diff > 50 && currentSceneIndex < scenes.length - 1) {
            updateScene(currentSceneIndex + 1); // Swipe Up -> Next
        } else if (diff < -50 && currentSceneIndex > 0) {
            updateScene(currentSceneIndex - 1); // Swipe Down -> Prev
        }
    }, { passive: true });
});
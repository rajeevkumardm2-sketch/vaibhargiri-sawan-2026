document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. DOM ELEMENTS
    // ==========================================
    const loader = document.getElementById('loader');
    const startButton = document.getElementById('startButton');
    const introSection = document.getElementById('intro');
    const experienceMain = document.getElementById('experience');
    const bgMusic = document.getElementById('bgMusic');
    const particleCanvas = document.getElementById('particleCanvas');
    const scenes = document.querySelectorAll('.scene, #theEnd');

    let currentSceneIndex = 0;
    let isTransitioning = false;

    // ==========================================
    // 2. LOADER CONTROLLER
    // ==========================================
    // Window fully load hone par loader ko hide karein
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.8s ease';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 800);
            }
        }, 1000); // Smooth transition delay
    });

    // ==========================================
    // 3. CANVAS PARTICLES ANIMATION
    // ==========================================
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        let particles = [];
        const particleCount = 40;

        function resizeCanvas() {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * particleCanvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedY = Math.random() * -0.5 - 0.2; // Move upwards
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.y += this.speedY;
                if (this.y < 0) {
                    this.y = particleCanvas.height;
                    this.x = Math.random() * particleCanvas.width;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; // Warm gold color
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            resizeCanvas();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', resizeCanvas);
        initParticles();
        animateParticles();
    }

    // ==========================================
    // 4. AUDIO & JOURNEY START
    // ==========================================
    if (startButton) {
        startButton.addEventListener('click', () => {
            // Play background music (requires user interaction in browsers)
            if (bgMusic) {
                bgMusic.volume = 0.6;
                bgMusic.play().catch(error => {
                    console.log("Audio play deferred or blocked by browser:", error);
                });
            }

            // Intro fade out
            introSection.style.opacity = '0';
            introSection.style.transition = 'opacity 1s ease';

            setTimeout(() => {
                introSection.style.display = 'none';
                experienceMain.style.display = 'block';
                experienceMain.style.opacity = '1';
                
                // Show Scene 1 and play video if any
                updateScene(0);
            }, 1000);
        });
    }

    // ==========================================
    // 5. SCENE TRANSITION CONTROLLER
    // ==========================================
    function updateScene(newIndex) {
        if (newIndex < 0 || newIndex >= scenes.length) return;

        isTransitioning = true;

        scenes.forEach((scene, idx) => {
            const video = scene.querySelector('video');

            if (idx === newIndex) {
                scene.classList.add('active');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(e => console.log("Video play error:", e));
                }
            } else {
                scene.classList.remove('active');
                if (video) {
                    video.pause();
                }
            }
        });

        currentSceneIndex = newIndex;

        // Debounce transitions
        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }

    // ==========================================
    // 6. SCROLL & TOUCH NAVIGATION
    // ==========================================
    // Mouse Scroll Wheel handling
    window.addEventListener('wheel', (e) => {
        if (experienceMain.style.display !== 'block' || isTransitioning) return;

        if (e.deltaY > 0) {
            // Scroll Down -> Next Scene
            if (currentSceneIndex < scenes.length - 1) {
                updateScene(currentSceneIndex + 1);
            }
        } else {
            // Scroll Up -> Previous Scene
            if (currentSceneIndex > 0) {
                updateScene(currentSceneIndex - 1);
            }
        }
    }, { passive: true });

    // Mobile Swipe Handling
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (experienceMain.style.display !== 'block' || isTransitioning) return;

        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        const threshold = 50; // Minimum distance to trigger swipe

        if (swipeDistance > threshold) {
            // Swipe Up -> Next
            if (currentSceneIndex < scenes.length - 1) {
                updateScene(currentSceneIndex + 1);
            }
        } else if (swipeDistance < -threshold) {
            // Swipe Down -> Previous
            if (currentSceneIndex > 0) {
                updateScene(currentSceneIndex - 1);
            }
        }
    }
});
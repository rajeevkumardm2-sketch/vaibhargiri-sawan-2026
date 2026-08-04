/**
 * Script.js - Production-Ready Cinematic Experience Engine
 * Theme: Sawan Somwar Rajgir Vaibhargiri Yatra
 * 
 * Direct DOM integration without modifying existing HTML/CSS structure.
 * Written in Pure Vanilla ES6+.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DOM ELEMENTS & STATE MANAGEMENT
  // ==========================================
  const DOM = {
    loader: document.getElementById('loader'),
    intro: document.getElementById('intro'),
    startButton: document.getElementById('startButton'),
    experience: document.getElementById('experience'),
    sceneContainer: document.getElementById('sceneContainer'),
    scenes: document.querySelectorAll('.scene'),
    sceneImages: document.querySelectorAll('.sceneImage'),
    sceneVideos: document.querySelectorAll('.sceneVideo'),
    cinematicFrame: document.getElementById('cinematicFrame'),
    topBar: document.querySelector('.topBar'),
    bottomBar: document.querySelector('.bottomBar'),
    fog1: document.querySelector('.fog1'),
    fog2: document.querySelector('.fog2'),
    fog3: document.querySelector('.fog3'),
    lightRays: document.querySelector('.lightRays'),
    blurLayer: document.getElementById('blurLayer'),
    theEnd: document.getElementById('theEnd'),
    bgMusic: document.getElementById('bgMusic'),
    particleCanvas: document.getElementById('particleCanvas')
  };

  const CONFIG = {
    sceneDuration: 6000,        // Duration per scene in ms (6s)
    fadeDuration: 1200,         // Transition crossfade duration in ms
    kenBurnsScale: 1.18,        // Ken Burns zoom intensity multiplier
    particleCount: 55,          // Floating glowing ambient particles
  };

  const STATE = {
    currentSceneIndex: 0,
    isPlaying: false,
    sceneTimer: null,
    particleAnimationId: null,
    particles: []
  };

  // ==========================================
  // 2. INITIALIZATION & INLINE STYLES ENFORCEMENT
  // ==========================================
  function init() {
    setupBaseStyles();
    initParticles();
    handleLoaderSequence();
    bindEvents();
  }

  function setupBaseStyles() {
    // Ensures required CSS dynamic properties are ready for inline transitions
    if (DOM.experience) {
      DOM.experience.style.display = 'none';
      DOM.experience.style.opacity = '0';
      DOM.experience.style.transition = `opacity ${CONFIG.fadeDuration}ms ease`;
    }

    if (DOM.blurLayer) {
      DOM.blurLayer.style.opacity = '0';
      DOM.blurLayer.style.pointerEvents = 'none';
      DOM.blurLayer.style.transition = `opacity ${CONFIG.fadeDuration}ms ease, backdrop-filter ${CONFIG.fadeDuration}ms ease`;
    }

    if (DOM.theEnd) {
      DOM.theEnd.style.display = 'none';
      DOM.theEnd.style.opacity = '0';
      DOM.theEnd.style.transition = `opacity ${CONFIG.fadeDuration}ms ease`;
    }

    // Configure Scenes and Media
    DOM.scenes.forEach((scene, idx) => {
      scene.style.position = 'absolute';
      scene.style.top = '0';
      scene.style.left = '0';
      scene.style.width = '100%';
      scene.style.height = '100%';
      scene.style.opacity = '0';
      scene.style.visibility = 'hidden';
      scene.style.transition = `opacity ${CONFIG.fadeDuration}ms ease-in-out, visibility ${CONFIG.fadeDuration}ms ease-in-out`;
      scene.style.pointerEvents = 'none';

      // Setup Images for Ken Burns Zoom
      const img = scene.querySelector('.sceneImage');
      if (img) {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.transition = `transform ${CONFIG.sceneDuration + CONFIG.fadeDuration}ms linear`;
        img.style.transform = 'scale(1) translate(0, 0)';
      }

      // Setup Videos
      const video = scene.querySelector('.sceneVideo');
      if (video) {
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // ==========================================
  // 3. LOADER & INTRO TRANSITION
  // ==========================================
  function handleLoaderSequence() {
    // Simulates professional cinematic resource buffering
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (DOM.loader) {
          DOM.loader.style.transition = 'opacity 1000ms ease, visibility 1000ms ease';
          DOM.loader.style.opacity = '0';
          DOM.loader.style.visibility = 'hidden';
        }

        if (DOM.intro) {
          DOM.intro.style.opacity = '1';
          DOM.intro.style.visibility = 'visible';
        }
      }, 800);
    });

    // Fallback if load event fires earlier or hangs
    setTimeout(() => {
      if (DOM.loader && DOM.loader.style.opacity !== '0') {
        DOM.loader.style.opacity = '0';
        DOM.loader.style.visibility = 'hidden';
      }
    }, 3500);
  }

  // ==========================================
  // 4. EXPERIENCE CONTROLLER
  // ==========================================
  function startExperience() {
    STATE.isPlaying = true;

    // Play Background Audio securely post-user gesture
    if (DOM.bgMusic) {
      DOM.bgMusic.volume = 0.6;
      DOM.bgMusic.play().catch(err => console.warn('Audio play auto-blocked:', err));
    }

    // Smoothly fade out Intro
    if (DOM.intro) {
      DOM.intro.style.transition = 'opacity 1000ms ease';
      DOM.intro.style.opacity = '0';
      setTimeout(() => {
        DOM.intro.style.display = 'none';
      }, 1000);
    }

    // Reveal Cinematic Experience Container
    if (DOM.experience) {
      DOM.experience.style.display = 'block';
      // Force repaint
      void DOM.experience.offsetWidth;
      DOM.experience.style.opacity = '1';
    }

    // Activate dynamic Fog / Light overlay animations
    activateEnvironmentalEffects();

    // Start Scene Pipeline
    STATE.currentSceneIndex = 0;
    playScene(STATE.currentSceneIndex);
  }

  function bindEvents() {
    if (DOM.startButton) {
      DOM.startButton.addEventListener('click', startExperience);
      DOM.startButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startExperience();
      }, { passive: false });
    }

    // Handle Window Resize for Canvas
    window.addEventListener('resize', debounce(resizeCanvas, 200));
  }

  // ==========================================
  // 5. CINEMATIC SCENE PLAYBACK ENGINE
  // ==========================================
  function playScene(index) {
    if (!STATE.isPlaying) return;

    const totalScenes = DOM.scenes.length;

    // Check if Experience Completed
    if (index >= totalScenes) {
      triggerEndingSequence();
      return;
    }

    const currentScene = DOM.scenes[index];
    const previousScene = index > 0 ? DOM.scenes[index - 1] : null;

    // Hide Previous Scene cleanly
    if (previousScene) {
      previousScene.style.opacity = '0';
      previousScene.style.visibility = 'hidden';
      previousScene.style.pointerEvents = 'none';

      const prevVideo = previousScene.querySelector('.sceneVideo');
      if (prevVideo) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }

      const prevImg = previousScene.querySelector('.sceneImage');
      if (prevImg) {
        prevImg.style.transform = 'scale(1) translate(0, 0)';
      }
    }

    // Show Current Scene
    currentScene.style.visibility = 'visible';
    currentScene.style.opacity = '1';
    currentScene.style.pointerEvents = 'auto';

    // Apply Ken Burns Effect on Scene Image
    const img = currentScene.querySelector('.sceneImage');
    if (img) {
      // Random subtle direction for dynamic cinematic feel
      const dirX = (index % 2 === 0 ? 1 : -1) * 2;
      const dirY = (index % 3 === 0 ? 1 : -1) * 1.5;
      img.style.transform = `scale(${CONFIG.kenBurnsScale}) translate(${dirX}%, ${dirY}%)`;
    }

    // Autoplay Video if present
    const video = currentScene.querySelector('.sceneVideo');
    let dynamicDuration = CONFIG.sceneDuration;

    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.warn('Video playback interrupted:', err));
      }

      // Adjust dynamic duration to video duration if metadata loaded
      if (video.duration && !isNaN(video.duration) && video.duration > 3) {
        dynamicDuration = video.duration * 1000;
      }
    }

    // Schedule Next Scene
    STATE.sceneTimer = setTimeout(() => {
      STATE.currentSceneIndex++;
      playScene(STATE.currentSceneIndex);
    }, dynamicDuration);
  }

  // ==========================================
  // 6. BLUR LAYER & THE END SEQUENCE
  // ==========================================
  function triggerEndingSequence() {
    STATE.isPlaying = false;

    // Activate Cinematic Blur Layer Over Scene
    if (DOM.blurLayer) {
      DOM.blurLayer.style.opacity = '1';
      DOM.blurLayer.style.backdropFilter = 'blur(12px)';
      DOM.blurLayer.style.webkitBackdropFilter = 'blur(12px)';
    }

    // Hide Last Scene smoothly
    const lastScene = DOM.scenes[DOM.scenes.length - 1];
    if (lastScene) {
      lastScene.style.opacity = '0';
    }

    // Audio Fade Out
    if (DOM.bgMusic) {
      let vol = DOM.bgMusic.volume;
      const fadeAudio = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          DOM.bgMusic.volume = vol;
        } else {
          DOM.bgMusic.pause();
          clearInterval(fadeAudio);
        }
      }, 200);
    }

    // Display "THE END" Screen
    setTimeout(() => {
      if (DOM.theEnd) {
        DOM.theEnd.style.display = 'flex';
        void DOM.theEnd.offsetWidth;
        DOM.theEnd.style.opacity = '1';
      }
    }, CONFIG.fadeDuration / 2);
  }

  // ==========================================
  // 7. AMBIENT ATMOSPHERIC EFFECTS (Fog & Rays)
  // ==========================================
  function activateEnvironmentalEffects() {
    const fogs = [DOM.fog1, DOM.fog2, DOM.fog3];
    fogs.forEach((fog, i) => {
      if (fog) {
        fog.style.transition = `opacity 2000ms ease`;
        fog.style.opacity = `${0.3 + i * 0.15}`;
      }
    });

    if (DOM.lightRays) {
      DOM.lightRays.style.transition = 'opacity 3000ms ease';
      DOM.lightRays.style.opacity = '0.4';
    }
  }

  // ==========================================
  // 8. PARTICLE CANVAS ANIMATION ENGINE
  // ==========================================
  function initParticles() {
    if (!DOM.particleCanvas) return;

    const ctx = DOM.particleCanvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();

    // Generate Golden/Saffron & Mist Ambient Particles
    STATE.particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      STATE.particles.push({
        x: Math.random() * DOM.particleCanvas.width,
        y: Math.random() * DOM.particleCanvas.height,
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: Math.random() * -0.6 - 0.2, // Upward floating motion
        speedX: Math.sin(Math.random() * Math.PI) * 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        hue: Math.random() > 0.5 ? 42 : 38 // Warm Saffron/Golden tones
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, DOM.particleCanvas.width, DOM.particleCanvas.height);

      STATE.particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.2;
        p.alpha += Math.sin(p.y * p.pulseSpeed) * 0.005;

        // Reset if particle floats past top
        if (p.y < -10) {
          p.y = DOM.particleCanvas.height + 10;
          p.x = Math.random() * DOM.particleCanvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${Math.max(0.1, Math.min(0.9, p.alpha))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(243, 156, 18, 0.6)`;
        ctx.fill();
      });

      STATE.particleAnimationId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  function resizeCanvas() {
    if (DOM.particleCanvas) {
      DOM.particleCanvas.width = window.innerWidth;
      DOM.particleCanvas.height = window.innerHeight;
    }
  }

  // Utility Debounce Helper for Resize
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Fire Pipeline Initialization
  init();

});

/* ═══════════════════════════════════════════════════════════════
   FIDA DANCE ACADEMY — Interactive Engine
   Particle system, cursor glow, counter animations,
   scroll reveals, parallax, and smooth navigation
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── DOM References ────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const cursorGlow = document.getElementById('cursorGlow');
  const heroBg = document.querySelector('.hero-bg');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const particlesCanvas = document.getElementById('particles-canvas');

  // ── Navigation: Scroll Effect ─────────────────────────────
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Fade out scroll indicator
    if (scrollIndicator) {
      const opacity = Math.max(0, 1 - scrollY / 400);
      scrollIndicator.style.opacity = opacity;
      if (opacity <= 0) {
        scrollIndicator.style.pointerEvents = 'none';
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile Menu Toggle ────────────────────────────────────
  const menuIconOpen = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="8" x2="20" y2="8"></line><line x1="4" y1="16" x2="20" y2="16"></line></svg>`;
  const menuIconClose = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.innerHTML = isOpen ? menuIconClose : menuIconOpen;
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = menuIconOpen;
        document.body.style.overflow = '';
      });
    });
  }

  // ── Active Nav Link Tracking ──────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = navLinks ? navLinks.querySelectorAll('a') : [];

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinkElements.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ── Scroll Reveal Animation ───────────────────────────────
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealElements = document.querySelectorAll(revealSelectors);

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Device Detection ───────────────────────────────────────
  const isMobile = window.innerWidth <= 768 || !window.matchMedia('(pointer: fine)').matches;



  // ── Counter Animation ─────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2500;
    const suffix = '+';
    let startTime = null;

    // Set initial value
    el.textContent = '0' + suffix;

    function update(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for buttery smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final value is exact
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ── Cursor Glow Effect (Desktop only) ─────────────────────
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animateGlow() {
      // Smooth lerp
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  // ── Floating Particle System ──────────────────────────────
  if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = isMobile ? 15 : 40;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeCanvas() {
      particlesCanvas.width = document.documentElement.clientWidth;
      particlesCanvas.height = document.documentElement.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;
        this.size = Math.random() * 2 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.08 - 0.02;
        this.opacity = Math.random() * 0.35 + 0.05;
        this.maxOpacity = this.opacity;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.002 + 0.0005;
        this.twinkleSpeed = Math.random() * 0.003 + 0.002;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        // Gold color variation
        const goldR = 200 + Math.floor(Math.random() * 55);
        const goldG = 155 + Math.floor(Math.random() * 45);
        const goldB = 20 + Math.floor(Math.random() * 40);
        this.color = `${goldR}, ${goldG}, ${goldB}`;
      }

      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Gentle breathing using slow sine wave
        this.opacity = this.maxOpacity * (0.6 + 0.4 * Math.sin(time * this.twinkleSpeed + this.twinkleOffset));
        this.opacity = Math.max(0.02, Math.min(0.4, this.opacity));

        // Wrap around edges
        if (this.x < -10) this.x = particlesCanvas.width + 10;
        if (this.x > particlesCanvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = particlesCanvas.height + 10;
        if (this.y > particlesCanvas.height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();

        // Glow halo on larger particles
        if (this.size > 1.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.08})`;
          ctx.fill();
        }
      }
    }

    function initParticles() {
      particles = [];
      if (reducedMotion) return;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles(time) {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      // Draw connection lines between nearby particles
      if (!isMobile) {
        const connectionDistance = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
              const opacity = (1 - dist / connectionDistance) * 0.08;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach(p => {
        p.update(time || 0);
        p.draw();
      });
      animationId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    if (!reducedMotion) {
      animateParticles();
    }

    // Pause particles when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else if (!reducedMotion) {
        animateParticles();
      }
    });
  }

  // ── Smooth Scroll for Anchor Links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Magnetic Hover Effect on Cards (desktop only) ─────────
  const magneticCards = document.querySelectorAll('.program-card');

  if (!isMobile) {
    magneticCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;

        card.style.transition = 'none';
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = '';
      });
    });
  }

  // ── Gallery Image Tilt ────────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!isMobile) {
    galleryItems.forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        item.style.transition = 'none';
        item.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
      });

      item.addEventListener('mouseleave', () => {
        item.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.transform = '';
      });
    });
  }

  // ── Testimonials Horizontal Scroll with Drag ──────────────
  const testimonialsTrack = document.querySelector('.testimonials-track');

  if (testimonialsTrack) {
    let isDragging = false;
    let startX;
    let scrollLeft;

    testimonialsTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      testimonialsTrack.style.cursor = 'grabbing';
      startX = e.pageX - testimonialsTrack.offsetLeft;
      scrollLeft = testimonialsTrack.scrollLeft;
    });

    testimonialsTrack.addEventListener('mouseleave', () => {
      isDragging = false;
      testimonialsTrack.style.cursor = '';
    });

    testimonialsTrack.addEventListener('mouseup', () => {
      isDragging = false;
      testimonialsTrack.style.cursor = '';
    });

    testimonialsTrack.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - testimonialsTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      testimonialsTrack.scrollLeft = scrollLeft - walk;
    });
  }

  // ── Page Load Animation ───────────────────────────────────
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    // Trigger initial scroll check
    updateNavbar();
    updateActiveNav();
  });

  // Set initial body opacity for smooth entry
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';

})();

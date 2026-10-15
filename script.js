/* ==========================================================================
   ISHANTH G — PORTFOLIO JAVASCRIPT & MOTION ENGINE
   Refined micro-interactions, responsive constellation canvas, and physics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // 1. ORGANIC TYPING ANIMATION
  // ==========================================================================
  const typedTextEl = document.getElementById('typedText');
  const phrases = [
    'Full-Stack Developer',
    'AI/ML Enthusiast',
    'Competitive Programmer',
    'Problem Solver'
  ];

  if (typedTextEl) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function randBetween(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];
      let delay;

      if (isDeleting) {
        typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        delay = randBetween(28, 55); // Snappy deletion
      } else {
        typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        // Natural human typing rhythm
        delay = randBetween(70, 120);
        if (currentPhrase[charIndex - 1] === ' ' || currentPhrase[charIndex - 1] === '/') {
          delay += 60;
        }
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = 2200; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400; // Pause before typing next
      }

      setTimeout(typeEffect, delay);
    }

    typeEffect();
  }

  // ==========================================================================
  // 2. REFINED AMBIENT CONSTELLATION CANVAS
  // ==========================================================================
  const canvas = document.getElementById('particleCanvas');
  const heroSection = document.getElementById('hero');

  if (canvas && heroSection && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let isVisible = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let mouse = {
      x: null,
      y: null,
      radius: 120
    };

    function resizeCanvas() {
      const width = heroSection.clientWidth;
      const height = heroSection.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
      }

      reset() {
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.baseRadius = Math.random() * 1.2 + 0.6;
        this.radius = this.baseRadius;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < 0) this.x = this.w;
        else if (this.x > this.w) this.x = 0;
        if (this.y < 0) this.y = this.h;
        else if (this.y > this.h) this.y = 0;

        // Subtle pulsing opacity
        this.pulse += this.pulseSpeed;
        this.currentAlpha = this.alpha + Math.sin(this.pulse) * 0.15;

        // Gentle interactive mouse deflection
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 1.5;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force;
            this.y -= Math.sin(angle) * force;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.1, this.currentAlpha)})`;
        ctx.fill();
      }
    }

    function initParticles() {
      const w = heroSection.clientWidth;
      const h = heroSection.clientHeight;
      // Balanced particle count based on display size
      const count = Math.min(65, Math.floor((w * h) / 18000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(w, h));
      }
    }

    initParticles();

    function renderConnections() {
      const maxDist = 110;
      const count = particles.length;

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!isVisible) return;

      const w = heroSection.clientWidth;
      const h = heroSection.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      renderConnections();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause canvas when out of viewport to preserve GPU & battery
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationId) {
          animate();
        } else if (!isVisible && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0.05 });

    heroObserver.observe(heroSection);
  }

  // ==========================================================================
  // 3. CARD SPOTLIGHT GLOW EFFECT (Desktop)
  // ==========================================================================
  if (window.innerWidth > 960 && !prefersReducedMotion) {
    const spotlightCards = document.querySelectorAll(
      '.project-card, .stat-card, .cp-stat, .achievement-card, .skill-category, .timeline-content'
    );

    spotlightCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // ==========================================================================
  // 4. HERO CONTENT SUBTLE PARALLAX
  // ==========================================================================
  const heroContent = document.querySelector('.hero-content');
  if (heroSection && heroContent && window.innerWidth > 960 && !prefersReducedMotion) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let parallaxRAF = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      targetX = -normX * 8; // Restrained 8px max tilt
      targetY = -normY * 8;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function updateParallax() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      heroContent.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      parallaxRAF = requestAnimationFrame(updateParallax);
    }

    parallaxRAF = requestAnimationFrame(updateParallax);
  }

  // ==========================================================================
  // 5. MAGNETIC BUTTONS & INTERACTIVE PILLS
  // ==========================================================================
  if (window.innerWidth > 960 && !prefersReducedMotion) {
    const magneticElements = document.querySelectorAll('.btn-primary, .hero-socials a');

    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = (e.clientX - centerX) * 0.2;
        const distY = (e.clientY - centerY) * 0.2;

        el.style.transform = `translate(${distX.toFixed(1)}px, ${distY.toFixed(1)}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px)';
        el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
          el.style.transition = '';
        }, 350);
      });
    });
  }

  // ==========================================================================
  // 6. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.animate-on-scroll');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Trigger only once for performance
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ==========================================================================
  // 7. COUNTER ANIMATION WITH CUBIC EASING
  // ==========================================================================
  function animateCounters(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const suffix = counter.getAttribute('data-suffix') || '';
          const isDecimal = target % 1 !== 0;
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Natural cubic-out easing
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (isDecimal) {
              counter.textContent = current.toFixed(2) + suffix;
            } else {
              counter.textContent = Math.floor(current) + suffix;
            }

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
            }
          }

          requestAnimationFrame(updateCounter);
        });
        observer.unobserve(entry.target);
      }
    });
  }

  const counterObserver = new IntersectionObserver(animateCounters, {
    threshold: 0.25
  });

  document.querySelectorAll('.about-stats, .cp-stats').forEach(el => {
    counterObserver.observe(el);
  });

  // ==========================================================================
  // 8. NAVIGATION, ACTIVE LINK TRACKING & MOBILE MENU
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  // Navbar scrolled state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navAnchors.forEach(anchor => {
      anchor.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Active section tracking on scroll
  function updateActiveNav() {
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Smooth anchor scrolling with fixed navbar offset
  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navOffset = 64;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navOffset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ==========================================================================
  // 9. SCROLL TO TOP BUTTON
  // ==========================================================================
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 10. CONTACT FORM FEEDBACK
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Received!';
        btn.style.background = '#10b981';
        btn.style.color = '#ffffff';

        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3200);
      }, 700);
    });
  }

});

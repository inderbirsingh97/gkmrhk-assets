/* GKMRHK - Main JavaScript */
(function () {
  'use strict';

  // ===== SCROLL TO TOP =====
  const scrollBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (scrollBtn) {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }
  });
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== ACTIVE NAV =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) {
      link.classList.add('active');
      const parent = link.closest('.dropdown');
      if (parent) {
        const toggle = parent.querySelector('.nav-link');
        if (toggle) toggle.classList.add('active');
      }
    }
  });

  // ===== NAVBAR SCROLL SHRINK =====
  const navbar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 60
        ? '0 4px 30px rgba(0,0,0,0.4)'
        : '0 2px 20px rgba(0,0,0,0.3)';
    }
  });

  // ===== INTERSECTION OBSERVER (fade in) =====
  const observables = document.querySelectorAll('.info-card, .routine-card, .resource-card, .social-tile');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(20px)';
          entry.target.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 50);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observables.forEach(el => io.observe(el));
  }

  // ===== HERO PARALLAX (subtle) =====
  const heroImg = document.querySelector('.hero-img-wrap img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroImg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }, { passive: true });
  }

})();

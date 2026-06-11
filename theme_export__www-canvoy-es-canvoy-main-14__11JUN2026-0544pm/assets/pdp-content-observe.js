/**
 * pdp-content-observe.js — Fase 5
 * IntersectionObserver para animar entrada de cards
 * en las secciones de contenido PDP.
 * Carga diferida: defer en el <script> del layout.
 */
(function () {
  if (!('IntersectionObserver' in window)) {
    // Fallback: mostrar todo sin animación
    document.querySelectorAll(
      '.pdp-benefit-card, .pdp-hiw__step, .pdp-review-card'
    ).forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll(
    '.pdp-benefit-card, .pdp-hiw__step, .pdp-review-card'
  ).forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.07) + 's';
    obs.observe(el);
  });
})();

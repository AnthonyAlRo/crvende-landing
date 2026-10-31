'use strict';

// Una sola muestra y los recursos existentes; los estilos no se guardan ni se envían.
const preview = document.querySelector('#site-preview');
const styleButtons = [...document.querySelectorAll('[data-preview-theme]')];
const styleStatus = document.querySelector('#preview-style-status');
const styleName = document.querySelector('#preview-style-name');
const styleDescriptions = {
  clasico: 'Contemporáneo: portada fotográfica y navegación clara.',
  natural: 'Natural: composición dividida y formas orgánicas.',
  calido: 'Editorial: portada centrada y tonos cálidos.'
};
styleButtons.forEach(button => button.addEventListener('click', () => {
  preview.dataset.theme = button.dataset.previewTheme;
  styleButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  styleName.textContent = button.textContent.trim();
  styleStatus.textContent = styleDescriptions[button.dataset.previewTheme];
  const fullPreviewLink = document.querySelector('[data-full-preview]');
  if (fullPreviewLink) fullPreviewLink.href = `diseno/perfil-publico.html?estilo=${button.dataset.previewTheme}`;
}));

// Animar una sola vez y únicamente fuera de la vista inicial. Sin trabajo por cada scroll.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.business-benefits article, .preview-copy, .profile-stage, .merchant-features, .journey-intro, .visitor-steps>li, .launch-panel, .faq-layout, .signup-layout');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  targets.forEach(target => {
    if (target.getBoundingClientRect().top < window.innerHeight) return;
    target.classList.add('reveal-pending');
    revealObserver.observe(target);
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    targets.forEach(target => target.classList.remove('reveal-pending'));
    revealObserver.disconnect();
  });
}

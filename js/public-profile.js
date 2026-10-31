'use strict';
if (document.body.classList.contains('public-prototype-page')) {
  const requestedTheme = new URLSearchParams(window.location.search).get('estilo');
  if (['clasico', 'natural', 'calido'].includes(requestedTheme)) document.querySelector('#site-preview').dataset.theme = requestedTheme;
}
// Acciones de la página pública ficticia; nunca abre mapas ni canales inventados.
const publicProfileDialog = document.querySelector('#public-profile-dialog');
const publicActionCopy = {
  directions: ['Cómo llegar a Café de la Esquina', 'En el perfil de un comercio real, aquí encontrarás su ubicación y las indicaciones para llegar. Café de la Esquina es ficticio: esta muestra no tiene una dirección real.'],
  menu: ['El menú del local', 'El comercio podrá compartir su menú con quienes visiten su página. Esta muestra presenta el diseño; no corresponde al menú de un negocio real.'],
  hours: ['Horarios de atención', 'Aquí podrás consultar los horarios que el comercio mantenga actualizados. No publicamos horarios inventados para este local ficticio.'],
  contact: ['Contacto y redes del comercio', 'Desde la página pública podrás acceder a los canales de contacto que comparta el negocio. Esta muestra no está conectada a teléfonos ni redes reales.']
};
document.querySelectorAll('[data-public-action]').forEach(button => button.addEventListener('click', () => {
  const copy = publicActionCopy[button.dataset.publicAction];
  if (!copy) return;
  publicProfileDialog.querySelector('#public-dialog-title').textContent = copy[0];
  publicProfileDialog.querySelector('#public-dialog-description').textContent = copy[1];
  publicProfileDialog.showModal();
}));
publicProfileDialog.querySelectorAll('.public-dialog-close,[data-public-close]').forEach(button => button.addEventListener('click', () => publicProfileDialog.close()));
publicProfileDialog.addEventListener('click', event => { if (event.target === publicProfileDialog) publicProfileDialog.close(); });

function enhancePublicTour(tour) {
  const track = tour.querySelector('.public-tour-track');
  const slides = [...tour.querySelectorAll('.public-tour-slide')];
  const previous = tour.querySelector('[data-tour-previous]');
  const next = tour.querySelector('[data-tour-next]');
  const status = tour.querySelector('.public-tour-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let framePending = false;
  function nearestIndex() {
    return slides.reduce((nearest, slide, index) => Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[nearest].offsetLeft - track.scrollLeft) ? index : nearest, 0);
  }
  function update() {
    const index = nearestIndex();
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    if (index !== current) {
      current = index;
      status.textContent = `${index + 1} / ${slides.length} · ${slides[index].dataset.tourTitle}`;
    }
  }
  function goTo(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: slides[target].offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  previous.addEventListener('click', () => goTo(nearestIndex() - 1));
  next.addEventListener('click', () => goTo(nearestIndex() + 1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: nearestIndex() - 1, ArrowRight: nearestIndex() + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key]);
  });
  track.addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => { framePending = false; update(); });
  }, { passive: true });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      track.scrollTo({ left: slides[current].offsetLeft, behavior: 'auto' });
      update();
    }).observe(track);
  }
  update();
}
document.querySelectorAll('[data-public-tour]').forEach(enhancePublicTour);

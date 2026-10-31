'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  navigation.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#interest').value = link.dataset.interest;
  syncBusinessFields();
}));

const form = document.querySelector('#interest-form');
const status = document.querySelector('#form-status');
const businessFields = document.querySelector('#business-fields');
const submitButton = form.querySelector('[type="submit"]');
const syncLocationFields = initLocationFields(form);
let submitting = false;
function syncBusinessFields() {
  const business = form.elements.interest.value === 'negocio';
  businessFields.hidden = !business;
  for (const input of businessFields.querySelectorAll('input, select')) {
    input.required = business;
    input.disabled = !business;
  }
  syncLocationFields();
}
form.elements.interest.addEventListener('change', syncBusinessFields);
syncBusinessFields();
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting) return;
  const emailInput = form.elements.email;
  emailInput.value = emailInput.value.trim();
  if (form.elements.interest.value === 'negocio') {
    form.elements.business.value = form.elements.business.value.trim();
  }
  if (!form.reportValidity()) return;
  const payload = new FormData(form);
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  form.setAttribute('aria-busy', 'true');
  status.classList.remove('error');
  status.textContent = 'Estamos enviando tu registro.';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      status.classList.add('error');
      status.textContent = response.status === 429
        ? 'El servicio está recibiendo muchas solicitudes. Tus datos siguen en el formulario; intentá nuevamente más tarde.'
        : 'No se pudo completar el registro. Revisá los datos e intentá nuevamente. Si el problema continúa, escribinos a crvende1@gmail.com.';
      return;
    }
    status.textContent = 'Gracias. Recibimos tu interés en CRvende. Te contactaremos con novedades sobre el lanzamiento.';
    form.reset();
    syncBusinessFields();
  } catch {
    status.textContent = 'No pudimos confirmar el envío. Tus datos siguen en el formulario. Revisá tu conexión e intentá de nuevo, o escribinos a crvende1@gmail.com.';
    status.classList.add('error');
  } finally {
    submitting = false;
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar mi interés <span aria-hidden="true">↗</span>';
    form.setAttribute('aria-busy', 'false');
  }
});

const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelectorAll('.privacy-trigger').forEach(button => button.addEventListener('click', () => privacyDialog.showModal()));
privacyDialog.querySelector('.dialog-close').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', event => { if (event.target === privacyDialog) privacyDialog.close(); });

const directionsDialog = document.querySelector('#directions-dialog');
document.querySelectorAll('[data-directions]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#directions-business').textContent = button.dataset.directions;
  directionsDialog.showModal();
}));
directionsDialog.querySelectorAll('[data-close-directions]').forEach(button => button.addEventListener('click', () => directionsDialog.close()));
directionsDialog.addEventListener('click', event => { if (event.target === directionsDialog) directionsDialog.close(); });
document.querySelector('#year').textContent = new Intl.DateTimeFormat('es-CR', { year: 'numeric', timeZone: 'America/Costa_Rica' }).format(new Date());

const header = document.querySelector('.dataserv-header');
function updateHeaderShell() {
  if (header) header.classList.toggle('is-scrolled', scrollY > 20);
}
window.addEventListener('scroll', updateHeaderShell, { passive: true });
updateHeaderShell();

const intentCards = document.querySelectorAll('.contact-intent-card');
const interestSelect = document.querySelector('#interest');
const form = document.querySelector('#contact-form');
const submitBtn = document.querySelector('#contact-submit');
const statusTitle = document.querySelector('#contact-status-title');

intentCards.forEach(card => {
  card.addEventListener('click', () => {
    intentCards.forEach(c => {
      c.classList.remove('is-selected');
      c.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('is-selected');
    card.setAttribute('aria-pressed', 'true');
    const value = card.dataset.interest;
    if (interestSelect && value) interestSelect.value = value;
    document.querySelector('#contact-brief')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  });
});

function showFieldError(id, message) {
  const input = document.querySelector(`#${id}`);
  const err = document.querySelector(`#error-${id}`);
  const field = input?.closest('.contact-field');
  if (!input || !err || !field) return;
  if (message) {
    field.classList.add('is-invalid');
    err.textContent = message;
    err.hidden = false;
    input.setAttribute('aria-invalid', 'true');
  } else {
    field.classList.remove('is-invalid');
    err.hidden = true;
    input.removeAttribute('aria-invalid');
  }
}

function validateForm() {
  const first = document.querySelector('#first-name');
  const last = document.querySelector('#last-name');
  const email = document.querySelector('#email');
  const message = document.querySelector('#message');

  showFieldError('first-name', first?.value.trim() ? '' : 'First name is required.');
  showFieldError('last-name', last?.value.trim() ? '' : 'Last name is required.');
  const emailVal = email?.value.trim() || '';
  showFieldError('email', !emailVal ? 'Work email is required.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal) ? '' : 'Enter a valid email address.');
  showFieldError('interest', interestSelect?.value ? '' : 'Select an area of interest.');
  showFieldError('message', message?.value.trim() ? '' : 'Please tell us how we can help.');

  return !form.querySelector('.contact-field.is-invalid');
}

/** Wire to API / Supabase / CRM — returns true when the brief was accepted. */
async function submitProjectBrief(payload) {
  await new Promise(r => setTimeout(r, 1400));
  console.info('[contact] brief ready for backend:', payload);
  return true;
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateForm()) {
    const firstInvalid = form.querySelector('.contact-field.is-invalid input, .contact-field.is-invalid select, .contact-field.is-invalid textarea');
    firstInvalid?.focus();
    return;
  }
  const payload = {
    firstName: document.querySelector('#first-name')?.value.trim(),
    lastName: document.querySelector('#last-name')?.value.trim(),
    email: document.querySelector('#email')?.value.trim(),
    company: document.querySelector('#company')?.value.trim(),
    phone: document.querySelector('#phone')?.value.trim(),
    region: document.querySelector('#region')?.value.trim(),
    interest: interestSelect?.value,
    stage: document.querySelector('#stage')?.value,
    timeline: document.querySelector('#timeline')?.value,
    budget: document.querySelector('#budget')?.value,
    message: document.querySelector('#message')?.value.trim(),
    intent: document.querySelector('.contact-intent-card.is-selected')?.dataset.intent ?? null,
  };

  submitBtn.disabled = true;
  const label = submitBtn.innerHTML;
  submitBtn.textContent = 'TRANSMITTING BRIEF...';

  try {
    const accepted = await submitProjectBrief(payload);
    if (!accepted) throw new Error('Submission failed');
    statusTitle.textContent = 'MESSAGE RECEIVED.';
    form.classList.add('is-success');
  } catch {
    statusTitle.textContent = 'UNABLE TO SEND.';
    document.querySelector('#contact-form-status')?.setAttribute('role', 'alert');
    // Keep the filled-in fields visible so the brief can be sent again.
    form.classList.add('is-error');
    const statusCopy = document.querySelector('.contact-status-copy');
    if (statusCopy) statusCopy.textContent = 'Something went wrong. Please try again or email contact@dataservinc.com directly.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = label;
  }
});

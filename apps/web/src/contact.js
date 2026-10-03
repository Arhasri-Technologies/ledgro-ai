const header = document.querySelector('.dataserv-header');
function updateHeaderShell() {
  if (header) header.classList.toggle('is-scrolled', scrollY > 20);
}
window.addEventListener('scroll', updateHeaderShell, { passive: true });
updateHeaderShell();

const intentCards = document.querySelectorAll('.contact-intent-card');
const interestSelect = document.querySelector('#interest');
const form = document.querySelector('#contact-form');
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

// Preserve the visitor's chosen homepage route without submitting any data.
const inquiry = new URLSearchParams(location.search);
const requestedRoute = inquiry.get('demo') === 'ledgro' ? 'ledgro' : inquiry.get('intent');
const inquiryRoutes = {
  vel: { interest: 'VEL.ai', stage: 'Have requirements', intent: 'products' },
  idea: { interest: 'Web Application', stage: 'Exploring', intent: 'build-new' },
  ledgro: { interest: 'Ledgro', stage: 'Existing product', intent: 'products' },
  investor: { interest: 'Investor / Partnership', stage: 'Exploring', intent: 'products' },
};
const chosenRoute = inquiryRoutes[requestedRoute];
if (chosenRoute) {
  if (interestSelect) interestSelect.value = chosenRoute.interest;
  const stage = document.querySelector('#stage');
  if (stage && !stage.value) stage.value = chosenRoute.stage;
  intentCards.forEach(card => {
    const selected = card.dataset.intent === chosenRoute.intent;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
}

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

// No delivery backend is configured. Prepare a reviewable email instead of
// claiming that a brief has been transmitted or accepted.
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateForm()) {
    form.querySelector('.contact-field.is-invalid input, .contact-field.is-invalid select, .contact-field.is-invalid textarea')?.focus();
    return;
  }
  const fields = [
    ['First name', 'first-name'], ['Last name', 'last-name'], ['Email', 'email'],
    ['Company', 'company'], ['Phone', 'phone'], ['Region', 'region'],
    ['Interest', 'interest'], ['Project stage', 'stage'], ['Timeline', 'timeline'],
    ['Budget', 'budget'], ['Project brief', 'message'],
  ];
  const body = fields.map(([label, id]) => `${label}: ${document.getElementById(id)?.value.trim() || 'Not specified'}`).join('\n\n');
  const emailLink = document.getElementById('contact-email-draft');
  emailLink.href = `mailto:contact@dataservinc.com?subject=${encodeURIComponent(`Project inquiry: ${interestSelect.value}`)}&body=${encodeURIComponent(body)}`;
  document.getElementById('contact-copy-brief').dataset.brief = body;
  statusTitle.textContent = 'YOUR EMAIL DRAFT IS READY.';
  form.classList.add('is-draft');
  emailLink.focus();
});

form?.addEventListener('input', () => {
  form.classList.remove('is-draft');
  const copy = document.getElementById('contact-copy-brief');
  if (copy) { delete copy.dataset.brief; copy.textContent = 'Copy brief'; }
});
document.getElementById('contact-copy-brief')?.addEventListener('click', async event => {
  try {
    await navigator.clipboard.writeText(event.currentTarget.dataset.brief || '');
    document.getElementById('contact-copy-brief').textContent = 'Brief copied';
  } catch {
    document.querySelector('.contact-status-copy').textContent = 'Copy is unavailable in this browser. Your entries remain above; copy them into an email to contact@dataservinc.com.';
  }
});

const root = document.querySelector('[data-home-journal]');
if (!root) {
  /* Other pages omit the homepage journal spotlight. */
} else {
  const slides = [...root.querySelectorAll('[data-journal-slide]')];
  const counter = root.querySelector('[data-journal-counter]');
  const prevBtn = root.querySelector('[data-journal-prev]');
  const nextBtn = root.querySelector('[data-journal-next]');
  const dotsRoot = root.querySelector('[data-journal-dots]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let animating = false;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 9000;

  function slideCode(i) {
    return slides[i]?.dataset.code ?? '';
  }

  function renderDots() {
    if (!dotsRoot) return;
    dotsRoot.replaceChildren();
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show perspective ${i + 1} of ${slides.length}`);
      dot.setAttribute('aria-current', String(i === index));
      dot.addEventListener('click', () => go(i));
      dotsRoot.append(dot);
    });
  }

  function sync() {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.toggleAttribute('inert', !active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (counter) counter.textContent = slideCode(index);
    dotsRoot?.querySelectorAll('button').forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === index));
    });
    root.dataset.activeIndex = String(index);
  }

  function go(nextIndex) {
    if (!slides.length || animating || nextIndex === index) return;
    const wrapped = (nextIndex + slides.length) % slides.length;
    if (reduced.matches) {
      index = wrapped;
      sync();
      return;
    }
    animating = true;
    const outgoing = slides[index];
    const incoming = slides[wrapped];
    outgoing.classList.add('is-exiting');
    outgoing.classList.remove('is-active');
    incoming.classList.add('is-entering', 'is-active');
    if (counter) counter.textContent = slideCode(wrapped);
    window.setTimeout(() => {
      index = wrapped;
      outgoing.classList.remove('is-exiting');
      incoming.classList.remove('is-entering');
      sync();
      animating = false;
    }, 520);
    restartAutoplay();
  }

  function restartAutoplay() {
    window.clearInterval(autoplayTimer);
    if (reduced.matches || slides.length < 2) return;
    autoplayTimer = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
  }

  prevBtn?.addEventListener('click', () => go(index - 1));
  nextBtn?.addEventListener('click', () => go(index + 1));

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
  });

  let touchStartX = 0;
  root.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    (event) => {
      const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
      if (Math.abs(dx) < 48) return;
      go(dx < 0 ? index + 1 : index - 1);
    },
    { passive: true }
  );

  root.addEventListener('mouseenter', () => window.clearInterval(autoplayTimer));
  root.addEventListener('mouseleave', restartAutoplay);
  reduced.addEventListener('change', () => {
    slides.forEach((s) => s.classList.remove('is-exiting', 'is-entering'));
    sync();
    restartAutoplay();
  });

  const visibility = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) restartAutoplay();
      else window.clearInterval(autoplayTimer);
    },
    { threshold: 0.25 }
  );
  visibility.observe(root);

  renderDots();
  sync();
  restartAutoplay();
}

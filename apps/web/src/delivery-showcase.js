const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const deliveryRoot = document.querySelector('[data-delivery-root]');
// Each folder tab belongs to its sticky card; no independent pinned navigation.
if (deliveryRoot) {
  const revealItems = [...deliveryRoot.querySelectorAll('[data-delivery-reveal]')];
  const revealObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    deliveryRoot.classList.add('is-revealed');
    revealItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
    });
    revealObserver.disconnect();
  }, { threshold: 0 });
  revealObserver.observe(deliveryRoot);
}

const enterpriseRoot = document.querySelector('[data-enterprise-root]');
if (enterpriseRoot) {
  const revealItems = [...enterpriseRoot.querySelectorAll('[data-enterprise-reveal]')];
  const revealObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    enterpriseRoot.classList.add('is-revealed');
    revealItems.forEach((item, index) => {
      item.style.animationDelay = `${0.12 + index * 0.1}s`;
    });
    revealObserver.disconnect();
  }, { threshold: 0.15 });
  revealObserver.observe(enterpriseRoot);

  const marquee = enterpriseRoot.querySelector('[data-enterprise-marquee]');
  if (marquee) {
    const viewport = marquee.querySelector('.enterprise-trust__marquee-viewport');
    const pause = () => marquee.classList.add('is-paused');
    const resume = () => marquee.classList.remove('is-paused');
    marquee.addEventListener('mouseenter', pause);
    marquee.addEventListener('mouseleave', resume);
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', () => {
      if (!marquee.contains(document.activeElement)) resume();
    });
    marquee.querySelectorAll('.enterprise-trust__marquee-group:not([aria-hidden]) .enterprise-trust__bubble').forEach(bubble => {
      bubble.setAttribute('tabindex', '0');
      bubble.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          enterpriseRoot.querySelector('.enterprise-trust__actions a')?.click();
        }
      });
    });
    if (viewport && !reduced.matches) {
      viewport.addEventListener('wheel', event => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) event.preventDefault();
      }, { passive: false });
    }
  }

  const parallax = enterpriseRoot.querySelector('.enterprise-trust__bg img');
  if (parallax) {
    let frame = 0;
    function updateParallax() {
      frame = 0;
      const rect = enterpriseRoot.getBoundingClientRect();
      if (reduced.matches) {
        parallax.style.removeProperty('--enterprise-parallax');
        return;
      }
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
      parallax.style.setProperty('--enterprise-parallax', `${(progress - .5) * 90}px`);
    }
    function queueParallax() {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    }
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax, { passive: true });
    reduced.addEventListener('change', queueParallax);
    queueParallax();
  }
}

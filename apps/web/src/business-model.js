const section = document.querySelector('.business-model');
const backdrop = section?.querySelector('.business-head-backdrop');
if (backdrop && !backdrop.querySelector('.business-head-starfield')) {
  const compact = window.innerWidth < 760;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const starfield = document.createElement('div');
  starfield.className = 'business-head-starfield';
  starfield.setAttribute('aria-hidden', 'true');

  const starCount = compact ? 40 : 84;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('span');
    const spark = i % 7 === 0 || i % 11 === 0;
    star.className = spark ? 'business-head-star business-head-star--spark' : 'business-head-star';
    star.style.cssText = `--x:${((i * 37.7 + 5) % 98) + 1}%;--y:${((i * 23.3 + 11) % 96) + 2}%;--size:${(i % 3) + 1}px;--duration:${16 + (i % 19)}s;--delay:-${(i * 1.35).toFixed(2)}s;--twinkle:${3.5 + (i % 6)}s`;
    starfield.append(star);
  }

  if (!reduced.matches) {
    const meteorCount = compact ? 3 : 5;
    for (let i = 0; i < meteorCount; i++) {
      const meteor = document.createElement('span');
      meteor.className = 'business-head-meteor';
      meteor.style.cssText = `--x:${18 + i * 26}%;--y:${6 + i * 14}%;--delay:${i * 4.2}s;--duration:${11 + i * 2}s`;
      starfield.append(meteor);
    }
  }

  backdrop.prepend(starfield);

  if (!reduced.matches) {
    const observer = new IntersectionObserver(([entry]) => {
      backdrop.classList.toggle('business-head-atmosphere-hidden', !entry.isIntersecting);
    }, { threshold: 0.06 });
    observer.observe(section);
    document.addEventListener('visibilitychange', () => {
      backdrop.classList.toggle('business-head-atmosphere-hidden', document.hidden);
    });
  }
}

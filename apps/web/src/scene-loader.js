// Lower-page WebGL scenes are initialized only as they approach the viewport.
const loaders = new Map([
  [document.querySelector('.intro-animated'), () => Promise.all([import('./intro-scene.js'), import('./intro-particles.jsx')])],
  [document.querySelector('.reach'), () => import('./reach-globe.js')],
  [document.querySelector('.connected'), () => import('./connected.js')],
]);
const lazy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    lazy.unobserve(entry.target);
    loaders.get(entry.target)?.().catch(error => console.warn('Scene fallback:', error.message));
  }
}, { rootMargin: '200px' });
for (const element of loaders.keys()) if (element) lazy.observe(element);
const motion = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('scene-out-of-view', !entry.isIntersecting);
});
for (const element of document.querySelectorAll('.dataserv-hero,.intro-animated,.reach,.expertise-animated,.ticker,.hero-marquee,.dataserv-partner,.delivery-showcase,.enterprise-trust')) motion.observe(element);

const partner = document.querySelector('#partner');
if (partner) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    partner.classList.add('partner-entered');
    observer.disconnect();
  }, { threshold: .12 });
  observer.observe(partner);
}

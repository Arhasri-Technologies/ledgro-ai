const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const root = document.documentElement
const motionButton = document.querySelector('.nit-motion')
let paused = reducedMotion.matches
function updateMotion() {
  root.classList.toggle('nit-paused', paused || reducedMotion.matches)
  motionButton.textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'
  motionButton.setAttribute('aria-pressed', String(paused || reducedMotion.matches))
  motionButton.disabled = reducedMotion.matches
}
motionButton.addEventListener('click', () => { paused = !paused; updateMotion() })
reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateMotion() })
updateMotion()

const reveals = document.querySelectorAll('.about-reveal')
if ('IntersectionObserver' in window) {
  root.classList.add('nit-motion-ready')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) { target.classList.add('nit-visible'); observer.unobserve(target) }
    })
  }, {threshold: .08})
  reveals.forEach((element) => observer.observe(element))
  const links = [...document.querySelectorAll('.about-jump a')]
  const sections = new IntersectionObserver((entries) => {
    const active = entries.find((entry) => entry.isIntersecting)
    if (!active) return
    links.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }, {rootMargin: '-18% 0px -60% 0px'})
  links.forEach((link) => { const section = document.querySelector(link.hash); if (section) sections.observe(section) })
}

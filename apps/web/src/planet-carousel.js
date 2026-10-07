const hero = document.querySelector('.planet-carousel')

if (hero) {
  const slides = [
    { planet: 'venus', world: 'VENUS / 01', name: 'Ledgro', kicker: 'Your business. Beautifully connected.', tagline: 'Everything working together.', description: 'Connect your business with modular enterprise applications. Bring operations, teams, and everyday workflows together on Ledgro.', cta: 'Explore Ledgro', href: '/ledgro.html' },
    { planet: 'earth', world: 'EARTH / 02', name: 'DataServ Inc.', kicker: 'One company. A world of possibilities.', tagline: 'Ideas without limits.', description: 'We bring AI and expert engineering together to turn your next big idea into software that moves your business.', cta: 'Let’s build your idea', href: '/contact.html?intent=idea' },
    { planet: 'mars', world: 'MARS / 03', name: 'Vel.ai', kicker: 'The next frontier of software.', tagline: 'From vision to what’s next.', description: 'Meet our vision for agent-led software delivery. Vel.ai is in development to connect planning, engineering, and validation across the software lifecycle.', cta: 'Discover Vel.ai', href: '/vela.html' },
  ]
  const planets = [...hero.querySelectorAll('[data-planet]')]
  const dots = [...hero.querySelectorAll('[data-slide]')]
  const copy = hero.querySelector('.reach-copy')
  const left = hero.querySelector('.planet-nav--left')
  const right = hero.querySelector('.planet-nav--right')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let active = 1
  let animation

  // Decorative motion rests while the tab is hidden; scene-loader handles scroll visibility.
  const syncStarMotion = () => hero.classList.toggle('stars-paused', document.hidden)
  document.addEventListener('visibilitychange', syncStarMotion)
  syncStarMotion()

  function updateSide(button, index, direction) {
    const slide = slides[index]
    button.hidden = !slide
    if (!slide) return
    button.setAttribute('aria-label', `Explore ${slide.name} on ${slide.planet}`)
    button.querySelector('.planet-nav-world').textContent = slide.world
    button.querySelector('strong').textContent = slide.name
    button.querySelector('.planet-nav-action').textContent = direction === 'left' ? '← Explore' : 'Explore →'
  }

  function select(index) {
    if (index < 0 || index >= slides.length || index === active) return
    const focusWasSide = document.activeElement === left || document.activeElement === right
    active = index
    const slide = slides[index]
    hero.dataset.active = slide.planet
    planets.forEach((planet, i) => { planet.dataset.position = String(i - active) })
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)))
    updateSide(left, active - 1, 'left')
    updateSide(right, active + 1, 'right')
    animation?.cancel()
    copy.querySelector('.reach-kicker').textContent = slide.kicker
    copy.querySelector('h1').textContent = slide.name
    copy.querySelector('.planet-tagline').textContent = slide.tagline
    copy.querySelector('.reach-lead').textContent = slide.description
    const link = copy.querySelector('a')
    link.href = slide.href
    link.firstChild.textContent = `${slide.cta} `
    if (!reduced.matches) animation = copy.animate([
      { opacity: 0, transform: 'translateY(16px)', filter: 'blur(5px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' })
    if (focusWasSide) dots[active].focus({ preventScroll: true })
  }

  left.addEventListener('click', () => select(active - 1))
  right.addEventListener('click', () => select(active + 1))
  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)))
  hero.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    select(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : active + (event.key === 'ArrowRight' ? 1 : -1))
  })
  reduced.addEventListener('change', () => { if (reduced.matches) animation?.cancel() })
}

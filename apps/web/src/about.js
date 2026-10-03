document.documentElement.classList.add('about-motion')
const nodes = document.querySelectorAll('.about-reveal')
const reduce = matchMedia('(prefers-reduced-motion: reduce)')
const show = (el) => el.classList.add('is-in')
if (reduce.matches) nodes.forEach(show)
else {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      show(entry.target)
      io.unobserve(entry.target)
    }
  }, { threshold: 0.16 })
  nodes.forEach((node) => io.observe(node))
  reduce.addEventListener('change', () => { if (reduce.matches) nodes.forEach(show) })
}

const stages = [
  ['DISCOVER', 'Start with the right questions.', 'We map the business need, the people using the system, and what success should look like. A shared brief gives the whole team a clear direction.', 'Map the possibilities'],
  ['DESIGN', 'Make the idea tangible.', 'We turn the brief into wireframes, architecture, and a shared plan. Together, we explore how the experience should feel before the build begins.', 'Shape the experience'],
  ['DEVELOP', 'Build. Review. Move forward.', 'Working increments turn the plan into software. Engineers share progress, review the details, and keep the team close to every decision.', 'Connect the pieces'],
  ['VALIDATE', 'Confidence comes from proof.', 'We check behavior, performance, and security against the brief. The people who will use the system help us understand whether it is ready.', 'Put it to the test'],
  ['LAUNCH', 'A beginning, not a handoff.', 'We bring the system into the business and stay involved through support and improvement. Real use informs what we build next.', 'Ready for the real world'],
]
const stageButtons = document.querySelectorAll('[data-stage]')
const preview = document.querySelector('#delivery-preview')
stageButtons.forEach((button) => button.addEventListener('click', () => {
  const index = Number(button.dataset.stage)
  const [label, title, copy] = stages[index]
  stageButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
  preview.dataset.phase = String(index)
  document.querySelector('#delivery-stage-label').textContent = `0${index + 1} / ${label}`
  document.querySelector('#delivery-stage-title').textContent = title
  document.querySelector('#delivery-stage-copy').textContent = copy
  document.querySelectorAll('[data-scene]').forEach((scene) => { scene.hidden = Number(scene.dataset.scene) !== index })
}))

const motionButton = document.querySelector('.about-motion-toggle')
let motionPaused = reduce.matches
function syncMotion() {
  if (!motionButton) return
  document.documentElement.classList.toggle('about-paused', motionPaused || reduce.matches)
  motionButton.setAttribute('aria-pressed', String(motionPaused || reduce.matches))
  motionButton.textContent = reduce.matches ? 'Reduced motion' : motionPaused ? 'Resume motion' : 'Pause motion'
  motionButton.disabled = reduce.matches
}
motionButton?.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion() })
reduce.addEventListener('change', () => { motionPaused = reduce.matches; syncMotion() })
syncMotion()

const jumpLinks = [...document.querySelectorAll('.about-jump a')]
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting)
  if (!visible.length) return
  const id = visible[0].target.id
  jumpLinks.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}, { rootMargin: '-20% 0px -55% 0px', threshold: 0 })
jumpLinks.forEach((link) => { const section = document.querySelector(link.hash); if (section) sectionObserver.observe(section) })

// Keep navigation readable after leaving the transparent opening position.
const aboutHeader = document.querySelector('.about-page .dataserv-header');
const syncAboutHeader = () => aboutHeader?.classList.toggle('is-scrolled', window.scrollY > 20);
window.addEventListener('scroll', syncAboutHeader, { passive: true });
syncAboutHeader();

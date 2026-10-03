const canvas = document.getElementById('it-particles')
const reduce = matchMedia('(prefers-reduced-motion: reduce)')
if (canvas) {
  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let frame = 0
  const particles = Array.from({ length: 90 }, () => spawn(true))

  function spawn(seed) {
    const angle = Math.random() * Math.PI * 2
    const radius = 40 + Math.random() * 220
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: seed ? 80 + Math.random() * 920 : 1000,
      speed: Math.random() * 3.2 + 1.6,
      color: Math.random() > 0.35 ? '186, 230, 255' : '0, 223, 255',
    }
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    width = canvas.clientWidth || canvas.parentElement.clientWidth
    height = canvas.clientHeight || canvas.parentElement.clientHeight
    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    const originX = width * 0.84
    const originY = height * 0.42
    ctx.clearRect(0, 0, width, height)
    for (const p of particles) {
      if (!reduce.matches) {
        p.z -= p.speed
        if (p.z <= 1) Object.assign(p, spawn(false))
      }
      const scale = 280 / p.z
      const px = originX + p.x * scale
      const py = originY + p.y * scale
      const tail = 280 / (p.z + 28)
      const opacity = Math.min(1, (1 - p.z / 1000) * 1.4)
      ctx.beginPath()
      ctx.moveTo(originX + p.x * tail, originY + p.y * tail)
      ctx.lineTo(px, py)
      ctx.strokeStyle = `rgba(${p.color}, ${opacity})`
      ctx.lineWidth = Math.max(1.1, (1 - p.z / 1000) * 2.4)
      ctx.stroke()
    }
  }

  function tick() {
    if (document.hidden) { frame = 0; return }
    draw()
    if (reduce.matches) return
    frame = requestAnimationFrame(tick)
  }

  resize()
  new ResizeObserver(() => { resize(); draw() }).observe(canvas)
  tick()
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !frame && !reduce.matches) frame = requestAnimationFrame(tick)
  })
}

const topics = [
  ['01 / CLOUD', 'Cloud', 'CLOUD', 'Move what should move, and leave what should stay. The roadmap follows how teams operate today, through rollout.'],
  ['02 / INTEGRATION', 'Integration', 'INTEGRATION', 'Connect the systems that already hold the work, so data flows without a second process beside them.'],
  ['03 / ERP', 'ERP', 'ERP', 'Scope the platform to the way finance, operations, and delivery actually run — then plan the rollout those teams can absorb.'],
  ['04 / ARCHITECTURE', 'Architecture', 'ARCHITECTURE', 'A structure from discovery to rollout: what to build, what to connect, and what your teams will own afterward.'],
  ['05 / AI READINESS', 'Security & AI readiness', 'AI', 'Assess data flows, security, and whether the organization is ready for AI — before budget is committed, with criteria you can evaluate against.'],
  ['06 / HANDOFF', 'Operations & governance', 'HANDOFF', 'Handoff plans so internal teams can run and extend what gets shipped, instead of waiting on the next engagement.'],
]
const practiceTabs = [...document.querySelectorAll('[data-it]')]
const panel = document.getElementById('it-practice-panel')
const kicker = document.getElementById('it-kicker')
const topic = document.getElementById('it-topic')
const copy = document.getElementById('it-copy')
const chip = document.getElementById('it-chip')

function selectPractice(index) {
  const [label, title, mark, text] = topics[index]
  practiceTabs.forEach((tab, i) => {
    const on = i === index
    tab.setAttribute('aria-selected', String(on))
    tab.tabIndex = on ? 0 : -1
  })
  panel.dataset.phase = String(index)
  panel.setAttribute('aria-labelledby', practiceTabs[index].id)
  kicker.textContent = label
  topic.textContent = title
  copy.textContent = text
  chip.textContent = mark
  copy.classList.remove('is-in')
  void copy.offsetWidth
  copy.classList.add('is-in')
}

practiceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPractice(index))
  tab.addEventListener('keydown', (event) => {
    const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % practiceTabs.length
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index + practiceTabs.length - 1) % practiceTabs.length
      : null
    if (next == null) return
    event.preventDefault()
    selectPractice(next)
    practiceTabs[next].focus()
  })
})

const jumpLinks = [...document.querySelectorAll('.about-jump a')]
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('about-motion')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const reveals = document.querySelectorAll('.about-reveal')
  const show = (el) => el.classList.add('is-in')
  if (reduce.matches) reveals.forEach(show)
  else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        show(entry.target)
        revealObserver.unobserve(entry.target)
      })
    }, { threshold: 0.12 })
    reveals.forEach((node) => revealObserver.observe(node))
  }
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).at(-1)
    if (!active) return
    jumpLinks.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }, { rootMargin: '-20% 0px -60% 0px' })
  jumpLinks.forEach((link) => {
    const section = document.querySelector(link.hash)
    if (section) sectionObserver.observe(section)
  })
}

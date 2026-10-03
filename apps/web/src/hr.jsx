import React from 'react'
import { createRoot } from 'react-dom/client'
import { PredictiveArcCanvas } from '@designcodeio/threeui/components/PredictiveArcCanvas'
import '@designcodeio/threeui/style.css'

const header = document.querySelector('.site-header')
if (header) addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true })

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const set = document.getElementById('hr-set')
const feeds = [
  ['DATASERV HR', 'People & Culture', 'Greatest asset', 'Innovation', 'Inclusion', 'Growth with AI'],
  ['INTERVIEW', '01 Application review', '02 Recruiter call', '03 Technical', '04 System design', '05 Culture & values', '06 Offer'],
  ['CANDIDATE', '2-3 weeks', 'Respect your time', 'Real-world problems', 'Think aloud', 'Be authentic'],
  ['WHAT TO EXPECT', 'Resume & portfolio', '3-5 business days', 'Recruiter call', '30 minutes', 'Take-home or live'],
  ['HOW TO SUCCEED', 'Research us', 'Showcase projects', 'Ask questions', 'Share your thinking'],
  ['VIRTUAL INTERVIEW', 'Test camera & mic', 'Quiet, well-lit room', 'Business casual', 'Look at the camera'],
  ['SKILLS', 'Problem solving', 'Clean code', 'Clear communication', 'Growth mindset'],
  ['PHILOSOPHY', 'People-first', 'Creativity stays', 'Empathy stays', 'Lead the AI era'],
  ['OFFER', '1-2 business days', 'Personalized onboarding', 'You are all set'],
  ['PROOF', '92% satisfaction', '4.8/5 Glassdoor', '35+ countries', '94% recommend'],
  ['JOIN', 'Open positions', 'People-first', 'Build what is next'],
]
const photos = [
  { src: '/assets/hr/hr-candidate.jpg', label: 'CANDIDATE' },
  { src: '/assets/hr/hr-interview.jpg', label: 'INTERVIEW' },
  { src: '/assets/hr/hr-culture.jpg', label: 'CULTURE' },
  { src: '/assets/hr/hr-offer.jpg', label: 'OFFER' },
].map((photo) => {
  const image = new Image()
  image.src = photo.src
  return { ...photo, image }
})
const tvs = [
  { l: '4%', t: '8%', w: '22%', h: '26%', r: '-7deg' },
  { l: '30%', t: '5%', w: '10%', h: '14%', r: '4deg' },
  { l: '64%', t: '6%', w: '28%', h: '26%', r: '2deg' },
  { l: '-4%', t: '36%', w: '16%', h: '22%', r: '-3deg' },
  { l: '24%', t: '32%', w: '16%', h: '20%', r: '3deg' },
  { l: '44%', t: '40%', w: '14%', h: '20%', r: '-2deg' },
  { l: '62%', t: '40%', w: '13%', h: '16%', r: '5deg' },
  { l: '6%', t: '64%', w: '18%', h: '24%', r: '2deg' },
  { l: '28%', t: '68%', w: '12%', h: '16%', r: '-6deg' },
  { l: '76%', t: '56%', w: '22%', h: '28%', r: '4deg' },
  { l: '54%', t: '72%', w: '10%', h: '14%', r: '-3deg' },
]
const screens = []
if (set) {
  tvs.forEach((tv, index) => {
    const frame = document.createElement('div')
    frame.className = 'hr-tv'
    frame.style.cssText = `left:${tv.l};top:${tv.t};width:${tv.w};height:${tv.h};--r:${tv.r}`
    const screen = document.createElement('div')
    screen.className = 'hr-screen'
    const canvas = document.createElement('canvas')
    screen.append(canvas)
    frame.append(screen)
    set.append(frame)
    const photoAt = { 0: 0, 2: 1, 7: 2, 9: 3 }
    const photo = photoAt[index] == null ? null : photos[photoAt[index]]
    screens.push(photo ? { canvas, photo } : { canvas, lines: feeds[index] })
  })
}

const paint = (canvas, lines, shift) => {
  const w = 280
  const h = 180
  if (canvas.width !== w) {
    canvas.width = w
    canvas.height = h
  }
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#061422'
  ctx.fillRect(0, 0, w, h)
  ctx.font = '600 18px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = '#c5ebff'
  ctx.shadowColor = '#49b4ff'
  ctx.shadowBlur = 8
  const lineH = 32
  const span = lines.length * lineH
  const offset = ((shift % span) + span) % span
  for (let copy = 0; copy < 2; copy += 1) {
    lines.forEach((line, i) => {
      const y = 28 + i * lineH - offset + copy * span
      if (y > -8 && y < h) ctx.fillText(line, 16, y)
    })
  }
}

const paintImage = (canvas, photo, shift) => {
  const w = 280
  const h = 180
  if (canvas.width !== w) {
    canvas.width = w
    canvas.height = h
  }
  const ctx = canvas.getContext('2d')
  const img = photo.image
  ctx.fillStyle = '#061422'
  ctx.fillRect(0, 0, w, h)
  if (!img.complete || !img.naturalWidth) return
  const scale = Math.max(w / img.naturalWidth, (h - 26) / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const span = Math.max(1, dh - (h - 26))
  const offset = reduceMotion.matches ? 0 : ((shift * 0.12 % span) + span) % span
  ctx.drawImage(img, (w - dw) / 2, -offset, dw, dh)
  ctx.fillStyle = '#061422e6'
  ctx.fillRect(0, h - 26, w, 26)
  ctx.font = '600 13px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = '#c5ebff'
  ctx.shadowColor = '#49b4ff'
  ctx.shadowBlur = 6
  ctx.fillText(photo.label, 12, h - 8)
}

let raf = 0
const draw = (now) => {
  const shift = reduceMotion.matches ? 0 : now * 0.028 + scrollY * 0.35
  screens.forEach((screen, i) => {
    if (screen.photo) paintImage(screen.canvas, screen.photo, shift + i * 48)
    else paint(screen.canvas, screen.lines, shift + i * 48)
  })
  if (!reduceMotion.matches) raf = requestAnimationFrame(draw)
}
if (screens.length) draw(0)

const arcHost = document.getElementById('start-arc')
const arcRoot = arcHost ? createRoot(arcHost) : null
const renderScenes = () => {
  const light = document.documentElement.dataset.theme === 'light'
  arcRoot?.render(
    <PredictiveArcCanvas variant="data-pixel" mode={light ? 'light' : 'dark'} speed={reduceMotion.matches ? 0 : 1} />
  )
}
if (arcRoot) {
  renderScenes()
  new MutationObserver(renderScenes).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  reduceMotion.addEventListener('change', () => {
    cancelAnimationFrame(raf)
    renderScenes()
    if (screens.length) draw(performance.now())
  })
}

const motionBits = document.querySelectorAll('.cc-head, .cc-card, .cc-stats div, #start > :not(.cc-arc)')
motionBits.forEach((el, i) => el.style.setProperty('--i', String(i % 6)))
if (!reduceMotion.matches) document.documentElement.classList.add('cc-motion')
const show = (el) => el.classList.add('cc-on')
if (reduceMotion.matches) motionBits.forEach(show)
else if ('IntersectionObserver' in window) {
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      show(entry.target)
      if (entry.target.closest('.cc-stats') && entry.target.matches('div')) count(entry.target.querySelector('strong'))
      seen.unobserve(entry.target)
    })
  }, { threshold: 0.2 })
  motionBits.forEach((el) => seen.observe(el))
}
function count(node) {
  if (!node || node.dataset.counted) return
  node.dataset.counted = '1'
  const match = node.textContent.trim().match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return
  const n = parseFloat(match[1])
  const decimals = (match[1].split('.')[1] || '').length
  const t0 = performance.now()
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / 1100)
    const value = n * (1 - (1 - p) ** 3)
    node.textContent = (decimals ? value.toFixed(decimals) : String(Math.round(value))) + match[2]
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

const jumpLinks = [...document.querySelectorAll('.cc-jump a')]
if ('IntersectionObserver' in window && jumpLinks.length) {
  const sections = jumpLinks.map((link) => document.querySelector(link.hash)).filter(Boolean)
  const observer = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).at(-1)
    if (!active) return
    jumpLinks.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
  }, { rootMargin: '-20% 0px -55% 0px' })
  sections.forEach((section) => observer.observe(section))
}

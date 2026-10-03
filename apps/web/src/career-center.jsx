import React from 'react'
import { createRoot } from 'react-dom/client'
import { PredictiveArcCanvas } from '@designcodeio/threeui/components/PredictiveArcCanvas'
import { RecursiveErosionBackground } from './shaders/neuform-isolated/NeuformIsolatedEffects'

const header = document.querySelector('.site-header')
if (header) addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true })

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const host = document.getElementById('career-shader')
const arcHost = document.getElementById('start-arc')
const heroRoot = host ? createRoot(host) : null
const arcRoot = arcHost ? createRoot(arcHost) : null
const renderScenes = () => {
  const light = document.documentElement.dataset.theme === 'light'
  const mode = light ? 'light' : 'dark'
  heroRoot?.render(
    <div className="shader-frame">
      <RecursiveErosionBackground
        variant="sphere"
        mode={mode}
        hue={light ? 180 : 0}
        saturation={light ? 2 : 1}
        brightness={1}
        speed={1}
        pointSize={1}
        wavelength={1}
      />
    </div>
  )
  arcRoot?.render(
    <PredictiveArcCanvas variant="data-pixel" mode={mode} speed={reduceMotion.matches ? 0 : 1} />
  )
}
if (heroRoot || arcRoot) {
  renderScenes()
  new MutationObserver(renderScenes).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  reduceMotion.addEventListener('change', renderScenes)
}

const reduce = reduceMotion.matches
const motionBits = document.querySelectorAll('.cc-head, .cc-card, .cc-stats div, .ip-step, .ip-tips li, .ip-skills article, #start > :not(.cc-arc)')
motionBits.forEach((el, i) => el.style.setProperty('--i', String(i % 6)))
if (!reduce) document.documentElement.classList.add('cc-motion')
const show = (el) => el.classList.add('cc-on')
if (reduce) motionBits.forEach(show)
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
  const raw = node.textContent.trim()
  const n = parseFloat(raw)
  if (!n) return
  const suffix = raw.slice(String(Math.trunc(n)).length)
  const t0 = performance.now()
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / 1100)
    node.textContent = Math.round(n * (1 - (1 - p) ** 3)) + suffix
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

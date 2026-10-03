import React from 'react'
import { createRoot } from 'react-dom/client'
import { HeatmapBadge } from './shaders/heatmap-badge/HeatmapBadge'

const header = document.querySelector('.site-header')
if (header) addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true })

const host = document.getElementById('join-shader')
if (host) {
  createRoot(host).render(
    <div className="shader-frame">
      <HeatmapBadge variant="vinyl" />
    </div>,
  )
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const motionBits = document.querySelectorAll('.cc-head, .cc-card, .cc-stats div, #start > :not(.cc-arc)')
motionBits.forEach((el, i) => el.style.setProperty('--i', String(i % 6)))
if (!reduce) document.documentElement.classList.add('cc-motion')
const show = (el) => el.classList.add('cc-on')
if (reduce) motionBits.forEach(show)
else if ('IntersectionObserver' in window) {
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      show(entry.target)
      seen.unobserve(entry.target)
    })
  }, { threshold: 0.2 })
  motionBits.forEach((el) => seen.observe(el))
}

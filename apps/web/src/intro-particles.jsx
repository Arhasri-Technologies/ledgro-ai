import React from 'react'
import { createRoot } from 'react-dom/client'
import { ParticleNetwork } from '@designcodeio/threeui/components/ParticleNetwork'

const host = document.querySelector('#about .intro-spotlight-bg')
if (host) {
  const root = createRoot(host)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const render = () => root.render(<ParticleNetwork mode="dark" speed={reduce.matches ? 0 : 1} style={{ width: '100%', height: '100%', border: 0, display: 'block', pointerEvents: 'none' }} />)
  render()
  reduce.addEventListener('change', render)
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) { reduce.removeEventListener('change', render); root.unmount() }
  })
}

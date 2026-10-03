import React from 'react'
import { createRoot } from 'react-dom/client'
import { PredictiveArcCanvas } from './vendor/predictive-arc/src/shaders/predictive-arc/PredictiveArcCollection'
import './vendor/predictive-arc/src/shaders/threeui.css'
import './about-energy.css'

const host = document.getElementById('about-energy-background')
if (host) {
  const root = createRoot(host)
  const render = () => {
    const paused = document.documentElement.classList.contains('about-paused')
    root.render(<PredictiveArcCanvas mode="dark" speed={paused ? 0 : 1} hue={0} saturation={1} brightness={1} />)
  }
  const observer = new MutationObserver(render)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  render()
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) { observer.disconnect(); root.unmount() }
  })
}

import React from 'react'
import { createRoot } from 'react-dom/client'
import { PredictiveArcCanvas } from '@designcodeio/threeui/components/PredictiveArcCanvas'

const host = document.getElementById('blog-signal')
if (host) {
  const root = createRoot(host)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const render = () => root.render(
    <PredictiveArcCanvas
      variant="signal-particles"
      mode="auto"
      speed={reduce.matches ? 0 : 0.65}
      hue={-22}
      saturation={1.2}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
  render()
  reduce.addEventListener('change', render)
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) { reduce.removeEventListener('change', render); root.unmount() }
  })
}

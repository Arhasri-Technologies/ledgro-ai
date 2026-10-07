// The source asset is preserved byte-for-byte. Only this embedded presentation
// removes Betawise's page chrome and uses our locally hosted r149 runtime.
const host = document.querySelector('#reach-globe')
const section = host?.closest('.reach')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')

if (host && section) {
  const response = await fetch('/landing-pages/betawise.html')
  if (!response.ok) throw new Error(`Betawise scene: ${response.status}`)
  const source = await response.text()
  const frame = document.createElement('iframe')
  frame.title = 'Animated network globe'
  frame.tabIndex = -1
  frame.setAttribute('sandbox', 'allow-scripts')
  let visible = false
  let ready = false
  const sync = () => {
    if (ready) frame.contentWindow?.postMessage({
      type: 'reach-state', active: visible && !document.hidden, reduced: reduced.matches,
      light: document.documentElement.dataset.theme === 'light',
    }, '*')
  }
  const receive = (event) => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'reach-ready') return
    ready = true
    section.classList.add('reach-ready')
    sync()
  }
  window.addEventListener('message', receive)
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  observer.observe(section)
  document.addEventListener('visibilitychange', sync)
  reduced.addEventListener('change', sync)
  const themeObserver = new MutationObserver(sync)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const bootstrap = `<script>
    (() => {
      const nativeRAF = window.requestAnimationFrame.bind(window);
      const nativeCancel = window.cancelAnimationFrame.bind(window);
      const waiting = new Map();
      const scheduled = new Map();
      let active = true, sequence = 0;
      function schedule(id, callback) {
        scheduled.set(id, nativeRAF(time => {
          scheduled.delete(id);
          if (active) callback(time); else waiting.set(id, callback);
        }));
      }
      window.requestAnimationFrame = callback => {
        const id = ++sequence;
        if (active) schedule(id, callback); else waiting.set(id, callback);
        return id;
      };
      window.cancelAnimationFrame = id => {
        if (scheduled.has(id)) nativeCancel(scheduled.get(id));
        scheduled.delete(id); waiting.delete(id);
      };
      window.addEventListener('message', event => {
        if (event.source !== parent || event.data?.type !== 'reach-state') return;
        const state = event.data;
        const material = window.__betawise?.compMat;
        if (material?.uniforms.uLightMode) material.uniforms.uLightMode.value = state.light ? 1 : 0;
        active = state.active && !state.reduced;
        if (state.reduced) window.__betawise?.shot(12, 1);
        else if (active) window.__betawise?.play();
        if (active) {
          const callbacks = [...waiting]; waiting.clear();
          callbacks.forEach(([id, callback]) => schedule(id, callback));
        }
      });
      window.addEventListener('load', () => {
        if (window.__betawise) parent.postMessage({ type: 'reach-ready' }, '*');
      });
    })();
  <\/script>`
  frame.srcdoc = source
    .replace(/<header>[\s\S]*?<\/header>/, '')
    .replace(/<main>[\s\S]*?<\/main>/, '')
    .replace(/<link\b[^>]*>/g, '')
    .replace('https://unpkg.com/three@0.149.0/build/three.min.js', '/vendor/three-r149.min.js')
    .replace(
      'LIGHT: [0.16, 0.22, 0.96],',
      'LIGHT: [0.08, 0.04, 0.99],',
    )
    .replace('BACK_MUL: 0.11,', 'BACK_MUL: 0.32,')
    .replace('GAIN: 0.60,', 'GAIN: 0.72,')
    // Keep the original globe detail, without an artificial illuminated rim.
    .replace('RIM_A: 0.50,', 'RIM_A: 0.0,')
    .replace('RIM_B: 0.30,', 'RIM_B: 0.65,')
    .replace('RIM_LIGHT: 0.85,', 'RIM_LIGHT: 0.0,')
    .replace('c += b * uBloom;', 'c += b * 0.0;')
    // Recolor the rendered points and routes, rather than inverting the globe.
    // Light mode uses soft white points over shaded ocean blues; dark output is unchanged.
    .replace('uBloom: { value: CFG.BLOOM },', `uLightMode: { value: ${document.documentElement.dataset.theme === 'light' ? 1 : 0} }, uBloom: { value: CFG.BLOOM },`)
    .replace('uniform float uBloom,uExp,uGrain,uTime;', 'uniform float uBloom,uExp,uGrain,uTime,uLightMode;')
    .replace(
      'gl_FragColor = vec4(max(c,0.0),1.0);',
      'float ink = smoothstep(0.025, 0.65, max(c.r, max(c.g, c.b))); vec2 globeUV = (vU - 0.5) / 0.245; float sphereZ = sqrt(max(0.0, 1.0 - dot(globeUV, globeUV))); vec3 normal = normalize(vec3(globeUV, sphereZ + 0.001)); float sun = clamp(dot(normal, normalize(vec3(-0.45, 0.55, 1.0))), 0.0, 1.0); vec3 ocean = mix(vec3(0.035, 0.11, 0.20), vec3(0.16, 0.38, 0.53), sun); vec3 land = mix(vec3(0.42, 0.59, 0.66), vec3(0.90, 0.95, 0.93), sun); vec3 daylight = mix(ocean, land, ink * 0.88); gl_FragColor = vec4(mix(max(c,0.0), daylight, uLightMode),1.0);',
    )
    // Fine city-to-city paths with distinct moving pulses; bloom stays off.
    // The existing light-mode compositor turns cyan into readable blue routes.
    .replace(
      'ARC_GAIN: 1.55, ARC_BASE: 0.40, ARC_TAIL: 5.5, ARC_SPEED: 0.34,',
      'ARC_GAIN: 2.2, ARC_BASE: 0.16, ARC_TAIL: 14.0, ARC_SPEED: 0.22,',
    )
    // Soft starfield around the earth — never on the continents.
    .replace('DUST: 16000,', 'DUST: 14000,')
    .replace('DUST_GAIN: 0.42,', 'DUST_GAIN: 0.40,')
    // Globe is centered; align the star hole to the true limb and clear the disk.
    .replace(
      'var sil = Math.hypot(x * k, y * k - 0.043) / 0.50;        /* 1 = the limb */',
      'var sil = Math.hypot(x * k, y * k) / 0.50;        /* 1 = the limb */',
    )
    .replace(
      'var hole = 0.10 + 0.90 * sm(0.72, 1.06, sil);',
      'var hole = sm(1.18, 1.52, sil);',
    )
    // Also drop any star that sits inside / on the globe sphere.
    .replace(
      'if (Math.random() > Math.min(1, Math.pow(dustW(x, y, z), wPow || 1) * 0.10)) continue;',
      'if (Math.hypot(x, y, z) < 0.72) continue; if (Math.random() > Math.min(1, Math.pow(dustW(x, y, z), wPow || 1) * 0.10)) continue;',
    )
    // Lock the globe dead-center in the frame.
    .replace('globe.position.y = GLOBE_MID_OFF;', 'globe.position.y = 0;')
    .replace(
      '</head>',
      `<style>
        html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#000}
        body{pointer-events:none;display:grid;place-items:center}
        canvas{display:block;margin:auto}
        .veil{display:none}
      </style>${bootstrap}</head>`,
    )
  host.replaceChildren(frame)

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return
    observer.disconnect()
    themeObserver.disconnect()
    window.removeEventListener('message', receive)
    document.removeEventListener('visibilitychange', sync)
    reduced.removeEventListener('change', sync)
    frame.remove()
  })
}

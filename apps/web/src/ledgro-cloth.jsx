import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import clothSource from '../../../node_modules/@designcodeio/threeui/lib-dist/shaders/neuform-isolated/sources/lumina-weavers-cloth.html.js'

const LEDGRO = `// Typography
                x.textAlign = 'center';
                x.textBaseline = 'middle';
                x.lineJoin = 'round';
                function logo(y, size) {
                  var g = x.createLinearGradient(200, y - size, 1080, y + size * 0.35);
                  g.addColorStop(0, '#0a3d99');
                  g.addColorStop(0.32, '#1a6bff');
                  g.addColorStop(0.5, '#e8fbff');
                  g.addColorStop(0.68, '#00dfff');
                  g.addColorStop(1, '#1a6bff');
                  return g;
                }
                function paint(text, y, size, family, fill) {
                  x.font = '700 ' + size + 'px ' + family;
                  x.lineWidth = Math.max(3, size * 0.035);
                  x.strokeStyle = '#050505';
                  x.strokeText(text, W/2, y);
                  x.fillStyle = fill;
                  x.fillText(text, W/2, y);
                }
                paint('LEDGRO', 250, 118, 'Georgia, "Times New Roman", serif', '#ffffff');
                x.strokeStyle = logo(328, 6);
                x.lineWidth = 6;
                x.beginPath();
                x.moveTo(W/2 - 176, 324);
                x.lineTo(W/2 + 176, 324);
                x.stroke();
                paint('50% OFF', 420, 100, 'Georgia, "Times New Roman", serif', logo(420, 100));
                paint('ON THE FIRST 1000 CUSTOMERS', 510, 34, '"Helvetica Neue", Arial, sans-serif', logo(510, 34));

                `

const VELA = LEDGRO
  .replace("paint('LEDGRO', 250, 118, 'Georgia, \"Times New Roman\", serif', '#ffffff');", "paint('VEL.AI', 250, 118, 'Georgia, \"Times New Roman\", serif', '#ffffff');")
  .replace("paint('ON THE FIRST 1000 CUSTOMERS', 510, 34, '\"Helvetica Neue\", Arial, sans-serif', logo(510, 34));", "paint('ON THE FIRST 10000 CREDITS', 510, 34, '\"Helvetica Neue\", Arial, sans-serif', logo(510, 34));")

const AUTHORED = `// Typography
                x.fillStyle = '#a5202c';
                x.font = 'bold 78px Georgia, "Times New Roman", serif';
                x.textAlign = 'center'; 
                x.textBaseline = 'middle';
                x.fillText('L\u2009W', W/2, 190);
                
                x.font = 'normal 20px "Helvetica Neue", Arial, sans-serif';
                x.fillStyle = '#7c1622';
                x.fillText('· KYOTO ·', W/2, 246);

                x.fillStyle = '#9e1e2a';
                x.font = 'bold 118px Georgia, "Times New Roman", serif';
                x.fillText('LUMINA', W/2, 400);
                x.fillText('WEAVERS', W/2, 520);

                x.fillStyle = '#7c1622';
                x.font = '600 30px "Helvetica Neue", Arial, sans-serif';
                x.fillText('K I N E T I C   T E X T I L E S   ·   2 0 2 4', W/2, 626);

                `

const GROUND = `// Ivory ground gradient
                const g = x.createLinearGradient(0, 0, 0, H);
                g.addColorStop(0, '#efe6d4'); 
                g.addColorStop(0.5, '#e9dfca'); 
                g.addColorStop(1, '#e3d7bf');
                x.fillStyle = g; 
                x.fillRect(0, 0, W, H);

                // Crimson hem border
                x.strokeStyle = '#a5202c'; 
                x.lineWidth = 10;
                x.strokeRect(46, 46, W-92, H-92);
                x.lineWidth = 3; 
                x.strokeStyle = '#7c1622';
                x.strokeRect(66, 66, W-132, H-132);`

const CLOTH = `// Black ground, logo-blue hem
                const g = x.createLinearGradient(0, 0, 0, H);
                g.addColorStop(0, '#0c0c0c');
                g.addColorStop(0.5, '#070707');
                g.addColorStop(1, '#030303');
                x.fillStyle = g;
                x.fillRect(0, 0, W, H);

                x.strokeStyle = '#1a6bff';
                x.lineWidth = 10;
                x.strokeRect(46, 46, W-92, H-92);
                x.lineWidth = 3;
                x.strokeStyle = '#00dfff';
                x.strokeRect(66, 66, W-132, H-132);`

function ledgroClothSource(source, label) {
  if (!source.includes(AUTHORED)) throw new Error('Woven cloth label block changed')
  if (!source.includes(GROUND)) throw new Error('Woven cloth ground block changed')
  const labeled = source
    .replace(GROUND, CLOTH)
    .replace(AUTHORED, label)
    .replace("x.strokeStyle = 'rgba(60,30,20,0.05)';", "x.strokeStyle = 'rgba(0,223,255,0.12)';")
    .replace('specular: 0x2a1410,', 'specular: 0x0c1a33,')
    .replace('const rim = new THREE.DirectionalLight(0xb02330, 0.42);', 'const rim = new THREE.DirectionalLight(0x00dfff, 0.55);')
    .replace('scene.add(new THREE.AmbientLight(0xffe9d0, 0.62));', 'scene.add(new THREE.AmbientLight(0xe7f6ff, 0.9));')
  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; margin: 0 !important; overflow: hidden !important; background: #000 !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-role="aura"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important; opacity: 0.28 !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 1 !important; }
[data-threeui-role="background"] > div { display: none !important; }
</style>`
  const focusScript = `<script data-threeui-focus>
(function () {
  function isolate() {
    var cloth = document.querySelector('body > div.fixed.inset-0.overflow-hidden.z-0');
    var aura = document.querySelector('body > div.fixed.inset-0.pointer-events-none.bg-cover');
    if (!cloth || cloth.getAttribute('data-threeui-role')) return;
    if (aura) {
      aura.setAttribute('data-threeui-role', 'aura');
      document.body.appendChild(aura);
    }
    cloth.setAttribute('data-threeui-role', 'background');
    document.body.appendChild(cloth);
    Array.from(document.body.children).forEach(function (element) {
      if (element === cloth || element === aura) return;
      element.setAttribute('data-threeui-residual', '');
    });
    document.body.setAttribute('data-threeui-ready', '');
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  setTimeout(isolate, 100);
  window.addEventListener('load', isolate, { once: true });
})();
<\/script>`
  return labeled.replace(/<\/head>/i, `${focusStyle}</head>`).replace(/<\/body>/i, `${focusScript}</body>`)
}

if (VELA.includes('LEDGRO') || VELA.includes('CUSTOMERS') || !VELA.includes('10000 CREDITS')) throw new Error('Vela cloth label did not split from Ledgro')

const PAGES = {
  ledgro: { label: LEDGRO, title: 'Ledgro woven cloth. 50% off on the first 1000 customers.' },
  vela: { label: VELA, title: 'VEL.ai woven cloth. 50% off on the first 10000 credits.' },
}

function LedgroCloth({ page }) {
  const srcDoc = useMemo(() => ledgroClothSource(clothSource, page.label), [page])
  return (
    <iframe
      title={page.title}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      style={{ display: 'block', width: '100%', height: '100%', border: 0, background: '#000' }}
    />
  )
}

const host = document.getElementById('vela-cloth') || document.getElementById('ledgro-cloth')
if (host) {
  const page = host.id === 'vela-cloth' ? PAGES.vela : PAGES.ledgro
  const root = createRoot(host)
  root.render(<LedgroCloth page={page} />)
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) root.unmount()
  })
}

const gallery = document.querySelector('.capability-gallery');
if (gallery) {
  const track = gallery.querySelector('.capability-track');
  const cards = [...track.querySelectorAll('.capability-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let overlay = null;
  let navigating = false;
  let expansion = null;
  const visibleCards = () => cards.filter(card => !card.hidden);
  const trackInset = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const nearestIndex = () => {
    const start = track.scrollLeft + trackInset();
    let distance = Infinity, index = 0;
    visibleCards().forEach((card, i) => {
      const d = Math.abs(card.offsetLeft - start);
      if (d < distance) { distance = d; index = i; }
    });
    return index;
  };
  const updateCount = () => {
    gallery.style.setProperty('--gallery-progress', `${(nearestIndex() + 1) / visibleCards().length * 100}%`);
    const center = track.scrollLeft + track.clientWidth / 2;
    visibleCards().forEach(card => {
      const side = Math.max(-1, Math.min(1, (card.offsetLeft + card.offsetWidth / 2 - center) / card.offsetWidth));
      card.style.setProperty('--side', side);
      card.style.setProperty('--distance', Math.abs(side));
    });
    gallery.querySelector('.capability-count').textContent = `${String(nearestIndex() + 1).padStart(2, '0')} / ${String(visibleCards().length).padStart(2, '0')}`;
  };
  const goTo = index => {
    const list = visibleCards();
    const card = list[(index + list.length) % list.length];
    track.scrollTo({left: card.offsetLeft - trackInset(), behavior: reduced.matches ? 'instant' : 'smooth'});
  };
  gallery.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    gallery.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
    track.scrollTo({left: 0, behavior: 'instant'});
    visibleCards().forEach((card, i) => {
      card.getAnimations().forEach(animation => animation.cancel());
      if (!reduced.matches) card.animate([{opacity: 0, translate: '0 22px', filter: 'blur(5px)'}, {opacity: 1, translate: '0 0', filter: 'blur(0px)'}], {duration: 600, delay: Math.min(i, 3) * 65, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
    });
    updateCount();
  }));
  gallery.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => goTo(nearestIndex() + Number(button.dataset.direction))));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? visibleCards().length - 1 : nearestIndex() + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let countFrame = 0;
  track.addEventListener('scroll', () => {
    if (!countFrame) countFrame = requestAnimationFrame(() => { updateCount(); countFrame = 0; });
  }, {passive: true});
  new ResizeObserver(updateCount).observe(track);
  const resetExpansion = () => {
    expansion?.cancel();
    overlay?.remove();
    overlay = null;
    navigating = false;
  };
  window.addEventListener('pageshow', resetExpansion);
  window.addEventListener('keydown', event => { if (event.key === 'Escape') resetExpansion(); });
  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduced.matches || paused || event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty('--tilt-x', `${x * 7}deg`);
      card.style.setProperty('--tilt-y', `${-y * 5}deg`);
      card.style.setProperty('--image-x', `${-x * 7}px`);
      card.style.setProperty('--image-y', `${-y * 7}px`);
      card.style.setProperty('--shine-x', `${(x + .5) * 100}%`);
      card.style.setProperty('--shine-y', `${(y + .5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => ['--tilt-x','--tilt-y','--image-x','--image-y'].forEach(key => card.style.removeProperty(key)));
  });
  cards.forEach(card => card.addEventListener('click', async event => {
    // Preserve native new-tab, download, and reduced-motion navigation.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const rect = card.getBoundingClientRect();
    overlay = document.createElement('div');
    overlay.className = 'capability-expansion';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.append(card.querySelector('img').cloneNode(true), card.querySelector('.capability-card-copy').cloneNode(true));
    document.body.append(overlay);
    try {
      const inset = `${Math.max(0, rect.top)}px ${Math.max(0, innerWidth - rect.right)}px ${Math.max(0, innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px`;
      const picture = overlay.querySelector('img');
      const copy = overlay.querySelector('.capability-card-copy');
      // Keep the same image crop at the start, then reveal the full-bleed composition.
      picture.animate([
        {left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`},
        {left: '0px', top: '0px', width: '100%', height: '100%'}
      ], {duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'});
      copy.animate([{opacity: 0, transform: 'translateY(35px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 600, delay: 360, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'});
      expansion = overlay.animate([
        {clipPath: `inset(${inset} round 12px)`},
        {clipPath: 'inset(0px 0px 0px 0px round 0px)'}
      ], {duration: 1100, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards'});
      await expansion.finished;
      location.assign(card.href);
    } catch { resetExpansion(); }
  }));

  // Load Three.js only when the gallery approaches the viewport.
  let renderer, scene, camera, dust, wireforms, frame = 0, inView = false, initialized = false;
  let pointerX = 0, pointerY = 0;
  const canvas = gallery.querySelector('canvas');
  const GALLERY_AUTO_MS = 4000;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };
  const draw = time => {
    frame = 0;
    if (!renderer || !inView || document.hidden || paused || reduced.matches) return;
    dust.rotation.y = Math.sin(time * .00007) * .16 + pointerX * .06;
    dust.rotation.x += (pointerY * .04 - dust.rotation.x) * .025;
    wireforms.children.forEach((form, index) => {
      form.rotation.x = time * .00009 * (index % 2 ? -1 : 1) + index * .4;
      form.rotation.y = time * .00013 + pointerX * .12;
      form.rotation.z = Math.sin(time * .00015 + index) * .15;
      form.position.y = form.userData.baseY + Math.sin(time * .00045 + index * 2) * .16;
    });
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };
  const resume = () => { if (!frame && renderer && inView && !paused && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw); };
  const initialize = async () => {
    if (initialized || reduced.matches) return;
    initialized = true;
    try {
      const THREE = await import('three');
      renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: false, powerPreference: 'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, .1, 50);
      camera.position.set(0, -0.42, 8);
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(240 * 3);
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] = (Math.random() - .5) * 20;
        positions[i + 1] = (Math.random() - .5) * 9;
        positions[i + 2] = (Math.random() - .5) * 4;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      dust = new THREE.Points(geometry, new THREE.PointsMaterial({color: 0x9cc9f1, size: .018, transparent: true, opacity: .65}));
      scene.add(dust);
      wireforms = new THREE.Group();
      const shapes = [new THREE.TorusGeometry(1.35, .38, 12, 40), new THREE.IcosahedronGeometry(.85, 1), new THREE.SphereGeometry(.62, 18, 12)];
      shapes.forEach((shape, index) => {
        const lines = new THREE.LineSegments(new THREE.WireframeGeometry(shape), new THREE.LineBasicMaterial({color: 0x84c9fa, transparent: true, opacity: index === 0 ? .3 : .22, depthWrite: false}));
        shape.dispose();
        lines.position.set(index === 0 ? 2.5 : index === 1 ? -.4 : 5, index === 0 ? -.55 : index === 1 ? -1.25 : -.35, 0);
        lines.userData.baseY = lines.position.y;
        wireforms.add(lines);
      });
      scene.add(wireforms);
      dust.position.y = -0.35;
      const frameWireforms = (mobile = innerWidth < 700) => {
        wireforms.position.x = mobile ? 0 : 0.35;
        wireforms.position.y = mobile ? -0.72 : -0.85;
        wireforms.scale.setScalar(mobile ? 0.82 : 0.72);
      };
      frameWireforms();
      const paintWireframes = () => {
        const light = document.documentElement.dataset.theme === 'light';
        wireforms.children.forEach((form, index) => {
          form.material.color.set(light ? 0x29618d : 0x84c9fa);
          form.material.opacity = light ? 0.36 : index === 0 ? 0.3 : 0.22;
        });
        dust.material.color.set(light ? 0x5a94bd : 0x9cc9f1);
        dust.material.opacity = light ? 0.5 : 0.65;
        renderer.render(scene, camera);
      };
      new MutationObserver(paintWireframes).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
      paintWireframes();
      new ResizeObserver(() => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        frameWireforms(innerWidth < 700);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }).observe(canvas);
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); canvas.hidden = true; });
      resume();
    } catch { canvas.hidden = true; }
  };
  const pauseButton = gallery.querySelector('.capability-motion');
  let galleryAutoTimer = 0;
  let galleryUserActive = false;
  let galleryInteractionEnd = 0;

  function resetGalleryAuto() {
    clearInterval(galleryAutoTimer);
    if (reduced.matches || paused || !inView || document.hidden) return;
    galleryAutoTimer = window.setInterval(() => {
      if (reduced.matches || paused || !inView || document.hidden || galleryUserActive) return;
      goTo(nearestIndex() + 1);
    }, GALLERY_AUTO_MS);
  }

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) {
      initialize();
      resume();
      resetGalleryAuto();
    } else {
      stop();
      clearInterval(galleryAutoTimer);
    }
  }, {rootMargin: '150px'}).observe(gallery);
  gallery.addEventListener('pointermove', event => {
    const rect = gallery.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
  }, {passive: true});
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : resume());
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); else { initialize(); resume(); } });

  track.addEventListener('scroll', () => {
    galleryUserActive = true;
    clearTimeout(galleryInteractionEnd);
    galleryInteractionEnd = window.setTimeout(() => {
      galleryUserActive = false;
      resetGalleryAuto();
    }, 4000);
  }, { passive: true });
  track.addEventListener('pointerdown', () => { galleryUserActive = true; });
  track.addEventListener('pointerup', () => {
    galleryInteractionEnd = window.setTimeout(() => {
      galleryUserActive = false;
      resetGalleryAuto();
    }, 4000);
  });

  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Resume gallery motion' : 'Pause gallery motion');
    pauseButton.textContent = paused ? '▷' : 'Ⅱ';
    paused ? stop() : resume();
    resetGalleryAuto();
  });
  // Every collection starts at its first card, aligned with the section content.
  track.scrollLeft = 0;
  updateCount();

  gallery.classList.add('motion-ready');
  if (reduced.matches) {
    gallery.classList.add('is-entered');
  } else {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) gallery.classList.add('is-entered');
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }).observe(gallery);
  }
}

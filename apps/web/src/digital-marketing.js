const scenes = [
  { photo: 'photo-1495474472287-4d71bcdd2085', alt: 'Coffee served on a table', kicker: '01 / THE HOOK', title: 'Your morning.\nMade better.' },
  { photo: 'photo-1442512595331-e89e73853f31', alt: 'Freshly prepared coffee', kicker: '02 / THE STORY', title: 'Crafted with care.\nEvery single cup.' },
  { photo: 'photo-1501339847302-ac426a4a7cbb', alt: 'Welcoming café interior', kicker: '03 / THE CALL TO ACTION', title: 'Find your\nnew favourite.' },
]
const image = document.querySelector('#dm-scene-image')
const buttons = document.querySelectorAll('[data-scene]')
buttons.forEach(button => button.addEventListener('click', () => {
  const scene = scenes[Number(button.dataset.scene)]
  image.src = `https://images.unsplash.com/${scene.photo}?auto=format&fit=crop&w=700&q=80`
  image.alt = scene.alt
  document.querySelector('#dm-scene-kicker').textContent = scene.kicker
  document.querySelector('#dm-scene-title').textContent = scene.title
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
}))
// Keep the section navigation in sync without hiding content behind animation.
if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.about-jump a')]
  const observer = new IntersectionObserver(entries => {
    const active = entries.find(entry => entry.isIntersecting)
    if (!active) return
    links.forEach(link => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }, { rootMargin: '-15% 0px -60% 0px' })
  links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section) })
}

// Start the decorative film muted; respect motion preferences and manual pause.
const heroVideo = document.querySelector('.dm-cover-video')
const videoToggle = document.querySelector('.dm-video-toggle')
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
let manuallyPaused = false
function syncVideoControl() {
  videoToggle.textContent = heroVideo.paused ? 'Play video' : 'Pause video'
  videoToggle.setAttribute('aria-label', `${heroVideo.paused ? 'Play' : 'Pause'} background video`)
}
async function startHeroVideo() {
  try { await heroVideo.play() } catch { /* The poster remains available when autoplay is blocked. */ }
  syncVideoControl()
}
videoToggle.addEventListener('click', () => {
  manuallyPaused = !heroVideo.paused
  if (heroVideo.paused) startHeroVideo()
  else heroVideo.pause()
})
heroVideo.addEventListener('play', syncVideoControl)
heroVideo.addEventListener('pause', syncVideoControl)
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) heroVideo.pause()
  else if (!manuallyPaused && !document.hidden) startHeroVideo()
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden) heroVideo.pause()
  else if (!motionPreference.matches && !manuallyPaused) startHeroVideo()
})
if (!motionPreference.matches) startHeroVideo()

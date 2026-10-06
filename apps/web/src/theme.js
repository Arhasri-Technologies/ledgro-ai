const storageKey = 'ledgro-theme'
const root = document.documentElement
const btn = document.getElementById('theme-toggle')

function preferred() {
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/* White mark on dark surfaces; dark mark on light surfaces. */
const logos = { dark: '/assets/logo-dark.png', light: '/assets/logo.png' }

function paintLogos(theme) {
  const pageTheme = theme === 'light' ? 'light' : 'dark'
  document.querySelectorAll('.brand img').forEach((img) => {
    if (!img.getAttribute('src')?.includes('/assets/logo')) return
    // Homepage header is always dark — keep the white logo there.
    const onDarkHeader =
      document.body.classList.contains('home-page') && img.closest('.site-header')
    const src = onDarkHeader ? logos.dark : logos[pageTheme] || logos.dark
    if (img.getAttribute('src') !== src) img.setAttribute('src', src)
  })
}

function apply(theme) {
  const next = theme === 'light' ? 'light' : 'dark'
  root.dataset.theme = next
  localStorage.setItem(storageKey, next)
  paintLogos(next)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = next === 'light' ? '#f4f7fb' : '#091b23'
  if (!btn) return
  const toLight = next === 'dark'
  btn.setAttribute('aria-label', toLight ? 'Activate light mode' : 'Activate dark mode')
  btn.setAttribute('aria-pressed', String(!toLight))
  const icon = btn.querySelector('.theme-toggle-icon')
  if (icon) icon.textContent = toLight ? '☀' : '☾'
}

if (!root.dataset.theme) apply(localStorage.getItem(storageKey) || preferred())
else apply(root.dataset.theme)

btn?.addEventListener('click', () => {
  apply(root.dataset.theme === 'dark' ? 'light' : 'dark')
})

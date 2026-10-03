const header = document.querySelector('.site-header')
if (!header) {
  /* no shared header on this page */
} else {
  addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true })
  const menuToggle = header.querySelector('.nav-menu-toggle')
  const dropdownItems = [...header.querySelectorAll('.nav-item--dropdown')]

  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('mobile-nav-open')
    menuToggle.setAttribute('aria-expanded', String(open))
  })

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.nav-trigger')
    if (!trigger) return

    trigger.addEventListener('click', (e) => {
      if (window.innerWidth > 1024) return
      e.preventDefault()
      const willOpen = !item.classList.contains('is-open')
      dropdownItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open')
          other.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false')
        }
      })
      item.classList.toggle('is-open', willOpen)
      trigger.setAttribute('aria-expanded', String(willOpen))
    })
  })

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      header.classList.remove('mobile-nav-open')
      menuToggle?.setAttribute('aria-expanded', 'false')
      dropdownItems.forEach((item) => {
        item.classList.remove('is-open')
        item.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false')
      })
    }
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      header.classList.remove('mobile-nav-open')
      menuToggle?.setAttribute('aria-expanded', 'false')
      dropdownItems.forEach((item) => {
        item.classList.remove('is-open')
        item.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false')
      })
    }
  })
}

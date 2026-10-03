const header = document.querySelector('.site-header')
if (header) addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true })

const jobs = [...document.querySelectorAll('.op-job')]
const dept = document.querySelector('[data-filter="dept"]')
const work = document.querySelector('[data-filter="work"]')
const count = document.querySelector('[data-count]')
const noun = document.querySelector('[data-noun]')
const empty = document.querySelector('.op-empty')

const applyFilters = () => {
  let shown = 0
  jobs.forEach((job) => {
    const ok = (dept.value === 'all' || job.dataset.dept === dept.value)
      && (work.value === 'all' || job.dataset.work === work.value)
    job.hidden = !ok
    if (ok) shown += 1
  })
  count.textContent = String(shown)
  noun.textContent = shown === 1 ? 'position' : 'positions'
  empty.hidden = shown > 0
}

dept?.addEventListener('change', applyFilters)
work?.addEventListener('change', applyFilters)

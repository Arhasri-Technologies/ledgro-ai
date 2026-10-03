import React from 'react'
import { createRoot } from 'react-dom/client'
import { CrtBackground } from '@designcodeio/threeui/components/CrtBackground'
import '@designcodeio/threeui/style.css'

const header = document.querySelector('.site-header')
if (header) addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), {passive: true})
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const crt = document.getElementById('crt-mount')
if (crt) {
  createRoot(crt).render(
    <CrtBackground variant="terminal" speed={reduced ? 0 : 1} typeSpeed={reduced ? 0 : 1} motion={reduced ? 0 : 1} />
  )
}
const technologies = {
  typescript: ['APPLICATION LANGUAGE','TypeScript','Typed application code that stays readable as the product and the team grow.','Web, mobile and service code where shared types catch mistakes before release.','Strict types at boundaries, shared models and reviews that treat types as part of the design.','Types do not replace tests. We type the contracts that change, and keep the rest straightforward.'],
  ionic: ['MOBILE & WEB','Ionic Framework','One interface system for iOS, Android and the web, built on standard web technology.','Customer and field apps that should feel native without a separate codebase for each platform.','Platform conventions, offline states, device features and testing on real phones.','Some device features still need native work. Shared UI does not remove device testing.'],
  tailwind: ['INTERFACE SYSTEM','Tailwind CSS','A utility-first styling system so screens stay consistent without a separate stylesheet language.','Product interfaces and pages that share the same spacing, type and color.','A small set of tokens, responsive layouts and components that stay accessible.','Unchecked utilities get noisy. We keep patterns in components so the markup stays readable.'],
  ai: ['INTELLIGENT WORKFLOWS','AI & agent orchestration','Use models and agents for specific tasks with explicit permissions and human review.','Voice-to-requirements, assisted development, knowledge retrieval and bounded automation.','Evaluation examples, failure handling, privacy boundaries, latency and cost budgets.','AI output can be wrong. Critical actions need validation and appropriate approval.']
}
const fields = ['tech-category','tech-title','tech-description','tech-use','tech-focus','tech-tradeoff']
document.querySelectorAll('[data-tech]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-tech]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
  technologies[button.dataset.tech].forEach((text, i) => document.getElementById(fields[i]).textContent = text)
  document.getElementById('technology').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})
}))
const form = document.getElementById('app-brief')
document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', () => { form.elements.route.value = link.dataset.route }))
let downloadUrl
form.addEventListener('submit', event => {
  event.preventDefault()
  const summary = form.elements.summary
  summary.setCustomValidity(summary.value.trim().length < 20 ? 'Please describe your project in at least 20 characters.' : '')
  if (!form.reportValidity()) return
  const data = new FormData(form)
  const text = `DATASERV PROJECT BRIEF\n\nPath: ${data.get('route')}\nPlatform: ${data.get('platform')}\nTimeframe: ${data.get('timeframe')}\n\n${data.get('summary').trim()}\n`
  if (downloadUrl) URL.revokeObjectURL(downloadUrl)
  downloadUrl = URL.createObjectURL(new Blob([text], {type:'text/plain'}))
  document.getElementById('brief-download').href = downloadUrl
  document.getElementById('brief-result').hidden = false
})
form.elements.summary.addEventListener('input', () => form.elements.summary.setCustomValidity(''))
form.addEventListener('input', () => { document.getElementById('brief-result').hidden = true })

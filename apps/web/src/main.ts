import './style.css'
import { hostedProject } from './project.config'
import { supabase, type ProjectDetailsRow } from './supabase'

const app = document.querySelector<HTMLDivElement>('#app')!

function row(label: string, value: string, opts?: { mono?: boolean; href?: string }) {
  const dt = document.createElement('dt')
  dt.textContent = label
  const dd = document.createElement('dd')
  if (opts?.href) {
    const a = document.createElement('a')
    a.href = opts.href
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.textContent = value
    dd.appendChild(a)
  } else {
    dd.textContent = value
    if (opts?.mono) dd.classList.add('mono')
  }
  return [dt, dd] as const
}

function renderShell(db: ProjectDetailsRow | null, error: string | null) {
  app.replaceChildren()

  const header = document.createElement('header')
  header.innerHTML = `
    <p class="eyebrow">Ledgro · Supabase</p>
    <h1>${db?.title ?? hostedProject.name}</h1>
    <p class="lede">${db?.tagline ?? 'Loading project profile…'}</p>
  `

  const grid = document.createElement('dl')
  grid.className = 'detail-grid'

  const apiUrl = import.meta.env.VITE_SUPABASE_URL as string
  const pairs: Array<[string, string, { mono?: boolean; href?: string }?]> = [
    ['Local config id', hostedProject.localProjectId, { mono: true }],
    ['Project ref', hostedProject.ref, { mono: true }],
    ['Region', hostedProject.region],
    ['Status', hostedProject.status],
    ['API URL', apiUrl, { mono: true, href: apiUrl }],
    ['Dashboard', 'Open in Supabase', { href: hostedProject.dashboardUrl }],
    ['Pattern', hostedProject.pattern],
    ['Repo folder', db?.repo_path ?? 'ledgro-ai', { mono: true }],
  ]

  for (const [label, value, opts] of pairs) {
    const [dt, dd] = row(label, value, opts)
    grid.append(dt, dd)
  }

  if (db?.stack?.length) {
    const [dt, dd] = row('Stack', db.stack.join(' · '))
    grid.append(dt, dd)
  }

  if (db) {
    const [dt, dd] = row(
      'DB updated',
      new Date(db.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    )
    grid.append(dt, dd)
  }

  const dbSection = document.createElement('section')
  dbSection.className = 'panel'
  dbSection.append(
    Object.assign(document.createElement('h2'), { textContent: 'Hosted project' }),
    grid,
  )

  const live = document.createElement('section')
  live.className = 'panel'
  const liveTitle = Object.assign(document.createElement('h2'), { textContent: 'Live from Supabase' })
  const liveBody = document.createElement('p')
  liveBody.className = 'live-status'

  if (error) {
    liveBody.classList.add('error')
    liveBody.textContent = error
  } else if (db) {
    liveBody.textContent = `Connected — read \`public.project_details\` (slug: ${db.slug}).`
  } else {
    liveBody.textContent = 'Checking database…'
  }

  live.append(liveTitle, liveBody)

  const wrap = document.createElement('main')
  wrap.append(header, dbSection, live)
  app.append(wrap)
}

async function load() {
  renderShell(null, null)

  const { data, error } = await supabase
    .from('project_details')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    renderShell(null, error.message)
    return
  }

  renderShell(data as ProjectDetailsRow | null, data ? null : 'No project_details row found.')
}

load()

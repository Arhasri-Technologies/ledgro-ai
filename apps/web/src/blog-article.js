const statusEl = document.querySelector('#article-status');
const articleEl = document.querySelector('#article');
const progressEl = document.querySelector('#read-progress');
const progressBar = progressEl?.querySelector('span');
const titleEl = document.querySelector('#article-title');
const dekEl = document.querySelector('#article-dek');
const categoryEl = document.querySelector('#article-category');
const bylineEl = document.querySelector('#article-byline');
const heroArtEl = document.querySelector('#article-hero-art');
const bodyEl = document.querySelector('#article-body');
const sourceLink = document.querySelector('#article-source-link');
const railAuthorEl = document.querySelector('#article-rail-author');
const railDateEl = document.querySelector('#rail-date');
const railMinutesEl = document.querySelector('#rail-minutes');
const railTopicEl = document.querySelector('#rail-topic');
const tocEl = document.querySelector('#article-toc');
const tocListEl = document.querySelector('#article-toc-list');

const profiles = {
  'Anil Potluri': {
    image: 'anil.jpg',
    role: 'Chief Technology Officer',
    blurb: 'Enterprise AI, transformation, and the systems that carry it.',
  },
  'Gunda Ajay Kumar': {
    image: 'ajay.jpg',
    role: 'AI Solutions Architect',
    blurb: 'Responsible AI, governance, and delivery you can stand behind.',
  },
};

const slug = new URLSearchParams(location.search).get('slug')?.trim() ?? '';

function showError(message) {
  statusEl.textContent = message;
  articleEl.hidden = true;
  progressEl.hidden = true;
}

function buildHeroArt(category) {
  const ethics = category === 'AI Ethics';
  const art = document.createElement('div');
  art.className = `article-art ${ethics ? 'art-ethics' : 'art-enterprise'}`;
  art.append(
    Object.assign(document.createElement('span'), {
      className: 'article-index',
      textContent: ethics ? '02 / RESPONSIBLE SYSTEMS' : '01 / ENTERPRISE INTELLIGENCE',
    }),
  );
  const diagram = document.createElement('div');
  diagram.className = 'article-diagram';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 260');
  svg.innerHTML = ethics
    ? `<g fill="none" stroke="currentColor" stroke-width="1"><circle cx="200" cy="120" r="91" opacity=".25"/><circle cx="200" cy="120" r="68" opacity=".3" stroke-dasharray="2 8"/><path d="M200 49l52 20v48c0 38-52 65-52 65s-52-27-52-65V69z" fill="var(--j-shield,#dce8df)"/><path d="M179 113l15 16 29-34" stroke-width="3"/><path d="M109 120H45m246 0h64M200 211v25" opacity=".5"/></g><g fill="currentColor"><circle cx="45" cy="120" r="4"/><circle cx="355" cy="120" r="4"/><circle cx="200" cy="236" r="4"/></g>`
    : `<g fill="none" stroke="currentColor" stroke-width="1"><path d="M65 61h73l48 65m-121 73h73l48-65m28-4 51-69h70m-121 77 51 61h70" opacity=".55"/><rect x="153" y="88" width="94" height="84" rx="20" fill="var(--j-node,#163e35)"/><rect x="38" y="36" width="52" height="50" rx="12"/><rect x="310" y="36" width="52" height="50" rx="12"/><rect x="38" y="174" width="52" height="50" rx="12"/><rect x="310" y="174" width="52" height="50" rx="12"/><path d="M55 61h18m-9-9v18m258-9h26M54 192h20m-20 12h13m252-4 8 8 16-19"/><circle class="diagram-signal" cx="138" cy="61" r="4" fill="currentColor"/><circle class="diagram-signal" cx="265" cy="199" r="4" fill="currentColor"/></g><text x="200" y="140" text-anchor="middle" fill="currentColor" font-family="sans-serif" font-size="28">AI</text>`;
  diagram.append(svg);
  const statement = document.createElement('strong');
  statement.className = 'art-statement';
  statement.textContent = ethics ? 'Progress needs principles.' : 'Intelligence, put to work.';
  const label = document.createElement('span');
  label.className = 'article-art-label';
  label.textContent = ethics
    ? 'TRANSPARENCY / FAIRNESS / ACCOUNTABILITY'
    : 'INFORMATION / INTELLIGENCE / ACTION';
  art.append(diagram, statement, label);
  return art;
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderByline(post) {
  bylineEl.replaceChildren();
  const profile = profiles[post.author];
  if (profile) {
    const photo = document.createElement('img');
    photo.src = `/assets/authors/${profile.image}`;
    photo.alt = post.author;
    photo.width = 64;
    photo.height = 64;
    photo.loading = 'eager';
    bylineEl.append(photo);
  }
  const meta = document.createElement('div');
  meta.className = 'byline-meta';
  meta.append(
    Object.assign(document.createElement('span'), { className: 'author-caption', textContent: 'Written by' }),
    Object.assign(document.createElement('strong'), { textContent: post.author }),
  );
  if (profile) {
    meta.append(Object.assign(document.createElement('span'), { className: 'author-role', textContent: profile.role }));
  }
  const stats = document.createElement('div');
  stats.className = 'byline-stats';
  const date = document.createElement('time');
  date.dateTime = post.date;
  date.textContent = formatDate(post.date);
  stats.append(date, Object.assign(document.createElement('span'), { textContent: `${post.minutes} min read` }));
  bylineEl.append(meta, stats);
}

function renderRail(post) {
  railAuthorEl.replaceChildren();
  const profile = profiles[post.author];
  if (profile) {
    const photo = document.createElement('img');
    photo.src = `/assets/authors/${profile.image}`;
    photo.alt = post.author;
    photo.width = 72;
    photo.height = 72;
    photo.loading = 'lazy';
    railAuthorEl.append(photo);
  }
  const head = document.createElement('div');
  head.append(
    Object.assign(document.createElement('strong'), { textContent: post.author }),
    Object.assign(document.createElement('span'), { textContent: profile?.role ?? 'DataServ' }),
  );
  railAuthorEl.append(
    head,
    Object.assign(document.createElement('p'), {
      textContent: profile?.blurb ?? 'Perspectives from the DataServ team.',
    }),
  );
  railDateEl.textContent = formatDate(post.date);
  railMinutesEl.textContent = `${post.minutes} minutes`;
  railTopicEl.textContent = post.category;
}

function buildToc() {
  const headings = [...bodyEl.querySelectorAll('h2')];
  tocListEl.replaceChildren();
  if (headings.length < 2) {
    tocEl.hidden = true;
    return;
  }
  headings.forEach((heading, index) => {
    const id = heading.id || `section-${index + 1}`;
    heading.id = id;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = heading.textContent.trim();
    item.append(link);
    tocListEl.append(item);
  });
  tocEl.hidden = false;
}

function bindReadProgress() {
  if (!progressBar) return;
  progressEl.hidden = false;
  const update = () => {
    const rect = articleEl.getBoundingClientRect();
    const total = articleEl.offsetHeight - window.innerHeight;
    if (total <= 0) {
      progressBar.style.width = '0%';
      return;
    }
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    progressBar.style.width = `${(scrolled / total) * 100}%`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

async function load() {
  if (!/^[\w-]+$/.test(slug)) {
    showError('Missing or invalid article. Return to the journal to pick a story.');
    return;
  }

  try {
    const response = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(35000),
    });
    if (!response.ok) throw new Error('not found');
    const { article: post } = await response.json();
    document.title = `${post.title} | Dataserv Inc. | AI-Driven Software`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && post.excerpt) desc.setAttribute('content', post.excerpt);

    categoryEl.textContent = post.category;
    titleEl.textContent = post.title;
    dekEl.textContent = post.excerpt ?? '';
    dekEl.hidden = !post.excerpt;
    heroArtEl.replaceChildren(buildHeroArt(post.category));
    renderByline(post);
    renderRail(post);
    bodyEl.innerHTML = post.contentHtml;
    buildToc();
    sourceLink.href = post.sourceUrl;
    statusEl.hidden = true;
    articleEl.hidden = false;
    bindReadProgress();
  } catch {
    showError('This article could not be loaded. Try again from the journal list.');
  }
}

load();

const origin = 'https://www.dataservinc.com';
let cached, inflight, detailSource, detailInflight;

export function localArticleUrl(slug) {
  return `/blog-article.html?slug=${encodeURIComponent(slug)}`;
}

export function parseArticleHtml(source, slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const marker = `slug:"${slug}"`;
  const start = source.indexOf(marker);
  if (start < 0) return null;
  const contentKey = source.indexOf('content:`', start);
  if (contentKey < 0 || contentKey > start + 800) return null;
  const from = contentKey + 'content:`'.length;
  let html = '';
  for (let i = from; i < source.length; i++) {
    if (source[i] === '`' && source[i - 1] !== '\\') break;
    html += source[i];
  }
  return html.trim() || null;
}

export function parsePosts(source) {
  const literal = source.match(/blogs=(\[\{slug:[\s\S]*?\}\]);/)?.[1];
  if (!literal) throw new Error('Source article format changed');
  // Convert only literal keys and booleans. Never execute downloaded code.
  const json = literal.replace(/"(?:\\.|[^"\\])*"|\b[a-zA-Z_$][\w$]*(?=:)|![01]/g, token =>
    token.startsWith('"') ? token : token === '!0' ? 'true' : token === '!1' ? 'false' : JSON.stringify(token));
  const posts = JSON.parse(json).map(p => {
    if (!/^[a-z0-9-]+$/.test(p.slug) || typeof p.title !== 'string' || !p.author?.name || !/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt)) throw new Error('Invalid article');
    return {slug:p.slug,title:p.title,excerpt:p.excerpt,author:p.author.name,date:p.publishedAt,minutes:p.readingTime,category:p.category,featured:!!p.featured,url:localArticleUrl(p.slug)};
  });
  if (!posts.length) throw new Error('No articles returned');
  return posts.sort((a,b)=>b.date.localeCompare(a.date));
}
async function read(path) {
  if (!/^\/(?:blogs\/?|(?:main|chunk)-[\w-]+\.js)$/.test(path)) throw new Error('Invalid source path');
  const response = await fetch(origin+path,{signal:AbortSignal.timeout(10000)});
  if (!response.ok) throw new Error('Source unavailable');
  return response.text();
}
async function getDetailSource() {
  if (detailSource) return detailSource;
  if (detailInflight) return detailInflight;
  detailInflight = (async () => {
    const html = await read('/blogs');
    const main = html.match(/src="(main-[\w-]+\.js)"/)?.[1];
    if (!main) throw new Error('Source entry unavailable');
    const script = await read('/' + main);
    const chunk = script.match(/path:"blogs\/:slug",loadComponent:\(\)=>import\("\.\/(chunk-[\w-]+\.js)"\)/)?.[1];
    if (!chunk) throw new Error('Blog detail source unavailable');
    detailSource = await read('/' + chunk);
    return detailSource;
  })().finally(() => {
    detailInflight = null;
  });
  return detailInflight;
}

export async function getArticle(slug) {
  const feed = await getFeed();
  const meta = feed.posts.find((p) => p.slug === slug);
  if (!meta) return null;
  const source = await getDetailSource();
  const contentHtml = parseArticleHtml(source, slug);
  if (!contentHtml) return null;
  return { ...meta, contentHtml, sourceUrl: `${origin}/blogs/${slug}` };
}

export async function getFeed() {
  if(cached && Date.now()-cached.time<60000) return cached.data;
  if(inflight) return inflight;
  inflight=(async()=>{
    const html=await read('/blogs');
    const main=html.match(/src="(main-[\w-]+\.js)"/)?.[1];
    if(!main) throw new Error('Source entry unavailable');
    const script=await read('/'+main);
    const chunk=script.match(/path:"blogs",loadComponent:\(\)=>import\("\.\/(chunk-[\w-]+\.js)"\)/)?.[1];
    if(!chunk) throw new Error('Blog source unavailable');
    const data={posts:parsePosts(await read('/'+chunk)),checkedAt:new Date().toISOString()};
    cached={time:Date.now(),data}; return data;
  })().finally(()=>{inflight=null});
  return inflight;
}
export async function feedHandler(req,res) {
  if(req.method!=='GET'){res.statusCode=405;res.end();return;}
  res.setHeader('Content-Type','application/json');
  try {const data=await getFeed();res.setHeader('Cache-Control','public, max-age=60');res.end(JSON.stringify(data));}
  catch {res.statusCode=503;res.end(JSON.stringify({error:'The source could not be refreshed.'}));}
}

export async function articleHandler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  const slug = new URL(req.url, 'http://localhost').searchParams.get('slug') ?? '';
  try {
    const article = await getArticle(slug);
    if (!article) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Article not found.' }));
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify({ article, checkedAt: new Date().toISOString() }));
  } catch {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Article could not be loaded.' }));
  }
}

function mountBlogApi(server) {
  server.middlewares.use('/api/blogs', feedHandler);
  server.middlewares.use('/api/blog', articleHandler);
}

export function blogFeedPlugin(){return {name:'dataserv-blog-feed',configureServer:mountBlogApi,configurePreviewServer:mountBlogApi}}

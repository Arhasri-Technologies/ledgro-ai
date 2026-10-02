# DataServ blog integration

The local `/blogs.html` page links to original articles on https://www.dataservinc.com/blogs. Source inspected October 1, 2026: two articles, stored as literals in the public Angular blog component; no public feed was found. Publication dates are preserved.

`server/blog-feed.mjs` follows the public main bundle to its blog component, parses the article literals without evaluating JavaScript, validates URLs, and caches successful results for 60 seconds. The UI checks on load, every five minutes while visible, on return to the tab, and on manual refresh. This is polling, not push realtime. A saved JSON snapshot is shown if refresh fails; the UI labels it honestly.

Vite development and preview register `/api/blogs`. Production requires a Node-compatible endpoint using `feedHandler`. A Vercel handler is provided in root `api/blogs.mjs`; deploy with the repository root as the project root, `npm run build` as build command, and `apps/web/dist` as output. Other hosts must mount the handler at `/api/blogs`. Static-only hosting retains the saved articles but cannot refresh them. No deployment has been performed.

The upstream bundle format can change. Failures return 503 rather than silently reporting a stale source as live. Update the adapter if the publisher introduces a CMS/feed or changes the bundle format.

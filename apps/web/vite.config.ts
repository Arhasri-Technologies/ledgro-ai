import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import { blogFeedPlugin } from './server/blog-feed.mjs'

export default defineConfig({
  plugins: [blogFeedPlugin()],
  server: { port: 5199 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        blogs: resolve(import.meta.dirname, 'blogs.html'),
        blogArticle: resolve(import.meta.dirname, 'blog-article.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        nonItConsulting: resolve(import.meta.dirname, 'non-it-consulting.html'),
        digitalMarketing: resolve(import.meta.dirname, 'digital-marketing.html'),
      },
    },
  },
})

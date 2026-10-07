import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import { blogFeedPlugin } from './server/blog-feed.mjs'

export default defineConfig({
  plugins: [blogFeedPlugin(), {
    // Unselected sibling effects use the installed ThreeUI distribution;
    // the registered Predictive Arc source stays byte-exact.
    name: 'predictive-arc-sibling-dependencies',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer?.includes('/vendor/predictive-arc/')) return null
      const sibling = source.match(/neuform-isolated\/(NeuformBatchEffects|NeuformCraftEffects|NeuformIsolatedEffects)$/)
      return sibling ? resolve(import.meta.dirname, '../../node_modules/@designcodeio/threeui/lib-dist/shaders/neuform-isolated', `${sibling[1]}.js`) : null
    },
  }],
  server: { port: 5199 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        'ai-ml': resolve(import.meta.dirname, 'ai-ml.html'),
        'ai-automation': resolve(import.meta.dirname, 'ai-automation.html'),
        'web-applications': resolve(import.meta.dirname, 'web-applications.html'),
        'mobile-apps': resolve(import.meta.dirname, 'mobile-apps.html'),
        'cloud-data': resolve(import.meta.dirname, 'cloud-data.html'),
        'api-integrations': resolve(import.meta.dirname, 'api-integrations.html'),

        appDevelopment: resolve(import.meta.dirname, 'app-development.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        blogs: resolve(import.meta.dirname, 'blogs.html'),
        blogArticle: resolve(import.meta.dirname, 'blog-article.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        nonItConsulting: resolve(import.meta.dirname, 'non-it-consulting.html'),
        digitalMarketing: resolve(import.meta.dirname, 'digital-marketing.html'),
        itConsulting: resolve(import.meta.dirname, 'it-consulting.html'),
        careerCenter: resolve(import.meta.dirname, 'career-center.html'),
        careerConnections: resolve(import.meta.dirname, 'career-connections.html'),
        hr: resolve(import.meta.dirname, 'hr.html'),
        interviewProcess: resolve(import.meta.dirname, 'interview-process.html'),
        currentOpenings: resolve(import.meta.dirname, 'current-openings.html'),
        joinOurTeam: resolve(import.meta.dirname, 'join-our-team.html'),
        ledgro: resolve(import.meta.dirname, 'ledgro.html'),
        vela: resolve(import.meta.dirname, 'vela.html'),
      },
    },
  },
})

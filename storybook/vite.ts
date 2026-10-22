import type { UserConfig } from 'vite'

export const storybookViteConfig: UserConfig = {
  build: {
    // Storybook ships prebundled preview/docs runtimes above Vite's 500 kB app budget.
    // Keep a bounded budget for the explorer without changing the demo's limit.
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      // Docs extraction and CSS generation dominate short Storybook builds.
      // Skip the relative-time advisory here; keep correctness and size warnings enabled.
      checks: { bundlerTimings: false },
      onLog(level, log, defaultHandler) {
        // Storybook runs entirely in the browser; RSC client boundaries have no effect here.
        if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('"use client"')) return
        defaultHandler(level, log)
      },
    },
  },
}

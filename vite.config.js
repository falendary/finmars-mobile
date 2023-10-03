import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	build: {
		sourcemap: true, // Source map generation must be turned on
	},
	plugins: [vue(),
		sentryVitePlugin({
			authToken: process.env.SENTRY_AUTH_TOKEN,
			org: "finmars",
			project: "mobile",
			url: "https://sentry.finmars.com/",
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	base: command === 'serve' ? '/' : (process.env.VITE_APP_PLATFORM === 'web' ? '/m/' : './'),
	test: {
		globals: true,
		environment: 'jsdom'
	}
}))

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [vue()],
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

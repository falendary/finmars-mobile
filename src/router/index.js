import { createRouter, createWebHistory } from '@ionic/vue-router'
import { Preferences } from '@capacitor/preferences'

import routes from './routes.js'
import '../keycloak.js'

let keycloak

const router = createRouter({
	history: createWebHistory(import.meta.env.VITE_BASE_URL),
	routes,
})

router.beforeEach(async (to, from) => {
	// refactor
	const region = await getRegion()
	const { value: space } = await Preferences.get({ key: 'space' })

	console.log('to.path ', to.path)

	if (to.path == '/logout') {
		Preferences.clear()

		let redirectUri = window.location.origin + router.options.history.base + '/'

		if (window.Capacitor.platform != 'web') redirectUri = 'https://finmars.com/'

		keycloak.logout({
			redirectUri,
		})

		setTimeout(() => {
			keycloak = undefined
			window.restartVueApp()
		}, 100)

		return '/'
	}

	if (to.path == '/login') {
		let res = initKeycloak(region)

		// if (res) return '/workspaces'

		return '/workspaces'
	}

	if (to.path == '/') {
		if (region && space) return '/main'
		console.log('region:', region)

		return true
	}
	if (!region) return '/'
	// if (!space && to.path != '/workspaces' && from.path != '/workspaces')
	// 	return '/workspaces'

	if (!keycloak) await initKeycloak(region)

	if (to.hash) return { path: to.path, query: to.query, hash: '' }
})

async function initKeycloak(region) {
	log.time('Keycloak init')

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

	keycloak = new Keycloak(region.keycloakOpts)

	let initOptions = {
		onLoad: 'login-required',
		timeSkew: 0,
		redirectUri:
			window.location.origin + router.options.history.base + '/workspaces',
	}
	if (window.Capacitor.platform != 'web') {
		initOptions.checkLoginIframe = false
		initOptions.adapter = 'capacitor'
		initOptions.responseMode = 'query'
		initOptions.redirectUri = 'https://finmars.com/login'
	}

	if (tokens) Object.assign(initOptions, JSON.parse(tokens))

	keycloak.onAuthSuccess = setTokens
	keycloak.onAuthRefreshSuccess = setTokens
	keycloak.onTokenExpired = refreshTokens

	await keycloak.init(initOptions)

	Preferences.set({
		key: 'username',
		value: keycloak.idTokenParsed.preferred_username,
	})

	log.timeEnd({
		key: 'Keycloak init',
		text: 'Keycloak initialized 🔐',
		place: 'api',
	})

	return true

	function setTokens() {
		console.log('keycloak.token:', keycloak.token)
		Preferences.set({
			key: 'kcTokens',
			value: JSON.stringify({
				token: keycloak.token,
				refreshToken: keycloak.refreshToken,
				idToken: keycloak.idToken,
			}),
		})
	}

	async function refreshTokens() {
		const isRefreshed = await keycloak.updateToken(5)

		if (!isRefreshed) {
			await keycloak.login()
		}
	}
}

async function getRegion() {
	let { value } = await Preferences.get({ key: 'region' })

	if (!value) return false

	return JSON.parse(value)
}

export default router

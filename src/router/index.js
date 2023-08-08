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

	console.log('to.path ', to.path );

	if (to.path == '/logout') {
		Preferences.clear()

		await keycloak.logout({
			redirectUri: window.location.origin + router.options.history.base + '/',
		})

		return false
	}
	if (to.path == '/') {
		if (region && space) return '/main'

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

	keycloak = Keycloak(region.keycloakOpts)

	keycloak.onAuthSuccess = setTokens
	keycloak.onAuthRefreshSuccess = setTokens
	keycloak.onTokenExpired = refreshTokens

	let kcOpts = {
		onLoad: 'login-required',
		timeSkew: 0,
		redirectUri: 'https://finmars.com/workspaces'
	}

	if (window.Cordova) {
		kcOpts['adapter'] = 'capacitor'
		kcOpts['responseMode'] = 'query'
		kcOpts['redirectUri'] = 'https://finmars.com/workspaces'
	}

	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))
	await keycloak.init(kcOpts)

	// console.log('keycloak.token', keycloak.token)
	// console.log('keycloak.refreshToken', keycloak.refreshToken)
	// console.log('keycloak.idToken', keycloak.idToken)

	Preferences.set({
		key: 'username',
		value: keycloak.idTokenParsed.preferred_username,
	})

	// if (keycloak.isTokenExpired(5)) await refreshTokens()

	log.timeEnd({
		key: 'Keycloak init',
		text: 'Keycloak initialized 🔐',
		place: 'api',
	})

	function setTokens() {

		// alert('setTokens: ' + keycloak.token)

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

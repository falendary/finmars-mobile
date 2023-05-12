import { createRouter, createWebHistory } from '@ionic/vue-router'
import { Preferences } from '@capacitor/preferences'
import KeycloakJs from 'keycloak-js'

import routes from './routes.js'

let keycloak
const region = await getRegion()
const { value: space } = await Preferences.get({ key: 'space' })

const router = createRouter({
	history: createWebHistory(import.meta.env.VITE_BASE_URL),
	routes,
})

router.beforeEach(async (to, from) => {
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
	if (!space && to.path != '/workspaces' && from.path != '/workspaces')
		return '/workspaces'

	if (!keycloak) await initKeycloak()

	if (to.hash) return { path: to.path, query: to.query, hash: '' }
})

async function initKeycloak() {
	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

	keycloak = new KeycloakJs(region.keycloakOpts)

	keycloak.onAuthSuccess = setTokens
	keycloak.onAuthRefreshSuccess = setTokens
	keycloak.onTokenExpired = refreshTokens
	keycloak.onReady = onReady

	let kcOpts = {
		onLoad: 'login-required',
	}
	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))

	await keycloak.init(kcOpts)

	async function onReady(authenticated) {
		// token is not expired, but it return expired. WTF keycloak?!
		if (keycloak.isTokenExpired(5)) refreshTokens()
	}

	function setTokens() {
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

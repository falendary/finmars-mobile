import { Preferences } from '@capacitor/preferences'
import router from '@/router/index.js'


async function getRegion() {
	let { value } = await Preferences.get({ key: 'region' })

	if (!value) return false

	return JSON.parse(value)
}

export async function initKeycloak() {

	const region = await getRegion()

	console.log('==== initKeycloak ==== ')

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

	window.keycloak = Keycloak(region.keycloakOpts)

	window.keycloak.onAuthSuccess = setTokens
	window.keycloak.onAuthRefreshSuccess = setTokens
	// window.keycloak.onTokenExpired = refreshTokens

	let kcOpts = {
		onLoad: 'login-required',
		checkLoginIframe: true,
		// checkLoginIframeInterval: 60, // Seconds
		timeSkew: 0, // fix bag with update token
		redirectUri: window.location.origin + router.options.history.base + '/workspaces'
	}

	if (window.Cordova) {
		kcOpts['adapter'] = 'capacitor'
		kcOpts['responseMode'] = 'query'
		kcOpts['redirectUri'] = 'https://finmars.com/workspaces'
	}

	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))

	console.log('kcOpts', kcOpts)

	await window.keycloak.init(kcOpts)

	Preferences.set({
		key: 'username',
		value: window.keycloak.idTokenParsed.preferred_username
	})

}


function setTokens() {

	// alert('setTokens: ' + keycloak.token)

	Preferences.set({
		key: 'kcTokens',
		value: JSON.stringify({
			token: window.keycloak.token,
			refreshToken: window.keycloak.refreshToken,
			idToken: window.keycloak.idToken
		})
	})
}

export async function refreshToken() {

	// alert('setTokens: ' + keycloak.token)

	return window.keycloak.updateToken().then(function() {

		Preferences.set({
			key: 'kcTokens',
			value: JSON.stringify({
				token: window.keycloak.token,
				refreshToken: window.keycloak.refreshToken,
				idToken: window.keycloak.idToken
			})
		})

		return window.keycloak.token

	})
}

// async function refreshTokens() {
//
// 	console.log('refreshTokens')
//
// 	const isRefreshed = await window.keycloak.updateToken(5)
//
// 	if (!isRefreshed) {
// 		await window.keycloak.login()
// 	}
// }

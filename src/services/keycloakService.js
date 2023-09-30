import { Preferences } from '@capacitor/preferences'
import router from '@/router/index.js'

async function getRegion() {
	let { value } = await Preferences.get({ key: 'region' })

	if (!value) return false

	return JSON.parse(value)
}

export async function initKeycloak() {

	const region = await getRegion()

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

	window.keycloak = Keycloak(region.keycloakOpts)

	window.keycloak.onAuthSuccess = setTokens
	window.keycloak.onAuthRefreshSuccess = setTokens
	// window.keycloak.onTokenExpired = refreshTokens

	let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })

	let appDestinationPath = 'workspaces'

	if (activeSpaceCode) {
		appDestinationPath = 'main/dashboard'
	}

	console.log('initKeycloak.activeSpaceCode', activeSpaceCode);
	console.log('initKeycloak.appDestinationPath', appDestinationPath);

	let kcOpts = {
		onLoad: 'login-required',
		checkLoginIframe: true,
		// checkLoginIframeInterval: 60, // Seconds
		timeSkew: 0, // fix bag with update token
		redirectUri: window.location.origin + router.options.history.base + '/' + appDestinationPath
	}

	if (window.Cordova) {

		console.log('window.Cordova', window.Cordova)

		kcOpts['adapter'] = 'capacitor'
		kcOpts['responseMode'] = 'query'
		kcOpts['redirectUri'] = 'finmars://' + appDestinationPath
	}

	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))

	// console.log('kcOpts', kcOpts)

	await window.keycloak.init(kcOpts)

	if (window.keycloak.idTokenParsed) {
		Preferences.set({
			key: 'username',
			value: window.keycloak.idTokenParsed.preferred_username
		})
	}

}

export async function logoutKeycloak() {

	var logoutOptions = { redirectUri: window.location.origin + router.options.history.base + '/welcome' }

	if (window.Cordova) {

		console.log('window.Cordova', window.Cordova)
		logoutOptions['redirectUri'] = 'finmars://welcome'
	}

	Preferences.remove({
		key: 'kcTokens'
	})

	await window.keycloak.logout(logoutOptions)


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

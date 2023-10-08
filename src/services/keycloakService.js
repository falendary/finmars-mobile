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

	console.log('region.keycloakOpts', JSON.stringify(region.keycloakOpts, null, 4));

	window.keycloak = Keycloak(region.keycloakOpts)

	window.keycloak.onAuthSuccess = setTokens
	window.keycloak.onAuthRefreshSuccess = setTokens
	// window.keycloak.onTokenExpired = refreshTokens

	let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })

	let appDestinationPath = 'welcome'

	if (activeSpaceCode) {
		appDestinationPath = 'main/dashboard'
	}

	console.log('initKeycloak.activeSpaceCode', activeSpaceCode);
	console.log('initKeycloak.appDestinationPath', appDestinationPath);

	let kcOpts = {
		onLoad: 'login-required',
		checkLoginIframe: true,
		checkLoginIframeInterval: 60, // Seconds
		timeSkew: 0, // fix bag with update token
		redirectUri: window.location.origin + router.options.history.base + '/' + appDestinationPath
	}



	if (window.Cordova) {

		console.log('window.Cordova', window.Cordova)

		kcOpts['adapter'] = 'capacitor'
		kcOpts['responseMode'] = 'query'
		kcOpts['redirectUri'] = 'finmars://' + appDestinationPath

		const platform = import.meta.env.VITE_APP_PLATFORM;

		// console.log('import.meta.env', import.meta.env);

		if (platform == 'android') {
			kcOpts['redirectUri'] = 'https://finmars.com/' + appDestinationPath
		}

	}

	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))

	// console.log('kcOpts', JSON.stringify(kcOpts, null, 4))

	await window.keycloak.init(kcOpts)

	if (window.keycloak.idTokenParsed) {
		Preferences.set({
			key: 'username',
			value: window.keycloak.idTokenParsed.preferred_username
		})
	}

	console.log("HEREE??????")

	// debugger;

}

export async function logoutKeycloak() {

	var logoutOptions = { redirectUri: window.location.origin + router.options.history.base + '/welcome' }

	if (window.Cordova) {

		console.log('window.Cordova', window.Cordova)
		logoutOptions['redirectUri'] = 'finmars://welcome'

		const platform = import.meta.env.VITE_APP_PLATFORM;

		if (platform == 'android') {
			logoutOptions['redirectUri'] = 'https://finmars.com/welcome'
		}

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


export async function clearTokens() {

	// alert('setTokens: ' + keycloak.token)

	await Preferences.remove({
		key: 'kcTokens'
	})
	await Preferences.remove({ key: 'region' })
	await Preferences.remove({ key: 'activeSpaceCode' })
	await Preferences.remove({ key: 'activeSpaceName' })

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

import { Preferences } from '@capacitor/preferences'
import router from '@/router/index.js'
import { Capacitor } from '@capacitor/core'
import Keycloak from 'keycloak-js'

async function getRegion() {
	let { value } = await Preferences.get({ key: 'region' })

	if (!value) return false

	return JSON.parse(value)
}

export async function initKeycloak() {

	const region = await getRegion()

	console.log('initKeycloak.region', region);

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

	// console.log('region.keycloakOpts', JSON.stringify(region.keycloakOpts, null, 4));

	window.keycloak = new Keycloak(region.keycloakOpts)

	window.keycloak.onAuthSuccess = setTokens
	window.keycloak.onAuthRefreshSuccess = setTokens
	// window.keycloak.onTokenExpired = refreshTokens

	let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })
	let { value: activeRealmCode } = await Preferences.get({ key: 'activeRealmCode' })

	let appDestinationPath = 'welcome'

	if (activeSpaceCode) {
		appDestinationPath = 'main/dashboard'
	}

	// console.log('initKeycloak.activeSpaceCode', activeSpaceCode);
	// console.log('initKeycloak.appDestinationPath', appDestinationPath);

	const isNative = Capacitor.isNativePlatform?.() === true;

	let kcOpts = {
		onLoad: 'login-required',
		checkLoginIframe: !isNative, // important: disable on native
		checkLoginIframeInterval: 60, // Seconds
		timeSkew: 0, // fix bag with update token
		redirectUri: window.location.origin + router.options.history.base + '/' + appDestinationPath
	}



	if (window.Cordova) {

		// console.log('window.Cordova', window.Cordova)

		kcOpts['adapter'] = 'capacitor'
		kcOpts['responseMode'] = 'query'
		// kcOpts['redirectUri'] = 'finmars://' + appDestinationPath
		kcOpts['redirectUri'] = 'capacitor://' + appDestinationPath

		const platform = import.meta.env.VITE_APP_PLATFORM;


		// console.log('import.meta.env', import.meta.env);

		if (window.Capacitor.platform == 'android') {
			kcOpts['redirectUri'] = 'https://finmars.com/' + appDestinationPath
		}

		console.log('platform', platform)
		console.log('redirectUri', kcOpts['redirectUri'])

	}

	if (tokens) Object.assign(kcOpts, JSON.parse(tokens))

	// console.log('kcOpts', JSON.stringify(kcOpts, null, 4))
	console.log('before_init');

	const authenticated = await window.keycloak.init(kcOpts);

	console.log("after init?" % authenticated)

	if (window.keycloak.idTokenParsed) {
		Preferences.set({
			key: 'username',
			value: window.keycloak.idTokenParsed.preferred_username
		})
	}


	// debugger;

}

export async function logoutKeycloak() {

	var logoutOptions = { redirectUri: window.location.origin + router.options.history.base + '/welcome' }

	if (window.Cordova) {

		// console.log('window.Cordova', window.Cordova)
		logoutOptions['redirectUri'] = 'finmars://welcome'

		const platform = import.meta.env.VITE_APP_PLATFORM;

		if (platform == 'android') {
			logoutOptions['redirectUri'] = 'https://finmars.com/welcome'
		}

	}

	window.keycloak.logout(logoutOptions);

}

function setTokens() {

	// // console.log('initKeycloak.setTokens', window.keycloak.token)

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


function buildRealmBase(region) {
	const base = region.keycloakOpts.url.replace(/\/+$/, '');
	const realm = region.keycloakOpts.realm;
	return base + '/realms/' + realm;
}

async function fetchWithTimeout(url, options, timeoutMs) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, { ...options, signal: ctrl.signal });
		return res;
	} finally {
		clearTimeout(t);
	}
}

export async function keycloakTokenHealthcheck(region, tokens, timeoutMs = 8000) {
	if (!region || !region.keycloakOpts) return false;
	if (!tokens) return false;

	const base = buildRealmBase(region);
	const userinfoUrl = base + '/protocol/openid-connect/userinfo';
	const tokenUrl = base + '/protocol/openid-connect/token';
	const clientId = region.keycloakOpts.clientId;

	// 1) Try userinfo with current access token
	try {
		const res = await fetchWithTimeout(userinfoUrl, {
			method: 'GET',
			headers: { Authorization: 'Bearer ' + tokens.token }
		}, timeoutMs);

		if (res.ok) {
			return true; // token is valid online
		}
		// if unauthorized, fall through to refresh
	} catch (_) {
		// network fail -> try refresh (maybe token expired)
	}

	// 2) Try refresh token
	if (!tokens.refreshToken) return false;

	const body = new URLSearchParams();
	body.set('grant_type', 'refresh_token');
	body.set('client_id', clientId);
	body.set('refresh_token', tokens.refreshToken);

	try {
		const res = await fetchWithTimeout(tokenUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString()
		}, timeoutMs);

		if (!res.ok) return false;

		const json = await res.json();
		if (!json.access_token || !json.refresh_token) return false;

		// 3) Save new tokens
		await Preferences.set({
			key: 'kcTokens',
			value: JSON.stringify({
				token: json.access_token,
				refreshToken: json.refresh_token,
				idToken: json.id_token || null
			})
		});

		return true;
	} catch (_) {
		return false;
	}
}

// async function refreshTokens() {
//
// 	// console.log('refreshTokens')
//
// 	const isRefreshed = await window.keycloak.updateToken(5)
//
// 	if (!isRefreshed) {
// 		await window.keycloak.login()
// 	}
// }

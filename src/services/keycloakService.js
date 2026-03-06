import { Preferences } from "@capacitor/preferences"
import router from "@/router/index.js"
import { Capacitor } from "@capacitor/core"
import Keycloak from "keycloak-js"

let keycloakInstance = null
let initPromise = null

function getPlatformInfo() {
	return {
		isNative: Capacitor.isNativePlatform(),
		platform: Capacitor.getPlatform()
	}
}

async function getJsonPreference(key, fallback = null) {
	try {
		const { value } = await Preferences.get({ key })
		if (!value) return fallback
		return JSON.parse(value)
	} catch (error) {
		console.error(`keycloakService.getJsonPreference failed for key="${key}"`, error)
		return fallback
	}
}

async function setJsonPreference(key, value) {
	try {
		await Preferences.set({
			key,
			value: JSON.stringify(value)
		})
	} catch (error) {
		console.error(`keycloakService.setJsonPreference failed for key="${key}"`, error)
		throw error
	}
}

function getRouterBase() {
	return router?.options?.history?.base || ""
}

function normalizePath(path) {
	return String(path || "").replace(/^\/+/, "")
}

function buildRedirectUri(path = "welcome") {
	const cleanPath = normalizePath(path)
	const base = getRouterBase().replace(/\/+$/, "")
	const { isNative, platform } = getPlatformInfo()

	if (!isNative) {
		return `${window.location.origin}${base}/${cleanPath}`
	}

	if (platform === "android") {
		return `https://finmars.com/${cleanPath}`
	}

	return `capacitor://${cleanPath}`
}

function buildLogoutRedirectUri() {
	return buildRedirectUri("welcome")
}

function validateRegion(region) {
	return Boolean(
		region &&
		region.keycloakOpts &&
		region.keycloakOpts.url &&
		region.keycloakOpts.realm &&
		region.keycloakOpts.clientId
	)
}

async function getRegion() {
	return getJsonPreference("region", null)
}

async function getStoredTokens() {
	return getJsonPreference("kcTokens", null)
}

async function saveTokens() {
	if (!keycloakInstance) return

	try {
		await setJsonPreference("kcTokens", {
			token: keycloakInstance.token || null,
			refreshToken: keycloakInstance.refreshToken || null,
			idToken: keycloakInstance.idToken || null
		})
	} catch (error) {
		console.error("keycloakService.saveTokens failed", error)
	}
}

async function saveUsername() {
	try {
		const username = keycloakInstance?.idTokenParsed?.preferred_username
		if (!username) return

		await Preferences.set({
			key: "username",
			value: username
		})
	} catch (error) {
		console.error("keycloakService.saveUsername failed", error)
	}
}

function attachKeycloakHandlers() {
	if (!keycloakInstance) return

	keycloakInstance.onAuthSuccess = async () => {
		console.log("keycloak.onAuthSuccess")
		await saveTokens()
		await saveUsername()
	}

	keycloakInstance.onAuthRefreshSuccess = async () => {
		console.log("keycloak.onAuthRefreshSuccess")
		await saveTokens()
	}

	keycloakInstance.onAuthLogout = async () => {
		console.log("keycloak.onAuthLogout")
		await clearTokens()
	}

	keycloakInstance.onAuthError = (errorData) => {
		console.error("keycloak.onAuthError", errorData)
	}

	keycloakInstance.onAuthRefreshError = (errorData) => {
		console.error("keycloak.onAuthRefreshError", errorData)
	}

	keycloakInstance.onTokenExpired = async () => {
		console.log("keycloak.onTokenExpired")

		try {
			await keycloakInstance.updateToken(30)
			await saveTokens()
		} catch (error) {
			console.error("keycloak.onTokenExpired refresh failed", error)
		}
	}
}

export function getKeycloak() {
	return keycloakInstance
}

export async function initKeycloak() {
	if (initPromise) return initPromise

	initPromise = (async () => {
		const region = await getRegion()

		if (!validateRegion(region)) {
			throw new Error('Missing or invalid Keycloak region configuration')
		}

		if (!keycloakInstance || typeof keycloakInstance.init !== 'function') {
			keycloakInstance = new Keycloak(region.keycloakOpts)
			attachKeycloakHandlers()
		}
		const appDestinationPath = 'login'

		const storedTokens = await getStoredTokens()

		const initOptions = {
			onLoad: 'check-sso',
			checkLoginIframe: !Capacitor.isNativePlatform(),
			checkLoginIframeInterval: 60,
			timeSkew: 0,
			redirectUri: buildRedirectUri(appDestinationPath)
		}

		if (storedTokens?.token) initOptions.token = storedTokens.token
		if (storedTokens?.refreshToken) initOptions.refreshToken = storedTokens.refreshToken
		if (storedTokens?.idToken) initOptions.idToken = storedTokens.idToken

		console.log('keycloak.init.start', {
			redirectUri: initOptions.redirectUri,
			hasStoredTokens: Boolean(storedTokens?.token && storedTokens?.refreshToken)
		})

		const authenticated = await keycloakInstance.init(initOptions)

		console.log('keycloak.init.done', { authenticated })

		if (authenticated) {
			await saveTokens()
			await saveUsername()
		}

		return authenticated
	})()

	try {
		return await initPromise
	} catch (error) {
		keycloakInstance = null
		initPromise = null
		throw error
	}
}

export async function loginKeycloak(path = null) {
	const region = await getRegion()

	if (!validateRegion(region)) {
		throw new Error("Cannot login without region configuration")
	}

	// Always initialize through the same path
	try {
		await initKeycloak()
	} catch (error) {
		console.warn("loginKeycloak.initKeycloak failed, will try direct login init", error)
	}

	// Absolute guard
	if (!keycloakInstance) {
		keycloakInstance = new Keycloak(region.keycloakOpts)
		attachKeycloakHandlers()
	}

	if (!keycloakInstance || typeof keycloakInstance.login !== "function") {
		throw new Error("Keycloak instance is not available for login")
	}

	const appDestinationPath = path || 'login'

	console.log("keycloak.login.start", {
		redirectUri: buildRedirectUri(appDestinationPath),
		hasInstance: Boolean(keycloakInstance),
		hasLoginMethod: typeof keycloakInstance?.login === "function"
	})

	const redirectUri = buildRedirectUri(appDestinationPath)

	console.log('loginKeycloak called', {
		isNative: Capacitor.isNativePlatform(),
		platform: Capacitor.getPlatform(),
		redirectUri,
		keycloakUrl: region.keycloakOpts.url,
		realm: region.keycloakOpts.realm,
		clientId: region.keycloakOpts.clientId
	})

	return keycloakInstance.login({
		redirectUri: redirectUri
	})
}

export async function logoutKeycloak() {
	if (!keycloakInstance) {
		await clearTokens()
		return
	}

	try {
		await keycloakInstance.logout({
			redirectUri: buildLogoutRedirectUri()
		})
	} catch (error) {
		console.error("keycloakService.logoutKeycloak failed", error)
		throw error
	} finally {
		keycloakInstance = null
		initPromise = null
	}
}

export async function refreshToken(minValidity = 30) {
	if (!keycloakInstance) {
		throw new Error("Keycloak is not initialized")
	}

	try {
		const refreshed = await keycloakInstance.updateToken(minValidity)

		if (refreshed) {
			await saveTokens()
		}

		return keycloakInstance.token
	} catch (error) {
		console.error("keycloakService.refreshToken failed", error)
		throw error
	}
}

export async function getValidToken(minValidity = 30) {
	if (!keycloakInstance) {
		const authenticated = await initKeycloak()
		if (!authenticated) {
			throw new Error("User is not authenticated")
		}
	}

	return refreshToken(minValidity)
}

export async function clearTokens() {
	await Preferences.remove({ key: "kcTokens" })
	await Preferences.remove({ key: "username" })
	await Preferences.remove({ key: "activeSpaceCode" })
	await Preferences.remove({ key: "activeSpaceName" })
	// keep region on purpose, so user stays in the selected region
}

function buildRealmBase(region) {
	const base = region.keycloakOpts.url.replace(/\/+$/, "")
	const realm = region.keycloakOpts.realm
	return `${base}/realms/${realm}`
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), timeoutMs)

	try {
		return await fetch(url, {
			...options,
			signal: controller.signal
		})
	} finally {
		clearTimeout(timer)
	}
}

export async function keycloakTokenHealthcheck(region, tokens, timeoutMs = 8000) {
	if (!validateRegion(region)) return false
	if (!tokens?.token) return false

	const base = buildRealmBase(region)
	const userinfoUrl = `${base}/protocol/openid-connect/userinfo`
	const tokenUrl = `${base}/protocol/openid-connect/token`
	const clientId = region.keycloakOpts.clientId

	try {
		const userInfoRes = await fetchWithTimeout(
			userinfoUrl,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${tokens.token}`
				}
			},
			timeoutMs
		)

		if (userInfoRes.ok) {
			return true
		}
	} catch (error) {
		console.warn("keycloakTokenHealthcheck.userinfo failed", error)
	}

	if (!tokens.refreshToken) return false

	const body = new URLSearchParams()
	body.set("grant_type", "refresh_token")
	body.set("client_id", clientId)
	body.set("refresh_token", tokens.refreshToken)

	try {
		const refreshRes = await fetchWithTimeout(
			tokenUrl,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: body.toString()
			},
			timeoutMs
		)

		if (!refreshRes.ok) {
			return false
		}

		const json = await refreshRes.json()

		if (!json.access_token || !json.refresh_token) {
			return false
		}

		await setJsonPreference("kcTokens", {
			token: json.access_token,
			refreshToken: json.refresh_token,
			idToken: json.id_token || null
		})

		return true
	} catch (error) {
		console.warn("keycloakTokenHealthcheck.refresh failed", error)
		return false
	}
}

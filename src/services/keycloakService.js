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
		emitAuthSuccess()
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

function ensureKeycloakInstance(region) {
	if (!keycloakInstance || typeof keycloakInstance.init !== "function") {
		keycloakInstance = new Keycloak(region.keycloakOpts)
		attachKeycloakHandlers()
	}
	return keycloakInstance
}

function emitAuthSuccess() {
	window.dispatchEvent(new CustomEvent("auth:success"))
}

export async function initKeycloak() {
	if (initPromise) return initPromise

	initPromise = (async () => {
		const region = await getRegion()

		if (!validateRegion(region)) {
			throw new Error("Missing or invalid Keycloak region configuration")
		}

		const kc = ensureKeycloakInstance(region)
		const storedTokens = await getStoredTokens()

		const initOptions = {
			onLoad: "check-sso",
			checkLoginIframe: !Capacitor.isNativePlatform(),
			checkLoginIframeInterval: 60,
			timeSkew: 0,
			redirectUri: buildRedirectUri("login")
		}

		if (storedTokens?.token) initOptions.token = storedTokens.token
		if (storedTokens?.refreshToken) initOptions.refreshToken = storedTokens.refreshToken
		if (storedTokens?.idToken) initOptions.idToken = storedTokens.idToken

		console.log("keycloak.init.start", {
			redirectUri: initOptions.redirectUri,
			hasStoredTokens: Boolean(storedTokens?.token && storedTokens?.refreshToken)
		})

		const authenticated = await kc.init(initOptions)

		console.log("keycloak.init.done", { authenticated })

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

	try {
		await initKeycloak()
	} catch (error) {
		console.warn("loginKeycloak.initKeycloak failed", error)
	}

	if (!keycloakInstance) {
		keycloakInstance = new Keycloak(region.keycloakOpts)
		attachKeycloakHandlers()
	}

	if (!keycloakInstance || typeof keycloakInstance.login !== "function") {
		throw new Error("Keycloak instance is not available for login")
	}

	const appDestinationPath = path || "login"
	const redirectUri = buildRedirectUri(appDestinationPath)

	console.log("kc before login", keycloakInstance)
	console.log("typeof kc?.login", typeof keycloakInstance?.login)

	return keycloakInstance.login({
		redirectUri
	})
}

export async function logoutKeycloak() {
	const region = await getRegion()

	if (!validateRegion(region)) {
		await clearTokens()
		return
	}

	const kc = ensureKeycloakInstance(region)

	await clearTokens()

	kc.logout({
		logoutMethod: "GET",
		redirectUri: buildLogoutRedirectUri()
	})
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


export async function clearTokens() {
	await Preferences.remove({ key: "kcTokens" })
	await Preferences.remove({ key: "username" })
	await Preferences.remove({ key: "activeSpaceCode" })
	await Preferences.remove({ key: "activeSpaceName" })
	// keep region on purpose, so user stays in the selected region
}

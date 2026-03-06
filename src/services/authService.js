import { Preferences } from '@capacitor/preferences'
import { initKeycloak, loginKeycloak, clearTokens } from '@/services/keycloakService.js'

async function getJsonPreference(key, fallback = null) {
	try {
		const { value } = await Preferences.get({ key })
		if (!value) return fallback
		return JSON.parse(value)
	} catch (error) {
		console.error(`authService.getJsonPreference failed for key="${key}"`, error)
		return fallback
	}
}

function hasKeycloakCallbackParams() {
	const url = new URL(window.location.href)

	const search = new URLSearchParams(url.search)
	const hashString = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash
	const hash = new URLSearchParams(hashString)

	const names = ['state', 'code', 'session_state', 'iss', 'error', 'error_description']

	return names.some((name) => search.has(name) || hash.has(name))
}

export async function isAuthenticatedLocally() {
	const tokens = await getJsonPreference('kcTokens', null)
	return Boolean(tokens?.token || tokens?.refreshToken)
}

export async function tryRestoreSession() {
	try {
		const authenticated = await initKeycloak()
		return authenticated === true
	} catch (error) {
		console.error('authService.tryRestoreSession failed', error)
		return false
	}
}

export async function bootstrapSession() {
	const hasLocalTokens = await isAuthenticatedLocally()
	const hasCallbackParams = hasKeycloakCallbackParams()

	// 1. Returned from Keycloak redirect, try to complete init
	if (hasCallbackParams) {
		try {
			const authenticated = await initKeycloak()

			if (authenticated) {
				cleanupAuthCallbackUrl()
				return { status: 'authenticated' }
			}

			cleanupAuthCallbackUrl()
			return { status: 'needs-login' }
		} catch (error) {
			console.error('authService.bootstrapSession callback init failed', error)
			cleanupAuthCallbackUrl()
			return { status: 'error', reason: 'callback-init-failed', error }
		}
	}

	// 2. Existing local session, try to restore
	if (hasLocalTokens) {
		const restored = await tryRestoreSession()

		if (restored) {
			return { status: 'authenticated' }
		}

		await clearTokens()
		return { status: 'needs-login' }
	}

	// 3. First open, no remembered session
	return { status: 'needs-login' }
}

export async function startLoginFlow(path = null) {
	return loginKeycloak(path)
}

export async function routeAfterAuth(router) {
	const { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })

	if (activeSpaceCode) {
		await router.replace('/main/dashboard')
		return
	}

	await router.replace('/workspaces')
}

export function cleanupAuthCallbackUrl() {
	try {
		const url = new URL(window.location.href)
		const cleanUrl = `${url.origin}${url.pathname}`
		window.history.replaceState(null, '', cleanUrl)
	} catch (error) {
		console.error('authService.cleanupAuthCallbackUrl failed', error)
	}
}

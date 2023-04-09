import KeycloakJs from 'keycloak-js'
import { Preferences } from '@capacitor/preferences'

export default {
  async install(app, opts = {}) {
		const keycloak = new KeycloakJs({
			url: opts.url || import.meta.env.VITE_KEYCLOAK_URL,
			realm: opts.realm || import.meta.env.VITE_KEYCLOAK_REALM,
			clientId: opts.clientId || import.meta.env.VITE_KEYCLOAK_CLIENT_ID
		})

		keycloak.onAuthSuccess = setTokens
		keycloak.onAuthRefreshSuccess = setTokens
		keycloak.onTokenExpired = refreshTokens
		keycloak.onReady = onReady

    app.provide('keycloak', keycloak)

		async function onReady(authenticated) {
			// token is not expired, but it return expired. WTF keycloak?!
			if ( keycloak.isTokenExpired() ) await refreshTokens() 
		
			if ( app.config.globalProperties.$route.hash.includes('#state=') ) 
				app.config.globalProperties.$router.push({hash: ''})
		}
		
		async function setTokens() {
			await Preferences.set({
				key: 'kcTokens', 
				value: JSON.stringify({
					token: keycloak.token,
					refreshToken: keycloak.refreshToken,
					idToken: keycloak.idToken,
				})
			})
		}
		
		async function refreshTokens() {
			const isRefreshed = await keycloak.updateToken()
		
			if ( !isRefreshed ) {
				await keycloak.login()
			}
		}
  }
}


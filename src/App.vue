<template>
	<ion-app>
		<Suspense>
			<ion-router-outlet id="main-content" />
		</Suspense>
	</ion-app>
</template>

<script setup>
	import { IonApp, IonRouterOutlet } from '@ionic/vue'

	import { App } from '@capacitor/app';
	import { useRouter } from 'vue-router'
	import { Preferences } from '@capacitor/preferences'

	const router = useRouter()

	App.addListener('appUrlOpen', async (event) => {

		// alert('App opened with URL: ' + event);

		console.log('event.url', event.url);

		const slug = event.url.split('https://finmars.com')[1]

		// alert('slug: ' + slug)

		if (slug) {
			// history.push(slug);
			// TODO posibly refactor, remove duplicatino
			// async function initKeycloak(region) {
			//
			// 	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
			//
			// 	var keycloak = Keycloak(region.keycloakOpts)
			//
			// 	let kcOpts = {
			// 		onLoad: 'login-required',
			// 		timeSkew: 0,
			// 		redirectUri: 'https://finmars.com/workspaces'
			// 	}
			//
			// 	if (window.Cordova) {
			// 		kcOpts['adapter'] = 'capacitor'
			// 		kcOpts['responseMode'] = 'query'
			// 		kcOpts['redirectUri'] = 'https://finmars.com/main'
			// 	}
			//
			// 	await keycloak.init(kcOpts)
			//
			//
			// 	console.log('keycloak.token', keycloak.token)
			// 	console.log('keycloak.refreshToken', keycloak.refreshToken)
			// 	console.log('keycloak.idToken', keycloak.idToken)
			//
			// 	Preferences.set({
			// 		key: 'username',
			// 		value: keycloak.idTokenParsed.preferred_username,
			// 	})
			//
			// 	Preferences.set({
			// 		key: 'kcTokens',
			// 		value: JSON.stringify({
			// 			token: keycloak.token,
			// 			refreshToken: keycloak.refreshToken,
			// 			idToken: keycloak.idToken,
			// 		}),
			// 	})
			//
			// }
			//
			// async function getRegion() {
			// 	let { value } = await Preferences.get({ key: 'region' })
			//
			// 	if (!value) return false
			//
			// 	return JSON.parse(value)
			// }
			//
			// const region = await getRegion()
			//
			// await initKeycloak(region)

			router.push(slug)



		}

	})

</script>

<style lang="scss" scoped></style>

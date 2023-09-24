<template>
	<ion-app>
		<Suspense>
			<ion-router-outlet id="main-content" />
		</Suspense>
	</ion-app>
</template>

<script setup>
	import { IonApp, IonRouterOutlet } from '@ionic/vue'
	import { onMounted } from 'vue'

	import { App } from '@capacitor/app'
	import { useRouter } from 'vue-router'
	import { Preferences } from '@capacitor/preferences'
	import { initKeycloak } from '@/services/keycloakService.js'

	const router = useRouter()

	// App.addListener('appUrlOpen', async (event) => {
	// 	console.log('event.url', event.url)

	// 	const slug = event.url.split('https://finmars.com')[1]
	// })

	onMounted(async () => {
		let { value: tokens } = await Preferences.get({ key: 'kcTokens' })

		// console.log('onMounted.tokens', tokens);

		if (tokens) {

			await initKeycloak()
			router.push('/workspaces')
		} else {

			if (window.location.href.indexOf('state=')) {
				await initKeycloak()
				router.push('/workspaces')
			}

		// 	user should pick region and after that login
		}

	});

</script>

<style lang="scss" scoped></style>

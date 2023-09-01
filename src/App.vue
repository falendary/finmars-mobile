<template>
	<ion-app>
		<Suspense>
			<ion-router-outlet id="main-content" />
		</Suspense>
	</ion-app>
</template>

<script setup>
	import { IonApp, IonRouterOutlet } from '@ionic/vue'

	import { App } from '@capacitor/app'
	import { useRouter } from 'vue-router'
	import { Preferences } from '@capacitor/preferences'

	const router = useRouter()

	// App.addListener('appUrlOpen', async (event) => {
	// 	console.log('event.url', event.url)

	// 	const slug = event.url.split('https://finmars.com')[1]
	// })
</script>

<style lang="scss" scoped></style>

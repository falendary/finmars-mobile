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

	App.addListener('appUrlOpen', (event) => {

		console.log('App opened with URL: ' + event);

	})

</script>

<style lang="scss" scoped></style>

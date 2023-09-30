<template>
	<ion-app>
		<Suspense>
			<ion-router-outlet id="main-content"  />
		</Suspense>
	</ion-app>
</template>

<script setup>
	import { IonApp, IonRouterOutlet } from '@ionic/vue'
	import { onMounted, ref } from 'vue'

	import { App } from '@capacitor/app'
	import { useRouter } from 'vue-router'
	import { Preferences } from '@capacitor/preferences'
	import { initKeycloak } from '@/services/keycloakService.js'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import useStore from '@/composables/useStore.js'

	const router = useRouter()

	const processing = ref(false)

	// App.addListener('appUrlOpen', async (event) => {
	// 	console.log('event.url', event.url)

	// 	const slug = event.url.split('https://finmars.com')[1]
	// })

	onMounted(async () => {

		let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
		let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })


		// console.log('onMounted.tokens', tokens);

		if (tokens) {

			console.log("Has tokens in Storage, trying to reinit Keycloak")

			processing.value = true

			await initKeycloak()

			processing.value = false



			if (activeSpaceCode) {
				router.push('/main/dashboard')
			} else {
				router.push('/workspaces')
			}


		} else {


			if (window.location.href.indexOf('state=') !== -1) {

				console.log("Probably got redirect from keycloak, trying to parse query parameters")


				processing.value = true
				await initKeycloak()
				processing.value = false
				if (activeSpaceCode) {
					router.push('/main/dashboard')
				} else {
					router.push('/workspaces')
				}
			} else {
				console.log("Nothing, its first open, wait until user select region")
			}

		// 	user should pick region and after that login
		}

	});

</script>

<style lang="scss">

	#main-content {
		//padding: 12px;
		padding-left: env(safe-area-inset-left);
		padding-right: env(safe-area-inset-right);
	}

	.safe--area, .ion-page {
		–padding-top: var(–ion-safe-area-top, 0);
		padding-top: env(safe-area-inset-top);
		--ion-safe-area-top: 20px;
		--ion-safe-area-bottom: 20px;
	}

	.text-center {
		text-align: center;
	}

	.text-error {
		color: crimson;
	}
	.text-fs-extra-small {
		font-size: 0.5rem;
	}

	.text-fs-small {
		font-size: 0.75rem;
	}

	.text-fs-normal {
		font-size: 1rem;
	}

	.text-fs-big {
		font-size: 1.1rem;
	}

	.finmars-button-text {
		--background: none;
		--padding: 0;
		--color: #000;
		--box-shadow: none;
		--margin: 0;
		--margin-top: 0;
		margin-top: 0 !important;
	}
	.display-flex {
		display: flex;
	}

	.align-center  {
		align-items: center;

	}

	.justify-center {
		justify-content: center;
	}

	.p-t-2rem {
		padding-top: 2rem;
	}

	.height-100 {
		height: 100vh;
	}

	ion-content {
		--background: transparent;
	}

</style>

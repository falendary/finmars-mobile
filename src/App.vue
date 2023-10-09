<template>
	<ion-app>

		<ion-header >
			<ion-toolbar v-if="isOffline && showOfflineBar" color="danger">
				<ion-title>Connection Offline</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="showOfflineBar = false;">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<Suspense v-show="!store.globalProcessing">

			<ion-router-outlet id="main-content" />


		</Suspense>


		<div v-show="store.globalProcessing" class="display-flex align-center justify-center height-100">
			<progress-circular bg="black" diameter="90"></progress-circular>
		</div>

	</ion-app>
</template>

<script>
	import { IonApp, IonButton, IonButtons, IonRouterOutlet } from '@ionic/vue'
	import { Preferences } from '@capacitor/preferences'
	import { initKeycloak } from '@/services/keycloakService.js'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { Suspense } from 'vue'
	import { Network } from '@capacitor/network'
	import useStore from '@/composables/useStore.js'

	export default {
		components: {
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},

		data() {
			return {
				processing: false,
				showOfflineBar: true,
				isOffline: false,
				store: null
			}
		},
		methods: {
			async initializeDarkTheme() {

				let { value: darkTheme } = await Preferences.get({ key: 'darkTheme' })

				console.log('from store darkTheme', darkTheme)

				let isDark = false

				if (darkTheme === 'true') {
					isDark = true
				} else if (darkTheme === 'false') {
					isDark = false
				} else {
					const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

					if (prefersDark) {
						isDark = true
					}
				}
				document.body.classList.toggle('dark', isDark)

			},
			async updateNetworkStatus() {
				const status = await Network.getStatus();
				this.isOffline = !status.connected;
			}
		},
		async created() {

			this.store = useStore()

			let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
			let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })

			this.initializeDarkTheme();


			this.store.globalProcessing = true

			if (tokens) {

				console.log('APP_INIT: Has tokens in Storage, trying to reinit Keycloak')

				try {
					await initKeycloak()

					this.store.globalProcessing = false

					if (activeSpaceCode) {

						console.log("APP_INIT: has activeSpaceCode. redirect to dashboard")

						this.$router.push('/main/dashboard');
						// if (this.$router.currentRoute.path === '/login') {
						// 	console.log("APP_INIT: On login page. Redirecting to dashboard");
						// 	this.$router.push('/main/dashboard');
						// } else {
						// 	console.log("APP_INIT: Not on login page. No redirection needed.");
						// }

					} else {

						console.log("APP_INIT: has activeSpaceCode. redirect to workspaces")

						this.$router.push('/workspaces')
					}

					console.log('this.store.globalProcessing', this.store.globalProcessing);

				} catch (e) {

					console.log('APP_INIT: keycloak.error', e)

					await Preferences.remove({ key: 'kcTokens' })

					this.$router.push('/welcome')

				}


			} else {

				if (window.location.href.indexOf('state=') !== -1) {

					console.log('APP_INIT: Probably got redirect from keycloak, trying to parse query parameters')

					this.store.globalProcessing = true
					await initKeycloak()
					this.store.globalProcessing = false
					if (activeSpaceCode) {
						this.$router.push('/main/dashboard')
					} else {
						this.$router.push('/workspaces')
					}
				} else {

					console.log('APP_INIT: Nothing, its first open, wait until user select region. Keycloak IS NOT INITED')

					this.$router.push('/welcome')

				}

				// 	user should pick region and after that login
			}

			this.store.globalProcessing = false

		},
		mounted() {
			this.updateNetworkStatus();

			Network.addListener('networkStatusChange', (status) => {
				this.isOffline = !status.connected;

				if (this.isOffline) {
					this.showOfflineBar = true;
				}
			});
		}
	}

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

	ion-modal {
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

	.flex-end {
		justify-content: end;
	}

	.flex-align-center {
		align-items: center;
	}

	.align-center {
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

	ion-app ion-content {

		--dot-size: 1px;
		--dot-space: 22px;
		--background: var(--ion-content-background), linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space), linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space), var(--dot-color);
	}

	ion-modal ion-content {
		--background: var(--ion-card-background);
	}

	.text-nowrap {
		white-space: nowrap;
	}

	.header {
		padding: 0 15px;
		//color: #747474;
		color: var(--ion-text-color);
		font-weight: 400;
		//font-size: 20px;
		font-size: 1.1rem;
		margin-bottom: 15px;
		opacity: .8;
	}

	.item-icon {
		width: 2rem;
		min-width: 2rem;
		overflow: hidden;
		text-align: center;
		margin-right: 0.4rem;
	}


	.item-icon-icon {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: #fff;
		color: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		font-size: 1.2rem;
	}

	.selectable {
		user-select: text !important;
		-webkit-user-select: text !important;
		-moz-user-select: text !important;
		-ms-user-select: text !important;
	}

</style>

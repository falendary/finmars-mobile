<template>
	<ion-app>

		<global-error-toast></global-error-toast>

		<Passcode v-if="showPasscode" @verified="showPasscode = false;"></Passcode>

<!--		<ion-header v-if="isOffline && showOfflineBar && ">-->
<!--			<ion-toolbar  color="danger">-->
<!--				<ion-title>Connection Offline</ion-title>-->
<!--				<ion-buttons slot="end">-->
<!--					<ion-button @click="showOfflineBar = false;">Close</ion-button>-->
<!--				</ion-buttons>-->
<!--			</ion-toolbar>-->
<!--		</ion-header>-->

		<ion-header v-if="connectionError">
			<ion-toolbar  color="danger">
				<p style="margin: 0; font-size: .7rem; padding-left: 1rem;">
					Network Error, Please Try Again Later
				</p>
				<ion-buttons slot="end">
					<ion-button @click="connectionError = false;">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<div v-show="!store.globalProcessing && !showPasscode">
			<ion-router-outlet id="main-content" :class="{ 'app-blurred': isBlurred }" />
		</div>

		<div v-show="store.globalProcessing" class="display-flex align-center justify-center height-100">
			<ion-button class="global-process-close-button" @click="goToRecovery()" v-show="showRecoveryButton">Recovery
			</ion-button>
			<progress-circular bg="black" diameter="90"></progress-circular>
		</div>

	</ion-app>
</template>

<script>
	import { IonApp, IonButton, IonButtons, IonRouterOutlet, toastController } from '@ionic/vue'
	import { Preferences } from '@capacitor/preferences'
	import { initKeycloak } from '@/services/keycloakService.js'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { Suspense } from 'vue'
	import { Network } from '@capacitor/network'
	import useStore from '@/composables/useStore.js'
	import { App } from '@capacitor/app'
	import Passcode from '@/components/Passcode.vue'
	import GlobalErrorToast from '@/components/GlobalErrorToast.vue'
	import useApi from '@/composables/useApi.js'

	export default {
		components: {
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode,
			GlobalErrorToast
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},

		data() {
			return {
				processing: false,
				showOfflineBar: true,
				isOffline: false,
				store: null,
				isBlurred: false,
				showPasscode: false,
				backgroundTimestamp: null,
				showRecoveryButton: false,
				recoveryTimeout: null,
				connectionError: false
			}
		},
		methods: {
			async initializeDarkTheme() {

				let { value: darkTheme } = await Preferences.get({ key: 'darkTheme' })

				// console.log('from store darkTheme', darkTheme)

				let isDark = false

				if (darkTheme === 'true') {
					isDark = true
				} else if (darkTheme === 'false') {
					isDark = false
				} else {

					if (window.matchMedia) {
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

						if (prefersDark.matches) {
							isDark = true
						}
					}
				}

				if (isDark) {
					document.body.classList.toggle('dark', isDark)
				}

			},
			async updateNetworkStatus() {
				const status = await Network.getStatus()
				this.isOffline = !status.connected
			},
			async verifyPasscode() {

				let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
				let { value: savedPasscode } = await Preferences.get({ key: 'passcode' })

				if (savedPasscode && tokens) { // only if we logged in and passcode is setted up
					this.showPasscode = true
				}
			},
			async handleAppStateChange(state) {

				const currentTimestamp = new Date().getTime()

				// state.isActive will be true if the app is in the foreground
				if (state.isActive) {

					if (this.backgroundTimestamp) {
						const timeDifference = currentTimestamp - this.backgroundTimestamp
						if (timeDifference >= 60000) { // 1 minute in milliseconds
							await this.verifyPasscode()
						}
					} else {
						await this.verifyPasscode()
					}

					this.isBlurred = false

					// Trigger your Passcode modal here
				} else {

					this.backgroundTimestamp = currentTimestamp
					this.isBlurred = true

				}
			},
			async goToRecovery() {
				this.store.globalProcessing = false
				this.$router.replace('/recovery')
			},
			async doHealthcheck() {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 1000); // Set timeout for 1 second

				try {
					// Pass the signal to your fetch call
					let data = await useApi('authorizerPing.get', { signal: controller.signal });
					// console.log('doHealthcheck.results', data);

					clearTimeout(timeoutId); // Clear the timeout if the request finishes in time

					let hasError = this.connectionError;

					if (data.error) {
						this.connectionError = true;
					} else {
						this.connectionError = false;

						if (hasError) {
							const toast = await toastController.create({
								message: 'The connection is restored',
								duration: 1500,
								position: 'top',
							});

							await toast.present();
						}
					}
				} catch (error) {
					clearTimeout(timeoutId); // Clear the timeout in case of an error

					if (error.name === 'AbortError') {
						// console.log('Request was aborted after 1 second');
						this.connectionError = true;
					} else {
						// Handle other errors
						console.error('Failed to perform health check:', error);
						this.connectionError = true;
					}
				}
			},
			resetRecoveryButtonTimer() {
				// Clear any existing timeout
				if (this.recoveryTimeout) {
					clearTimeout(this.recoveryTimeout)
				}

				// console.log('resetRecoveryButtonTimer', this.store.globalProcessing)

				// Set a new timeout if globalProcessing is true
				if (this.store.globalProcessing) {
					this.recoveryTimeout = setTimeout(() => {
						this.showRecoveryButton = true
					}, 5 * 1000) // 5 seconds delay
				} else {
					// If globalProcessing is not true, hide the button immediately
					this.showRecoveryButton = false
				}
			},
			async checkAuth() {

				let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
				let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })

				if (tokens) {

					// console.log('APP_INIT: Has tokens in Storage, trying to reinit Keycloak')

					try {
						await initKeycloak()

						this.store.globalProcessing = false

						if (activeSpaceCode) {
							// console.log('APP_INIT: has activeSpaceCode. redirect to dashboard')
							this.$router.replace('/main/dashboard')
						} else {
							// console.log('APP_INIT: has activeSpaceCode. redirect to workspaces')
							this.$router.replace('/workspaces')
						}

					} catch (e) {

						// console.log('APP_INIT: keycloak.error', e)
						await Preferences.remove({ key: 'kcTokens' })
						this.$router.replace('/welcome')

					}


				} else {

					// console.log('APP_INIT: no tokens in Storage, trying to parse query parameters')

					if (window.location.href.indexOf('state=') !== -1) {

						this.isBlurred = false

						// console.log('APP_INIT: Probably got redirect from keycloak, trying to parse query parameters')

						this.store.globalProcessing = true
						await initKeycloak()
						this.store.globalProcessing = false
						if (activeSpaceCode) {
							this.$router.replace('/main/dashboard')
						} else {
							this.$router.replace('/workspaces')
						}

					} else {

						// console.log('APP_INIT: Nothing, its first open, wait until user select region. Keycloak IS NOT INITED')

						if (this.$route.path !== '/welcome') {
							this.$router.replace('/welcome')
						}

					}
				}

			}
		},
		async created() {

			this.store = useStore()

			await this.initializeDarkTheme()


			this.store.globalProcessing = true

			this.resetRecoveryButtonTimer()

			await this.checkAuth()

			this.store.globalProcessing = false

			await this.verifyPasscode()

			this.doHealthcheck()

			this.globalInternval = setInterval(() => {
				this.isBlurred = false;
				this.resetRecoveryButtonTimer()
				this.doHealthcheck()
			}, 15 * 1000) // do healthcheck every 10 seconds

		},
		mounted() {
			// this.updateNetworkStatus()

			// this.showPasscode = true; // for debug purpose

			// Network.addListener('networkStatusChange', (status) => {
			// 	this.isOffline = !status.connected
			//
			// 	if (this.isOffline) {
			// 		this.showOfflineBar = true
			// 	}
			// })

			App.addListener('appStateChange', this.handleAppStateChange)


		},
		beforeUnmount() {
			// Clean up listeners when component is destroyed
			App.removeAllListeners()
			if (this.recoveryTimeout) {
				clearTimeout(this.recoveryTimeout)
			}

			if (this.globalInternval) {
				clearInterval(this.globalInternval)
			}
		}
	}

</script>

<style lang="scss">

	body {
		--background: #000;
	}

	.app-blurred {
		filter: blur(1rem);
		pointer-events: none; /* Prevent interactions while blurred */
	}

	#main-content {
		//padding: 12px;
		padding-left: env(safe-area-inset-left);
		padding-right: env(safe-area-inset-right);
	}

	.safe--area {
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
		//--background: var(--ion-content-background), linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space), linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space), var(--dot-color);
		--background: var(--ion-content-background);
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

	.black-space-page {
		--background: #000;
		background: #000;
		position: relative;
		color: #fff;
	}

	.header-with-period-type-picker {
		display: flex;
		justify-content: space-between;
		align-items: center;

	}

	.global-process-close-button {
		position: fixed;
		bottom: 1rem;
		margin: 0 auto;
	}


</style>

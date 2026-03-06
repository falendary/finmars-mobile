<template>
	<ion-app>

		<global-error-toast></global-error-toast>

		<Passcode v-if="showPasscode" @verified="showPasscode = false;"></Passcode>

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
			<progress-circular diameter="90"></progress-circular>
		</div>

	</ion-app>
</template>

<script>
	import { IonApp, IonButton, IonButtons, IonRouterOutlet, toastController } from '@ionic/vue'
	import { Preferences } from '@capacitor/preferences'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { App as CapacitorApp } from '@capacitor/app'
	import Passcode from '@/components/Passcode.vue'
	import GlobalErrorToast from '@/components/GlobalErrorToast.vue'
	import useStore from '@/composables/useStore.js'
	import { isAuthenticatedLocally } from '@/services/authService.js'

	export default {
		components: {
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			IonApp,
			Passcode,
			GlobalErrorToast
		},

		data() {
			return {
				store: null,
				isBlurred: false,
				showPasscode: false,
				backgroundTimestamp: null,
				showRecoveryButton: false,
				recoveryTimeout: null,
				connectionError: false,
				appStateListenerHandle: null,
				onlineHandler: null,
				offlineHandler: null,
				globalInterval: null
			}
		},

		methods: {
			async initializeDarkTheme() {
				const { value: darkTheme } = await Preferences.get({ key: 'darkTheme' })

				let isDark = false

				if (darkTheme === 'true') {
					isDark = true
				} else if (darkTheme === 'false') {
					isDark = false
				} else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
					isDark = true
				}

				document.body.classList.toggle('dark', isDark)
			},

			async handleConnectivityChange(isConnected) {
				if (!isConnected) {
					const toast = await toastController.create({
						message: 'You are offline. Check your internet connection.',
						duration: 3000,
						position: 'top',
						color: 'danger',
					})
					await toast.present()
				} else if (this.connectionError) {
					const toast = await toastController.create({
						message: 'Internet connection restored.',
						duration: 1500,
						position: 'top',
						color: 'success',
					})
					await toast.present()
				}

				this.connectionError = !isConnected
			},

			async verifyPasscode() {
				const { value: savedPasscode } = await Preferences.get({ key: 'passcode' })
				const authenticated = await isAuthenticatedLocally()

				if (savedPasscode && authenticated) {
					this.showPasscode = true
				}
			},

			async handleAppStateChange(state) {
				const currentTimestamp = Date.now()

				if (state.isActive) {
					if (this.backgroundTimestamp) {
						const timeDifference = currentTimestamp - this.backgroundTimestamp
						if (timeDifference >= 60000) {
							await this.verifyPasscode()
						}
					} else {
						await this.verifyPasscode()
					}

					this.isBlurred = false
				} else {
					this.backgroundTimestamp = currentTimestamp
					this.isBlurred = true
				}
			},

			async goToRecovery() {
				this.store.globalProcessing = false
				await this.$router.replace('/recovery')
			},

			resetRecoveryButtonTimer() {
				if (this.recoveryTimeout) {
					clearTimeout(this.recoveryTimeout)
				}

				if (this.store.globalProcessing) {
					this.recoveryTimeout = setTimeout(() => {
						this.showRecoveryButton = true
					}, 5000)
				} else {
					this.showRecoveryButton = false
				}
			},

			async runLegacyRegionCleanup() {
				try {
					const { value } = await Preferences.get({ key: 'region' })
					const region = value ? JSON.parse(value) : null

					if (region && region.domain === 'https://finmars.com') {
						await Preferences.remove({ key: 'region' })
						await Preferences.remove({ key: 'activeRealmCode' })
						await Preferences.remove({ key: 'activeSpaceCode' })
						await Preferences.remove({ key: 'activeSpaceName' })
						await Preferences.remove({ key: 'passcode' })

						window.location.href = '/welcome'
					}
				} catch (error) {
					console.error('runLegacyRegionCleanup failed', error)
				}
			},

			installConnectivityListeners() {
				this.onlineHandler = () => this.handleConnectivityChange(true)
				this.offlineHandler = () => this.handleConnectivityChange(false)

				window.addEventListener('online', this.onlineHandler)
				window.addEventListener('offline', this.offlineHandler)
				this.handleConnectivityChange(navigator.onLine)
			}
		},

		async created() {
			this.store = useStore()

			await this.runLegacyRegionCleanup()
			await this.initializeDarkTheme()
			this.installConnectivityListeners()

			this.globalInterval = setInterval(() => {
				this.isBlurred = false
				this.resetRecoveryButtonTimer()
			}, 15000)
		},

		async mounted() {
			this.appStateListenerHandle = await CapacitorApp.addListener(
				'appStateChange',
				this.handleAppStateChange
			)

			await this.verifyPasscode()
		},

		beforeUnmount() {
			if (this.onlineHandler) {
				window.removeEventListener('online', this.onlineHandler)
			}

			if (this.offlineHandler) {
				window.removeEventListener('offline', this.offlineHandler)
			}

			if (this.appStateListenerHandle) {
				this.appStateListenerHandle.remove()
			}

			if (this.recoveryTimeout) {
				clearTimeout(this.recoveryTimeout)
			}

			if (this.globalInterval) {
				clearInterval(this.globalInterval)
			}
		}
	}
</script>

<style lang="scss">

	ion-toolbar {
		--background: var(--page-background-color);
	}

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

<template>
	<ion-page>

		<ion-content>

			<div class="header flex sb aic">
				<div class="text-center" style="width: 100%;">More</div>
			</div>

			<h3 style="padding-left: 1rem">General</h3>
			<div style="padding: 0 1rem; font-size: .7rem;">
				<div>Current Space: {{ workspace }}</div>
				<div>User: {{ username }}</div>
			</div>

			<h3 style="padding-left: 1rem">Security</h3>
			<ion-button
				class="ion-margin-horizontal logout"
				fill="outline"
				expand="block"
				@click="setupPasscode()"
			>
				Setup Passcode
			</ion-button>

			<h3 style="padding-left: 1rem">Recovery</h3>
			<p style="padding: 0 1rem; font-size: .7rem">If something went wrong you can proceed to Recovery Page. It will
				reset app</p>
			<ion-button
				class="ion-margin-horizontal logout"
				fill="outline"
				expand="block"
				@click="recovery()"
			>
				Recovery
			</ion-button>


			<h3 style="padding-left: 1rem">Interface</h3>
			<div style="padding: 1rem">
				<ion-toggle :checked="isDarkTheme" @ionChange="themeToggleChange($event)" justify="space-between"
				>Dark Mode
				</ion-toggle>
			</div>

			<h3 style="padding-left: 1rem">Other</h3>

			<ion-button
				class="ion-margin-horizontal"
				fill="outline"
				expand="block"
				v-if="spaceStore.settings.general.period_type !== 'custom'"
				:disabled="isCalculateButtonDisabled"
				@click="calculate()"
			>
				Calculate
			</ion-button>

			<div v-if="spaceStore.settings.general.period_type === 'custom'">
				Not supported for <b>Custom</b>
			</div>


			<ion-button
				class="ion-margin-horizontal"
				fill="outline"
				expand="block"
				@click="changeSpace()"
			>
				Change Space
			</ion-button>

			<ion-button
				class="ion-margin-horizontal"
				fill="outline"
				expand="block"
				@click="clearRegions()"
			>
				Clear Regions
			</ion-button>

			<ion-button style="margin-top: 8rem; margin-bottom: 4rem;"
									class="ion-margin-horizontal logout"
									fill="outline"
									expand="block"
									@click="logout()"
			>
				Logout
			</ion-button>

		</ion-content>
	</ion-page>
</template>

<script>
	import {
		alertController,
		IonButton,
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonModal,
		IonPage,
		IonRefresher,
		IonRefresherContent,
		IonToggle,
		IonToolbar
	} from '@ionic/vue'

	import { computed } from 'vue'
	import ComplexTransactionList from '@/components/ComplexTransactionList.vue'
	import useStore from '@/composables/useStore'
	import { Preferences } from '@capacitor/preferences'
	import useApi from '@/composables/useApi.js'

	export default {
		components: {
			IonToggle,
			IonButton,
			IonRefresherContent,
			IonRefresher,
			IonHeader,
			IonPage,
			IonToolbar,
			IonModal, IonDatetimeButton, IonDatetime,
			ComplexTransactionList
		},
		data() {
			return {
				spaceStore: null,
				transactionsOpts: null,
				processing: false,
				workspace: null,
				username: null,
				isDarkTheme: false,
				isCalculateButtonDisabled: false
			}
		},
		methods: {
			async calculate() {

				this.isCalculateButtonDisabled = true

				this.spaceStore.settings.general.portfolios.forEach((portfolio) => {

					useApi('portfolioHistoryCalculate.post', {
						body: {
							'portfolio': portfolio,
							'currency': this.spaceStore.settings.general.currency,
							'pricing_policy': this.spaceStore.settings.general.pricing_policy,
							'date': this.spaceStore.settings.general.date_to,
							'segmentation_type': 'business_days_end_of_months',
							'period_type': this.spaceStore.settings.general.period_type,
							'cost_method': 'avco', // avco
							'performance_method': 'modified_dietz',
							'benchmark': 'sp_500'
						}
					})

				})

				setTimeout(() => {
					this.isCalculateButtonDisabled = false
				}, 20000)

				const alert = await alertController.create({
					header: 'Calculation is in progress',
					message: 'Please, wait for a few minutes and refresh the page',
					buttons: ['Ok']
				})

				await alert.present()

			},
			toggleDarkTheme(shouldAdd) {

				// console.log('shouldAdd', shouldAdd)

				document.body.classList.toggle('dark', shouldAdd)

				Preferences.set({ key: 'darkTheme', value: shouldAdd.toString() })

				this.isDarkTheme = shouldAdd

			},
			themeToggleChange(ev) {

				// console.log('themeToggleChange', ev)

				this.toggleDarkTheme(ev.detail.checked)
			},

			async logout() {
				this.$router.replace('/logout')
			},
			async setupPasscode() {
				this.$router.push('/setup-passcode')
			},
			async recovery() {

				this.$router.replace('/recovery')
			},

			async clearRegions() {

				// console.log('clearRegions?', alertController)

				await Preferences.remove({ key: 'custom_regions' })

				const alert = await alertController.create({
					header: 'Custom Regions are cleared',
					message: 'On next login you will see only default regions',
					buttons: ['Ok']
				})

				await alert.present()

			},
			changeSpace() {
				this.$router.replace('/workspaces')

			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

			let { value } = await Preferences.get({ key: 'activeSpaceCode' })
			this.workspace = value

			let { value: valUser } = await Preferences.get({ key: 'username' })
			this.username = valUser

			let { value: darkTheme } = await Preferences.get({ key: 'darkTheme' })

			if (darkTheme === 'true') {
				this.isDarkTheme = true
			} else if (darkTheme === 'false') {
				this.isDarkTheme = false
			} else {

				if (window.matchMedia) {
					const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

					if (prefersDark.matches) {
						this.isDarkTheme = true
					}
				}
			}

		},
		mounted() {


		}
	}


</script>

<style lang="scss" scoped>
	.header {
		padding: 0 15px;
		color: var(--ion-text-color);
		font-weight: 500;
		font-size: 1.1rem;
		margin-bottom: 15px;
	}

	.header_info {
		font-size: 0.6rem;
	}

	ion-searchbar {
		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 23px;
	}

	ion-content {
		--padding-top: 16px;
		--padding-bottom: 10px;
		//--background: #fafafa;
	}

	h3 {
		opacity: .5;
	}
</style>

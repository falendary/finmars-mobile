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
			<p style="padding: 0 1rem; font-size: .7rem">If something went wrong you can proceed to Recovery Page. It will reset app</p>
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
				@click="changeSpace()"
			>
				CHANGE SPACE
			</ion-button>

			<ion-button
				class="ion-margin-horizontal logout"
				fill="outline"
				expand="block"
				@click="logout()"
			>
				LOGOUT
			</ion-button>

		</ion-content>
	</ion-page>
</template>

<script>
	import {
		IonButton,
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonModal,
		IonPage,
		IonRefresher,
		IonRefresherContent, IonToggle,
		IonToolbar
	} from '@ionic/vue'

	import { computed, watch } from 'vue'
	import ComplexTransactionList from '@/components/ComplexTransactionList.vue'
	import useStore from '@/composables/useStore'
	import { Preferences } from '@capacitor/preferences'

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
				isDarkTheme: false
			}
		},
		methods: {

			toggleDarkTheme(shouldAdd) {

				console.log('shouldAdd', shouldAdd)

				document.body.classList.toggle('dark', shouldAdd)

				Preferences.set({ key: 'darkTheme', value: shouldAdd.toString() })

				this.isDarkTheme = shouldAdd;

			},
			themeToggleChange(ev) {

				console.log('themeToggleChange', ev)

				this.toggleDarkTheme(ev.detail.checked)
			},

			async logout() {
				this.$router.push('/logout')
			},
			async setupPasscode() {
				this.$router.push('/setup-passcode')
			},
			async recovery() {

				this.$router.push('/recovery')
			},
			changeSpace() {
				this.$router.replace('/workspaces')

			},

		},
		async created() {

			this.store = useStore()
			this.spaceStore = this.store.activeSpaceStore

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

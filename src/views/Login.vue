<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%" class="login-holder">
					<h1 class="tac">Login Page</h1>


					<div style="display:flex; align-items: center; justify-content: center; width: 100%;">
						<ion-button class="global-process-close-button" @click="goToRegionSelect()">Region Select
						</ion-button>
					</div>

				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script>

	import { initKeycloak } from '@/services/keycloakService.js'
	import { Preferences } from '@capacitor/preferences'
	import { IonButton } from '@ionic/vue'

	export default {
		components: { IonButton },

		data() {
			return {}
		},
		methods: {
			goToRegionSelect() {
				this.$router.replace('/welcome')
			}
		},
		async created() {


			try {

				await initKeycloak()

				// console.log('keycloak inited, redirect to /workspaces')

				this.$router.replace('/workspaces')

			} catch (e) {

				await Preferences.remove({ key: 'kcTokens' })

				console.error('login.keycloak.error', e)

				this.$router.replace('/welcome')
			}

		}

	}


</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		//--background: #fafafa;
		--background: var(--ion-card-background);
	}
</style>

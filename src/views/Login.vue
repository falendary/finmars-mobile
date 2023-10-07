<template>
	<ion-page>
		<ion-content class='ion-padding'>
			<div class='center aic' style='height: 100%'>
				<div style='width: 90%'>
					<h1 class='tac'>Login</h1>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script>

	import { initKeycloak } from '@/services/keycloakService.js'
	import { Preferences } from '@capacitor/preferences'

	export default {

		methods: {

		},
		async created() {

			try {

				await initKeycloak()

				console.log('keycloak inited, redirect to /workspaces')

				this.$router.push('/workspaces')

			} catch (e) {

				await Preferences.remove({ key: 'kcTokens' })

				console.error("login.keycloak.error", e)

				this.$router.push('/welcome')
			}

		}

	}



</script>

<style lang='scss' scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		//--background: #fafafa;
		--background: #eff4f7;
	}
</style>

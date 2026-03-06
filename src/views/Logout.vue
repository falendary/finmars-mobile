<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Logout</h1>
					<p class="tac">Signing out...</p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script>
	import { logoutKeycloak } from '@/services/keycloakService.js'

	export default {
		async created() {
			try {
				const result = await logoutKeycloak()

				// if there was no keycloak instance, nothing will redirect us
				if (!result.redirected) {
					await this.$router.replace('/welcome')
				}
			} catch (e) {
				console.error('Logout failed', e)
				await this.$router.replace('/welcome')
			}
		}
	}
</script>

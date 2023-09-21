<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Login</h1>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>

	console.log("Login Page Init")

	import { initKeycloak } from '@/services/keycloakService.js'

	await initKeycloak()

</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		--background: #fafafa;
	}
</style>

<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Logout</h1>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>

	import { useRouter } from 'vue-router'

	const router = useRouter()

	console.log("Logout Page Init")

	import {  logoutKeycloak } from '@/services/keycloakService.js'

	await logoutKeycloak()



	router.push('/welcome')

</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		//--background: #fafafa;
		--background: #eff4f7;
	}
</style>

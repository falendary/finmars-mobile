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

<script setup>

	import { useRouter } from 'vue-router'
	import { initKeycloak } from '@/services/keycloakService.js'

	const router = useRouter()

	console.log('Login Page Init')

	try {
		await initKeycloak()

		console.log('keycloak inited, redirect to /workspaces')

		router.push('/workspaces')
	} catch (e) {
		router.push('/welcome')
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

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

<script>

	import { logoutKeycloak } from '@/services/keycloakService.js'

	export default {
		components: {},

		data() {
			return {}
		},
		methods: {},
		async created() {

			console.log('Logout init. wait for logoutKeycloak')

			logoutKeycloak()

			console.log('logoutKeycloak done')
			console.log('redirect to welcome')

			this.$router.replace('/welcome')

		}

	}

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

<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Welcome to Finmars</h1>

					<ion-select
						v-model="region"
						label="Region"
						placeholder="Choose region"
					>
						<ion-select-option v-for="item in regions" :value="item.id">
							{{ item.name }}
						</ion-select-option>
					</ion-select>

					<IonButton expand="full" @click="login()">LOGIN</IonButton>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import {
		IonButton,
		IonContent,
		IonPage,
		IonSelect,
		IonSelectOption,
	} from '@ionic/vue'
	import { ref } from 'vue'
	import { Preferences } from '@capacitor/preferences'
	import '../keycloak.js'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const regions = [
		{
			id: 'eu-central',
			name: 'Europe (eu-central)',
			domain: 'https://finmars.com',
			keycloakOpts: {
				url: 'https://eu-central.finmars.com',
				realm: 'finmars',
				clientId: 'finmars',
			},
		},
		// {
		// 	id: 'eu2-central',
		// 	name: 'Switzerland (eu-central-2)',
		// 	domain: 'https://eu-central-2.finmars.com',
		// 	keycloakOpts: {
		// 		url: 'https://eu-central-2.finmars.com',
		// 		realm: 'finmars',
		// 		clientId: 'finmars',
		// 	},
		// },
		{
			id: 'stage',
			name: 'RC (stage)',
			domain: 'https://stage.finmars.com',
			keycloakOpts: {
				url: 'https://stage-auth.finmars.com',
				realm: 'finmars',
				clientId: 'finmars',
			},
		},
		{
			id: 'dev',
			name: 'Development (dev)',
			domain: 'https://dev.finmars.com',
			keycloakOpts: {
				url: 'https://dev-auth.finmars.com',
				realm: 'finmars',
				clientId: 'finmars',
			},
		},
	]
	const region = ref('eu-central')

	async function login() {
		let regionObj = regions.find((o) => o.id == region.value)
		await Preferences.set({ key: 'region', value: JSON.stringify(regionObj) })

		router.push('/login')
	}
</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		--background: #fafafa;
	}
</style>

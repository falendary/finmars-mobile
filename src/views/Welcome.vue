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

	let capacitorAdapter

	async function login() {
		let regionObj = regions.find((o) => o.id == region.value)
		Preferences.set({ key: 'region', value: JSON.stringify(regionObj) })

		let keycloak = Keycloak(regionObj.keycloakOpts)

		var initOptions = {
			onLoad: 'login-required',
			redirectUri:
				window.location.origin + router.options.history.base + '/workspaces',
		}

		if (window.Capacitor.platform != 'web') {
			initOptions['checkLoginIframe'] = false
			initOptions['adapter'] = 'capacitor'
			initOptions['responseMode'] = 'query'
			initOptions['redirectUri'] = 'https://finmars.com/workspaces'
		}
		console.log('initOptions:', initOptions)

		await keycloak.init(initOptions)
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

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
		IonPage,
		IonContent,
		IonIcon,
		IonButtons,
		IonButton,
		IonFooter,
		IonSelect,
		IonSelectOption,
	} from '@ionic/vue'
	import { ref, inject } from 'vue'
	import { Preferences } from '@capacitor/preferences'
	import KeycloakJs from 'keycloak-js'
	import { useRouter } from 'vue-router'
	import { Browser } from '@capacitor/browser'

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
		{
			id: 'eu2-central',
			name: 'Switzerland (eu-central-2)',
			domain: 'https://eu-central-2.finmars.com',
			keycloakOpts: {
				url: 'https://eu-central-2.finmars.com',
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

	let capacitorAdapter

	async function login() {
		let regionObj = regions.find((o) => o.id == region.value)
		Preferences.set({ key: 'region', value: JSON.stringify(regionObj) })
		let keycloak = new KeycloakJs(regionObj.keycloakOpts)

		// keycloak.init({ adapter: createAdapter(keycloak) })
		keycloak.init()
		keycloak.login({
			redirectUri:
				window.location.origin + router.options.history.base + '/workspaces',
		})
	}

	function createAdapter(kc) {
		let createCordovaOptions = function (userOptions) {
			let cordovaOptions = shallowCloneCordovaOptions(userOptions)
			cordovaOptions.location = 'no'

			if (userOptions && userOptions.prompt == 'none') {
				cordovaOptions.hidden = 'yes'
			}

			return formatCordovaOptions(cordovaOptions)
		}

		let shallowCloneCordovaOptions = function (userOptions) {
			if (userOptions && userOptions.cordovaOptions) {
				return Object.keys(userOptions.cordovaOptions).reduce(function (
					options,
					optionName
				) {
					options[optionName] = userOptions.cordovaOptions[optionName]
					return options
				},
				{})
			} else {
				return {}
			}
		}

		let formatCordovaOptions = function (cordovaOptions) {
			return Object.keys(cordovaOptions)
				.reduce(function (options, optionName) {
					options.push(optionName + '=' + cordovaOptions[optionName])
					return options
				}, [])
				.join(',')
		}

		let cordovaRedirectUri = 'http://localhost'

		return {
			async login(options) {
				let cordovaOptions = createCordovaOptions(options)
				let loginUrl = kc.createLoginUrl(options)

				let completed = false
				let closed = false
				await Browser.addListener('browserPageLoaded', async (e) => {
					console.log('browserPageLoaded')
					// if (e.url.indexOf(cordovaRedirectUri) == 0) {
					// 	// var callback = parseCallback(e.url)
					// 	// processCallback(callback, promise)

					// 	closed = true
					// 	await Browser.close()
					// 	completed = true
					// }
				})
				await Browser.open({ url: loginUrl })

				return false

				// ref.addEventListener('loaderror', function (event) {
				// 	if (!completed) {
				// 		if (event.url.indexOf(cordovaRedirectUri) == 0) {
				// 			var callback = parseCallback(event.url)
				// 			processCallback(callback, promise)
				// 			closeBrowser()
				// 			completed = true
				// 		} else {
				// 			promise.setError()
				// 			closeBrowser()
				// 		}
				// 	}
				// })

				// ref.addEventListener('exit', function (event) {
				// 	if (!closed) {
				// 		promise.setError({
				// 			reason: 'closed_by_user',
				// 		})
				// 	}
				// })
			},

			logout: function (options) {
				var promise = createPromise()

				var logoutUrl = kc.createLogoutUrl(options)
				var ref = cordovaOpenWindowWrapper(
					logoutUrl,
					'_blank',
					'location=no,hidden=yes,clearcache=yes'
				)

				var error

				ref.addEventListener('loadstart', function (event) {
					if (event.url.indexOf(cordovaRedirectUri) == 0) {
						ref.close()
					}
				})

				ref.addEventListener('loaderror', function (event) {
					if (event.url.indexOf(cordovaRedirectUri) == 0) {
						ref.close()
					} else {
						error = true
						ref.close()
					}
				})

				ref.addEventListener('exit', function (event) {
					if (error) {
						promise.setError()
					} else {
						kc.clearToken()
						promise.setSuccess()
					}
				})

				return promise.promise
			},

			register: function (options) {
				var promise = createPromise()
				var registerUrl = kc.createRegisterUrl()
				var cordovaOptions = createCordovaOptions(options)
				var ref = cordovaOpenWindowWrapper(
					registerUrl,
					'_blank',
					cordovaOptions
				)
				ref.addEventListener('loadstart', function (event) {
					if (event.url.indexOf(cordovaRedirectUri) == 0) {
						ref.close()
						var oauth = parseCallback(event.url)
						processCallback(oauth, promise)
					}
				})
				return promise.promise
			},

			accountManagement: function () {
				var accountUrl = kc.createAccountUrl()
				if (typeof accountUrl !== 'undefined') {
					var ref = cordovaOpenWindowWrapper(
						accountUrl,
						'_blank',
						'location=no'
					)
					ref.addEventListener('loadstart', function (event) {
						if (event.url.indexOf(cordovaRedirectUri) == 0) {
							ref.close()
						}
					})
				} else {
					throw 'Not supported by the OIDC server'
				}
			},

			redirectUri: function (options) {
				return cordovaRedirectUri
			},
		}
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

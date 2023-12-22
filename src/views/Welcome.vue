<template>
	<ion-page>
		<ion-content class="ion-padding welcome-page">

			<vue-particles
				id="tsparticles"
				:particlesInit="particlesInit"
				:options="{
									fpsLimit: 120,

                    particles: {
                        collisions: {
                            enable: true
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800
                            },
                            value: 80
                        },
                        shape: {
                            type: 'circle'
                        }
                    },

										preset: 'stars',
										detectRetina: true,
										 emitters: {
												direction: 'none',
										}
									}"
			/>


			<div class="welcome-page-container center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Welcome to Finmars</h1>

					<ion-select
						v-model="region"
						label="Region"
						placeholder="Choose region"
					>
						<ion-select-option v-for="item in regions" :value="item.id" :disabled="!item.active">
							{{ item.name }}
						</ion-select-option>
					</ion-select>

					<div v-if='region == "custom"'>

						<div class="finmars-black-input-container">

							<label for="">Name</label>
							<input class="finmars-black-input" type="text" v-model="customRegion.name">

						</div>

						<div class="finmars-black-input-container">

							<label for="">Domain</label>
							<input class="finmars-black-input" type="text" v-model="customRegion.domain">

						</div>

						<div class="finmars-black-input-container">

							<label for="">URL*</label>
							<input class="finmars-black-input" type="text" v-model="customRegion.keycloakOpts.url">

						</div>

						<div class="finmars-black-input-container">

							<label for="">Realm*</label>
							<input class="finmars-black-input" type="text" v-model="customRegion.keycloakOpts.realm">

						</div>

						<div class="finmars-black-input-container">

							<label for="">Client ID*</label>
							<input class="finmars-black-input" type="text" v-model="customRegion.keycloakOpts.clientId">

						</div>

					</div>

					<div v-if="errorMessage" class="text-center text-error text-fs-small">{{ errorMessage }}</div>


					<IonButton expand="full" @click="login()">LOGIN</IonButton>


				</div>

				<div class="finmars-main-copyright"><span class="finmars-main-copyright-text">Copyright ©</span> <span
					class="finmars-main-copyright-text current-year">{{ currentYear }}</span> <a href="https://finmars.com"
																																											 class="finmars-site-link">Finmars
					SCSA</a></div>


			</div>
		</ion-content>
	</ion-page>
</template>

<script>
	import { IonButton, IonContent, IonPage, IonSelect, IonSelectOption } from '@ionic/vue'
	import { Preferences } from '@capacitor/preferences'
	import '../keycloak.js'
	import { useRouter } from 'vue-router'

	import { loadStarsPreset } from 'tsparticles-preset-stars'

	export default {
		components: {
			IonButton, IonContent, IonPage, IonSelect, IonSelectOption
		},

		data() {
			return {
				currentYear: new Date().getFullYear(),
				customRegionIsAdvancedMode: false,
				errorMessage: '',
				customRegion: {
					id: 'custom',
					isCustom: true,
					active: true,
					name: 'Custom',
					domain: 'https://finmars.com',
					keycloakOpts: {
						url: 'https://eu-central.finmars.com',
						realm: 'finmars',
						clientId: 'finmars'
					}
				},
				regions: [
					{
						id: 'eu-central',
						name: 'Europe (eu-central)',
						domain: 'https://finmars.com',
						active: true,
						keycloakOpts: {
							url: 'https://eu-central.finmars.com',
							realm: 'finmars',
							clientId: 'finmars'
						}
					},
					{
						id: 'eu2-central',
						name: 'Switzerland (eu-central-2)',
						domain: 'https://eu-central-2.finmars.com',
						active: false,
						keycloakOpts: {
							url: 'https://eu-central-2.finmars.com',
							realm: 'finmars',
							clientId: 'finmars'
						}
					}
				],
				router: useRouter(),
				region: 'eu-central'
			}
		},
		methods: {

			async login() {

				this.errorMessage = ''


				let regionObj

				if (this.region !== 'custom') {

					regionObj = this.regions.find((o) => o.id === this.region)

				} else {

					regionObj = Object.assign({}, this.customRegion)

					regionObj.id = regionObj.name + '_' + new Date().toISOString()

					let custom_regions = this.regions.filter((item) => {
						return item.isCustom
					})

					custom_regions.push(regionObj)

					await Preferences.set({ key: 'custom_regions', value: JSON.stringify(custom_regions) })

				}

				console.log('welcome.login.region.value', this.region)
				console.log('welcome.login.customRegion', this.customRegion)
				console.log('welcome.login.regionObj', regionObj)


				if (regionObj) {

					await Preferences.set({ key: 'region', value: JSON.stringify(regionObj) })

					await this.router.replace('/login')

				} else {

					this.errorMessage = 'Region is not set. Check your settings or please, contact Support'

				}
			},

			async particlesInit(engine) {
				//await loadFull(engine);
				await loadStarsPreset(engine)
			}

		},
		async created() {

			if (window.location.href.indexOf('error_message=') !== -1) {

				this.errorMessage = window.location.href.split('error_message=')[1]

			}

			console.log('Welcome.errorMessage', this.errorMessage)


			let custom_regions = await Preferences.get({ key: 'custom_regions' })

			console.log('custom_regions', custom_regions)

			if (custom_regions && custom_regions.value) {
				var custom_regions_objects = JSON.parse(custom_regions.value)
				if (custom_regions_objects) {
					this.regions = this.regions.concat(custom_regions_objects)
				}
			}

			this.regions.push({
				id: 'custom',
				name: 'Add New Region',
				active: true
			})

		}

	}

</script>

<style lang="scss">
	ion-button {
		margin-top: 20px;
	}

	.welcome-page-container {
		--background: trasparent;
		background: transparent;
		color: #fff;
		position: relative;
		padding-bottom: 120px; // to see copyright block on page
	}

	ion-content {
		//--background: #fafafa;
		--background: #eff4f7;
	}

	.welcome-page {
		--background: #000;
		background: #000;
		position: relative;
		color: #fff;
	}

	.finmars-main-copyright {
		position: absolute;
		bottom: 10px;
	}

	.finmars-main-copyright .finmars-main-copyright-text {
		font-size: 10px;
		color: #fff;
		opacity: .4;
	}

	.finmars-main-copyright .finmars-site-link {
		font-size: 10px;
		color: #fff;
		text-decoration: none;
		opacity: .6;
	}

	.finmars-site-link:hover {
		color: #fff;
		opacity: 1;
	}

	.finmars-main-copyright .finmars-site-link:active {
		color: #fff;
		opacity: .6;
	}

	.finmars-main-copyright .finmars-site-link:visited {
		color: #fff;
		opacity: .6;
	}

	.finmars-black-input-container {
		box-sizing: border-box;
		margin: 24px 0;
		position: relative;
		width: 100%;
		height: 56px;
		background: rgba(255, 255, 255, 0.11764705882352941);

		label {
			color: #df5423;
			position: absolute;
			background: #000;
			top: -8px;
			font-size: 12px;
			left: 8px;
			padding: 0 4px;
		}

	}

	.finmars-black-input {
		background: transparent;
		height: 100%;
		width: 100%;
		/*width: 100%;*/
		color: #fff;
		font-size: 16px;
		border: 0;
		outline: none;
		/*padding-left: 8px;*/
		padding: 2px 16px 2px 16px;
		box-sizing: border-box;
	}


</style>

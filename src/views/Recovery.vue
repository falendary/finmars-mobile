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
					<h1 class="tac">🛠 Recovery</h1>

					<p>We're really sorry! Something unexpected occurred, and we're working hard to set things right.</p>

					<p>Your experience is important to us, and we regret the inconvenience caused. We've taken note of this issue,
						and our engineers are already on it.</p>

					<p>In the meantime, please try one of the following:</p>

					<div class="display-flex align-center" style="margin-top: 0.5rem">
						<IonButton style="margin-top: 0; margin-right: 0.5rem" @click="toSpaces()">Space Selection</IonButton>
					</div>

					<div style="margin-top: 0.5rem">
						<IonButton style="margin-top: 0; margin-right: 0.5rem" @click="refresh()">Refresh</IonButton> your app or page.
					</div>
					<div class="display-flex align-center" style="margin-top: 0.5rem">
						<IonButton style="margin-top: 0; margin-right: 0.5rem" @click="logout()">Logout</IonButton>
						and log back in.
					</div>

					<p>If the problem persists, reach out to our <a href="mailto:support@finmars.com">support team</a>. They'll be
						happy to assist!</p>
					<p>Thank you for your patience and understanding.</p>


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
	import { IonButton, IonContent, IonPage } from '@ionic/vue'
	import '../keycloak.js'

	import { loadStarsPreset } from 'tsparticles-preset-stars'
	import { Preferences } from '@capacitor/preferences'
	import useStore from '@/composables/useStore.js'

	export default {
		components: {
			IonButton, IonContent, IonPage
		},

		data() {
			return {
				currentYear: new Date().getFullYear()
			}
		},
		methods: {
			async refresh() {

				this.store = useStore()

				await Preferences.remove({ key: 'activeSpaceCode' })
				await Preferences.remove({ key: 'activeSpaceName' })
				await Preferences.remove({ key: 'layout' })

				await this.store.clear();

				window.location.href = '/workspaces'
			},
			async logout() {

				this.$router.push('/logout')
			},
			async toSpaces() {
				this.$router.push('/workspaces')
			},
			async particlesInit(engine) {
				//await loadFull(engine);
				await loadStarsPreset(engine)
			}

		},
		async created() {


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

<template>
	<ion-page>
		<ion-content class="ion-padding">

		<div class="passcode-component-wrapper">

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

		<div class="passcode-container">

			<p class="passcode-username">Passcode</p>

			<div class="passcode-container">
				<div class="passcode-display">
					<div
						v-for="n in 4"
						:key="n"
						:class="['passcode-digit', { filled: n <= passcode.length }]"
					></div>
				</div>

				<div class="buttons-grid">
					<button v-for="n in 9" :key="n" class="passcode-button" @touchend="addDigit(n)">{{ n }}</button>
					&nbsp;
					<button class="passcode-button" @click="addDigit(0)">0</button>
					<button class="passcode-button-clear" @click="clearAll()">Clear</button>
				</div>
			</div>

			<div class="display-flex align-center justify-center" style="margin-bottom: 1rem;">
				<IonButton style="margin-top: 0; margin-right: 0.5rem; width: 8rem" :disabled="passcode.length < 4" @click="savePasscode()">Save</IonButton>
			</div>


		</div>

		</div>
		</ion-content>
	</ion-page>

</template>

<script>
	import { IonButton, IonContent, IonPage } from '@ionic/vue'

	import { loadStarsPreset } from 'tsparticles-preset-stars'
	import { Preferences } from '@capacitor/preferences'

	import { Haptics, ImpactStyle } from '@capacitor/haptics'

	export default {
		components: {
			IonButton, IonContent, IonPage
		},

		data() {
			return {
				passcode: ''
			}
		},
		methods: {

			async addDigit(digit) {

				await Haptics.impact({ style: ImpactStyle.Heavy });

				if (this.passcode.length < 4) {
					this.passcode += digit
				}
				if (this.passcode.length === 4) {
					// Validate or use the passcode here.
					// console.log('Passcode entered:', this.passcode)
				}
			},
			clearLast() {
				this.passcode = this.passcode.slice(0, -1)
			},
			clearAll() {
				this.passcode = ''
			},

			savePasscode() {

				Preferences.set({
					key: 'passcode',
					value: this.passcode
				})

				this.$router.push('/main/dashboard')

			},

			async particlesInit(engine) {
				//await loadFull(engine);
				await loadStarsPreset(engine)
			}

		},
		async created() {

			this.passcode = ''


		}

	}

</script>

<style lang="scss">

	.passcode-component-wrapper {
		width: 100%;
		height: 100%;
		z-index: 1;
		background: #000;
		overflow: auto;
	}

	ion-button {
		margin-top: 20px;
	}

	.passcode-component {
		--background: trasparent;
		background: transparent;
		color: #fff;
		position: relative;
	}

	ion-content {
		//--background: #fafafa;
		--background: #eff4f7;
	}


	.passcode-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		position: relative;
		min-height: 100%;
		justify-content: flex-end;
	}

	.passcode-display {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.passcode-digit {
		width: 20px;
		height: 20px;
		background-color: #333;
		border-radius: 50%;
		transition: background-color .5s;
	}

	.passcode-digit.filled {
		background-color: #eee;
	}

	.passcode-username {
		width: 100%;
		text-align: center;
	}
	.passcode-display {
		top: 5.5rem;
	}

	.buttons-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}

	.passcode-button {
		background: rgba(255, 255, 255, 0.045);
		border-radius: 50%;
		padding: 1rem 1.5rem;
		font-weight: 200;
		color: #fff;
		//border: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 3rem;
		transition: background-color 0.3s, transform 0.1s;

		&:active {
			background-color: #eee; /* or any color to indicate the touch */
			transform: scale(0.95); /* Slight scale down to give a "pressed" feel */
		}
	}

	/* If you want to give more touch feedback for touch devices */
	@media (hover: none) {
		.passcode-button:active {
			background-color: #eee;
			box-shadow: none; /* You can remove any box shadows if there are any */
		}
	}

	.passcode-button-clear {
		background: transparent;
		font-size: 0.9rem;
		color: #fff;
	}

	.passcode-digit.right-passcode {
		background-color: green;
		opacity: .9;

	}

	.passcode-digit.wrong-passcode {
		background-color: crimson;
		opacity: .9;
		animation: shake 0.5s;
	}


	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-10px);
		}
		50% {
			transform: translateX(10px);
		}
		75% {
			transform: translateX(-10px);
		}
		100% {
			transform: translateX(0);
		}
	}


</style>
